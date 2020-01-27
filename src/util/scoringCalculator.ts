import { Questionnaire, QuestionnaireItem, QuestionnaireResponse, QuestionnaireResponseAnswer, QuestionnaireOption } from '../types/fhir';
import { createDummySectionScoreItem, scoringItemType } from './scoring';
import { getItemsWithIdFromResponseItemArray } from './skjemautfyller-core';
import { getExtension, getCalculatedExpressionExtension } from './extension';
import ExtensionConstants from '../constants/extensions';
import { ScoringItemType } from '../constants/scoringItemType';
const stu3 = require('./fhirpathLoaderHelper');
const fhirpath = require('fhirpath');

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
      var type = scoringItemType(qItem);
      if (type === ScoringItemType.SECTION_SCORE) {
        // A section score item, only return self, as it doesn't have any children
        let newRetVal = new CalculatedScores();
        newRetVal.sectionScores.push(qItem);
        return newRetVal;
      }

      if (type === ScoringItemType.TOTAL_SCORE) {
        // A total score item, only return self, as it doesn't have any children
        let newRetVal = new CalculatedScores();
        newRetVal.totalScores.push(qItem);
        return newRetVal;
      }

      if (type === ScoringItemType.QUESTION_SCORE || type === ScoringItemType.QUESTION_FHIRPATH_SCORE) {
        let newRetVal = new CalculatedScores();
        newRetVal.questionScores.push(qItem, ...retVal.questionScores);

        if (type === ScoringItemType.QUESTION_FHIRPATH_SCORE) {
          this.itemCache[qItem.linkId] = qItem;
        }

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

  public calculate(questionnaireResponse: QuestionnaireResponse): { [linkId: string]: number | undefined } {
    let answerPad: { [linkId: string]: number | undefined } = {};

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
    answerPad: { [linkId: string]: number | undefined }
  ): number | undefined {
    let sum: number = 0;
    let hasCalculatedAtLeastOneAnswer = false;
    let dependencies: Array<QuestionnaireItem> = this.sectionScoreCache[linkId];

    for (let item of dependencies) {
      const result = this.valueOf(item, questionnaireResponse, answerPad);
      if (result !== undefined) {
        sum += result;
        hasCalculatedAtLeastOneAnswer = true;
      }
    }

    return hasCalculatedAtLeastOneAnswer ? sum : undefined;
  }

  private valueOf(
    item: QuestionnaireItem,
    questionnaireResponse: QuestionnaireResponse,
    answerPad: { [linkId: string]: number | undefined }
  ): number | undefined {
    const scoringType = scoringItemType(item);
    switch (scoringType) {
      case ScoringItemType.SECTION_SCORE:
        return this.valueOfSectionScoreItem(item, questionnaireResponse, answerPad);
      case ScoringItemType.QUESTION_SCORE:
        return this.valueOfQuestionScoreItem(item, questionnaireResponse, answerPad);
      case ScoringItemType.QUESTION_FHIRPATH_SCORE:
        return this.valueOfQuestionFhirpathScoreItem(item, questionnaireResponse, answerPad);
      default:
        return;
    }
  }

  private valueOfQuestionFhirpathScoreItem(
    item: QuestionnaireItem,
    questionnaireResponse: QuestionnaireResponse,
    answerPad: { [linkId: string]: number | undefined }
  ): number {
    const expressionExtension = getCalculatedExpressionExtension(item);
    let value = 0;
    if (expressionExtension) {
      let result = fhirpath.evaluate(questionnaireResponse, expressionExtension.valueString, null, stu3);
      if (result.length) {
        value = (result[0] as number) ?? 0;
      }
    }

    // value will become the new answer for this linkId
    answerPad[item.linkId] = value;

    return value;
  }

  private valueOfQuestionScoreItem(
    item: QuestionnaireItem,
    questionnaireResponse: QuestionnaireResponse,
    _answerPad: { [linkId: string]: number | undefined }
  ): number | undefined {
    let sum: number = 0;
    let hasCalculatedAtLeastOneAnswer = false;
    let qrItems = getItemsWithIdFromResponseItemArray(item.linkId, questionnaireResponse.item, true);
    for (let qrItem of qrItems) {
      if (!qrItem.answer) continue;

      for (let answer of qrItem.answer) {
        let option = this.getAnswerMatch(answer, item);
        if (option) {
          sum += this.getOptionScore(option);
          hasCalculatedAtLeastOneAnswer = true;
        }
      }
    }

    return hasCalculatedAtLeastOneAnswer ? sum : undefined;
  }

  private valueOfSectionScoreItem(
    item: QuestionnaireItem,
    questionnaireResponse: QuestionnaireResponse,
    answerPad: { [linkId: string]: number | undefined }
  ): number | undefined {
    if (item.linkId in answerPad) {
      // return cached score
      return answerPad[item.linkId];
    }

    // Don't already know the answer, so calculate it
    return this.calculateSectionScore(item.linkId, questionnaireResponse, answerPad);
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
