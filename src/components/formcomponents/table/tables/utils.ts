import moment from 'moment';

import {
  Attachment,
  Coding,
  Quantity,
  QuestionnaireItem,
  QuestionnaireItemEnableBehaviorCodes,
  QuestionnaireItemEnableWhen,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
} from '../../../../types/fhir';

import { parseDate } from '@helsenorge/date-time/components/time-input/date-core';
import * as DateTimeConstants from '@helsenorge/date-time/constants/datetime';

import { DATEFORMATS } from './constants';
import { OPEN_CHOICE_SYSTEM } from '../../../../constants';
import { CodeSystems } from '../../../../constants/codingsystems';
import ItemType from '../../../../constants/itemType';
import { getQuestionnaireItemCodeValue } from '../../../../util/codingsystem';
import { getCalculatedExpressionExtension, getCopyExtension } from '../../../../util/extension';
import { evaluateFhirpathExpressionToGetString } from '../../../../util/fhirpathHelper';
import { Path, enableWhenMatchesAnswer, getQuestionnaireResponseItemsWithLinkId, isInGroupContext } from '../../../../util/refero-core';

function extractValueFromCoding(coding: Coding | undefined, field: keyof Pick<Coding, 'code' | 'display' | 'system'> = 'display'): string {
  if (!coding) return '';
  return coding[field] ?? '';
}
const extractValueFromQuantity = (
  quantity: Quantity | undefined,
  field: keyof Pick<Quantity, 'value' | 'code' | 'system' | 'unit'> = 'value'
): string | number => {
  if (!quantity) return '';
  switch (field) {
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
  if (!inputValue) {
    return '';
  }
  const date = parseDate(String(inputValue));
  //TODO: Check if we can use language from state here
  return moment(date).locale('nb').format(DATEFORMATS.DATE);
};
const extractValueFromTime = (inputDate?: string): string => {
  if (!inputDate) {
    return '';
  }
  const date = parseDate(String(inputDate));
  const momentDate = moment(date);
  return `${momentDate.hours()}${DateTimeConstants.TIME_SEPARATOR}${momentDate.minutes()}`;
};
const extractValueFromDateTime = (inputValue?: string): string => {
  if (!inputValue) {
    return '';
  }
  const date = parseDate(String(inputValue));
  //TODO: Check if we can use language from state here
  return moment(date).locale('nb').format(DATEFORMATS.DATETIME);
};
export const extractValueFromAttachment = (
  inputValue?: Attachment,
  field: keyof Pick<Attachment, 'data' | 'url' | 'title' | 'size' | 'contentType' | 'language' | 'id' | 'hash' | 'creation'> = 'url'
): string | number => {
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

export const getPrimitiveValueFromItemType = (
  type: typeof ItemType[keyof typeof ItemType],
  res: QuestionnaireResponseItemAnswer
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
      return res.valueBoolean === true ? 'Ja' : 'Nei' ?? false;
    case ItemType.DATE:
      return extractValueFromDate(res.valueDate);
    case ItemType.DATETIME:
      return extractValueFromDateTime(res.valueDateTime);
    case ItemType.TIME:
      return extractValueFromTime(res.valueTime);
    case ItemType.CHOICE:
    case ItemType.OPENCHOICE:
      return extractValueFromCoding(res.valueCoding, 'display');
    case ItemType.QUANTITY:
      return extractValueFromQuantity(res.valueQuantity);
    case ItemType.ATTATCHMENT:
      return extractValueFromAttachment(res.valueAttachment, 'data');
    default:
      return '';
  }
};
export function getQuestionnaireResponseItemAnswer(
  type: typeof ItemType[keyof typeof ItemType],
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
  const extension = getCopyExtension(item);

  if (extension) {
    let result = evaluateFhirpathExpressionToGetString(extension, questionnaireResponse);

    if (!!getCalculatedExpressionExtension(item)) {
      result = result.map((m: { value: number }) => {
        return m.value;
      });
    }
    return getQuestionnaireResponseItemAnswer(item.type, result);
  }
  return undefined;
};

export const convertValuesToStrings = (values: Array<string | number | Quantity>): string[] => values.map(value => value.toString());

export const extractValuesFromAnswer = (
  type: typeof ItemType[keyof typeof ItemType],
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
  type: typeof ItemType[keyof typeof ItemType],
  answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]
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
export function findFirstDefinedProperty<T>(obj: T): T[Extract<keyof T, string>] | null {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== undefined) {
      return obj[key];
    }
  }
  return null;
}
export const addAnswerToItems = (
  items: QuestionnaireItem[],
  questionnaireResponse?: QuestionnaireResponse | null
): QuestionnaireResponseItem[] => {
  if (!questionnaireResponse || items.length === 0) {
    return [];
  }
  const processItem = (item: QuestionnaireItem): QuestionnaireResponseItem => {
    const res = getValueIfDataReceiver(item, questionnaireResponse);
    const clonedItems = structuredClone(item);
    const questionnaireResponseItem: QuestionnaireResponseItem = {
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

  return items.map(processItem);
};
