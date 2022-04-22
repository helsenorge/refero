import { QuestionnaireResponse, QuestionnaireResponseItem, QuestionnaireResponseItemAnswer } from '../types/fhir';

import { parseDate } from '@helsenorge/date-time/components/time-input/date-core';

import { OPEN_CHOICE_ID } from '../constants';

export const createNarrative = (qr: QuestionnaireResponse | null | undefined): string => {
  let narrative = '';
  if (!qr) {
    return narrative;
  }
  for (let i = 0; qr.item && i < qr.item.length; i++) {
    narrative += createNarrativeForItem(qr.item[i]);
  }
  return `<div xmlns=\"http://www.w3.org/1999/xhtml\">${narrative}</div>`;
};

const createNarrativeForItem = (qi: QuestionnaireResponseItem): string => {
  let narrative = '';
  const hasAnswers = qi.answer && qi.answer.length > 0;
  const hasItems = qi.item && qi.item.length > 0;
  const text = qi.text ? ` ${encode(qi.text)}?` : '';
  narrative += `<p><b>${qi.linkId}.${text}</b>`;
  if (!qi || (!hasItems && !hasAnswers)) {
    return `${narrative}</p>`;
  }
  if (qi.answer) {
    narrative += '</p>';
    qi.answer.forEach((a: QuestionnaireResponseItemAnswer) => {
      narrative += `<p>${encode(getAnswerAsString(a))}</p>`;
      if (a.item && a.item.length > 0) {
        a.item.forEach((ai: QuestionnaireResponseItem) => {
          narrative += createNarrativeForItem(ai);
        });
      }
    });
  }

  if (qi.item && qi.item.length > 0) {
    if (!hasAnswers) {
      narrative = `${narrative}</p>`;
    }
    qi.item.forEach((ai: QuestionnaireResponseItem) => {
      narrative += createNarrativeForItem(ai);
    });
  }
  return narrative;
};

const encode = (s: string): string => {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
};

const getAnswerAsString = (answer: QuestionnaireResponseItemAnswer): string => {
  if (!answer) {
    return '';
  }
  if (answer.valueBoolean === true || answer.valueBoolean === false) {
    return `${answer.valueBoolean}`;
  }
  if (answer.valueTime) {
    return answer.valueTime;
  }
  if (answer.valueDecimal) {
    return `${answer.valueDecimal}`;
  }
  if (answer.valueInteger) {
    return `${answer.valueInteger}`;
  }
  if (answer.valueString) {
    return answer.valueString;
  }
  const coding = answer.valueCoding;
  const codingValue = coding && coding.code ? String(coding.code) : null;
  if (codingValue !== null && codingValue !== undefined && codingValue !== '' && codingValue !== OPEN_CHOICE_ID) {
    return codingValue;
  }
  if (answer.valueDate) {
    return parseDate(answer.valueDate).toISOString();
  }
  if (answer.valueDateTime) {
    return parseDate(answer.valueDateTime).toISOString();
  }
  return '';
};
