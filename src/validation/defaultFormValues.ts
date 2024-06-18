import { QuestionnaireItem } from 'fhir/r4';

import itemControlConstants from '../constants/itemcontrol';
import ItemType, { IItemType } from '../constants/itemType';
import valueSet from '../constants/valuesets';
import { getItemControlValue } from '../util/choice';
import { getItemControlExtensionValue } from '../util/extension';
export const defaultValuesForType: Record<IItemType, unknown> = {
  [ItemType.TEXT]: '', // Default value for text items
  [ItemType.QUANTITY]: null, // Default value for quantity items
  [ItemType.CHOICE]: [], // Default value for choice items
  [ItemType.BOOLEAN]: false, // Default value for boolean items
  [ItemType.INTEGER]: '', // Default value for integer items
  [ItemType.DECIMAL]: '', // Default value for decimal items
  [ItemType.DATE]: '', // Default value for date items
  [ItemType.DATETIME]: '', // Default value for dateTime items
  [ItemType.TIME]: '', // Default value for time items
  [ItemType.REFERENCE]: '', // Default value for reference items
  [ItemType.ATTATCHMENT]: [], // Default value for attachment items
  [ItemType.URL]: '', // Default value for url items
  [ItemType.QUESTION]: '', // Default value for question items
  [ItemType.GROUP]: '', // Default value for group items
  [ItemType.DISPLAY]: '', // Default value for display items
  [ItemType.OPENCHOICE]: [], // Default value for open-choice items,
  [ItemType.STRING]: '', // Default value for string items
};
type DefaultValues = Record<string, unknown>;

const getDefaultFormValuesForType = (item: QuestionnaireItem): unknown => {
  switch (item.type) {
    case ItemType.CHOICE:
    case ItemType.OPENCHOICE:
      const itemControlValue = getItemControlValue(item);
      switch (itemControlValue) {
        case itemControlConstants.CHECKBOX:
          return [];
        default:
          return '';
      }
    default:
      return defaultValuesForType[item.type];
  }
};

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
          x?.valueCoding?.code
      );
    }
  return getDefaultFormValuesForType(item);
};

// Recursively generate a nested structure of default values
export const generateDefaultValues = (items?: QuestionnaireItem[]): DefaultValues => {
  const nestedDefaultValues = items?.reduce((acc: DefaultValues, item) => {
    const key = item.linkId;
    // Assign default value only if not read-only
    if (!item.readOnly) {
      acc[key] = getInitialValueForItem(item);
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
    const item = items?.find(item => key === item.linkId);
    if (!item) continue;
    const type = item?.type;
    //exclude help elements
    const isHelpElement =
      getItemControlExtensionValue(item)?.find(x => x.system === valueSet.QUESTIONNAIRE_ITEM_CONTROL_SYSTEM)?.code === 'help';
    if (!type || !excludedTypes.includes(type) || !isHelpElement) {
      flatDefaults[key] = defaults[key];
    }
  }
  return flatDefaults;
};
