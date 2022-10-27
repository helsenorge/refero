import { QuestionnaireItem, QuestionnaireResponseItemAnswer } from '../types/fhir';
export function createDateFromYear(item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer): Date | undefined {
  if (answer && answer.valueDate) {
    return new Date(answer.valueDate.toString() + 'T00:00Z');
  } else if (item.initial && item.initial[0].valueDate) {
    return new Date(item.initial[0].valueDate.toString() + 'T00:00Z');
  } else {
    return undefined;
  }
}
