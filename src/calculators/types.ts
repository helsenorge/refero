import { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

import { ClearAction } from '@/actions/newValue';

export type RunEnableWhenInput = {
  questionnaire: Questionnaire | null | undefined;
  questionnaireResponse: QuestionnaireResponse | null | undefined;
};
export type RunEnableWhenResult = ClearAction[];
