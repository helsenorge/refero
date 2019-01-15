import { Questionnaire } from '../types/fhir';
import { QuestionnaireResponse } from '../types/fhir';

export type RECEIVE_SKJEMA_DEFINITION = 'skjemautfyller/RECEIVE_SKJEMA_DEFINITION';
export const RECEIVE_SKJEMA_DEFINITION: RECEIVE_SKJEMA_DEFINITION = 'skjemautfyller/RECEIVE_SKJEMA_DEFINITION';

export interface FormAction {
  questionnaire: Questionnaire;
  questionnaireResponse?: QuestionnaireResponse;
  language?: string;
  type: string;
}

export function receiveSkjemaDefinition(
  skjemaDefinition: Questionnaire,
  questionnaireResponse?: QuestionnaireResponse,
  language?: string
): FormAction {
  return {
    type: RECEIVE_SKJEMA_DEFINITION,
    questionnaire: skjemaDefinition,
    questionnaireResponse: questionnaireResponse,
    language: language,
  };
}
