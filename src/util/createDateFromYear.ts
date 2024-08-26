import { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
export function createDateFromYear(item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer): Date | undefined {
  if (answer && answer.valueDate) {
    return new Date(answer.valueDate.padStart(4, '0') + 'T00:00Z');
  } else if (item.initial && item.initial[0].valueDate) {
    return new Date(item.initial[0].valueDate.padStart(4, '0') + 'T00:00Z');
  } else {
    return undefined;
  }
}
