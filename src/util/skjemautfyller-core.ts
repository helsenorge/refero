import moment from 'moment';
import { parseDate } from '@helsenorge/toolkit/components/molecules/time-input/date-core';

import {
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
  QuestionnaireItem,
  QuestionnaireItemEnableWhen,
  QuestionnaireResponse,
} from '../types/fhir';
import { FormData, FormDefinition } from '../reducers/form';
import ItemType from '../constants/itemType';
import { getMinOccursExtensionValue } from './extension';

export function getRootQuestionnaireResponseItemFromData(
  definitionLinkId: string,
  formData: FormData
): Array<QuestionnaireResponseItem> | undefined {
  if (!formData || !formData.Content) {
    return undefined;
  }
  const content = formData.Content;
  if (!content.item || content.item.length === 0) {
    return undefined;
  }
  return getItemWithIdFromResponseItemArray(definitionLinkId, content.item);
}

export function isInGroupContext(path: Path[], item: QuestionnaireResponseItem, items: QuestionnaireResponseItem[]): boolean {
  const pathItem = path && path.find(p => p.linkId === item.linkId && p.index !== undefined);
  if (!pathItem) {
    return true;
  }

  const repeatingItems = getItemWithIdFromResponseItemArray(item.linkId, items) || [];
  return repeatingItems.indexOf(item) === pathItem.index;
}

export function getQuestionnaireResponseItemWithLinkid(
  linkId: string,
  responseItem: QuestionnaireResponseItem,
  referencePath: Array<Path>
): QuestionnaireResponseItem | undefined {
  if (!responseItem) {
    return undefined;
  }
  if (responseItem.linkId === linkId) {
    return responseItem;
  }

  for (let i = 0; responseItem.item && i < responseItem.item.length; i++) {
    if (!isInGroupContext(referencePath, responseItem.item[i], responseItem.item)) {
      continue;
    }

    const item = getQuestionnaireResponseItemWithLinkid(linkId, responseItem.item[i], referencePath);
    if (item) {
      return item;
    }
  }

  for (let i = 0; responseItem.answer && i < responseItem.answer.length; i++) {
    const answer = responseItem.answer[i];
    for (let j = 0; answer.item && j < answer.item.length; j++) {
      if (!isInGroupContext(referencePath, answer.item[j], answer.item)) {
        continue;
      }

      const item = getQuestionnaireResponseItemWithLinkid(linkId, answer.item[j], referencePath);
      if (item) {
        return item;
      }
    }
  }

  return undefined;
}

export function getQuestionnaireResponseItemsWithLinkId(
  linkId: string,
  responseItems: Array<QuestionnaireResponseItem>,
  recursive = false
): Array<QuestionnaireResponseItem> {
  if (!responseItems) {
    return [];
  }

  let itemsWithLinkId = getItemsWithIdFromResponseItemArray(linkId, responseItems, recursive);
  if (itemsWithLinkId && itemsWithLinkId.length > 0) {
    return itemsWithLinkId;
  }

  function collectAnswerItems(items: Array<QuestionnaireResponseItem>): Array<QuestionnaireResponseItemAnswer> {
    if (items.length === 0) return [];

    let answers: Array<QuestionnaireResponseItemAnswer> = [];
    answers = answers.concat(...items.map(i => i.answer || []));

    let subItems: Array<QuestionnaireResponseItem> = [];
    subItems = subItems.concat(...items.map(i => i.item || []));

    return answers.concat(...collectAnswerItems(subItems));
  }

  const answers = collectAnswerItems(responseItems);
  let items: Array<QuestionnaireResponseItem> = [];
  items = items.concat(...answers.map(a => a.item || []));
  itemsWithLinkId = getItemsWithIdFromResponseItemArray(linkId, items, false);
  return itemsWithLinkId;
}

export function getArrayContainingResponseItemFromItems(
  linkId: string,
  items: Array<QuestionnaireResponseItem>
): Array<QuestionnaireResponseItem> | undefined {
  for (const item of items) {
    if (item.linkId === linkId) {
      return items;
    }
    if (item.item) {
      const result = getArrayContainingResponseItemFromItems(linkId, item.item);
      if (result) return result;
    }
    if (item.answer) {
      const result = getArrayContainingResponseItemFromAnswers(linkId, item.answer);
      if (result) return result;
    }
  }

  return undefined;
}

function getArrayContainingResponseItemFromAnswers(
  linkId: string,
  answers: Array<QuestionnaireResponseItemAnswer>
): Array<QuestionnaireResponseItem> | undefined {
  for (const answer of answers) {
    if (answer.item) {
      const result = getArrayContainingResponseItemFromItems(linkId, answer.item);
      if (result) return result;
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
  responseItems: Array<QuestionnaireResponseItem> | undefined
): Array<QuestionnaireResponseItem> | undefined {
  if (!responseItems || responseItems.length === 0) {
    return undefined;
  }
  const filteredItems = responseItems.filter(i => i.linkId === linkId);
  if (!filteredItems || filteredItems.length === 0) {
    return undefined;
  }
  return filteredItems;
}

export function getItemsWithIdFromResponseItemArray(
  linkId: string,
  responseItems: Array<QuestionnaireResponseItem> | undefined,
  recurse = false
): Array<QuestionnaireResponseItem> {
  if (!responseItems || responseItems.length === 0) {
    return [];
  }

  const filteredItems = responseItems.filter(i => i.linkId === linkId);

  if (recurse) {
    const reducer = (acc: Array<QuestionnaireResponseItem>, val: QuestionnaireResponseItem) => {
      if (val.item) {
        acc.push(...getItemsWithIdFromResponseItemArray(linkId, val.item, recurse));
      }
      return acc;
    };
    return responseItems.reduce(reducer, filteredItems);
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

export function hasAnswer(answer: QuestionnaireResponseItemAnswer): boolean {
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
  if (answer.valueQuantity && (answer.valueQuantity.value || answer.valueQuantity.value === 0)) {
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
  enableWhen: QuestionnaireItemEnableWhen,
  answers: Array<QuestionnaireResponseItemAnswer> | undefined
): boolean {
  if (!enableWhen) return false;

  answers = answers || [];
  // que-7: On Questionnaire.item.enableWhen: enableWhen must contain either a 'answer' or a 'hasAnswer' element (expression  on Questionnaire.item.enableWhen: hasAnswer.exists() xor answer.exists())
  if (enableWhen.operator === 'exists' && enableWhen.answerBoolean === false) {
    return !answers.some(a => hasAnswer(a));
  }

  if (enableWhen.operator === 'exists' && enableWhen.answerBoolean === true) {
    return answers.some(a => hasAnswer(a));
  }

  if (answers.length === 0) {
    return false;
  }

  let matches = false;
  answers.forEach((answer: QuestionnaireResponseItemAnswer) => {
    if (enableWhen.answerBoolean !== undefined) {
      matches = matches || enableWhenMatchesBooleanAnswer(enableWhen, answer);
    }
    if (enableWhen.answerDecimal) {
      matches = matches || enableWhenMatchesDecimalAnswer(enableWhen, answer);
    }
    if (enableWhen.answerInteger) {
      matches = matches || enableWhenMatchesIntegerAnswer(enableWhen, answer);
    }
    if (enableWhen.answerDate) {
      matches = matches || enableWhenMatchesDateAnswer(enableWhen, answer);
    }
    if (enableWhen.answerDateTime) {
      matches = matches || enableWhenMatchesDateTimeAnswer(enableWhen, answer);
    }
    if (enableWhen.answerTime) {
      matches = matches || enableWhenMatchesTimeAnswer(enableWhen, answer);
    }
    if (enableWhen.answerString) {
      matches = matches || enableWhenMatchesStringAnswer(enableWhen, answer);
    }
    if (enableWhen.answerCoding) {
      matches = matches || enableWhenMatchesCodeAnswer(enableWhen, answer);
    }
    if (enableWhen.answerQuantity) {
      matches = matches || enableWhenMatchesQuantityAnswer(enableWhen, answer);
    }
    if (enableWhen.answerReference) {
      matches = matches || enableWhenMatchesReferenceAnswer(enableWhen, answer);
    }
  });
  return matches;
}

export interface Path {
  linkId: string;
  index?: number;
}

export function createIdSuffix(path: Array<Path> | undefined, index = 0, repeats: boolean | undefined): string {
  let suffix = '';

  if (path) {
    path.forEach(p => {
      if (p.index) {
        suffix += '^' + p.index;
      }
    });
  }
  if (!repeats) return suffix;

  return suffix + '^' + index;
}

export function createPathForItem(
  path: Array<Path> | undefined,
  item: QuestionnaireItem,
  responseItem: QuestionnaireResponseItem,
  index: number | undefined
): Array<Path> {
  let newPath: Array<Path>;
  if (path === null || path === undefined) {
    newPath = [];
  } else {
    newPath = copyPath(path);
  }

  index = item.repeats ? index : undefined;
  if (item && responseItem) {
    newPath.push({
      linkId: responseItem.linkId,
      ...(item.repeats && { index }),
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
  const minOccurs = getMinOccursExtensionValue(item);
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
  const newPath: Array<Path> = [];
  for (let i = 0; i < path.length; i++) {
    newPath.push(Object.assign({}, path[i]));
  }
  return newPath;
}

export function getResponseItemAndPathWithLinkId(
  linkId: string,
  item: QuestionnaireResponse | QuestionnaireResponseItem,
  currentPath: Path[] = []
): Array<ItemAndPath> {
  let response: Array<ItemAndPath> = [];
  let index = 0;
  let seen: { [linkId: string]: number } = {};
  for (let i of item.item ?? []) {
    index = i.linkId in seen ? seen[i.linkId] : 0;
    response.push(...getResponseItemAndPathWithLinkIdTraverse(linkId, i, currentPath, index));
    seen[i.linkId] = index + 1;
  }

  if (isOfTypeQuestionnaireResponseItem(item)) {
    for (let a of item.answer ?? []) {
      for (let i of a.item ?? []) {
        index = i.linkId in seen ? seen[i.linkId] : 0;
        response.push(...getResponseItemAndPathWithLinkIdTraverse(linkId, i, currentPath, index));
        seen[i.linkId] = index + 1;
      }
    }
  }
  return response;
}

export interface ItemAndPath {
  item: QuestionnaireResponseItem;
  path: Path[];
}

function getResponseItemAndPathWithLinkIdTraverse(
  linkId: string,
  item: QuestionnaireResponseItem,
  currentPath: Path[],
  currentIndex: number
): Array<ItemAndPath> {
  currentPath.push({ linkId: item.linkId, index: currentIndex });

  let response: Array<ItemAndPath> = [];

  if (item.linkId === linkId) {
    response = [{ item: item, path: copyPath(currentPath) }];
  } else {
    response = getResponseItemAndPathWithLinkId(linkId, item, currentPath);
  }

  currentPath.pop();
  return response;
}

function isOfTypeQuestionnaireResponseItem(item: QuestionnaireResponse | QuestionnaireResponseItem): item is QuestionnaireResponseItem {
  return (<QuestionnaireResponseItem>item).answer !== undefined;
}

export function getResponseItemWithPath(path: Array<Path>, formData: FormData): QuestionnaireResponseItem | undefined {
  if (!path || path.length === 0) {
    return undefined;
  }
  if (!formData.Content || !formData.Content.item) {
    return undefined;
  }

  const rootItems: Array<QuestionnaireResponseItem> | undefined = getRootQuestionnaireResponseItemFromData(path[0].linkId, formData);
  if (!rootItems || rootItems.length === 0) {
    return undefined;
  }

  let item: QuestionnaireResponseItem = rootItems[path[0].index || 0];
  for (let i = 1; i < path.length; i++) {
    let itemsWithLinkIdFromPath = getItemWithIdFromResponseItemArray(path[i].linkId, item.item);

    if (!itemsWithLinkIdFromPath || itemsWithLinkIdFromPath.length === 0) {
      const itemsFromAnswer = item.answer && item.answer.map(a => a.item).reduce((a, b) => (a || []).concat(b || []));

      itemsWithLinkIdFromPath = getItemWithIdFromResponseItemArray(path[i].linkId, itemsFromAnswer);
      if (!itemsWithLinkIdFromPath || itemsWithLinkIdFromPath.length === 0) {
        break;
      }
    }
    item = itemsWithLinkIdFromPath[path[i].index || 0];
  }
  return item;
}

export function getQuestionnaireDefinitionItem(
  linkId: string,
  definitionItems: QuestionnaireItem[] | undefined
): QuestionnaireItem | undefined {
  let definitionItem: QuestionnaireItem | undefined;
  for (let i = 0; definitionItems && i < definitionItems.length; i++) {
    definitionItem = definitionItems[i];
    if (definitionItem.linkId !== linkId) {
      definitionItem = getQuestionnaireDefinitionItemWithLinkid(linkId, definitionItems[i]);
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

  for (let i = 0; definitionItem.item && i < definitionItem.item.length; i++) {
    const item = getQuestionnaireDefinitionItemWithLinkid(linkId, definitionItem.item[i]);
    if (item) {
      return item;
    }
  }

  // linkId not found in items, check the answers for items
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
