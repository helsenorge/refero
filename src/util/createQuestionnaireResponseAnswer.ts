import { QuestionnaireItem, QuestionnaireResponseAnswer } from '../types/fhir';

export function createQuestionnaireResponseAnswer(item: QuestionnaireItem): QuestionnaireResponseAnswer | undefined {
  const answer = {} as QuestionnaireResponseAnswer;
  let hasInitialAnswer = false;

  if (item.initialBoolean !== undefined) {
    answer.valueBoolean = item.initialBoolean;
    hasInitialAnswer = true;
  } else if (item.type === 'boolean') {
    hasInitialAnswer = true;
    answer.valueBoolean = false;
  }
  if (item.initialDecimal !== undefined) {
    hasInitialAnswer = true;
    answer.valueDecimal = Number(item.initialDecimal);
  }
  if (item.initialInteger !== undefined) {
    hasInitialAnswer = true;
    answer.valueInteger = Number(item.initialInteger);
  }
  if (item.initialDate !== undefined) {
    hasInitialAnswer = true;
    answer.valueDate = String(item.initialDate);
  }
  if (item.initialDateTime !== undefined) {
    hasInitialAnswer = true;
    answer.valueDateTime = String(item.initialDateTime);
  }
  if (item.initialTime !== undefined) {
    hasInitialAnswer = true;
    answer.valueTime = String(item.initialTime);
  }
  if (item.initialString !== undefined) {
    hasInitialAnswer = true;
    answer.valueString = item.initialString;
  }
  if (item.initialCoding !== undefined) {
    hasInitialAnswer = true;
    answer.valueCoding = item.initialCoding;
  }
  if (item.initialAttachment !== undefined) {
    hasInitialAnswer = true;
    answer.valueAttachment = item.initialAttachment;
  }

  return hasInitialAnswer ? answer : undefined;
}
