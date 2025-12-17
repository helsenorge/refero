import * as uuid from 'uuid';

import type { QuestionnaireItem, Coding } from 'fhir/r4';

import { Extensions } from '../constants/extensions';
import ItemType from '../constants/itemType';
import { SCORING, SCORING_CODE, SCORING_FORMULAS, ScoringTypes, Type } from '../constants/scoring';
import { ScoringItemType } from '../constants/scoringItemType';

export function createDummySectionScoreItem(): QuestionnaireItem {
  return {
    linkId: uuid.v4(),
    type: ItemType.QUANTITY,
    extension: [
      {
        url: Extensions.QUESTIONNAIRE_UNIT_URL,
        valueCoding: {
          system: SCORING,
          code: SCORING_CODE,
          display: 'score',
        },
      },
    ],
    code: [
      {
        system: SCORING_FORMULAS,
        code: Type.SECTION_SCORE,
        display: 'Sectionscore',
      },
    ],
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
  }

  return ScoringItemType.NONE;
}

function getCodingWithScoring(item: QuestionnaireItem): Coding | undefined {
  if (!item.code) return;

  for (const coding of item.code) {
    const system: string = coding.system || '';
    if (system === SCORING_FORMULAS && ScoringTypes.filter(s => s === coding.code).length > 0) {
      return coding;
    }
  }
}
