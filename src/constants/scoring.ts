export const SCORING_FORMULAS = 'http://ehelse.no/scoringFormulas' as const;
export const Type = {
  QUESTION_SCORE: 'QS',
  SECTION_SCORE: 'SS',
  TOTAL_SCORE: 'TS',
} as const;
export const SCORING = 'http://ehelse.no/Score';
export const SCORING_CODE = 'score';
export const ScoringTypes = [Type.QUESTION_SCORE, Type.SECTION_SCORE, Type.TOTAL_SCORE];
