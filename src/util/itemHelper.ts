import { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';

export const getValue = (item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer): string | number | number[] | undefined => {
  if (answer && Array.isArray(answer)) {
    return answer.map(m => m.valueDecimal);
  }
  if (answer && answer.valueDecimal !== undefined && answer.valueDecimal !== null) {
    return answer.valueDecimal;
  }
  if (!item || !item.initial || item.initial.length === 0 || !item.initial[0].valueDecimal) {
    return '';
  }
};
