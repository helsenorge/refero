import { format, isAfter, isBefore, isValid, parse } from 'date-fns';
import {
  Attachment,
  Coding,
  Quantity,
  QuestionnaireItem,
  QuestionnaireItemEnableWhen,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
} from 'fhir/r4';

import { QuestionnaireItemEnableBehaviorCodes } from '@/types/fhirEnums';

import { SortDirection } from '@helsenorge/designsystem-react/components/Table';

import { DATEFORMATS } from './constants';
import { QuestionnaireItemWithAnswers } from './interface';
import { OPEN_CHOICE_SYSTEM } from '@/constants';
import codeSystems, { CodeSystems } from '@/constants/codingsystems';
import ItemType, { IItemType } from '@/constants/itemType';
import { getQuestionnaireItemCodeValue } from '@/util/codingsystem';
import { getCalculatedExpressionExtension, getCopyExtension } from '@/util/extension';
import { evaluateFhirpathExpressionToGetString } from '@/util/fhirpathHelper';
import {
  Path,
  enableWhenMatchesAnswer,
  getQuestionnaireResponseItemsWithLinkId,
  getResponseItemAndPathWithLinkId,
  isInGroupContext,
} from '@/util/refero-core';

import { TIME_SEPARATOR } from '@/constants/dateTimeConstants';
type QuantityKeys = keyof Pick<Quantity, 'value' | 'code' | 'system' | 'unit'> | 'display';
type Codingkeys = keyof Pick<Coding, 'code' | 'display' | 'system'>;
type AttachmentKeys = keyof Pick<Attachment, 'data' | 'url' | 'title' | 'size' | 'contentType' | 'language' | 'id' | 'hash' | 'creation'>;

function extractValueFromCoding(coding: Coding | undefined, field: Codingkeys = 'display'): string {
  if (!coding) return '';
  return coding[field] ?? '';
}
const extractValueFromQuantity = (quantity: Quantity | undefined, field: QuantityKeys): string | number => {
  if (!quantity) return '';
  switch (field) {
    case 'display':
      return `${quantity.value ?? 0} ${quantity.unit ?? ''}`.replace(/'/g, '');
    case 'value':
      return quantity.value ?? 0;
    case 'unit':
      return quantity.unit ?? '';
    case 'system':
      return quantity.system ?? '';
    case 'code':
      return quantity.code ?? '';
    default:
      return '';
  }
};
const extractValueFromDate = (inputValue?: string): string => {
  try {
    if (!inputValue && !isValid(inputValue)) {
      return '';
    }
    return inputValue ? format(inputValue, DATEFORMATS.DATE) : '';
  } catch (_error) {
    return '';
  }
};
const extractValueFromTime = (inputTime?: string): string => {
  if (!inputTime) {
    return '';
  }
  const time = inputTime.split(TIME_SEPARATOR);
  if (time.length < 2) {
    return '';
  }
  return `${time[0]}${TIME_SEPARATOR}${time[1]}`;
};
const extractValueFromDateTime = (inputValue?: string): string => {
  try {
    if (!inputValue) {
      return '';
    }
    return inputValue ? format(inputValue, DATEFORMATS.DATETIME) : '';
  } catch (_error) {
    return '';
  }
};

export const extractValueFromAttachment = (inputValue?: Attachment, field: AttachmentKeys = 'url'): string | number => {
  if (inputValue) {
    switch (field) {
      case 'data':
        return inputValue.data ?? '';
      case 'url':
        return inputValue.url ?? '';
      case 'title':
        return inputValue.title ?? '';
      case 'size':
        return inputValue.size ?? 0;
      case 'contentType':
        return inputValue.contentType ?? '';
      case 'language':
        return inputValue.language ?? '';
      case 'id':
        return inputValue.id ?? '';
      case 'hash':
        return inputValue.hash ?? '';
      case 'creation':
        return inputValue.creation ?? '';

      default:
        return '';
    }
  } else {
    return '';
  }
};

/* Typeguards */
function isQuantityKey(key?: string): key is QuantityKeys {
  return ['value', 'code', 'system', 'unit', 'display'].includes(key ?? '');
}
function isCodingKey(key?: string): key is Codingkeys {
  return ['code', 'display', 'system'].includes(key ?? '');
}

function isAttachmentKey(key?: string): key is AttachmentKeys {
  return ['data', 'url', 'title', 'size', 'contentType', 'language', 'id', 'hash', 'creation'].includes(key ?? '');
}

type ItemTypeToDataTypeMap = {
  Coding: Codingkeys;
  Quantity: QuantityKeys;
  Attachment: AttachmentKeys;
};
export const getPrimitiveValueFromItemType = <
  ItemType extends keyof ItemTypeToDataTypeMap,
  DisplayType extends ItemTypeToDataTypeMap[ItemType],
>(
  type: IItemType,
  res: QuestionnaireResponseItemAnswer,
  displayType?: DisplayType
): string | number | never => {
  switch (type) {
    case ItemType.STRING:
    case ItemType.TEXT:
      return res.valueString ?? '';
    case ItemType.INTEGER:
      return res.valueInteger ?? 0;
    case ItemType.DECIMAL:
      return res.valueDecimal ?? 0;
    case ItemType.BOOLEAN:
      return res.valueBoolean === true ? `[X]` : `[ ]`;
    case ItemType.DATE:
      return extractValueFromDate(res.valueDate);
    case ItemType.DATETIME:
      return extractValueFromDateTime(res.valueDateTime);
    case ItemType.TIME:
      return extractValueFromTime(res.valueTime);
    case ItemType.CHOICE:
    case ItemType.OPENCHOICE:
      return extractValueFromCoding(res.valueCoding, isCodingKey(displayType) ? displayType : 'display');
    case ItemType.QUANTITY:
      return extractValueFromQuantity(res.valueQuantity, isQuantityKey(displayType) ? displayType : 'display');
    case ItemType.ATTATCHMENT:
      return extractValueFromAttachment(res.valueAttachment, isAttachmentKey(displayType) ? displayType : 'data');
    default:
      return '';
  }
};
export function getQuestionnaireResponseItemAnswer(
  type: (typeof ItemType)[keyof typeof ItemType],
  result: never[]
): QuestionnaireResponseItemAnswer | Array<QuestionnaireResponseItemAnswer> {
  switch (type) {
    case ItemType.BOOLEAN:
      return result.map(bool => ({ valueBoolean: bool }));
    case ItemType.CHOICE:
    case ItemType.OPENCHOICE:
      return result.map(coding => {
        if (typeof coding === 'string') {
          return {
            valueCoding: {
              display: coding,
              code: '',
              system: OPEN_CHOICE_SYSTEM,
            },
          };
        }
        return { valueCoding: coding };
      });
    case ItemType.QUANTITY:
      return result.map(quantity => ({ valueQuantity: quantity }));
    case ItemType.TEXT:
    case ItemType.STRING:
      return result.map(text => ({ valueString: text }));
    case ItemType.INTEGER:
      return result.map(integer => ({ valueInteger: integer }));
    case ItemType.DECIMAL:
      return result.map(decimal => ({ valueDecimal: decimal }));
    case ItemType.DATETIME:
      return result.map(dateTime => ({ valueDateTime: dateTime }));
    case ItemType.DATE:
      return result.map(date => ({ valueDate: date }));
    case ItemType.TIME:
      return result.map(time => ({ valueTime: time }));
    case ItemType.ATTATCHMENT:
      return result.map(attachment => ({ valueAttachment: attachment }));
    default:
      return [];
  }
}

export const getAnswerFromDisplayType = (
  item: QuestionnaireItem
): QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[] | undefined => {
  return { valueString: item.text };
};

export const getValueIfDataReceiver = (
  item: QuestionnaireItem,
  questionnaireResponse?: QuestionnaireResponse | null
): QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[] | undefined => {
  const copyExtension = getCopyExtension(item);
  const calculatedExpressionExtension = getCalculatedExpressionExtension(item);
  if (calculatedExpressionExtension) {
    if (questionnaireResponse) {
      const res = getResponseItemAndPathWithLinkId(item.linkId, questionnaireResponse);
      return res[0].item.answer;
    }
    return undefined;
  }
  if (copyExtension) {
    let result = evaluateFhirpathExpressionToGetString(copyExtension, questionnaireResponse);

    if (getCalculatedExpressionExtension(item)) {
      result = result.map((m: { value: number }) => {
        return m.value;
      });
    }

    return getQuestionnaireResponseItemAnswer(item.type as Exclude<(typeof ItemType)[keyof typeof ItemType], 'url'>, result);
  }
  return undefined;
};

export const convertValuesToStrings = (values: Array<string | number | Quantity>): string[] => values.map(value => value.toString());

export const extractValuesFromAnswer = (
  type: (typeof ItemType)[keyof typeof ItemType],
  questionnaireAnswer?: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]
): Array<string | number | Quantity> => {
  if (questionnaireAnswer === undefined) {
    return [];
  }
  return Array.isArray(questionnaireAnswer)
    ? questionnaireAnswer.map(answer => getPrimitiveValueFromItemType(type, answer))
    : [getPrimitiveValueFromItemType(type, questionnaireAnswer)];
};

export const transformAnswersToListOfStrings = (
  type: (typeof ItemType)[keyof typeof ItemType],
  answer?: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]
): string[] => {
  const value = extractValuesFromAnswer(type, answer);
  if (value.length === 0) {
    return [];
  }
  return convertValuesToStrings(value);
};

export const findIndexByCode = (item: QuestionnaireItem, codesystem: CodeSystems['TableColumn']): number => {
  const index = getQuestionnaireItemCodeValue(item, codesystem);
  return index ? Number(index) : -1;
};

/* ENABLE WHEN */
export const filterEnabledQuestionnaireItems = (items: QuestionnaireItem[], response: QuestionnaireResponse): QuestionnaireItem[] => {
  const responseItems = response.item || [];
  const checkItemEnabled = (item: QuestionnaireItem, currentPath: Path[]): boolean => {
    if (!item.enableWhen) {
      return true;
    }
    return isConditionEnabled(item.enableWhen, item.enableBehavior, currentPath, responseItems);
  };

  const recursivelyFilterItems = (currentItems: QuestionnaireItem[], currentPath: Path[] = []): QuestionnaireItem[] => {
    return currentItems.reduce((filteredItems: QuestionnaireItem[], currentItem: QuestionnaireItem, index) => {
      const newPath = currentPath.concat([{ linkId: currentItem.linkId, index }]);
      const isCurrentItemEnabled = checkItemEnabled(currentItem, newPath);

      const filteredNestedItems = currentItem.item ? recursivelyFilterItems(currentItem.item, newPath) : [];

      return isCurrentItemEnabled
        ? filteredItems.concat([{ ...currentItem, item: filteredNestedItems }])
        : filteredItems.concat(filteredNestedItems);
    }, []);
  };

  return recursivelyFilterItems(items);
};

export const isConditionEnabled = (
  conditions: QuestionnaireItemEnableWhen[],
  behavior: string | undefined,
  currentPath: Path[],
  responseItems: QuestionnaireResponseItem[]
): boolean => {
  const isSingleConditionMet = (condition: QuestionnaireItemEnableWhen): boolean => {
    const matchingResponseItem = getQuestionnaireResponseItemsWithLinkId(condition.question, responseItems, true).find(item =>
      isInGroupContext(currentPath, item, responseItems)
    );

    return matchingResponseItem ? enableWhenMatchesAnswer(condition, matchingResponseItem.answer) : false;
  };

  const conditionMatches = conditions.map(isSingleConditionMet);
  return behavior === QuestionnaireItemEnableBehaviorCodes.ALL ? conditionMatches.every(Boolean) : conditionMatches.some(Boolean);
};

export function findFirstDefinedProperty<T>(obj: T): T[Extract<keyof T, string>] | undefined {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== undefined) {
      return obj[key];
    }
  }
  return undefined;
}

export const addAnswerToItems = (
  items: QuestionnaireItem[],
  questionnaireResponse?: QuestionnaireResponse | null
): QuestionnaireItemWithAnswers[] => {
  if (!questionnaireResponse || items.length === 0) {
    return [];
  }
  const processItem = (item: QuestionnaireItem): QuestionnaireItemWithAnswers => {
    const res = getValueIfDataReceiver(item, questionnaireResponse);

    const clonedItems = structuredClone(item);
    const questionnaireResponseItem: QuestionnaireItemWithAnswers = {
      ...clonedItems,
    };
    if (!Array.isArray(res) && res !== undefined) {
      questionnaireResponseItem.answer = [res];
    } else {
      questionnaireResponseItem.answer = res;
    }
    if (item.item && item.item.length > 0) {
      questionnaireResponseItem.item = addAnswerToItems(item.item, questionnaireResponse);
    }

    return questionnaireResponseItem;
  };
  const response = items.map(processItem);
  return response;
};

export const getEnabledQuestionnaireItemsWithAnswers = (
  items?: QuestionnaireItem[],
  questionnaireResponse?: QuestionnaireResponse
): QuestionnaireItemWithAnswers[] => {
  if (!items || !questionnaireResponse) return [];
  const filteredItems = filterEnabledQuestionnaireItems(items, questionnaireResponse);
  return addAnswerToItems(filteredItems, questionnaireResponse);
};

/* TABLE HEADER */
export const transformCodingToSortDirection = (coding: Coding[]): SortDirection | undefined => {
  const code = getCodeFromCodingSystem(coding, codeSystems.TableOrderingFunctions);
  return code ? (code === 'ASC' ? SortDirection.asc : SortDirection.desc) : undefined;
};

export const getDisplayFromCodingSystem = (coding: Coding[], codingSystem: string): string | undefined => {
  const code = findCodeBySystem(coding, codingSystem);
  return code[0]?.display;
};

export const getCodeFromCodingSystem = (coding: Coding[], codingSystem: string): string | undefined => {
  const code = findCodeBySystem(coding, codingSystem);
  return code[0]?.code;
};

export function findCodeBySystem<T extends { system?: string }>(coding: T[], system?: string): T[] {
  return coding.filter(code => code.system === system);
}

export const sortByItemType = (aValue: string, bValue: string, sortOrder: SortDirection, type?: IItemType): number => {
  switch (type) {
    case ItemType.DATE:
      return compareDates(aValue, bValue, sortOrder);
    case ItemType.DATETIME:
      return compareDates(aValue, bValue, sortOrder);
    case ItemType.TIME:
      return compareTimes(aValue, bValue, sortOrder);
    case ItemType.INTEGER:
    case ItemType.DECIMAL:
      return compareNumbers(aValue, bValue, sortOrder);
    case ItemType.QUANTITY:
      return compareQuantities(aValue, bValue, sortOrder);
    case ItemType.STRING:
    case ItemType.TEXT:
    case ItemType.OPENCHOICE:
    case ItemType.CHOICE:
      return isNumber(aValue, bValue) ? compareNumbers(aValue, bValue, sortOrder) : compareStrings(aValue, bValue, sortOrder);
    default:
      return isNumber(aValue, bValue) ? compareNumbers(aValue, bValue, sortOrder) : compareStrings(aValue, bValue, sortOrder);
  }
};
const isNumber = (aValue: string, bValues: string): boolean => {
  return isNumberString(aValue) && isNumberString(bValues);
};
const isNumberString = (str: string): boolean => {
  str = str.trim();

  if (str === '') {
    return false;
  }
  const numberRegex = /^-?\d+(\.\d+)?([eE][-+]?\d+)?$/;

  if (!numberRegex.test(str)) {
    return false;
  }
  const number = Number(str);
  return !isNaN(number);
};

const extractNumber = (value: string | undefined): number => {
  if (!value) return 0;
  const match = value.match(/\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : 0;
};

const compareQuantities = (aValue: string | undefined, bValue: string | undefined, sortOrder: SortDirection): number => {
  const numberA = extractNumber(aValue);
  const numberB = extractNumber(bValue);
  return sortOrder === SortDirection.asc ? numberA - numberB : numberB - numberA;
};

const compareStrings = (aValue: string, bValue: string, sortOrder: SortDirection): number => {
  return sortOrder === SortDirection.asc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
};

const compareDates = (aValue: string, bValue: string, sortOrder: SortDirection): number => {
  const dateA = parse(aValue, DATEFORMATS.DATETIME, new Date());
  const dateB = parse(bValue, DATEFORMATS.DATETIME, new Date());

  let comparisonResult = 0;
  if (isBefore(dateA, dateB)) {
    comparisonResult = -1;
  } else if (isAfter(dateA, dateB)) {
    comparisonResult = 1;
  }
  return sortOrder === 'asc' ? comparisonResult : -comparisonResult;
};

const compareTimes = (aValue: string, bValue: string, sortOrder: SortDirection): number => {
  const format = DATEFORMATS.TIME;
  const timeA = parse(aValue, format, new Date());
  const timeB = parse(bValue, format, new Date());

  if (sortOrder === SortDirection.asc) {
    return isBefore(timeA, timeB) ? -1 : isAfter(timeA, timeB) ? 1 : 0;
  } else {
    return isAfter(timeA, timeB) ? -1 : isBefore(timeA, timeB) ? 1 : 0;
  }
};
const compareNumbers = (aValue: string, bValue: string, sortOrder: SortDirection): number => {
  const numberA = parseFloat(aValue);
  const numberB = parseFloat(bValue);
  return sortOrder === SortDirection.asc ? numberA - numberB : numberB - numberA;
};
