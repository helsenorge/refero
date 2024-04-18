import { QuestionnaireItem } from 'fhir/r4';

import { IItemType } from '../constants/itemType';

export const defaultValuesForType: Record<IItemType, unknown> = {
  text: '', // Default value for text items
  quantity: null, // Default value for quantity items
  choice: [], // Default value for choice items
  boolean: false, // Default value for boolean items
  integer: null, // Default value for integer items
  decimal: null, // Default value for decimal items
  date: '', // Default value for date items
  dateTime: '', // Default value for dateTime items
  time: '', // Default value for time items
  reference: '', // Default value for reference items
  attachment: '', // Default value for attachment items
  url: '', // Default value for url items
  question: '', // Default value for question items
  group: '', // Default value for group items
  display: '', // Default value for display items
  'open-choice': [], // Default value for open-choice items,
  string: '', // Default value for string items
};
type DefaultValues = Record<string, unknown>;

const getInitialValueForItem = (item: QuestionnaireItem): unknown => {
  if (item.initial)
    if (item.initial && item.initial.length > 0) {
      return item.initial.map(
        x =>
          x.valueBoolean ||
          x.valueString ||
          x.valueInteger ||
          x.valueDecimal ||
          x.valueDate ||
          x.valueDateTime ||
          x.valueTime ||
          x.valueAttachment ||
          x.valueReference ||
          x?.valueQuantity?.value ||
          x?.valueCoding?.code ||
          x.valueString
      );
    }
  return defaultValuesForType[item.type];
};

// Recursively generate a nested structure of default values
export const generateDefaultValues = (items?: QuestionnaireItem[]): DefaultValues => {
  const nestedDefaultValues = items?.reduce((acc: DefaultValues, item) => {
    const key = item.linkId;
    // Assign default value only if not read-only
    if (!item.readOnly) {
      acc[key] = item.repeats ? [getInitialValueForItem(item)] : getInitialValueForItem(item);
    }

    // Process nested items if any, even if current item is read-only
    if (item.item && item.item.length > 0) {
      const nestedDefaults = generateDefaultValues(item.item);
      Object.assign(acc, nestedDefaults);
    }
    return acc;
  }, {});
  return flattenAndFilterDefaults(nestedDefaultValues, items);
};

// Flatten the structure and remove entries of unwanted types
const flattenAndFilterDefaults = (defaults?: DefaultValues, items?: QuestionnaireItem[]): DefaultValues => {
  const flatDefaults: DefaultValues = {};
  const excludedTypes = ['group', 'display', 'reference', 'url'];

  for (const key in defaults) {
    // Extract the type from the key
    const type = items?.find(item => key === item.linkId)?.type;

    if (!type || !excludedTypes.includes(type)) {
      flatDefaults[key] = defaults[key];
    }
  }
  console.log('flatDefaults', flatDefaults);
  return flatDefaults;
};
