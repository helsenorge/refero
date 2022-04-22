import { QuestionnaireItem, QuestionnaireResponseItemAnswer } from '../types/fhir';

export function createQuestionnaireResponseAnswer(item: QuestionnaireItem): QuestionnaireResponseItemAnswer | undefined {
  const answer = {} as QuestionnaireResponseItemAnswer;
  let hasInitialAnswer = false;

  if (item.initial && item.initial.length > 0 && item.initial[0].valueBoolean !== undefined) {
    answer.valueBoolean = item.initial[0].valueBoolean;
    hasInitialAnswer = true;
  } else if (item.type === 'boolean') {
    hasInitialAnswer = true;
    answer.valueBoolean = false;
  }
  if (item.initial && item.initial.length > 0 && item.initial[0].valueDecimal !== undefined) {
    hasInitialAnswer = true;
    answer.valueDecimal = Number(item.initial[0].valueDecimal);
  }
  if (item.initial && item.initial.length > 0 && item.initial[0].valueInteger !== undefined) {
    hasInitialAnswer = true;
    answer.valueInteger = Number(item.initial[0].valueInteger);
  }
  if (item.initial && item.initial.length > 0 && item.initial[0].valueQuantity !== undefined) {
    hasInitialAnswer = true;
    answer.valueQuantity = item.initial[0].valueQuantity;
  }
  if (item.initial && item.initial.length > 0 && item.initial[0].valueDate !== undefined) {
    hasInitialAnswer = true;
    answer.valueDate = String(item.initial[0].valueDate);
  }
  if (item.initial && item.initial.length > 0 && item.initial[0].valueDateTime !== undefined) {
    hasInitialAnswer = true;
    answer.valueDateTime = String(item.initial[0].valueDateTime);
  }
  if (item.initial && item.initial.length > 0 && item.initial[0].valueTime !== undefined) {
    hasInitialAnswer = true;
    answer.valueTime = String(item.initial[0].valueTime);
  }
  if (item.initial && item.initial.length > 0 && item.initial[0].valueString !== undefined) {
    hasInitialAnswer = true;
    answer.valueString = item.initial[0].valueString;
  }
  if (item.initial && item.initial.length > 0 && item.initial[0].valueCoding !== undefined) {
    hasInitialAnswer = true;
    answer.valueCoding = item.initial[0].valueCoding;
  }
  if (item.initial && item.initial.length > 0 && item.initial[0].valueAttachment !== undefined) {
    hasInitialAnswer = true;
    answer.valueAttachment = item.initial[0].valueAttachment;
  }

  return hasInitialAnswer ? answer : undefined;
}
