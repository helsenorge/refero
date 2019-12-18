import { QuestionnaireItem, Coding, uri, Extension } from '../types/fhir';
import Scoring from '../constants/scoring';
import ExtensionConstants from '../constants/extensions';
import * as uuid from 'uuid';

export function createDummySectionScoreItem(): QuestionnaireItem {
  return {
    linkId: uuid.v4(),
    type: 'quantity',
    extension: [
      {
        url: ExtensionConstants.QUESTIONNAIRE_UNIT,
        valueCoding: {
          system: ('http://ehelse.no/Score' as unknown) as uri,
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

export function isScoringItem(item: QuestionnaireItem): boolean {
  const scoring = getCodingWithScoring(item);
  return scoring ? true : false;
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

export function getScoringType(item: QuestionnaireItem): string | undefined {
  const scoring = getCodingWithScoring(item);
  return scoring?.code;
}

function getCodingWithScoring(item: QuestionnaireItem): Coding | undefined {
  if (!item.code) return;

  let scoringTypes = [Scoring.Type.QUESTION_SCORE, Scoring.Type.SECTION_SCORE, Scoring.Type.TOTAL_SCORE];
  for (let coding of item.code) {
    let system: string = (coding.system as unknown) as string;
    if (system === Scoring.SCORING_FORMULAS && scoringTypes.filter(s => s === coding.code).length > 0) {
      return coding;
    }
  }
}
