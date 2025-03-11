import { ComponentType } from 'react';

import Group from '@components/formcomponents/group/group';
import Attachment from '@formcomponents/attachment/attachment';
import Boolean from '@formcomponents/boolean/boolean';
import Choice from '@formcomponents/choice/choice';
import Date from '@formcomponents/date/date';
import DateTimeInput from '@formcomponents/date/date-time';
import Time from '@formcomponents/date/time';
import Decimal from '@formcomponents/decimal/decimal';
import Display from '@formcomponents/display/display';
import FormButtonComponent from '@formcomponents/formButton/FormButtonComponent';
import Integer from '@formcomponents/integer/integer';
import OpenChoice from '@formcomponents/open-choice/open-choice';
import Quantity from '@formcomponents/quantity/quantity';
import StringComponent from '@formcomponents/string/string';
import Text from '@formcomponents/text/text';
import { QuestionnaireResponseItem, QuestionnaireItem } from 'fhir/r4';

import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import ItemType from '@/constants/itemType';
import { FormData } from '@/reducers/form';
import { isRepeat, itemHasButtonExtension } from '@/util';
import { createIdSuffix, getItemWithIdFromResponseItemArray, getRootQuestionnaireResponseItemFromData, Path } from '@/util/refero-core';

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
export function getComponentForItem(item: QuestionnaireItem): ComponentType<QuestionnaireComponentItemProps> | undefined {
  if (String(item.type) === ItemType.GROUP) {
    return Group;
  }
  if (String(item.type) === ItemType.DISPLAY) {
    return Display;
  }
  if (String(item.type) === ItemType.BOOLEAN) {
    return Boolean;
  }
  if (String(item.type) === ItemType.DECIMAL) {
    return Decimal;
  }
  if (String(item.type) === ItemType.INTEGER) {
    return Integer;
  }
  if (String(item.type) === ItemType.DATE) {
    return Date;
  }
  if (String(item.type) === ItemType.DATETIME) {
    return DateTimeInput;
  }
  if (String(item.type) === ItemType.TIME) {
    return Time;
  }
  if (String(item.type) === ItemType.STRING) {
    if (itemHasButtonExtension(item)) {
      return FormButtonComponent;
    }
    return StringComponent;
  }
  if (String(item.type) === ItemType.TEXT) {
    return Text;
  }
  if (String(item.type) === ItemType.CHOICE) {
    return Choice;
  }
  if (String(item.type) === ItemType.OPENCHOICE) {
    return OpenChoice;
  }
  if (String(item.type) === ItemType.ATTATCHMENT) {
    return Attachment;
  }
  if (String(item.type) === ItemType.QUANTITY) {
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
