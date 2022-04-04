import moment from 'moment';

import { QuestionnaireItemEnableWhen, QuestionnaireResponseItemAnswer, QuestionnaireEnableOperator } from '../types/fhir';

import { parseDate } from '@helsenorge/date-time/components/time-input/date-core';

const EPSILON = 0.0000001;
const OPERATOR_EQUALS = QuestionnaireEnableOperator.Equals.code;
const OPERATOR_NOTEQUALS = QuestionnaireEnableOperator.NotEquals.code;
const OPERATOR_GREATEROREQUALS = QuestionnaireEnableOperator.GreaterOrEquals.code;
const OPERATOR_GREATERTHAN = QuestionnaireEnableOperator.GreaterThan.code;
const OPERATOR_LESSOREQUALS = QuestionnaireEnableOperator.LessOrEquals.code;
const OPERATOR_LESSTHAN = QuestionnaireEnableOperator.LessThan.code;

export function enableWhenMatches(enableWhen: QuestionnaireItemEnableWhen, answer: QuestionnaireResponseItemAnswer): boolean {
  if (enableWhen.answerBoolean !== undefined) {
    return enableWhenMatchesBooleanAnswer(answer.valueBoolean, enableWhen.answerBoolean, enableWhen.operator);
  }
  if (enableWhen.answerDecimal || enableWhen.answerDecimal === 0) {
    return enableWhenMatchesDecimalAnswer(answer.valueDecimal, enableWhen.answerDecimal, enableWhen.operator);
  }
  if (enableWhen.answerInteger || enableWhen.answerInteger === 0) {
    return enableWhenMatchesIntegerAnswer(answer.valueInteger, enableWhen.answerInteger, enableWhen.operator);
  }
  if (enableWhen.answerDate) {
    return enableWhenMatchesDateAnswer(answer.valueDate, enableWhen.answerDate, enableWhen.operator);
  }
  if (enableWhen.answerDateTime) {
    return enableWhenMatchesDateTimeAnswer(answer.valueDateTime, enableWhen.answerDateTime, enableWhen.operator);
  }
  if (enableWhen.answerTime) {
    return enableWhenMatchesStringAnswer(answer.valueTime, enableWhen.answerTime, enableWhen.operator);
  }
  if (enableWhen.answerString || enableWhen.answerString === '') {
    return enableWhenMatchesStringAnswer(answer.valueString, enableWhen.answerString, enableWhen.operator);
  }
  if (enableWhen.answerCoding) {
    if (enableWhen.answerCoding === undefined || answer.valueCoding === undefined) {
      return false;
    }

    const isSameSystem = answer.valueCoding.system === enableWhen.answerCoding.system;
    return isSameSystem && enableWhenMatchesCodeAnswer(answer.valueCoding.code, enableWhen.answerCoding.code, enableWhen.operator);
  }
  if (enableWhen.answerQuantity) {
    if (answer.valueQuantity === undefined || enableWhen.answerQuantity === undefined) {
      return false;
    }

    const isSameSystem = answer.valueQuantity.system === enableWhen.answerQuantity.system;
    const isSameCode = answer.valueQuantity.code === enableWhen.answerQuantity.code;
    return (
      isSameSystem &&
      isSameCode &&
      enableWhenMatchesDecimalAnswer(answer.valueQuantity.value, enableWhen.answerQuantity.value, enableWhen.operator)
    );
  }
  if (enableWhen.answerReference) {
    if (enableWhen.answerReference === undefined) {
      return false;
    }

    if (answer.valueCoding) {
      return enableWhenMatchesReferenceAnswer(answer.valueCoding.code, enableWhen.answerReference.reference, enableWhen.operator);
    }
    if (answer.valueReference) {
      return enableWhenMatchesReferenceAnswer(answer.valueReference.reference, enableWhen.answerReference.reference, enableWhen.operator);
    }
  }

  return false;
}

function enableWhenMatchesBooleanAnswer(
  answerValueBoolean: boolean | undefined,
  enableWhenAnswerBoolean: boolean | undefined,
  operator: string
): boolean {
  if (answerValueBoolean === undefined || enableWhenAnswerBoolean === undefined) {
    return false;
  }

  switch (operator) {
    case OPERATOR_EQUALS:
      return answerValueBoolean === enableWhenAnswerBoolean;
    case OPERATOR_NOTEQUALS:
      return answerValueBoolean !== enableWhenAnswerBoolean;
    case OPERATOR_GREATEROREQUALS:
      return answerValueBoolean === enableWhenAnswerBoolean;
    case OPERATOR_GREATERTHAN:
      return false;
    case OPERATOR_LESSOREQUALS:
      return answerValueBoolean === enableWhenAnswerBoolean;
    case OPERATOR_LESSTHAN:
      return false;
    default:
      return false;
  }
}

function enableWhenMatchesDecimalAnswer(
  answerValueDecimal: number | undefined,
  enableWhenAnswerDecimal: number | undefined,
  operator: string
): boolean {
  if (answerValueDecimal === undefined || enableWhenAnswerDecimal === undefined) {
    return false;
  }

  const lessThan = (first: number, second: number): boolean => first - second < 0;
  const greaterThan = (first: number, second: number): boolean => first - second > 0;
  const equals = (first: number, second: number): boolean => Math.abs(first - second) <= EPSILON;

  switch (operator) {
    case OPERATOR_EQUALS:
      return equals(answerValueDecimal, enableWhenAnswerDecimal);
    case OPERATOR_NOTEQUALS:
      return !equals(answerValueDecimal, enableWhenAnswerDecimal);
    case OPERATOR_GREATEROREQUALS:
      return equals(answerValueDecimal, enableWhenAnswerDecimal) || greaterThan(answerValueDecimal, enableWhenAnswerDecimal);
    case OPERATOR_GREATERTHAN:
      return !equals(answerValueDecimal, enableWhenAnswerDecimal) && greaterThan(answerValueDecimal, enableWhenAnswerDecimal);
    case OPERATOR_LESSOREQUALS:
      return equals(answerValueDecimal, enableWhenAnswerDecimal) || lessThan(answerValueDecimal, enableWhenAnswerDecimal);
    case OPERATOR_LESSTHAN:
      return !equals(answerValueDecimal, enableWhenAnswerDecimal) && lessThan(answerValueDecimal, enableWhenAnswerDecimal);
    default:
      return false;
  }
}

function enableWhenMatchesIntegerAnswer(
  answerValueInteger: number | undefined,
  enableWhenAnswerInteger: number | undefined,
  operator: string
): boolean {
  if (answerValueInteger === undefined || enableWhenAnswerInteger === undefined) {
    return false;
  }

  switch (operator) {
    case OPERATOR_EQUALS:
      return answerValueInteger === enableWhenAnswerInteger;
    case OPERATOR_NOTEQUALS:
      return answerValueInteger !== enableWhenAnswerInteger;
    case OPERATOR_GREATEROREQUALS:
      return answerValueInteger >= enableWhenAnswerInteger;
    case OPERATOR_GREATERTHAN:
      return answerValueInteger > enableWhenAnswerInteger;
    case OPERATOR_LESSOREQUALS:
      return answerValueInteger <= enableWhenAnswerInteger;
    case OPERATOR_LESSTHAN:
      return answerValueInteger < enableWhenAnswerInteger;
    default:
      return false;
  }
}

function enableWhenMatchesDateAnswer(
  answerValueDate: string | undefined,
  enableWhenAnswerDate: string | undefined,
  operator: string
): boolean {
  if (answerValueDate === undefined || enableWhenAnswerDate === undefined) {
    return false;
  }

  const aValueDate = parseDate(String(answerValueDate));
  const ewAnswerDate = parseDate(String(enableWhenAnswerDate));

  switch (operator) {
    case OPERATOR_EQUALS:
      return moment(aValueDate).isSame(ewAnswerDate);
    case OPERATOR_NOTEQUALS:
      return !moment(aValueDate).isSame(ewAnswerDate);
    case OPERATOR_GREATEROREQUALS:
      return moment(aValueDate).isSameOrAfter(ewAnswerDate);
    case OPERATOR_GREATERTHAN:
      return moment(aValueDate).isAfter(ewAnswerDate);
    case OPERATOR_LESSOREQUALS:
      return moment(aValueDate).isSameOrBefore(ewAnswerDate);
    case OPERATOR_LESSTHAN:
      return moment(aValueDate).isBefore(ewAnswerDate);
    default:
      return false;
  }
}

function enableWhenMatchesDateTimeAnswer(
  answerValueDateTime: string | undefined,
  enableWhenAnswerDateTime: string | undefined,
  operator: string
): boolean {
  if (answerValueDateTime === undefined || enableWhenAnswerDateTime === undefined) {
    return false;
  }

  const aValueDateTime = parseDate(String(answerValueDateTime));
  const ewAnswerDateTime = parseDate(String(enableWhenAnswerDateTime));

  switch (operator) {
    case OPERATOR_EQUALS:
      return moment(aValueDateTime).isSame(ewAnswerDateTime);
    case OPERATOR_NOTEQUALS:
      return !moment(aValueDateTime).isSame(ewAnswerDateTime);
    case OPERATOR_GREATEROREQUALS:
      return moment(aValueDateTime).isSameOrAfter(ewAnswerDateTime);
    case OPERATOR_GREATERTHAN:
      return moment(aValueDateTime).isAfter(ewAnswerDateTime);
    case OPERATOR_LESSOREQUALS:
      return moment(aValueDateTime).isSameOrBefore(ewAnswerDateTime);
    case OPERATOR_LESSTHAN:
      return moment(aValueDateTime).isBefore(ewAnswerDateTime);
    default:
      return false;
  }
}

function enableWhenMatchesStringAnswer(
  answerValueString: string | undefined,
  enableWhenAnswerString: string | undefined,
  operator: string
): boolean {
  if (answerValueString === undefined || enableWhenAnswerString === undefined) {
    return false;
  }

  const compareEquals = answerValueString.localeCompare(enableWhenAnswerString);

  switch (operator) {
    case OPERATOR_EQUALS:
      return compareEquals === 0;
    case OPERATOR_NOTEQUALS:
      return compareEquals !== 0;
    case OPERATOR_GREATEROREQUALS:
      return compareEquals >= 0;
    case OPERATOR_GREATERTHAN:
      return compareEquals > 0;
    case OPERATOR_LESSOREQUALS:
      return compareEquals <= 0;
    case OPERATOR_LESSTHAN:
      return compareEquals < 0;
    default:
      return false;
  }
}

function enableWhenMatchesCodeAnswer(answerCode: string | undefined, enableWhenCode: string | undefined, operator: string): boolean {
  if (answerCode === undefined || enableWhenCode === undefined) {
    return false;
  }

  switch (operator) {
    case OPERATOR_EQUALS:
      return answerCode == enableWhenCode;
    case OPERATOR_NOTEQUALS:
      return answerCode != enableWhenCode;
    case OPERATOR_GREATEROREQUALS:
      return answerCode == enableWhenCode || false;
    case OPERATOR_GREATERTHAN:
      return false;
    case OPERATOR_LESSOREQUALS:
      return answerCode == enableWhenCode || false;
    case OPERATOR_LESSTHAN:
      return false;
    default:
      return false;
  }
}

function enableWhenMatchesReferenceAnswer(
  answerReference: string | undefined,
  enableWhenReference: string | undefined,
  operator: string
): boolean {
  if (answerReference === undefined || enableWhenReference === undefined) {
    return false;
  }

  switch (operator) {
    case OPERATOR_EQUALS:
      return answerReference == enableWhenReference;
    case OPERATOR_NOTEQUALS:
      return answerReference != enableWhenReference;
    case OPERATOR_GREATEROREQUALS:
      return answerReference == enableWhenReference || false;
    case OPERATOR_GREATERTHAN:
      return false;
    case OPERATOR_LESSOREQUALS:
      return answerReference == enableWhenReference || false;
    case OPERATOR_LESSTHAN:
      return false;
    default:
      return false;
  }
}
