import { QuestionnaireItem, QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';
import { FieldError, FieldErrors, FieldErrorsImpl, FieldValues, Merge } from 'react-hook-form';

import { getText, isReadOnly, shouldValidateReadOnly } from '@/util';
import { findFirstGuidInString, getQuestionnaireDefinitionItem } from '@/util/refero-core';
import { FormData } from '@/reducers/form';
import { decodeString } from '../createQuestionnaire/utils';

export type ResponseItemsWithFieldNames = {
  item: QuestionnaireResponseItem;
  fieldName: string;
  message?: string | FieldError | Merge<FieldError, FieldErrorsImpl<FieldValues>>;
};
export type QuestionnaureItemsWithFieldNames = { item: QuestionnaireItem; fieldName: string; message: string };

export type TextWithFieldName = { text: string; fieldName: string };
const isFieldError = (error: FieldErrors<FieldValues> | FieldError | undefined): error is FieldError => {
  return (error as FieldError).type !== undefined;
};

const isNestedErrorObject = (
  error: FieldErrors<FieldValues> | FieldError | undefined
): error is Record<string, FieldError | FieldErrors<FieldValues> | undefined> => {
  return typeof error === 'object' && !isFieldError(error);
};
function isQuestionnaireResponseItem(item: QuestionnaireResponse | QuestionnaireResponseItem): item is QuestionnaireResponseItem {
  return 'linkId' in item;
}
export const getItemFromErrorKeys = (
  errors: FieldErrors<FieldValues>,
  responseItem: QuestionnaireResponse | null | undefined = null
): ResponseItemsWithFieldNames[] => {
  if (!responseItem || !errors) return [];
  const processError = (
    errorObject: FieldErrors<FieldValues> | FieldError | undefined,
    parentFieldName: string[] = []
  ): ResponseItemsWithFieldNames[] => {
    if (!errorObject) return [];

    if (Array.isArray(errorObject)) {
      return errorObject.reduce<ResponseItemsWithFieldNames[]>((items, errorValue, index) => {
        const fullFieldName = [...parentFieldName, String(index)];
        items.push(...processError(errorValue, fullFieldName));
        return items;
      }, []);
    }

    if (isNestedErrorObject(errorObject)) {
      return Object.entries(errorObject).reduce<ResponseItemsWithFieldNames[]>((items, [fieldName, errorValue]) => {
        const fullFieldName = [...parentFieldName, fieldName];
        items.push(...processError(errorValue, fullFieldName));
        return items;
      }, []);
    }

    if (isFieldError(errorObject)) {
      const { linkId, indexPath } = extractLinkIdAndIndexPath(parentFieldName);
      const itm = getResponseItemByLinkIdAndIndexPath(linkId, indexPath, responseItem);

      if (itm) {
        return [
          {
            item: itm,
            fieldName: parentFieldName.join('.'),
            message: errorObject.message || '',
          },
        ];
      } else {
        return [
          {
            item: { linkId: linkId, text: 'N/A', item: [] },
            fieldName: parentFieldName.join('.'),
            message: errorObject.message || '',
          },
        ];
      }
    }

    return [];
  };

  return processError(errors);
};
function getResponseItemByLinkIdAndIndexPath(
  linkId: string,
  indexPath: number[],
  responseItem: QuestionnaireResponse | QuestionnaireResponseItem
): QuestionnaireResponseItem | null {
  return findItemRecursive(responseItem, linkId, indexPath);
}
function findItemRecursive(
  currentItem: QuestionnaireResponse | QuestionnaireResponseItem,
  linkId: string,
  indexPath: number[]
): QuestionnaireResponseItem | null {
  if (isQuestionnaireResponseItem(currentItem)) {
    if (currentItem.linkId === linkId && indexPath.length === 0) {
      return currentItem;
    }

    if (indexPath.length > 0) {
      const index = indexPath[0];
      const remainingIndexPath = indexPath.slice(1);

      if (currentItem.answer && currentItem.answer.length > index) {
        const answer = currentItem.answer[index];
        if (answer.item) {
          for (const childItem of answer.item) {
            const result = findItemRecursive(childItem, linkId, remainingIndexPath);
            if (result) {
              return result;
            }
          }
        }
      } else if (currentItem.item && currentItem.item.length > index) {
        const childItem = currentItem.item[index];
        const result = findItemRecursive(childItem, linkId, remainingIndexPath);
        if (result) {
          return result;
        }
      } else {
        return null;
      }
    } else {
      if (currentItem.item) {
        for (const childItem of currentItem.item) {
          const result = findItemRecursive(childItem, linkId, indexPath);
          if (result) {
            return result;
          }
        }
      }
      if (currentItem.answer) {
        for (const answer of currentItem.answer) {
          if (answer.item) {
            for (const childItem of answer.item) {
              const result = findItemRecursive(childItem, linkId, indexPath);
              if (result) {
                return result;
              }
            }
          }
        }
      }
    }
  } else {
    if (currentItem.item) {
      for (const childItem of currentItem.item) {
        const result = findItemRecursive(childItem, linkId, indexPath);
        if (result) {
          return result;
        }
      }
    }
  }

  return null;
}
function specialDatePart(inpStr: string): string | null {
  const dateParts = ['-date', '-hours', '-minutes', '-yearmonth-year', '-yearmonth-month'];
  for (const term of dateParts) {
    const index = inpStr.indexOf(term);
    if (index !== -1) {
      return inpStr.substring(0, index);
    }
  }

  return null;
}
export function extractLinkIdAndIndexPath(fieldNameParts: string[]): { linkId: string; indexPath: number[] } {
  const linkIdParts: string[] = [];
  const indexPath: number[] = [];
  for (const part of fieldNameParts) {
    const subParts = part.split('^');
    const guid = findFirstGuidInString(part);
    const dateLinkId = specialDatePart(part);

    if (guid) {
      linkIdParts.push(guid);
    } else if (dateLinkId) {
      linkIdParts.push(decodeString(dateLinkId));
    } else {
      linkIdParts.push(subParts[0]);
    }
    for (let i = 1; i < subParts.length; i++) {
      const index = parseInt(subParts[i], 10);
      if (!isNaN(index)) {
        indexPath.push(index);
      }
    }
  }

  const linkId = decodeString(linkIdParts.join('.'));
  return { linkId, indexPath };
}

export const getItemTextFromErrors = (
  errors: FieldErrors<FieldValues>,
  formData: FormData | null | undefined,
  questionnaireItem: QuestionnaireItem[] | undefined
): TextWithFieldName[] => {
  const data = getItemFromErrorKeys(errors, formData?.Content);

  return data
    .filter((item): item is QuestionnaureItemsWithFieldNames => item.item !== undefined)
    .map(({ item, fieldName, message }) => {
      return { item: getQuestionnaireDefinitionItem(item.linkId, questionnaireItem), fieldName, message };
    })
    .map(({ fieldName, item, message }) => ({ text: getText(item), fieldName, message }));
};

export const shouldValidate = (item: QuestionnaireItem | undefined, pdf: boolean | undefined): boolean => {
  return (!pdf && !isReadOnly(item)) || (!pdf && isReadOnly(item) && shouldValidateReadOnly(item));
};
