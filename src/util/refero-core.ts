import {
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
  QuestionnaireItem,
  QuestionnaireItemEnableWhen,
  QuestionnaireResponse,
  Coding,
  Reference,
  Attachment,
  Quantity,
} from 'fhir/r4';

import { QuestionnaireEnableOperator } from '../types/fhirEnums';

import { getMinOccursExtensionValue } from './extension';
import ItemType from '../constants/itemType';
import { FormData, FormDefinition } from '../reducers/form';
import { enableWhenMatches } from '../util/enableWhenMatcher';
export interface Path {
  linkId: string;
  index?: number;
}
export function getRootQuestionnaireResponseItemFromData(
  definitionLinkId: string,
  formData: FormData
): QuestionnaireResponseItem[] | undefined {
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
  referencePath: Path[]
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
  responseItems: QuestionnaireResponseItem[],
  recursive = false
): QuestionnaireResponseItem[] {
  if (!responseItems) {
    return [];
  }

  let itemsWithLinkId = getItemsWithIdFromResponseItemArray(linkId, responseItems, recursive);
  if (itemsWithLinkId && itemsWithLinkId.length > 0) {
    return itemsWithLinkId;
  }

  function collectAnswerItems(items: QuestionnaireResponseItem[]): QuestionnaireResponseItemAnswer[] {
    if (items.length === 0) return [];

    let answers: QuestionnaireResponseItemAnswer[] = [];
    answers = answers.concat(...items.map(i => i.answer || []));

    let subItems: QuestionnaireResponseItem[] = [];
    subItems = subItems.concat(...items.map(i => i.item || []));

    return answers.concat(...collectAnswerItems(subItems));
  }

  const answers = collectAnswerItems(responseItems);
  let items: QuestionnaireResponseItem[] = [];
  items = items.concat(...answers.map(a => a.item || []));
  itemsWithLinkId = getItemsWithIdFromResponseItemArray(linkId, items, false);
  return itemsWithLinkId;
}

export function getArrayContainingResponseItemFromItems(
  linkId: string,
  items: QuestionnaireResponseItem[]
): QuestionnaireResponseItem[] | undefined {
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
  answers: QuestionnaireResponseItemAnswer[]
): QuestionnaireResponseItem[] | undefined {
  for (const answer of answers) {
    if (answer.item) {
      const result = getArrayContainingResponseItemFromItems(linkId, answer.item);
      if (result) return result;
    }
  }

  return undefined;
}

export function getAnswerFromResponseItem(
  responseItem: QuestionnaireResponseItem | undefined
): QuestionnaireResponseItemAnswer[] | QuestionnaireResponseItemAnswer | undefined {
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

export function getResponseItems(formData: FormData | null): QuestionnaireResponseItem[] | undefined {
  if (!formData || !formData.Content) {
    return undefined;
  }
  const response = formData.Content;
  if (!response.item || response.item.length === 0) {
    return undefined;
  }
  return response.item;
}

export function getDefinitionItems(formDefinition: FormDefinition | null): QuestionnaireItem[] | undefined {
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
  responseItems: QuestionnaireResponseItem[] | undefined
): QuestionnaireResponseItem[] | undefined {
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
  responseItems: QuestionnaireResponseItem[] | undefined,
  recurse = false
): QuestionnaireResponseItem[] {
  if (!responseItems || responseItems.length === 0) {
    return [];
  }

  const filteredItems = responseItems.filter(i => i.linkId === linkId);

  if (recurse) {
    const reducer = (acc: QuestionnaireResponseItem[], val: QuestionnaireResponseItem): QuestionnaireResponseItem[] => {
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
  items: QuestionnaireResponseItem[] | undefined
): QuestionnaireResponseItem[] | undefined {
  if (!items || items.length === 0) {
    return undefined;
  }
  let filteredItems: QuestionnaireResponseItem[] = [];
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

export function hasAnswer(answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]): boolean {
  if (!answer) {
    return false;
  }

  return (
    hasBooleanAnswer(answer) ||
    hasCodingAnswer(answer) ||
    hasQuantityAnswer(answer) ||
    hasDateAnswer(answer) ||
    hasDateTimeAnswer(answer) ||
    hasTimeAnswer(answer) ||
    hasDecimalAnswer(answer) ||
    hasIntegerAnswer(answer) ||
    hasStringAnswer(answer) ||
    hasAttachmentAnswer(answer) ||
    hasReferendeAnswer(answer) ||
    hasUriAnswer(answer)
  );
}

function isObjEmpty(obj: object | undefined): boolean {
  return obj ? Object.keys(obj).length === 0 : true;
}

function getAnswer<T>(
  answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[],
  key: keyof QuestionnaireResponseItemAnswer
): T | undefined {
  if (Array.isArray(answer)) {
    return answer.reduce((acc, x) => acc || (x[key] as T), undefined);
  } else if (answer) {
    return answer[key] as T;
  }
  return undefined;
}
export function getBooleanAnswer(answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]): boolean | undefined {
  return getAnswer<boolean>(answer, 'valueBoolean');
}

export function getDecimalAnswer(answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]): number | undefined {
  return getAnswer<number>(answer, 'valueDecimal');
}

export function getIntegerAnswer(answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]): number | undefined {
  return getAnswer<number>(answer, 'valueInteger');
}

export function getDateAnswer(answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]): string | undefined {
  return getAnswer<string>(answer, 'valueDate');
}

export function getDateTimeAnswer(answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]): string | undefined {
  return getAnswer<string>(answer, 'valueDateTime');
}

export function getTimeAnswer(answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]): string | undefined {
  return getAnswer<string>(answer, 'valueTime');
}

export function getStringAnswer(answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]): string | undefined {
  return getAnswer<string>(answer, 'valueString');
}

export function getUriAnswer(answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]): string | undefined {
  return getAnswer<string>(answer, 'valueUri');
}

export function getAttachmentAnswer(answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]): Attachment | undefined {
  return getAnswer<{ id?: string }>(answer, 'valueAttachment');
}

export function getCodingAnswer(answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]): Coding | undefined {
  return getAnswer<Coding>(answer, 'valueCoding');
}

export function getQuantityAnswer(answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]): Quantity | undefined {
  return getAnswer<Quantity>(answer, 'valueQuantity');
}

export function getReferenceAnswer(answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]): Reference | undefined {
  return getAnswer<Reference>(answer, 'valueReference');
}

export function hasBooleanAnswer(answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]): boolean {
  return getBooleanAnswer(answer) === true || getBooleanAnswer(answer) === false;
}

export function hasCodingAnswer(answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]): boolean {
  return !!getCodingAnswer(answer) && !isObjEmpty(getCodingAnswer(answer));
}
export function hasQuantityAnswer(answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]): boolean {
  return getQuantityAnswer(answer) !== null && !isObjEmpty(getQuantityAnswer(answer));
}

export function hasDateAnswer(answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]): boolean {
  return !!getDateAnswer(answer);
}

export function hasDateTimeAnswer(answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]): boolean {
  return !!getDateTimeAnswer(answer);
}

export function hasTimeAnswer(answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]): boolean {
  return !!getTimeAnswer(answer);
}

export function hasDecimalAnswer(answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]): boolean {
  return !!getDecimalAnswer(answer) || getDecimalAnswer(answer) === 0;
}

export function hasIntegerAnswer(answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]): boolean {
  return !!getIntegerAnswer(answer) || getIntegerAnswer(answer) === 0;
}

export function hasStringAnswer(answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]): boolean {
  return !!getStringAnswer(answer);
}

export function hasAttachmentAnswer(answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]): boolean {
  return getAttachmentAnswer(answer) != null && !!getAttachmentAnswer(answer)?.id;
}
export function hasReferendeAnswer(answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]): boolean {
  return getReferenceAnswer(answer) != null && !!getReferenceAnswer(answer)?.id;
}

export function hasUriAnswer(answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]): boolean {
  return !!getUriAnswer(answer);
}
export function enableWhenMatchesAnswer(
  enableWhen: QuestionnaireItemEnableWhen,
  answers: QuestionnaireResponseItemAnswer[] | undefined
): boolean {
  if (!enableWhen) return false;

  answers = answers || [];
  // que-7: On Questionnaire.item.enableWhen: enableWhen must contain either a 'answer' or a 'hasAnswer' element (expression  on Questionnaire.item.enableWhen: hasAnswer.exists() xor answer.exists())
  if (enableWhen.operator === QuestionnaireEnableOperator.Exists.code && enableWhen.answerBoolean === false) {
    return !answers.some(a => hasAnswer(a));
  }

  if (enableWhen.operator === QuestionnaireEnableOperator.Exists.code && enableWhen.answerBoolean === true) {
    return answers.some(a => hasAnswer(a));
  }

  if (answers.length === 0) {
    return false;
  }

  let matches = false;
  answers.forEach((answer: QuestionnaireResponseItemAnswer) => {
    matches = matches || enableWhenMatches(enableWhen, answer);
  });
  return matches;
}

export function createIdSuffix(path: Path[] | undefined, index = 0, repeats: boolean | undefined): string {
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
export function parseSuffix(suffix: string, linkId: string): Path[] {
  const paths: Path[] = [];

  if (suffix) {
    const indices = suffix.split('^').filter(part => part !== '');
    indices.forEach(part => {
      paths.push({ linkId, index: parseInt(part, 10) });
    });
  }

  return paths;
}
export function parseIdSuffix(input: string): Path[] {
  const [linkId, suffix] = input.split(/^([^\\^]+)/).filter(part => part !== ''); // Split into two parts: linkId and the rest as suffix
  const paths: Path[] = [{ linkId: linkId.trim() }, ...parseSuffix(suffix, linkId.trim())]; // Combine linkId and parsed suffix paths

  return paths;
}
export function createPathForItem(
  path: Path[] | undefined,
  item: QuestionnaireItem,
  responseItem: QuestionnaireResponseItem,
  index: number | undefined
): Path[] {
  let newPath: Path[];
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

function copyPath(path: Path[]): Path[] {
  const newPath: Path[] = [];
  for (let i = 0; i < path.length; i++) {
    newPath.push(Object.assign({}, path[i]));
  }
  return newPath;
}

export function getResponseItemAndPathWithLinkId(
  linkId: string,
  item: QuestionnaireResponse | QuestionnaireResponseItem,
  currentPath: Path[] = []
): ItemAndPath[] {
  const response: ItemAndPath[] = [];
  let index = 0;
  const seen: { [linkId: string]: number } = {};
  for (const i of item.item ?? []) {
    index = i.linkId in seen ? seen[i.linkId] : 0;
    response.push(...getResponseItemAndPathWithLinkIdTraverse(linkId, i, currentPath, index));
    seen[i.linkId] = index + 1;
  }

  if (isOfTypeQuestionnaireResponseItem(item)) {
    for (const answer of item.answer ?? []) {
      if (answer.item) {
        for (const i of answer.item) {
          index = i.linkId in seen ? seen[i.linkId] : 0;
          response.push(...getResponseItemAndPathWithLinkIdTraverse(linkId, i, currentPath, index));
          seen[i.linkId] = index + 1;
        }
      } else {
        if (item.linkId === linkId) {
          response.push(...[{ item: item, path: copyPath(currentPath) }]);
        }
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
): ItemAndPath[] {
  currentPath.push({ linkId: item.linkId, index: currentIndex });

  let response: ItemAndPath[] = [];

  if (item.linkId === linkId) {
    response = [{ item: item, path: copyPath(currentPath) }];
  } else {
    response = getResponseItemAndPathWithLinkId(linkId, item, currentPath);
  }

  currentPath.pop();
  return response;
}

function isOfTypeQuestionnaireResponseItem(item: QuestionnaireResponse | QuestionnaireResponseItem): item is QuestionnaireResponseItem {
  return item.hasOwnProperty('answer');
}

export function getResponseItemWithPath(path: Path[], formData: FormData): QuestionnaireResponseItem | undefined {
  if (!path || path.length === 0) {
    return undefined;
  }
  if (!formData.Content || !formData.Content.item) {
    return undefined;
  }
  const rootItems: QuestionnaireResponseItem[] | undefined = getRootQuestionnaireResponseItemFromData(path[0].linkId, formData);

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

export function getQuestionnaireDefinitionItemWithLinkid(
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

function getQuestionnaireItemWithIdFromArray(linkId: string, items: QuestionnaireItem[] | undefined): QuestionnaireItem[] | undefined {
  if (!items || items.length === 0) {
    return undefined;
  }
  const filteredItems = items.filter(i => i.linkId === linkId);
  if (!filteredItems || filteredItems.length === 0) {
    return undefined;
  }
  return filteredItems;
}

export function getQuestionnaireItemsWithType(
  type: string,
  items: QuestionnaireItem[] | undefined,
  itemsWithType?: QuestionnaireItem[]
): QuestionnaireItem[] | undefined {
  if (items === undefined) return;
  if (!itemsWithType) itemsWithType = [];

  getItemLinkIdsWithType(type, items, itemsWithType);
  items.forEach(item => getQuestionnaireItemsWithType(type, item.item, itemsWithType));
  return itemsWithType;
}

function getItemLinkIdsWithType(type: string, items: QuestionnaireItem[] | undefined, itemsWithType: QuestionnaireItem[]): void {
  if (items !== undefined) {
    items.filter(f => f.type === type).forEach(f => itemsWithType.push(f));
  }
}
