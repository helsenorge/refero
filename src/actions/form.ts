import { Questionnaire } from '../types/fhir';
import { QuestionnaireResponse } from '../types/fhir';

export type SET_SKJEMA_DEFINITION = 'skjemautfyller/SET_SKJEMA_DEFINITION';
export const SET_SKJEMA_DEFINITION: SET_SKJEMA_DEFINITION = 'skjemautfyller/SET_SKJEMA_DEFINITION';

export interface FormAction {
  questionnaire: Questionnaire;
  questionnaireResponse?: QuestionnaireResponse;
  language?: string;
  syncQuestionnaireResponse?: boolean;
  type: string;
}

export function setSkjemaDefinition(
  skjemaDefinition: Questionnaire,
  questionnaireResponse?: QuestionnaireResponse,
  language?: string,
  syncQuestionnaireResponse?: boolean
): FormAction {
  return {
    type: SET_SKJEMA_DEFINITION,
    questionnaire: skjemaDefinition,
    questionnaireResponse: questionnaireResponse,
    language: language,
    syncQuestionnaireResponse: syncQuestionnaireResponse,
  };
}
