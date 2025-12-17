import type {
  QuestionnaireResponse,
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
} from 'fhir/r4';

import { createQuestionnaireResponseItem } from './generateQuestionnaireResponse';
import ItemType from '../constants/itemType';
import {
  hasAnswer,
  hasAttachmentAnswer,
  hasBooleanAnswer,
  hasCodingAnswer,
  hasDateAnswer,
  hasDateTimeAnswer,
  hasDecimalAnswer,
  hasIntegerAnswer,
  hasStringAnswer,
  hasQuantityAnswer,
  hasTimeAnswer,
} from '../util/refero-core';

interface Dictionary<T> {
  [linkId: string]: T[];
}

function copyItem(qItem: QuestionnaireItem, qrItem: QuestionnaireResponseItem): QuestionnaireResponseItem {
  const newQrItem = synQuestionnaireResponseItem(qItem, qrItem);
  return newQrItem;
}

function createNewItem(qItem: QuestionnaireItem): QuestionnaireResponseItem {
  const qrItem = createQuestionnaireResponseItem(qItem);
  return synQuestionnaireResponseItem(qItem, qrItem);
}

export function syncQuestionnaireResponse(q: Questionnaire, qr: QuestionnaireResponse): QuestionnaireResponse {
  const newQr: QuestionnaireResponse = { ...qr };
  const qrItemCopy: QuestionnaireResponseItem[] = [];
  const qrItems = createDictionary(qr.item || []);
  for (const qItem of q.item || []) {
    const linkId = qItem.linkId;

    if (qrItems[linkId]) {
      if (hasChanged(qItem, qrItems[linkId])) {
        qrItemCopy.push(createNewItem(qItem));
      } else {
        for (const qrItem of qrItems[linkId]) {
          qrItemCopy.push(copyItem(qItem, qrItem));
        }
      }
    } else {
      qrItemCopy.push(createNewItem(qItem));
    }
  }

  newQr.item = qrItemCopy;
  return newQr;
}

function synQuestionnaireResponseItem(qItem: QuestionnaireItem, qrItem: QuestionnaireResponseItem): QuestionnaireResponseItem {
  const newQrItem = JSON.parse(JSON.stringify(qrItem)) as QuestionnaireResponseItem;
  const qrItemCopy: QuestionnaireResponseItem[] = [];
  const qrAnswerItemCopy: QuestionnaireResponseItem[] = [];
  const qrItems = createDictionary(qrItem.item || []);
  const qrAnswerItems = createDictionary(qrItem.answer && qrItem.answer[0].item ? qrItem.answer[0].item : []);
  for (const subQItem of qItem.item || []) {
    const linkId = subQItem.linkId;

    if (qrItems[linkId]) {
      if (hasChanged(subQItem, qrItems[linkId])) {
        qrItemCopy.push(createNewItem(subQItem));
      } else {
        for (const subQrItem of qrItems[linkId]) {
          qrItemCopy.push(copyItem(subQItem, subQrItem));
        }
      }
    } else if (qrAnswerItems[linkId]) {
      if (hasChanged(subQItem, qrAnswerItems[linkId])) {
        qrAnswerItemCopy.push(createNewItem(subQItem));
      } else {
        for (const subQrItem of qrAnswerItems[linkId]) {
          qrAnswerItemCopy.push(copyItem(subQItem, subQrItem));
        }
      }
    } else {
      const newQrSubItem = createNewItem(subQItem);
      if (qItem.type == ItemType.GROUP) {
        qrItemCopy.push(newQrSubItem);
      } else {
        qrAnswerItemCopy.push(newQrSubItem);
      }
    }
  }

  if (qrItemCopy.length > 0) {
    newQrItem.item = qrItemCopy;
  } else {
    delete newQrItem.item;
  }
  if (qrAnswerItemCopy.length > 0) {
    if (!newQrItem.answer) {
      newQrItem.answer = [];
    }
    if (!newQrItem.answer[0]) {
      newQrItem.answer.push({});
    }
    newQrItem.answer[0].item = qrAnswerItemCopy;
  } else {
    if (newQrItem.answer && newQrItem.answer.length > 0) {
      delete newQrItem.answer[0].item;
    }
  }
  return newQrItem;
}

function hasChanged(qItem: QuestionnaireItem, qrItems: QuestionnaireResponseItem[]): boolean {
  const qrItemWithAnswer = qrItems.find(it => it.answer && it.answer.some(a => hasAnswer(a)));
  if (!qrItemWithAnswer || !qrItemWithAnswer.answer) return false;

  const answer = qrItemWithAnswer.answer.find(it => hasAnswer(it));
  if (!answer) {
    return false;
  }

  return !itemTypeMatchesAnswerValue(qItem.type, answer);
}

function itemTypeMatchesAnswerValue(type: string, answer: QuestionnaireResponseItemAnswer): boolean {
  switch (type) {
    case ItemType.ATTATCHMENT:
      return hasAttachmentAnswer(answer);
    case ItemType.BOOLEAN:
      return hasBooleanAnswer(answer);
    case ItemType.CHOICE:
      return hasCodingAnswer(answer);
    case ItemType.DATE:
      return hasDateAnswer(answer);
    case ItemType.DATETIME:
      return hasDateTimeAnswer(answer);
    case ItemType.DECIMAL:
      return hasDecimalAnswer(answer);
    case ItemType.DISPLAY:
    case ItemType.GROUP:
      return false;
    case ItemType.INTEGER:
      return hasIntegerAnswer(answer);
    case ItemType.OPENCHOICE:
      return hasCodingAnswer(answer) || hasStringAnswer(answer);
    case ItemType.QUANTITY:
      return hasQuantityAnswer(answer);
    case ItemType.STRING:
    case ItemType.TEXT:
      return hasStringAnswer(answer);
    case ItemType.TIME:
      return hasTimeAnswer(answer);
    default:
      return false;
  }
}

function createDictionary(qrItems: QuestionnaireResponseItem[]): Dictionary<QuestionnaireResponseItem> {
  const dictionary: Dictionary<QuestionnaireResponseItem> = {};
  for (const item of qrItems) {
    const linkId = transform(item.linkId);
    if (!dictionary[linkId]) {
      dictionary[linkId] = [];
    }

    dictionary[linkId].push({ ...item, linkId: linkId });
  }

  return dictionary;
}

function transform(linkId: string): string {
  return linkId.split('^')[0];
}
