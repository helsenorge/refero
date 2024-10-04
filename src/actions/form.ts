import { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import { Action, createAction } from '@reduxjs/toolkit';

export type SET_SKJEMA_DEFINITION = 'refero/SET_SKJEMA_DEFINITION';
export const SET_SKJEMA_DEFINITION: SET_SKJEMA_DEFINITION = 'refero/SET_SKJEMA_DEFINITION';

export interface FormAction extends Action {
  questionnaire: Questionnaire;
  questionnaireResponse?: QuestionnaireResponse;
  language?: string;
  syncQuestionnaireResponse?: boolean;
  type: string;
}
export type SetFormDefinitionAction = {
  questionnaire: Questionnaire;
  questionnaireResponse?: QuestionnaireResponse;
  language?: string;
  syncQuestionnaireResponse?: boolean;
};
export const setSkjemaDefinitionAction = createAction<SetFormDefinitionAction>(SET_SKJEMA_DEFINITION);
export const setSkjemaDefinition = (
  questionnaire: Questionnaire,
  questionnaireResponse?: QuestionnaireResponse,
  language?: string,
  syncQuestionnaireResponse?: boolean
) => {
  return setSkjemaDefinitionAction({ questionnaire, questionnaireResponse, language, syncQuestionnaireResponse });
};
