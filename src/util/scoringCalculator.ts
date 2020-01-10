import { Questionnaire, QuestionnaireItem, QuestionnaireResponse, QuestionnaireResponseAnswer, QuestionnaireOption } from '../types/fhir';
import { isSectionScoringItem, isQuestionScoringItem, isTotalScoringItem, createDummySectionScoreItem } from './scoring';
import { getItemsWithIdFromResponseItemArray } from './skjemautfyller-core';
import { getExtension } from './extension';
import ExtensionConstants from '../constants/extensions';

class CalculatedScores {
  totalScores: Array<QuestionnaireItem> = [];
  sectionScores: Array<QuestionnaireItem> = [];
  questionScores: Array<QuestionnaireItem> = [];

  public update(subRetVal: CalculatedScores): void {
    this.totalScores.push(...subRetVal.totalScores);
    this.sectionScores.push(...subRetVal.sectionScores);
    this.questionScores.push(...subRetVal.questionScores);
  }

  public hasTotalScores(): boolean {
    return this.totalScores.length > 0;
  }

  public hasSectionScores(): boolean {
    return this.sectionScores.length > 0;
  }

  public hasQuestionScores(): boolean {
    return this.questionScores.length > 0;
  }
}

export class ScoringCalculator {
  private sectionScoreCache: { [linkId: string]: Array<QuestionnaireItem> } = {};
  private totalScoreCache: Array<string> = [];
  private totalScoreItem: QuestionnaireItem | undefined;
  private itemCache: { [linkId: string]: QuestionnaireItem } = {};

  constructor(questionnaire: Questionnaire) {
    this.updateQuestionnaire(questionnaire);
  }

  private updateQuestionnaire(questionnaire: Questionnaire): void {
    this.sectionScoreCache = {};
    this.totalScoreCache = [];
    this.itemCache = {};
    this.totalScoreItem = undefined;
    this.traverseQuestionnaire(questionnaire);
  }

  private traverseQuestionnaire(qItem: Questionnaire | QuestionnaireItem, level: number = 0): CalculatedScores {
    let retVal: CalculatedScores = new CalculatedScores();

    if (qItem.item) {
      for (let subItem of qItem.item) {
        let subRetVal = this.traverseQuestionnaire(subItem, level + 1);
        retVal.update(subRetVal);
      }
    }

    // Inject dummy section score at top to simulate total score
    if (level === 0) {
      this.totalScoreItem = createDummySectionScoreItem();
      let subRetVal = this.traverseQuestionnaire(this.totalScoreItem, level + 1);
      retVal.update(subRetVal);
    }

    if (retVal.hasTotalScores()) {
      for (let totalScore of retVal.totalScores) {
        this.totalScoreCache.push(totalScore.linkId);
        this.itemCache[totalScore.linkId] = totalScore;
      }
    }

    if (retVal.hasSectionScores()) {
      // Define first sectionScore that is a child-item of us, in terms of all its siblings
      let firstSectionScore = retVal.sectionScores.shift()!;
      this.sectionScoreCache[firstSectionScore.linkId] = retVal.questionScores;
      this.itemCache[firstSectionScore.linkId] = firstSectionScore;

      // Define subsequent sectionScores as aliases to the first sectionScore
      for (let sectionScore of retVal.sectionScores) {
        this.sectionScoreCache[sectionScore.linkId] = [firstSectionScore];
        this.itemCache[sectionScore.linkId] = sectionScore;
      }

      let newRetVal = new CalculatedScores();
      newRetVal.questionScores.push(firstSectionScore);
      return newRetVal;
    }

    if (this.isOfTypeQuestionnaireItem(qItem)) {
      // A section score item, only return self, as it doesn't have any children
      if (isSectionScoringItem(qItem)) {
        let newRetVal = new CalculatedScores();
        newRetVal.sectionScores.push(qItem);
        return newRetVal;
      }

      // A total score item, only return self, as it doesn't have any children
      if (isTotalScoringItem(qItem)) {
        let newRetVal = new CalculatedScores();
        newRetVal.totalScores.push(qItem);
        return newRetVal;
      }

      // A question score item, return self and children
      if (isQuestionScoringItem(qItem)) {
        let newRetVal = new CalculatedScores();
        newRetVal.questionScores.push(qItem, ...retVal.questionScores);
        return newRetVal;
      }
    }

    // Not an item than contributes to scoring, just pass through
    let newRetVal = new CalculatedScores();
    newRetVal.questionScores.push(...retVal.questionScores);
    return newRetVal;
  }

  private isOfTypeQuestionnaire(item: Questionnaire | QuestionnaireItem): item is Questionnaire {
    return (<Questionnaire>item).status !== undefined;
  }

  private isOfTypeQuestionnaireItem(item: Questionnaire | QuestionnaireItem): item is QuestionnaireItem {
    return (<QuestionnaireItem>item).type !== undefined;
  }

  public calculate(questionnaireResponse: QuestionnaireResponse): { [linkId: string]: number } {
    let answerPad: { [linkId: string]: number } = {};

    for (let sectionScoreLinkId in this.sectionScoreCache) {
      answerPad[sectionScoreLinkId] = this.calculateSectionScore(sectionScoreLinkId, questionnaireResponse, answerPad);
    }

    for (let totalScoreLinkId of this.totalScoreCache) {
      answerPad[totalScoreLinkId] = this.calculateSectionScore(this.totalScoreItem!.linkId, questionnaireResponse, answerPad);
    }

    delete answerPad[this.totalScoreItem!.linkId];

    return answerPad;
  }

  private calculateSectionScore(
    linkId: string,
    questionnaireResponse: QuestionnaireResponse,
    answerPad: { [linkId: string]: number }
  ): number {
    let sum: number = 0;
    let dependencies: Array<QuestionnaireItem> = this.sectionScoreCache[linkId];

    for (let item of dependencies) {
      sum += this.valueOf(item, questionnaireResponse, answerPad);
    }

    return sum;
  }

  private valueOf(item: QuestionnaireItem, questionnaireResponse: QuestionnaireResponse, answerPad: { [linkId: string]: number }): number {
    const linkId = item.linkId;

    if (isSectionScoringItem(item)) {
      // Return previously calculated section score
      if (linkId in answerPad) {
        return answerPad[linkId];
      }

      // Don't already know the answer, so calculate it
      return this.calculateSectionScore(linkId, questionnaireResponse, answerPad);
    }

    let sum = 0;
    let qrItems = getItemsWithIdFromResponseItemArray(linkId, questionnaireResponse.item, true);
    for (let qrItem of qrItems) {
      if (!qrItem.answer) continue;

      for (let answer of qrItem.answer) {
        let option = this.getAnswerMatch(answer, item);
        if (option) {
          sum += this.getOptionScore(option);
        }
      }
    }
    return sum;
  }

  private getOptionScore(option: QuestionnaireOption): number {
    const extension = getExtension(ExtensionConstants.ORDINAL_VALUE, option.valueCoding);
    if (extension?.valueDecimal) {
      return (extension?.valueDecimal as unknown) as number;
    }

    return 0;
  }

  private getAnswerMatch(answer: QuestionnaireResponseAnswer, item: QuestionnaireItem): QuestionnaireOption | undefined {
    if (answer.valueCoding) {
      if (item.option) {
        for (let o of item.option) {
          if (o.valueCoding.code === answer.valueCoding.code && o.valueCoding.system === answer.valueCoding.system) {
            return o;
          }
        }
      }
    }

    return;
  }

  public getCachedTotalOrSectionItem(linkId: string): QuestionnaireItem | undefined {
    return this.itemCache[linkId];
  }
}
