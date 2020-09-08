import {
  QuestionnaireResponse,
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponseItem,
  QuestionnaireItemTypeList,
  QuestionnaireResponseAnswer,
} from '../types/fhir';
import { createQuestionnaireResponseItem } from './generateQuestionnaireResponse';
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
} from '../util/skjemautfyller-core';
import ItemType from '../constants/itemType';

interface Dictionary<T> {
  [linkId: string]: T[];
}

function createNewItem(qItem: QuestionnaireItem): QuestionnaireResponseItem {
  var qrItem = createQuestionnaireResponseItem(qItem);
  synQuestionnaireResponseItem(qItem, qrItem);
  return qrItem;
}

function copyItem(qItem: QuestionnaireItem, qrItem: QuestionnaireResponseItem): QuestionnaireResponseItem {
  synQuestionnaireResponseItem(qItem, qrItem);
  return qrItem;
}

export function syncQuestionnaireResponse(q: Questionnaire, qr: QuestionnaireResponse) {
  let qrItemCopy: QuestionnaireResponseItem[] = [];
  let qrItems = createDictionary(qr.item || []);
  for (let qItem of q.item || []) {
    let linkId = qItem.linkId;

    if (qrItems[linkId]) {
      if (hasChanged(qItem, qrItems[linkId])) {
        qrItemCopy.push(createNewItem(qItem));
      } else {
        for (let qrItem of qrItems[linkId]) {
          qrItemCopy.push(copyItem(qItem, qrItem));
        }
      }
    } else {
      qrItemCopy.push(createNewItem(qItem));
    }
  }

  qr.item = qrItemCopy;
  return qr;
}

function synQuestionnaireResponseItem(qItem: QuestionnaireItem, qrItem: QuestionnaireResponseItem) {
  var qrItemCopy: QuestionnaireResponseItem[] = [];
  var qrAnswerItemCopy: QuestionnaireResponseItem[] = [];
  var qrItems = createDictionary(qrItem.item || []);
  var qrAnswerItems = createDictionary(qrItem.answer && qrItem.answer[0].item ? qrItem.answer[0].item : []);
  for (let subQItem of qItem.item || []) {
    let linkId = subQItem.linkId;

    if (qrItems[linkId]) {
      if (hasChanged(subQItem, qrItems[linkId])) {
        qrItemCopy.push(createNewItem(subQItem));
      } else {
        for (let subQrItem of qrItems[linkId]) {
          qrItemCopy.push(copyItem(subQItem, subQrItem));
        }
      }
    } else if (qrAnswerItems[linkId]) {
      if (hasChanged(subQItem, qrAnswerItems[linkId])) {
        qrAnswerItemCopy.push(createNewItem(subQItem));
      } else {
        for (let subQrItem of qrAnswerItems[linkId]) {
          qrAnswerItemCopy.push(copyItem(subQItem, subQrItem));
        }
      }
    } else {
      let newQrItem = createNewItem(subQItem);
      if (qItem.type == ItemType.GROUP) {
        qrItemCopy.push(newQrItem);
      } else {
        qrAnswerItemCopy.push(newQrItem);
      }
    }
  }

  if (qrItemCopy.length > 0) {
    qrItem.item = qrItemCopy;
  } else {
    delete qrItem.item;
  }
  if (qrAnswerItemCopy.length > 0) {
    if (!qrItem.answer) {
      qrItem.answer = [];
    }
    if (!qrItem.answer[0]) {
      qrItem.answer.push({} as QuestionnaireResponseAnswer);
    }
    qrItem.answer[0].item = qrAnswerItemCopy;
  } else {
    if (qrItem.answer && qrItem.answer.length > 0) {
      delete qrItem.answer[0].item;
    }
  }
}

function hasChanged(qItem: QuestionnaireItem, qrItems: QuestionnaireResponseItem[]): boolean {
  var qrItemWithAnswer = qrItems.find(it => it.answer && it.answer.some(a => hasAnswer(a)));
  if (!qrItemWithAnswer || !qrItemWithAnswer.answer) return false;

  var answer = qrItemWithAnswer.answer.find(it => hasAnswer(it));
  if (!answer) {
    return false;
  }

  return !itemTypeMatchesAnswerValue(qItem.type, answer);
}

function itemTypeMatchesAnswerValue(type: QuestionnaireItemTypeList, answer: QuestionnaireResponseAnswer): boolean {
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
  let dictionary: Dictionary<QuestionnaireResponseItem> = {};
  for (let item of qrItems) {
    if (!dictionary[item.linkId]) {
      dictionary[item.linkId] = [];
    }

    dictionary[item.linkId].push(item);
  }

  return dictionary;
}
