import { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

export type SET_SKJEMA_DEFINITION = 'refero/SET_SKJEMA_DEFINITION';
export const SET_SKJEMA_DEFINITION: SET_SKJEMA_DEFINITION = 'refero/SET_SKJEMA_DEFINITION';

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
    questionnaireResponse,
    language,
    syncQuestionnaireResponse,
  };
}
