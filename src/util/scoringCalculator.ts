import {
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItemAnswer,
  QuestionnaireItemAnswerOption,
} from '../types/fhir';

import ExtensionConstants from '../constants/extensions';
import { ScoringItemType } from '../constants/scoringItemType';
import { getExtension, getCalculatedExpressionExtension } from './extension';
import r4 from './fhirpathLoaderHelper';
import { createDummySectionScoreItem, scoringItemType } from './scoring';
import { getQuestionnaireResponseItemsWithLinkId } from './refero-core';

// eslint-disable-next-line @typescript-eslint/no-var-requires
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
    const retVal: CalculatedScores = new CalculatedScores();

    if (qItem.item) {
      for (const subItem of qItem.item) {
        const subRetVal = this.traverseQuestionnaire(subItem, level + 1);
        retVal.update(subRetVal);
      }
    }

    // Inject dummy section score at top to simulate total score
    if (level === 0) {
      this.totalScoreItem = createDummySectionScoreItem();
      const subRetVal = this.traverseQuestionnaire(this.totalScoreItem, level + 1);
      retVal.update(subRetVal);
    }

    if (retVal.hasTotalScores()) {
      for (const totalScore of retVal.totalScores) {
        this.totalScoreCache.push(totalScore.linkId);
        this.itemCache[totalScore.linkId] = totalScore;
      }
    }

    if (retVal.hasSectionScores()) {
      // Define first sectionScore that is a child-item of us, in terms of all its siblings
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const firstSectionScore = retVal.sectionScores.shift()!;
      this.sectionScoreCache[firstSectionScore.linkId] = retVal.questionScores;
      this.itemCache[firstSectionScore.linkId] = firstSectionScore;

      // Define subsequent sectionScores as aliases to the first sectionScore
      for (const sectionScore of retVal.sectionScores) {
        this.sectionScoreCache[sectionScore.linkId] = [firstSectionScore];
        this.itemCache[sectionScore.linkId] = sectionScore;
      }

      const newRetVal = new CalculatedScores();
      newRetVal.questionScores.push(firstSectionScore);
      return newRetVal;
    }

    if (this.isOfTypeQuestionnaireItem(qItem)) {
      const type = scoringItemType(qItem);
      if (type === ScoringItemType.SECTION_SCORE) {
        // A section score item, only return self, as it doesn't have any children
        const newRetVal = new CalculatedScores();
        newRetVal.sectionScores.push(qItem);
        return newRetVal;
      }

      if (type === ScoringItemType.TOTAL_SCORE) {
        // A total score item, only return self, as it doesn't have any children
        const newRetVal = new CalculatedScores();
        newRetVal.totalScores.push(qItem);
        return newRetVal;
      }

      if (type === ScoringItemType.QUESTION_SCORE || type === ScoringItemType.QUESTION_FHIRPATH_SCORE) {
        const newRetVal = new CalculatedScores();
        newRetVal.questionScores.push(qItem, ...retVal.questionScores);

        if (type === ScoringItemType.QUESTION_FHIRPATH_SCORE) {
          this.itemCache[qItem.linkId] = qItem;
        }

        return newRetVal;
      }
    }

    // Not an item than contributes to scoring, just pass through
    const newRetVal = new CalculatedScores();
    newRetVal.questionScores.push(...retVal.questionScores);
    return newRetVal;
  }

  private isOfTypeQuestionnaireItem(item: Questionnaire | QuestionnaireItem): item is QuestionnaireItem {
    return (item as QuestionnaireItem).type !== undefined;
  }

  public calculate(questionnaireResponse: QuestionnaireResponse): { [linkId: string]: number | undefined } {
    const answerPad: { [linkId: string]: number | undefined } = {};

    for (const sectionScoreLinkId in this.sectionScoreCache) {
      answerPad[sectionScoreLinkId] = this.calculateSectionScore(sectionScoreLinkId, questionnaireResponse, answerPad);
    }

    for (const totalScoreLinkId of this.totalScoreCache) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      answerPad[totalScoreLinkId] = this.calculateSectionScore(this.totalScoreItem!.linkId, questionnaireResponse, answerPad);
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
    const dependencies: Array<QuestionnaireItem> = this.sectionScoreCache[linkId];

    for (const item of dependencies) {
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
        return this.valueOfQuestionScoreItem(item, questionnaireResponse);
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
  ): number | undefined {
    const expressionExtension = getCalculatedExpressionExtension(item);
    let value: number | undefined = undefined;
    if (expressionExtension) {
      const result = fhirpath.evaluate(questionnaireResponse, expressionExtension.valueString, null, r4);
      if (result.length) {
        value = (result[0] as number) ?? 0;
        if (isNaN(value) || !isFinite(value)) {
          value = undefined;
        }
      }
    }

    // value will become the new answer for this linkId
    answerPad[item.linkId] = value;

    return value;
  }

  private valueOfQuestionScoreItem(item: QuestionnaireItem, questionnaireResponse: QuestionnaireResponse): number | undefined {
    let sum: number = 0;
    let hasCalculatedAtLeastOneAnswer = false;
    const qrItems = getQuestionnaireResponseItemsWithLinkId(item.linkId, questionnaireResponse.item || [], true);
    for (const qrItem of qrItems) {
      if (!qrItem.answer) continue;

      for (const answer of qrItem.answer) {
        const option = this.getAnswerMatch(answer, item);
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

  private getOptionScore(option: QuestionnaireItemAnswerOption): number {
    const extension = getExtension(ExtensionConstants.ORDINAL_VALUE, option.valueCoding);
    if (extension?.valueDecimal) {
      return extension?.valueDecimal as unknown as number;
    }

    return 0;
  }

  private getAnswerMatch(answer: QuestionnaireResponseItemAnswer, item: QuestionnaireItem): QuestionnaireItemAnswerOption | undefined {
    if (answer.valueCoding) {
      if (item.answerOption) {
        for (const o of item.answerOption) {
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
