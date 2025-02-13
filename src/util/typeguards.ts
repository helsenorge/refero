import { QuestionnaireItem, QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';

import ItemControlConstants, { ItemControlValue } from '@/constants/itemcontrol';
import { TABLE_CODES_VALUES, TableCodes } from '@/constants/tableTypes';

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}
export const isQuestionnaireItem = (item: QuestionnaireItem | QuestionnaireResponseItem): item is QuestionnaireItem => {
  return (item as QuestionnaireItem).type !== undefined && (item as QuestionnaireItem).linkId !== undefined;
};
export function isOfTypeQuestionnaireResponseItem(
  item: QuestionnaireResponse | QuestionnaireResponseItem
): item is QuestionnaireResponseItem {
  // eslint-disable-next-line no-prototype-builtins
  return item.hasOwnProperty('answer');
}
export const hasCode = (code: string | undefined): code is string => {
  return !!code;
};

export const isTableCode = (code: TABLE_CODES_VALUES): code is TABLE_CODES_VALUES => {
  return Object.values(TableCodes).includes(code);
};
export function isItemControlValue(value?: string): value is ItemControlValue {
  return (
    Object.values(ItemControlConstants).some(val => val === value) || Object.values(ItemControlConstants.Group).some(val => val === value)
  );
}
