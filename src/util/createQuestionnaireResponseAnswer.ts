import { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';

export function createQuestionnaireResponseAnswer(item: QuestionnaireItem): QuestionnaireResponseItemAnswer | undefined {
  const answer: QuestionnaireResponseItemAnswer = {};

  let hasInitialAnswer = false;
  const initialSelectedOption = item?.answerOption?.find(x => x.initialSelected);

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
  if (item.initial && item.initial.length > 0 && item.initial[0].valueReference !== undefined) {
    hasInitialAnswer = true;
    answer.valueReference = item.initial[0].valueReference;
  }
  if (initialSelectedOption) {
    hasInitialAnswer = true;
    if (initialSelectedOption.valueCoding) {
      answer.valueCoding = initialSelectedOption.valueCoding;
    }
    if (initialSelectedOption.valueString) {
      answer.valueString = initialSelectedOption.valueString;
    } else if (initialSelectedOption.valueDate) {
      answer.valueString = initialSelectedOption.valueDate;
    } else if (initialSelectedOption.valueTime) {
      answer.valueString = initialSelectedOption.valueTime;
    } else if (initialSelectedOption.valueInteger) {
      answer.valueInteger = initialSelectedOption.valueInteger;
    } else if (initialSelectedOption.valueReference) {
      answer.valueReference = initialSelectedOption.valueReference;
    }
  }

  return hasInitialAnswer ? answer : undefined;
}
export function createQuestionnaireResponseAnswers(item: QuestionnaireItem): QuestionnaireResponseItemAnswer[] | undefined {
  const answers: QuestionnaireResponseItemAnswer[] = [];
  let hasInitialAnswer = false;
  const initialSelectedOption = item?.answerOption?.filter(x => x.initialSelected);

  if (item.initial && item.initial.length > 0) {
    answers.push(...item.initial);
    hasInitialAnswer = true;
  } else if (item.type === 'boolean') {
    hasInitialAnswer = true;
    answers.push({ valueBoolean: false });
  }

  if (initialSelectedOption && initialSelectedOption.length > 0) {
    hasInitialAnswer = true;
    answers.push(...initialSelectedOption);
  }

  return hasInitialAnswer ? answers : undefined;
}
