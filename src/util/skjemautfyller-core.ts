import {
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseAnswer,
  QuestionnaireItem,
  QuestionnaireEnableWhen,
} from '../types/fhir';
import { GlobalState } from '../reducers/index';
import { FormData, getFormDefinition, FormDefinition, getFormData } from '../reducers/form';
import { Props } from '../components/with-common-functions';
import { parseDate } from '@helsenorge/toolkit/components/atoms/time-input/date-core';
import * as moment from 'moment';
import { Dispatch } from 'redux';
import ItemType from '../constants/itemType';
import { getMinOccursExtensionValue } from './extension';

export function getQuestionnaireResponseItemFromData(
  definitionLinkId: string,
  formData: FormData,
  removeSuffix = false
): Array<QuestionnaireResponseItem> | undefined {
  if (!formData || !formData.Content) {
    return undefined;
  }
  const content = formData.Content;
  if (!content.item || content.item.length === 0) {
    return undefined;
  }
  return getItemWithIdFromResponseItemArray(definitionLinkId, content.item, removeSuffix);
}

export function getAllResponseItemsWithLinkid(
  definitionLinkId: string,
  responseItems: QuestionnaireResponseItem[] | undefined,
  removeSuffix = false
): QuestionnaireResponseItem[] {
  if (!responseItems) {
    return [];
  }
  let relatedResponseItems: QuestionnaireResponseItem[] = [];

  var getResponseItemsWithLinkid = function(
    definitionLinkId: string,
    responseItem: QuestionnaireResponseItem | QuestionnaireResponseAnswer
  ): void {
    if (!responseItem) {
      return;
    }
    const responseAsAnswer = responseItem as QuestionnaireResponseItem;
    const hasItems = responseItem.item && responseItem.item.length > 0;
    const hasAnswers = responseAsAnswer.answer && responseAsAnswer.answer.length > 0;
    if (!hasItems && !hasAnswers) {
      return;
    }

    const itemsWithLinkId = getItemWithIdFromResponseItemArray(definitionLinkId, responseItem.item, removeSuffix);
    if (itemsWithLinkId && itemsWithLinkId.length > 0) {
      itemsWithLinkId.forEach(i => {
        relatedResponseItems.push(i);
      });
    }

    for (let i = 0; responseItem.item && i < responseItem.item.length; i++) {
      getResponseItemsWithLinkid(definitionLinkId, responseItem.item[i]);
    }

    // linkId not found in items, check the answers for items
    if (!hasAnswers) {
      return;
    }
    for (let i = 0; responseAsAnswer.answer && i < responseAsAnswer.answer.length; i++) {
      const answerWithLinkId = getItemWithIdFromResponseItemArray(definitionLinkId, responseAsAnswer.answer[i].item, removeSuffix);
      if (answerWithLinkId && answerWithLinkId.length > 0) {
        answerWithLinkId.forEach(i => {
          relatedResponseItems.push(i);
        });
      }
    }

    // for (let i = 0; responseAsAnswer.answer && i < responseAsAnswer.answer.length; i++) {
    //   getResponseItemsWithLinkid(definitionLinkId, responseAsAnswer.answer[i]);
    // }
  };

  for (let k = 0; k < responseItems.length; k++) {
    getResponseItemsWithLinkid(definitionLinkId, responseItems[k]);
  }

  return relatedResponseItems;
}

export function getAllResponseItemsWithType(
  type: string,
  responseItems: QuestionnaireResponseItem[] | undefined
): QuestionnaireResponseItem[] {
  if (!responseItems) {
    return [];
  }
  let relatedResponseItems: QuestionnaireResponseItem[] = [];

  var getResponseItemsWithType = function(Type: string, responseItem: QuestionnaireResponseItem | QuestionnaireResponseAnswer): void {
    if (!responseItem) {
      return;
    }
    const responseAsAnswer = responseItem as QuestionnaireResponseItem;
    const hasItems = responseItem.item && responseItem.item.length > 0;
    const hasAnswers = responseAsAnswer.answer && responseAsAnswer.answer.length > 0;
    if (!hasItems && !hasAnswers) {
      return;
    }

    const itemsWithType = getItemWithTypeFromArray(Type, responseItem.item);
    if (itemsWithType && itemsWithType.length > 0) {
      itemsWithType.forEach(i => {
        relatedResponseItems.push(i);
      });
    }

    for (let i = 0; responseItem.item && i < responseItem.item.length; i++) {
      getResponseItemsWithType(Type, responseItem.item[i]);
    }

    // linkId not found in items, check the answers for items
    if (!hasAnswers) {
      return;
    }
    for (let i = 0; responseAsAnswer.answer && i < responseAsAnswer.answer.length; i++) {
      const answerWithType = getItemWithTypeFromArray(type, responseAsAnswer.answer[i].item);
      if (answerWithType && answerWithType.length > 0) {
        answerWithType.forEach(i => {
          relatedResponseItems.push(i);
        });
      }
    }

    for (let i = 0; responseAsAnswer.answer && i < responseAsAnswer.answer.length; i++) {
      getResponseItemsWithType(type, responseAsAnswer.answer[i]);
    }
  };

  for (let k = 0; k < responseItems.length; k++) {
    getResponseItemsWithType(type, responseItems[k]);
  }

  return relatedResponseItems;
}

export function getQuestionnaireResponseItemWithLinkid(
  linkId: string,
  responseItem: QuestionnaireResponseItem | QuestionnaireResponseAnswer | undefined,
  recursive = false,
  removeSuffix = false
): QuestionnaireResponseItem | undefined {
  if (!responseItem) {
    return undefined;
  }
  const responseAsAnswer = responseItem as QuestionnaireResponseItem;
  const hasItems = responseItem.item && responseItem.item.length > 0;
  const hasAnswers = responseAsAnswer.answer && responseAsAnswer.answer.length > 0;
  if (!hasItems && !hasAnswers) {
    return undefined;
  }

  const itemsWithLinkId = getItemWithIdFromResponseItemArray(linkId, responseItem.item, removeSuffix);
  if (itemsWithLinkId && itemsWithLinkId.length > 0) {
    return itemsWithLinkId[0];
  }

  if (recursive) {
    for (let i = 0; responseItem.item && i < responseItem.item.length; i++) {
      const item = getQuestionnaireResponseItemWithLinkid(linkId, responseItem.item[i], recursive, removeSuffix);
      if (item) {
        return item;
      }
    }
  }

  // linkId not found in items, check the answers for items
  if (!hasAnswers && !recursive) {
    return undefined;
  }
  for (let i = 0; responseAsAnswer.answer && i < responseAsAnswer.answer.length; i++) {
    const answerWithLinkId = getItemWithIdFromResponseItemArray(linkId, responseAsAnswer.answer[i].item, removeSuffix);
    if (answerWithLinkId && answerWithLinkId.length >= 0) {
      return answerWithLinkId[0];
    }
  }

  if (recursive) {
    for (let i = 0; responseAsAnswer.answer && i < responseAsAnswer.answer.length; i++) {
      const answer = getQuestionnaireResponseItemWithLinkid(linkId, responseAsAnswer.answer[i], recursive, removeSuffix);
      if (answer) {
        return answer;
      }
    }
  }
  return undefined;
}

export function getAnswerFromResponseItem(responseItem: QuestionnaireResponseItem | undefined) {
  if (!responseItem) {
    return undefined;
  }
  if (!responseItem.answer || responseItem.answer.length === 0) {
    return undefined;
  }
  if (responseItem.answer.length > 1) {
    return responseItem.answer;
  }
  return responseItem.answer[0];
}

export function getResponseItems(formData: FormData | null): Array<QuestionnaireResponseItem> | undefined {
  if (!formData || !formData.Content) {
    return undefined;
  }
  const response = formData.Content;
  if (!response.item || response.item.length === 0) {
    return undefined;
  }
  return response.item;
}

export function getDefinitionItems(formDefinition: FormDefinition | null): Array<QuestionnaireItem> | undefined {
  if (!formDefinition || !formDefinition.Content) {
    return undefined;
  }
  const definition = formDefinition.Content;
  if (!definition.item || definition.item.length === 0) {
    return undefined;
  }
  return definition.item;
}

export function getItemWithIdFromResponseItemArray(
  linkId: string,
  responseItems: Array<QuestionnaireResponseItem> | undefined,
  removeSuffix = false
): Array<QuestionnaireResponseItem> | undefined {
  if (!responseItems || responseItems.length === 0) {
    return undefined;
  }
  const filteredItems = responseItems.filter(i => {
    if (removeSuffix) {
      return i.linkId.split('^')[0] === linkId;
    }
    return i.linkId === linkId;
  });
  if (!filteredItems || filteredItems.length === 0) {
    return undefined;
  }
  return filteredItems;
}

export function getItemWithTypeFromArray(
  type: string,
  items: Array<QuestionnaireResponseItem> | undefined
): Array<QuestionnaireResponseItem> | undefined {
  if (!items || items.length === 0) {
    return undefined;
  }
  let filteredItems: Array<QuestionnaireResponseItem> = [];
  if (type === ItemType.ATTATCHMENT) {
    filteredItems = items.filter(
      i => i.answer && i.answer[0] && i.answer[0].valueAttachment !== null && i.answer[0].valueAttachment !== undefined
    );
  }
  if (!filteredItems || filteredItems.length === 0) {
    return undefined;
  }
  return filteredItems;
}

function enableWhenMatchesBooleanAnswer(enableWhen: QuestionnaireEnableWhen, answer: QuestionnaireResponseAnswer): boolean {
  if (enableWhen.answerBoolean === undefined) {
    return false;
  }
  if (answer.valueBoolean === undefined) {
    return false;
  }
  return enableWhen.answerBoolean === answer.valueBoolean;
}

function enableWhenMatchesDecimalAnswer(enableWhen: QuestionnaireEnableWhen, answer: QuestionnaireResponseAnswer): boolean {
  if (enableWhen.answerDecimal === undefined) {
    return false;
  }
  if (answer.valueDecimal === undefined) {
    return false;
  }
  return enableWhen.answerDecimal === answer.valueDecimal;
}

function enableWhenMatchesIntegerAnswer(enableWhen: QuestionnaireEnableWhen, answer: QuestionnaireResponseAnswer): boolean {
  if (enableWhen.answerInteger === undefined) {
    return false;
  }
  if (answer.valueInteger === undefined) {
    return false;
  }
  return enableWhen.answerInteger === answer.valueInteger;
}

function enableWhenMatchesDateAnswer(enableWhen: QuestionnaireEnableWhen, answer: QuestionnaireResponseAnswer): boolean {
  if (enableWhen.answerDate === undefined) {
    return false;
  }
  if (answer.valueDate === undefined) {
    return false;
  }
  return moment(parseDate(String(enableWhen.answerDate))).isSame(parseDate(String(answer.valueDate)));
}

function enableWhenMatchesDateTimeAnswer(enableWhen: QuestionnaireEnableWhen, answer: QuestionnaireResponseAnswer): boolean {
  if (enableWhen.answerDateTime === undefined) {
    return false;
  }
  if (answer.valueDateTime === undefined) {
    return false;
  }
  return moment(parseDate(String(enableWhen.answerDateTime))).isSame(parseDate(String(answer.valueDateTime)));
}

function enableWhenMatchesTimeAnswer(enableWhen: QuestionnaireEnableWhen, answer: QuestionnaireResponseAnswer): boolean {
  if (enableWhen.answerTime === undefined) {
    return false;
  }
  if (answer.valueTime === undefined) {
    return false;
  }
  return enableWhen.answerTime === answer.valueTime;
}

function enableWhenMatchesStringAnswer(enableWhen: QuestionnaireEnableWhen, answer: QuestionnaireResponseAnswer): boolean {
  if (enableWhen.answerString === undefined) {
    return false;
  }
  if (answer.valueString === undefined) {
    return false;
  }
  return enableWhen.answerString === answer.valueString;
}

function enableWhenMatchesCodeAnswer(enableWhen: QuestionnaireEnableWhen, answer: QuestionnaireResponseAnswer): boolean {
  if (enableWhen.answerCoding === undefined) {
    return false;
  }
  if (answer.valueCoding === undefined) {
    return false;
  }
  return enableWhen.answerCoding.code === answer.valueCoding.code && enableWhen.answerCoding.system === answer.valueCoding.system;
}

function enableWhenMatchesReferenceAnswer(enableWhen: QuestionnaireEnableWhen, answer: QuestionnaireResponseAnswer): boolean {
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

export function hasAnswer(answer: QuestionnaireResponseAnswer): boolean {
  if (!answer) {
    return false;
  }
  if (answer.valueBoolean === true || answer.valueBoolean === false) {
    return true;
  }
  const coding = answer.valueCoding;
  const codingValue = coding && coding.code ? String(coding.code) : null;
  if (codingValue !== null && codingValue !== undefined && codingValue !== '') {
    return true;
  }
  if (answer.valueDate) {
    return true;
  }
  if (answer.valueDateTime) {
    return true;
  }
  if (answer.valueDecimal) {
    return true;
  }
  if (answer.valueInteger || answer.valueInteger === 0) {
    return true;
  }
  if (answer.valueString) {
    return true;
  }
  if (answer.valueTime) {
    return true;
  }
  return false;
}

export function enableWhenMatchesAnswer(
  enableWhen: QuestionnaireEnableWhen,
  answers: Array<QuestionnaireResponseAnswer> | undefined
): boolean {
  if (!enableWhen || !answers) {
    return false;
  }
  let matches = true;
  answers.forEach((answer: QuestionnaireResponseAnswer) => {
    if (enableWhen.hasAnswer === true || enableWhen.hasAnswer === false) {
      matches = matches && hasAnswer(answer);
      return;
    }
    if (enableWhen.answerBoolean !== undefined) {
      matches = matches && enableWhenMatchesBooleanAnswer(enableWhen, answer);
    }
    if (enableWhen.answerDecimal) {
      matches = matches && enableWhenMatchesDecimalAnswer(enableWhen, answer);
    }
    if (enableWhen.answerInteger) {
      matches = matches && enableWhenMatchesIntegerAnswer(enableWhen, answer);
    }
    if (enableWhen.answerDate) {
      matches = matches && enableWhenMatchesDateAnswer(enableWhen, answer);
    }
    if (enableWhen.answerDateTime) {
      matches = matches && enableWhenMatchesDateTimeAnswer(enableWhen, answer);
    }
    if (enableWhen.answerTime) {
      matches = matches && enableWhenMatchesTimeAnswer(enableWhen, answer);
    }
    if (enableWhen.answerString) {
      matches = matches && enableWhenMatchesStringAnswer(enableWhen, answer);
    }
    if (enableWhen.answerCoding) {
      matches = matches && enableWhenMatchesCodeAnswer(enableWhen, answer);
    }
    if (enableWhen.answerReference) {
      matches = matches && enableWhenMatchesReferenceAnswer(enableWhen, answer);
    }
  });
  return matches;
}

export function selectComponent(state: GlobalState, originalProps: Props) {
  if (!originalProps.item || !originalProps.item.enableWhen) {
    return { ...originalProps, enable: true } as Props;
  }
  let enable = false;
  originalProps.item.enableWhen.forEach((enableWhen: QuestionnaireEnableWhen) => {
    const definitionItems = getDefinitionItems(getFormDefinition(state));
    const enableWhenQuestionItem = getQuestionnaireDefinitionItem(enableWhen.question, definitionItems);
    const responseItems = getResponseItems(getFormData(state));
    let enableWhenQuestion = enableWhen.question;
    let parentPath = undefined;
    if (originalProps.path) {
      parentPath = originalProps.path.slice(0, -1);
    }

    if (wrappedByRepeatItem(parentPath) && originalProps.id && originalProps.id.includes('^')) {
      enableWhenQuestion += originalProps.id.substring(originalProps.id.indexOf('^'));
    }

    for (let i = 0; responseItems && i < responseItems.length; i++) {
      let responseItem: QuestionnaireResponseItem | undefined = responseItems[i];
      if (responseItem.linkId !== enableWhen.question) {
        responseItem = getQuestionnaireResponseItemWithLinkid(enableWhenQuestion, responseItems[i], true);
      }
      if (!responseItem) {
        continue;
      }
      let deactivated = enableWhenQuestionItem ? enableWhenQuestionItem.deactivated : false;
      enable = enable || (enableWhenMatchesAnswer(enableWhen, responseItem.answer) && !deactivated);
    }
  });
  return { ...originalProps, enable } as Props;
}

export function mergeProps(stateProps: Props, dispatchProps: Props, ownProps: Props) {
  return Object.assign({}, ownProps, stateProps, dispatchProps);
}

export function mapDispatchToProps(dispatch: Dispatch<{}>, props: Props): Props {
  return {
    dispatch,
    path: props.path,
  };
}

export interface Path {
  linkId: string;
  // repeatIndex?: number;
}

export function wrappedByRepeatItem(path: Array<Path> | undefined): boolean {
  if (!path) {
    return false;
  }
  let wrappedByRepeatItem = false;
  path.forEach(path => {
    if (path.linkId.includes('^')) {
      wrappedByRepeatItem = true;
    }
  });
  return wrappedByRepeatItem;
}

export function createPathForItem(
  path: Array<Path> | undefined,
  item: QuestionnaireItem,
  responseItem: QuestionnaireResponseItem
): Array<Path> {
  let newPath: Array<Path>;
  if (path === null || path === undefined) {
    newPath = [];
  } else {
    newPath = copyPath(path);
  }

  if (item && responseItem) {
    newPath.push({
      linkId: responseItem.linkId,
    });
  }

  return newPath;
}

export function shouldRenderDeleteButton(item: QuestionnaireItem, index: number): boolean {
  if (!item.repeats) {
    return false;
  }
  if (index === 0) {
    return false;
  }
  let minOccurs = getMinOccursExtensionValue(item);
  if (minOccurs) {
    if (index >= minOccurs) {
      return true;
    }
  } else {
    return true;
  }
  return false;
}

function copyPath(path: Array<Path>) {
  const newPath = [];
  for (let i = 0; i < path.length; i++) {
    newPath.push(Object.assign({}, path[i]));
  }
  return newPath;
}

export function getResponseItemWithPath(path: Array<Path> | undefined, formData: FormData): QuestionnaireResponseItem | undefined {
  if (!path || path.length === 0) {
    return undefined;
  }
  if (!formData.Content || !formData.Content.item) {
    return undefined;
  }

  let items: Array<QuestionnaireResponseItem> | undefined = getQuestionnaireResponseItemFromData(path[0].linkId, formData);
  if (!items || items.length === 0) {
    return undefined;
  }

  if (path.length === 1) {
    return items[0];
  }

  let item: QuestionnaireResponseItem | undefined = items[0];
  for (let i = 1; i < path.length; i++) {
    item = getQuestionnaireResponseItemWithLinkid(path[i].linkId, item, false);
    if (!item) {
      break;
    }
  }
  return item;
}

const getAnswerAsString = (answer: QuestionnaireResponseAnswer): string => {
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
  if (codingValue !== null && codingValue !== undefined && codingValue !== '') {
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

const encode = (s: string): string => {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
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
    qi.answer.forEach((a: QuestionnaireResponseAnswer) => {
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

export function getQuestionnaireDefinitionItem(
  linkId: string,
  definitionItems: QuestionnaireItem[] | undefined
): QuestionnaireItem | undefined {
  let definitionItem: QuestionnaireItem | undefined;
  for (let i = 0; definitionItems && i < definitionItems.length; i++) {
    definitionItem = definitionItems[i];
    if (definitionItem.linkId !== linkId) {
      definitionItem = getQuestionnaireDefinitionItemWithLinkid(linkId, definitionItems[i], true);
    }
    if (definitionItem === undefined || definitionItem === null) {
      continue;
    }
    break;
  }
  return definitionItem;
}

function getQuestionnaireDefinitionItemWithLinkid(
  linkId: string,
  definitionItem: QuestionnaireItem | undefined,
  recursive = false,
  index = 0
): QuestionnaireItem | undefined {
  if (!definitionItem) {
    return undefined;
  }
  const hasItems = definitionItem.item && definitionItem.item.length > 0;
  if (!hasItems) {
    return undefined;
  }

  const itemsWithLinkId: QuestionnaireItem[] | undefined = getQuestionnaireItemWithIdFromArray(linkId, definitionItem.item);
  if (itemsWithLinkId && itemsWithLinkId.length >= index) {
    return itemsWithLinkId[index];
  }

  if (recursive) {
    for (let i = 0; definitionItem.item && i < definitionItem.item.length; i++) {
      const item = getQuestionnaireDefinitionItemWithLinkid(linkId, definitionItem.item[i], recursive);
      if (item) {
        return item;
      }
    }
  }

  // linkId not found in items, check the answers for items
  if (!recursive) {
    return undefined;
  }
}

function getQuestionnaireItemWithIdFromArray(
  linkId: string,
  items: Array<QuestionnaireItem> | undefined
): Array<QuestionnaireItem> | undefined {
  if (!items || items.length === 0) {
    return undefined;
  }
  const filteredItems = items.filter(i => i.linkId === linkId);
  if (!filteredItems || filteredItems.length === 0) {
    return undefined;
  }
  return filteredItems;
}

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
