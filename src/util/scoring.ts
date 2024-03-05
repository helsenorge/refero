import { QuestionnaireItem, Coding, Extension } from 'fhir/r4';
import * as uuid from 'uuid';

import { getCalculatedExpressionExtension } from './extension';
import ExtensionConstants from '../constants/extensions';
import ItemType from '../constants/itemType';
import { ScoringItemType } from '../constants/scoringItemType';
import { SCORING, SCORING_CODE, SCORING_FORMULAS, ScoringTypes, Type } from '../constants/scoring';

export function createDummySectionScoreItem(): QuestionnaireItem {
  return {
    linkId: uuid.v4(),
    type: ItemType.QUANTITY,
    extension: [
      {
        url: ExtensionConstants.QUESTIONNAIRE_UNIT,
        valueCoding: {
          system: SCORING,
          code: SCORING_CODE,
          display: 'score',
        },
      } as Extension,
    ],
    code: [
      {
        system: SCORING_FORMULAS,
        code: Type.SECTION_SCORE,
        display: 'Sectionscore',
      } as unknown,
    ] as Coding[],
  };
}

export function scoringItemType(item: QuestionnaireItem): ScoringItemType {
  const scoring = getCodingWithScoring(item);
  if (scoring) {
    switch (scoring.code) {
      case Type.TOTAL_SCORE:
        return ScoringItemType.TOTAL_SCORE;
      case Type.SECTION_SCORE:
        return ScoringItemType.SECTION_SCORE;
      case Type.QUESTION_SCORE:
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
  return scoring ? scoring.code === Type.SECTION_SCORE : false;
}

export function isTotalScoringItem(item: QuestionnaireItem): boolean {
  const scoring = getCodingWithScoring(item);
  return scoring ? scoring.code === Type.TOTAL_SCORE : false;
}

export function isQuestionScoringItem(item: QuestionnaireItem): boolean {
  const scoring = getCodingWithScoring(item);
  return scoring ? scoring.code === Type.QUESTION_SCORE : false;
}

function getCodingWithScoring(item: QuestionnaireItem): Coding | undefined {
  if (!item.code) return;

  for (const coding of item.code) {
    const system: string = coding.system as unknown as string;
    if (system === SCORING_FORMULAS && ScoringTypes.filter(s => s === coding.code).length > 0) {
      return coding;
    }
  }
}
