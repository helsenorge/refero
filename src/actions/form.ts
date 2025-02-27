import { Action, createAction, PayloadAction } from '@reduxjs/toolkit';
import { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

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
): PayloadAction<SetFormDefinitionAction> => {
  return setSkjemaDefinitionAction({ questionnaire, questionnaireResponse, language, syncQuestionnaireResponse });
};
