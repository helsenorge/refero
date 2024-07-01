import { Attachment, QuestionnaireItem, QuestionnaireItemInitial, Reference } from 'fhir/r4';

import ItemType, { IItemType } from '../constants/itemType';

export type DefaultValues = Record<string, IItemType | unknown>;

export const createIntitialFormValues = (items?: QuestionnaireItem[]): DefaultValues => {
  if (!items) return {};
  const createInitialFormValuesForItems = (items: QuestionnaireItem[]): DefaultValues => {
    return items.reduce((acc: DefaultValues, item) => {
      const key = item.repeats ? `${item.linkId}^0` : item.linkId;
      const itemValue = getInitialFormValueForItemtype(key, item);
      if (!item.readOnly) {
        acc = { ...acc, ...(itemValue && itemValue) };
      }
      if (item.item && item.item.length > 0) {
        const nestedDefaults = createInitialFormValuesForItems(item.item);
        Object.assign(acc, nestedDefaults);
      }
      return acc;
    }, {});
  };
  return createInitialFormValuesForItems(items);
};
const excludedTypes = ['group', 'display', 'reference', 'url'];
type excludedTypes = 'group' | 'display' | 'reference' | 'url';
const getInitialFormValueForItemtype = (key: string, item: QuestionnaireItem): DefaultValues | undefined => {
  if (excludedTypes.includes(item.type)) return;
  switch (item.type) {
    case ItemType.DATE:
      return { [`${item.linkId}-yearmonth-year`]: '', [`${item.linkId}-yearmonth-month`]: ''};
    case ItemType.DATETIME:
      return { [`${key}-date`]: '', [`${key}-hours`]: '', [`${key}-minutes`]: '' };
    case ItemType.TIME:
      return { [`${key}-hours`]: '', [`${key}-minutes`]: '' };
    case ItemType.DATE:
      return { [key]: '' };
    default:
      return { [key]: getValueforFormItem(item) };
  }
};

const getValueforFormItem = (
  item: QuestionnaireItem
): string | number | boolean | symbol | (string | number | boolean | Attachment | Reference | undefined)[] | null => {
  if (item.initial && item.initial.length > 0) {
    return initialValuesBasedOnItemType(item.initial);
  }
  return getDefaultValuesForQuestionnaireItemType(item.type);
};
const initialValuesBasedOnItemType = (
  initial: QuestionnaireItemInitial[]
): (string | number | boolean | Attachment | Reference | undefined)[] => {
  return initial
    .map(
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
    )
    .filter(x => x !== undefined);
};
export const getDefaultValuesForQuestionnaireItemType = (
  type: QuestionnaireItem['type']
): string | number | null | symbol | [] | boolean => {
  switch (type) {
    case ItemType.TEXT:
    case ItemType.INTEGER:
    case ItemType.DECIMAL:
    case ItemType.STRING:
      return '';
    case ItemType.QUANTITY:
      return null;
    case ItemType.ATTATCHMENT:
    case ItemType.OPENCHOICE:
    case ItemType.CHOICE:
      return [];
    case ItemType.BOOLEAN:
      return false;
    case ItemType.DATE:
    case ItemType.DATETIME:
    case ItemType.TIME:
      return '';
    default:
      return '';
  }
};
