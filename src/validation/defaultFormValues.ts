import { QuestionnaireItem } from 'fhir/r4';

import { IItemType } from '../constants/itemType';

export const defaultValuesForType: Record<IItemType, unknown> = {
  text: '', // Default value for text items
  quantity: null, // Default value for quantity items
  choice: null, // Default value for choice items
  boolean: false, // Default value for boolean items
  integer: null, // Default value for integer items
  decimal: null, // Default value for decimal items
  date: '', // Default value for date items
  dateTime: '', // Default value for dateTime items
  time: '', // Default value for time items
  reference: '', // Default value for reference items
  attachment: [], // Default value for attachment items
  url: '', // Default value for url items
  question: '', // Default value for question items
  group: '', // Default value for group items
  display: '', // Default value for display items
  'open-choice': null, // Default value for open-choice items,
  string: '', // Default value for string items
};
type DefaultValues = Record<string, unknown>;

export function generateDefaultValues(items?: QuestionnaireItem[]): Record<string, unknown> {
  const defaultValues: DefaultValues = {};
  if (!items) return defaultValues;
  for (const item of items) {
    const defaultValue = item.repeats ? [defaultValuesForType[item.type]] : defaultValuesForType[item.type];

    if (item.item && Array.isArray(item.item)) {
      defaultValues[item.linkId] = generateDefaultValues(item.item);
    } else {
      defaultValues[item.linkId] = defaultValue;
    }
  }

  return defaultValues;
}
