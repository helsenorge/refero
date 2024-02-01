import { QuestionnaireItem, QuestionnaireResponseItemAnswer } from '../../../types/fhir';

export const getBooleanValue = (answer: QuestionnaireResponseItemAnswer, item: QuestionnaireItem): boolean => {
  if (answer && answer.valueBoolean !== undefined) {
    return answer.valueBoolean;
  }
  if (!item || !item.initial || item.initial.length === 0 || !item.initial[0].valueBoolean) {
    return false;
  }
  return item.initial[0].valueBoolean;
};
