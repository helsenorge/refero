import { Questionnaire, QuestionnaireResponse } from '../types/fhir';

export type SET_SKJEMA_DEFINITION = 'skjemautfyller/SET_SKJEMA_DEFINITION';
export const SET_SKJEMA_DEFINITION: SET_SKJEMA_DEFINITION = 'skjemautfyller/SET_SKJEMA_DEFINITION';

export interface FormAction {
  questionnaire: Questionnaire;
  questionnaireResponse?: QuestionnaireResponse;
  language?: string;
  type: string;
}

export function setSkjemaDefinition(
  skjemaDefinition: Questionnaire,
  questionnaireResponse?: QuestionnaireResponse,
  language?: string
): FormAction {
  return {
    type: SET_SKJEMA_DEFINITION,
    questionnaire: skjemaDefinition,
    questionnaireResponse: questionnaireResponse,
    language: language,
  };
}
