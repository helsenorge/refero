import moment from 'moment';
import { parseDate } from '@helsenorge/toolkit/components/molecules/time-input/date-core';

import { QuestionnaireItemEnableWhen, QuestionnaireResponseItemAnswer } from '../types/fhir';

export function enableWhenMatches(enableWhen: QuestionnaireItemEnableWhen, answer: QuestionnaireResponseItemAnswer): boolean {
  if (enableWhen.answerBoolean !== undefined) {
    return enableWhenMatchesBooleanAnswer(enableWhen, answer);
  }
  if (enableWhen.answerDecimal) {
    return enableWhenMatchesDecimalAnswer(enableWhen, answer);
  }
  if (enableWhen.answerInteger) {
    return enableWhenMatchesIntegerAnswer(enableWhen, answer);
  }
  if (enableWhen.answerDate) {
    return enableWhenMatchesDateAnswer(enableWhen, answer);
  }
  if (enableWhen.answerDateTime) {
    return enableWhenMatchesDateTimeAnswer(enableWhen, answer);
  }
  if (enableWhen.answerTime) {
    return enableWhenMatchesTimeAnswer(enableWhen, answer);
  }
  if (enableWhen.answerString) {
    return enableWhenMatchesStringAnswer(enableWhen, answer);
  }
  if (enableWhen.answerCoding) {
    return enableWhenMatchesCodeAnswer(enableWhen, answer);
  }
  if (enableWhen.answerQuantity) {
    return enableWhenMatchesQuantityAnswer(enableWhen, answer);
  }
  if (enableWhen.answerReference) {
    return enableWhenMatchesReferenceAnswer(enableWhen, answer);
  }
  return false;
}

function enableWhenMatchesBooleanAnswer(enableWhen: QuestionnaireItemEnableWhen, answer: QuestionnaireResponseItemAnswer): boolean {
  if (enableWhen.answerBoolean === undefined) {
    return false;
  }
  if (answer.valueBoolean === undefined) {
    return false;
  }
  return enableWhen.answerBoolean === answer.valueBoolean;
}

function enableWhenMatchesDecimalAnswer(enableWhen: QuestionnaireItemEnableWhen, answer: QuestionnaireResponseItemAnswer): boolean {
  if (enableWhen.answerDecimal === undefined) {
    return false;
  }
  if (answer.valueDecimal === undefined) {
    return false;
  }
  return enableWhen.answerDecimal === answer.valueDecimal;
}

function enableWhenMatchesIntegerAnswer(enableWhen: QuestionnaireItemEnableWhen, answer: QuestionnaireResponseItemAnswer): boolean {
  if (enableWhen.answerInteger === undefined) {
    return false;
  }
  if (answer.valueInteger === undefined) {
    return false;
  }
  return enableWhen.answerInteger === answer.valueInteger;
}

function enableWhenMatchesDateAnswer(enableWhen: QuestionnaireItemEnableWhen, answer: QuestionnaireResponseItemAnswer): boolean {
  if (enableWhen.answerDate === undefined) {
    return false;
  }
  if (answer.valueDate === undefined) {
    return false;
  }
  return moment(parseDate(String(enableWhen.answerDate))).isSame(parseDate(String(answer.valueDate)));
}

function enableWhenMatchesDateTimeAnswer(enableWhen: QuestionnaireItemEnableWhen, answer: QuestionnaireResponseItemAnswer): boolean {
  if (enableWhen.answerDateTime === undefined) {
    return false;
  }
  if (answer.valueDateTime === undefined) {
    return false;
  }
  return moment(parseDate(String(enableWhen.answerDateTime))).isSame(parseDate(String(answer.valueDateTime)));
}

function enableWhenMatchesTimeAnswer(enableWhen: QuestionnaireItemEnableWhen, answer: QuestionnaireResponseItemAnswer): boolean {
  if (enableWhen.answerTime === undefined) {
    return false;
  }
  if (answer.valueTime === undefined) {
    return false;
  }
  return enableWhen.answerTime === answer.valueTime;
}

function enableWhenMatchesStringAnswer(enableWhen: QuestionnaireItemEnableWhen, answer: QuestionnaireResponseItemAnswer): boolean {
  if (enableWhen.answerString === undefined) {
    return false;
  }
  if (answer.valueString === undefined) {
    return false;
  }
  return enableWhen.answerString === answer.valueString;
}

function enableWhenMatchesCodeAnswer(enableWhen: QuestionnaireItemEnableWhen, answer: QuestionnaireResponseItemAnswer): boolean {
  if (enableWhen.answerCoding === undefined) {
    return false;
  }
  if (answer.valueCoding === undefined) {
    return false;
  }
  return enableWhen.answerCoding.code === answer.valueCoding.code && enableWhen.answerCoding.system === answer.valueCoding.system;
}

function enableWhenMatchesQuantityAnswer(enableWhen: QuestionnaireItemEnableWhen, answer: QuestionnaireResponseItemAnswer): boolean {
  if (enableWhen.answerQuantity === undefined) {
    return false;
  }
  if (answer.valueQuantity === undefined) {
    return false;
  }
  return (
    enableWhen.answerQuantity.code === answer.valueQuantity.code &&
    enableWhen.answerQuantity.system === answer.valueQuantity.system &&
    enableWhen.answerQuantity.value === answer.valueQuantity.value
  );
}

function enableWhenMatchesReferenceAnswer(enableWhen: QuestionnaireItemEnableWhen, answer: QuestionnaireResponseItemAnswer): boolean {
  if (enableWhen.answerReference === undefined) {
    return false;
  }

  if (answer.valueCoding) {
    return enableWhen.answerReference.reference === answer.valueCoding.code;
  }
  if (answer.valueReference) {
    return enableWhen.answerReference.reference === answer.valueReference.reference;
  }

  return false;
}
