import {
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItemAnswer,
  QuestionnaireItemAnswerOption,
} from 'fhir/r4';

import { getExtension } from './extension';
import { getQuestionnaireResponseItemsWithLinkId } from './refero-core';
import { createDummySectionScoreItem, scoringItemType } from './scoring';
import { Extensions } from '../constants/extensions';
import { ScoringItemType } from '../constants/scoringItemType';

export interface AnswerPad {
  [linkId: string]: number | undefined;
}

class CalculatedScores {
  totalScores: QuestionnaireItem[] = [];
  sectionScores: QuestionnaireItem[] = [];
  questionScores: QuestionnaireItem[] = [];

  update(scores: CalculatedScores): void {
    this.totalScores.push(...scores.totalScores);
    this.sectionScores.push(...scores.sectionScores);
    this.questionScores.push(...scores.questionScores);
  }

  hasTotalScores(): boolean {
    return this.totalScores.length > 0;
  }

  hasSectionScores(): boolean {
    return this.sectionScores.length > 0;
  }

  hasQuestionScores(): boolean {
    return this.questionScores.length > 0;
  }
}

export class ScoringCalculator {
  private sectionScoreCache: Map<string, QuestionnaireItem[]> = new Map<string, QuestionnaireItem[]>();
  private totalScoreCache: Map<string, boolean> = new Map();
  private totalScoreItem: QuestionnaireItem | undefined;
  private itemCache: Map<string, QuestionnaireItem> = new Map<string, QuestionnaireItem>();
  private isScoringQuestionnaire: boolean = false;

  constructor(questionnaire: Questionnaire) {
    this.initializeCaches(questionnaire);
  }

  private initializeCaches(questionnaire: Questionnaire): void {
    this.traverseQuestionnaire(questionnaire);
    this.isScoringQuestionnaire = this.hasScoring(questionnaire);
  }

  private traverseQuestionnaire(qItem: Questionnaire | QuestionnaireItem, level: number = 0): CalculatedScores {
    const calculatedScores = new CalculatedScores();

    if (qItem.item) {
      for (const subItem of qItem.item) {
        const subScores = this.traverseQuestionnaire(subItem, level + 1);
        calculatedScores.update(subScores);
      }
    }

    if (level === 0) {
      this.totalScoreItem = createDummySectionScoreItem();
      const subScores = this.traverseQuestionnaire(this.totalScoreItem, level + 1);
      calculatedScores.update(subScores);
    }

    this.cacheScores(calculatedScores);

    return this.processItem(qItem, calculatedScores);
  }

  private cacheScores(calculatedScores: CalculatedScores): void {
    this.cacheTotalScores(calculatedScores);
    this.cacheSectionScores(calculatedScores);
  }
  private cacheTotalScores(calculatedScores: CalculatedScores): void {
    if (calculatedScores.hasTotalScores()) {
      for (const totalScore of calculatedScores.totalScores) {
        this.totalScoreCache.set(totalScore.linkId, true);
        this.itemCache.set(totalScore.linkId, totalScore);
      }
    }
  }

  private cacheSectionScores(calculatedScores: CalculatedScores): void {
    if (calculatedScores.hasSectionScores()) {
      const firstSectionScore = calculatedScores.sectionScores.shift()!;
      this.sectionScoreCache.set(firstSectionScore.linkId, calculatedScores.questionScores);
      this.itemCache.set(firstSectionScore.linkId, firstSectionScore);

      for (const sectionScore of calculatedScores.sectionScores) {
        this.sectionScoreCache.set(sectionScore.linkId, [firstSectionScore]);
        this.itemCache.set(sectionScore.linkId, sectionScore);
      }
    }
  }
  private processItem(qItem: Questionnaire | QuestionnaireItem, calculatedScores: CalculatedScores): CalculatedScores {
    if (!this.isOfTypeQuestionnaireItem(qItem)) {
      return new CalculatedScores();
    }

    const type = scoringItemType(qItem);
    const newScores = new CalculatedScores();

    switch (type) {
      case ScoringItemType.SECTION_SCORE:
        newScores.sectionScores.push(qItem);
        break;
      case ScoringItemType.TOTAL_SCORE:
        newScores.totalScores.push(qItem);
        break;
      case ScoringItemType.QUESTION_SCORE:
        newScores.questionScores.push(qItem, ...calculatedScores.questionScores);
        break;
      default:
        newScores.questionScores.push(...calculatedScores.questionScores);
        break;
    }

    return newScores;
  }

  private isOfTypeQuestionnaireItem(item: Questionnaire | QuestionnaireItem): item is QuestionnaireItem {
    return 'type' in item;
  }
  private calculateAllSectionScores(answerPad: AnswerPad, questionnaireResponse: QuestionnaireResponse): AnswerPad {
    const tempAnswerPad: AnswerPad = answerPad;
    const keys = this.sectionScoreCache.keys();

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const result = keys.next();
      if (result.done) break;
      tempAnswerPad[result.value] = this.calculateSectionScore(result.value, questionnaireResponse, answerPad);
    }
    return tempAnswerPad;
  }

  private calculateAllTotalScores(answerPad: AnswerPad, questionnaireResponse: QuestionnaireResponse): AnswerPad {
    const tempAnswerPad: AnswerPad = answerPad;
    this.totalScoreCache.forEach((_value, totalScoreLinkId) => {
      tempAnswerPad[totalScoreLinkId] = this.calculateSectionScore(this.totalScoreItem!.linkId, questionnaireResponse, answerPad);
    });
    return tempAnswerPad;
  }

  public calculateScore(questionnaireResponse: QuestionnaireResponse): AnswerPad {
    const answerPad: AnswerPad = {};

    const sectionScoresCalculated = this.calculateAllSectionScores(answerPad, questionnaireResponse);
    const allScoresCalculated = this.calculateAllTotalScores(sectionScoresCalculated, questionnaireResponse);

    delete allScoresCalculated[this.totalScoreItem!.linkId];

    return allScoresCalculated;
  }

  private calculateSectionScore(linkId: string, questionnaireResponse: QuestionnaireResponse, answerPad: AnswerPad): number | undefined {
    let sum: number = 0;
    let hasCalculatedAtLeastOneAnswer = false;
    const dependencies: QuestionnaireItem[] = this.sectionScoreCache.get(linkId) || [];

    for (const item of dependencies) {
      const result = this.valueOf(item, questionnaireResponse, answerPad);
      if (result !== undefined) {
        sum += result;
        hasCalculatedAtLeastOneAnswer = true;
      }
    }

    return hasCalculatedAtLeastOneAnswer ? sum : undefined;
  }

  private valueOf(item: QuestionnaireItem, questionnaireResponse: QuestionnaireResponse, answerPad: AnswerPad): number | undefined {
    switch (scoringItemType(item)) {
      case ScoringItemType.SECTION_SCORE:
        return this.valueOfSectionScoreItem(item, questionnaireResponse, answerPad);
      case ScoringItemType.QUESTION_SCORE:
        return this.valueOfQuestionScoreItem(item, questionnaireResponse);
      default:
        return undefined;
    }
  }

  private valueOfQuestionScoreItem(item: QuestionnaireItem, questionnaireResponse: QuestionnaireResponse): number | undefined {
    let sum = 0;
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
    answerPad: AnswerPad
  ): number | undefined {
    return item.linkId in answerPad ? answerPad[item.linkId] : this.calculateSectionScore(item.linkId, questionnaireResponse, answerPad);
  }

  private getOptionScore(option: QuestionnaireItemAnswerOption): number {
    const extension = getExtension(Extensions.ORDINAL_VALUE_URL, option.valueCoding);
    return extension?.valueDecimal ? (extension.valueDecimal as number) : 0;
  }

  private getAnswerMatch(answer: QuestionnaireResponseItemAnswer, item: QuestionnaireItem): QuestionnaireItemAnswerOption | undefined {
    const valueCoding = answer.valueCoding;
    if (!valueCoding || !item.answerOption) return undefined;

    return item.answerOption.find(o => o.valueCoding?.code === valueCoding.code && o.valueCoding?.system === valueCoding.system);
  }

  public getCachedTotalOrSectionItem(linkId: string): QuestionnaireItem | undefined {
    return this.itemCache.get(linkId);
  }

  private hasScoring(questionnaire: Questionnaire): boolean {
    const hasScoringInItem = (item: QuestionnaireItem): boolean => {
      if (scoringItemType(item) !== ScoringItemType.NONE) {
        return true;
      }
      if (item.item && item.item.length > 0) {
        return item.item.some(nestedItem => hasScoringInItem(nestedItem));
      }
      return false;
    };

    return questionnaire?.item?.some(item => hasScoringInItem(item)) ?? false;
  }
  public getIsScoringQuestionnaire = (): boolean => {
    return this.isScoringQuestionnaire;
  };
}
