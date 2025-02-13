import { Attachment, QuestionnaireItem, QuestionnaireItemInitial, Reference } from 'fhir/r4';

import ItemType, { IItemType } from '../constants/itemType';

import { encodeString } from '@/components/createQuestionnaire/utils';
import itemControlConstants from '@/constants/itemcontrol';
import { isReadOnly, isRepeat } from '@/util';
import { getItemControlExtensionValue } from '@/util/extension';

export type DefaultValues = Record<string, IItemType | unknown>;
const excludedTypes = ['group', 'display', 'reference', 'url'];
type excludedTypes = 'group' | 'display' | 'reference' | 'url';

const excludedItemControlTypes = (item: QuestionnaireItem): boolean | undefined => {
  const itemControls = getItemControlExtensionValue(item);
  return (
    itemControls &&
    itemControls.some(
      itemControl =>
        itemControl.code === itemControlConstants.SIDEBAR ||
        itemControl.code === itemControlConstants.HELP ||
        itemControl.code === itemControlConstants.HIGHLIGHT ||
        itemControl.code === itemControlConstants.INLINE ||
        itemControl.code === itemControlConstants.HELP ||
        itemControl.code === itemControlConstants.HELPLINK
    )
  );
};
const excludedCodes = (item: QuestionnaireItem): boolean | undefined => {
  return item.code && item.code.some(code => code.code === 'SOT-1' || code.code === 'SOT-2' || code.code === 'SOT-3');
};
export const createIntitialFormValues = (items?: QuestionnaireItem[]): DefaultValues => {
  if (!items) return {};

  const createInitialFormValuesForItems = (items: QuestionnaireItem[]): DefaultValues => {
    return items.reduce((acc: DefaultValues, item) => {
      const key = isRepeat(item) ? `${item.linkId}^0` : item.linkId;
      const itemValue = getInitialFormValueForItemtype(key, item);
      if (!isReadOnly(item) && !excludedTypes.includes(item.type) && !excludedItemControlTypes(item) && !excludedCodes(item)) {
        acc = { ...acc, ...(itemValue && itemValue) };
      }
      if (item.item && item.item.length > 0) {
        const nestedDefaults = createInitialFormValuesForItems(item.item);
        Object.assign(acc, nestedDefaults);
      }
      return acc;
    }, {});
  };
  const initialValues = createInitialFormValuesForItems(items);
  return initialValues;
};

export const getInitialFormValueForItemtype = (key: string, item: QuestionnaireItem): DefaultValues | undefined => {
  if (excludedTypes.includes(item.type)) return;
  const encodedKey = encodeString(key);
  const itemControls = getItemControlExtensionValue(item);
  switch (item.type) {
    case ItemType.DATE:
      if (itemControls && itemControls.some(itemControl => itemControl.code === itemControlConstants.YEARMONTH)) {
        return { [`${encodedKey}-yearmonth-year`]: '', [`${encodedKey}-yearmonth-month`]: '' };
      } else {
        return { [encodedKey]: getValueforFormItem(item) };
      }
    case ItemType.DATETIME:
      return { [`${encodedKey}-date`]: '', [`${encodedKey}-hours`]: '', [`${encodedKey}-minutes`]: '' };
    case ItemType.TIME:
      return { [`${encodedKey}-hours`]: '', [`${encodedKey}-minutes`]: '' };
    default:
      return { [encodedKey]: getValueforFormItem(item) };
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
