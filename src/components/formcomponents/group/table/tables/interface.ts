import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';

export type QuestionnaireItemWithAnswers = QuestionnaireItem & {
  answer?: QuestionnaireResponseItem['answer'];
  item?: QuestionnaireItemWithAnswers[];
};
