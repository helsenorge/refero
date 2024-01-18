import { QuestionnaireItem, QuestionnaireResponseItem } from '../../../../types/fhir';

export type QuestionnaireItemWithAnswers = QuestionnaireItem & {
  answer?: QuestionnaireResponseItem['answer'];
};
