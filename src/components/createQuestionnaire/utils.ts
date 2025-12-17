import type { ComponentType } from 'react';

import Group from '@components/formcomponents/group/group';
import Attachment from '@formcomponents/attachment/attachment';
import Boolean from '@formcomponents/boolean/boolean';
import Choice from '@formcomponents/choice/choice';
import Date from '@formcomponents/date/date';
import DateTimeInput from '@formcomponents/date/date-time';
import Time from '@formcomponents/date/time';
import Decimal from '@formcomponents/decimal/decimal';
import Display from '@formcomponents/display/display';
import Integer from '@formcomponents/integer/integer';
import OpenChoice from '@formcomponents/open-choice/open-choice';
import Quantity from '@formcomponents/quantity/quantity';
import StringComponent from '@formcomponents/string/string';
import Text from '@formcomponents/text/text';

import type { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import type { FormData } from '@/reducers/form';
import type { QuestionnaireResponseItem, QuestionnaireItem } from 'fhir/r4';

import ItemType from '@/constants/itemType';
import { isRepeat } from '@/util';
import {
  createIdSuffix,
  getItemWithIdFromResponseItemArray,
  getRootQuestionnaireResponseItemFromData,
  type Path,
} from '@/util/refero-core';

export const getResponseItems = (
  item?: QuestionnaireItem,
  formData?: FormData | null,
  path?: Path[]
): QuestionnaireResponseItem[] | undefined => {
  if (!formData || !formData.Content || !formData.Content.item) {
    return undefined;
  }
  const responseItemsFromData = getRootQuestionnaireResponseItemFromData(item?.linkId, formData);

  if (responseItemsFromData) {
    return responseItemsFromData;
  }
  // Navigate to the response item corresponding to the current path
  const responseItem = getResponseItemWithPath(path, formData.Content.item);

  if (!responseItem) {
    return undefined;
  }

  if (responseItem.linkId === item?.linkId) {
    // If the response item matches the current item, return it
    return [responseItem];
  } else {
    // Otherwise, search within its child items
    const childItems = responseItem.item;
    const childAnswers = responseItem.answer?.flatMap(ans => ans.item || []);

    const matchingItems = getItemWithIdFromResponseItemArray(item?.linkId, [...(childItems || []), ...(childAnswers || [])]);

    return matchingItems;
  }
};
function getResponseItemWithPath(path: Path[] = [], items: QuestionnaireResponseItem[]): QuestionnaireResponseItem | undefined {
  let currentItems = items;
  let responseItem: QuestionnaireResponseItem | undefined;

  for (const pathPart of path) {
    const index = pathPart.index ?? 0;

    const matchingItems = currentItems.filter(item => item.linkId === pathPart.linkId);
    if (matchingItems.length <= index) {
      return undefined;
    }

    responseItem = matchingItems[index];

    if (!responseItem) {
      return undefined;
    }

    // Prepare for the next iteration
    currentItems = responseItem.item || responseItem.answer?.flatMap(ans => ans.item || []) || [];
  }

  return responseItem;
}
export function getComponentForItem(type: string): ComponentType<QuestionnaireComponentItemProps> | undefined {
  if (String(type) === ItemType.GROUP) {
    return Group;
  }
  if (String(type) === ItemType.DISPLAY) {
    return Display;
  }
  if (String(type) === ItemType.BOOLEAN) {
    return Boolean;
  }
  if (String(type) === ItemType.DECIMAL) {
    return Decimal;
  }
  if (String(type) === ItemType.INTEGER) {
    return Integer;
  }
  if (String(type) === ItemType.DATE) {
    return Date;
  }
  if (String(type) === ItemType.DATETIME) {
    return DateTimeInput;
  }
  if (String(type) === ItemType.TIME) {
    return Time;
  }
  if (String(type) === ItemType.STRING) {
    return StringComponent;
  }
  if (String(type) === ItemType.TEXT) {
    return Text;
  }
  if (String(type) === ItemType.CHOICE) {
    return Choice;
  }
  if (String(type) === ItemType.OPENCHOICE) {
    return OpenChoice;
  }
  if (String(type) === ItemType.ATTATCHMENT) {
    return Attachment;
  }
  if (String(type) === ItemType.QUANTITY) {
    return Quantity;
  }
  return undefined;
}

export const createIdFormComponentIds = (item?: QuestionnaireItem, path?: Path[], index?: number): string =>
  encodeString(`${item?.linkId}${createIdSuffix(path, index, isRepeat(item))}`);

export function encodeString(input: string): string {
  // Replace all occurrences of "." with "%2E"
  const encodedString = input.replace(/\./g, '%2E');

  return encodedString;
}

export function decodeString(encodedId: string): string {
  const originalString = encodedId.replace(/%2E/g, '.');

  return originalString;
}
