import type { ClearAction } from '@/actions/newValue';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

export type RunEnableWhenInput = {
  questionnaire: Questionnaire | null | undefined;
  questionnaireResponse: QuestionnaireResponse | null | undefined;
};
export type RunEnableWhenResult = ClearAction[];
