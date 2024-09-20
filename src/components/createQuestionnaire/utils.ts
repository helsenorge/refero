import Group from '@components/formcomponents/group/group';
import Display from '@formcomponents/display/display';
import Text from '@formcomponents/text/text';
import { QuestionnaireResponseItem, QuestionnaireItem } from 'fhir/r4';

import Attachment from '@formcomponents/attachment/attachment';
import Boolean from '@formcomponents/boolean/boolean';
import Choice from '@formcomponents/choice/choice';
import Date from '@formcomponents/date/date';
import DateTimeInput from '@formcomponents/date/date-time';
import Time from '@formcomponents/date/time';
import Decimal from '@formcomponents/decimal/decimal';
import Integer from '@formcomponents/integer/integer';
import OpenChoice from '@formcomponents/open-choice/open-choice';
import Quantity from '@formcomponents/quantity/quantity';
import StringComponent from '@formcomponents/string/string';
import TableContainer from '@formcomponents/table/TableContainer';

import { ComponentType } from 'react';
import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { isTableCode } from '@/util';
import { getItemWithIdFromResponseItemArray, getRootQuestionnaireResponseItemFromData } from '@/util/refero-core';
import { FormData } from '@/reducers/form';
import ItemType from '@/constants/itemType';

export const getResponseItems = (
  item: QuestionnaireItem,
  formData?: FormData | null,
  responseItem?: QuestionnaireResponseItem
): QuestionnaireResponseItem[] | undefined => {
  const responseItemsFromData = getRootQuestionnaireResponseItemFromData(item.linkId, formData);

  if (responseItemsFromData) {
    return responseItemsFromData;
  } else if (responseItem) {
    const childItems = responseItem.item;
    const childAnswers = responseItem.answer;

    if (childItems) {
      return getItemWithIdFromResponseItemArray(item.linkId, childItems);
    } else if (childAnswers && childAnswers[0]?.item) {
      return getItemWithIdFromResponseItemArray(item.linkId, childAnswers[0].item);
    } else {
      return [];
    }
  }
  return undefined;
};
export function getComponentForItem(
  type: string,
  extensionCode?: string | string[]
): ComponentType<QuestionnaireComponentItemProps> | undefined {
  if (String(type) === ItemType.GROUP && !!extensionCode && isTableCode(extensionCode)) {
    return TableContainer;
  } else if (String(type) === ItemType.GROUP) {
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
