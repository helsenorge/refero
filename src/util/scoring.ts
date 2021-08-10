import * as uuid from 'uuid';

import { QuestionnaireItem, Coding, Extension } from '../types/fhir';

import ExtensionConstants from '../constants/extensions';
import Scoring from '../constants/scoring';
import { ScoringItemType } from '../constants/scoringItemType';
import { getCalculatedExpressionExtension } from './extension';

export function createDummySectionScoreItem(): QuestionnaireItem {
  return {
    linkId: uuid.v4(),
    type: 'quantity',
    extension: [
      {
        url: ExtensionConstants.QUESTIONNAIRE_UNIT,
        valueCoding: {
          system: 'http://ehelse.no/Score',
          code: 'score',
          display: 'score',
        },
      } as Extension,
    ],
    code: [
      {
        system: Scoring.SCORING_FORMULAS,
        code: Scoring.Type.SECTION_SCORE,
        display: 'Sectionscore',
      } as unknown,
    ] as Coding[],
  };
}

export function scoringItemType(item: QuestionnaireItem): ScoringItemType {
  if (item.code) {
    const scoring = getCodingWithScoring(item);
    switch (scoring?.code) {
      case 'TS':
        return ScoringItemType.TOTAL_SCORE;
      case 'SS':
        return ScoringItemType.SECTION_SCORE;
      case 'QS':
        return ScoringItemType.QUESTION_SCORE;
      default:
        return ScoringItemType.NONE;
    }
  } else if (item.extension) {
    const calculatedExpressionExtension = getCalculatedExpressionExtension(item);
    return calculatedExpressionExtension ? ScoringItemType.QUESTION_FHIRPATH_SCORE : ScoringItemType.NONE;
  }

  return ScoringItemType.NONE;
}

export function isSectionScoringItem(item: QuestionnaireItem): boolean {
  const scoring = getCodingWithScoring(item);
  return scoring ? scoring.code === Scoring.Type.SECTION_SCORE : false;
}

export function isTotalScoringItem(item: QuestionnaireItem): boolean {
  const scoring = getCodingWithScoring(item);
  return scoring ? scoring.code === Scoring.Type.TOTAL_SCORE : false;
}

export function isQuestionScoringItem(item: QuestionnaireItem): boolean {
  const scoring = getCodingWithScoring(item);
  return scoring ? scoring.code === Scoring.Type.QUESTION_SCORE : false;
}

function getCodingWithScoring(item: QuestionnaireItem): Coding | undefined {
  if (!item.code) return;

  const scoringTypes = [Scoring.Type.QUESTION_SCORE, Scoring.Type.SECTION_SCORE, Scoring.Type.TOTAL_SCORE];
  for (const coding of item.code) {
    const system: string = (coding.system as unknown) as string;
    if (system === Scoring.SCORING_FORMULAS && scoringTypes.filter(s => s === coding.code).length > 0) {
      return coding;
    }
  }
}
