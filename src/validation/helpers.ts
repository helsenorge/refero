import { QuestionnaireItemAnswerOption } from 'fhir/r4';

export const extractCodesFromAnswerOptions = (answerOptions: QuestionnaireItemAnswerOption[]): string[] => {
  return answerOptions.map(option => option.valueCoding?.code).filter((code): code is string => !!code);
};
