import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { FieldError, FieldErrors, FieldErrorsImpl, FieldValues, Merge } from 'react-hook-form';

import { FormData, FormDefinition } from '@/reducers/form';
import { getText } from '@/util';
import { findFirstGuidInString, getQuestionnaireDefinitionItem, getResponseItemAndPathWithLinkId } from '@/util/refero-core';

export type ResponseItemsWithFieldNames = {
  item: QuestionnaireResponseItem;
  fieldName: string;
  message?: string | FieldError | Merge<FieldError, FieldErrorsImpl<any>>;
};
export type QuestionnaureItemsWithFieldNames = { item: QuestionnaireItem; fieldName: string; message: string };

export type TextWithFieldName = { text: string; fieldName: string };
const isFieldError = (error: FieldError | Merge<FieldError, FieldErrorsImpl<any>> | Record<string, any>): error is FieldError => {
  return (error as FieldError).type !== undefined;
};

const isNestedErrorObject = (
  error: FieldError | Merge<FieldError, FieldErrorsImpl<any>> | Record<string, any>
): error is Record<string, any> => {
  return typeof error === 'object' && !isFieldError(error);
};

const getItemFromErrorKeys = (
  errors: FieldErrors<FieldValues>,
  formData?: FormData | null,
  responseItem = formData?.Content
): ResponseItemsWithFieldNames[] => {
  if (!formData || !responseItem || !errors) return [];

  const processError = (
    errorObject: FieldErrors<FieldValues> | FieldError | undefined,
    parentFieldName = ''
  ): ResponseItemsWithFieldNames[] => {
    if (!errorObject) return [];

    if (isNestedErrorObject(errorObject)) {
      return Object.entries(errorObject).reduce<ResponseItemsWithFieldNames[]>((items, [fieldName, errorValue]) => {
        const fullFieldName = parentFieldName ? `${parentFieldName}.${fieldName}` : fieldName;
        const linkId = findFirstGuidInString(fullFieldName) ?? fullFieldName;
        const itm = getResponseItemAndPathWithLinkId(linkId, responseItem);

        if (itm && itm[0]) {
          items.push(...processError(errorValue, fullFieldName));
        }

        return items;
      }, []);
    }

    if (isFieldError(errorObject)) {
      const linkId = findFirstGuidInString(parentFieldName) ?? parentFieldName;
      const itm = getResponseItemAndPathWithLinkId(linkId, responseItem);
      if (itm && itm[0]) {
        return [{ item: itm[0].item, fieldName: parentFieldName, message: (errorObject as FieldError).message || '' }];
      }
    }

    return [];
  };

  return processError(errors);
};

export const getItemTextFromErrors = (
  errors: FieldErrors<FieldValues>,
  formData: FormData | null,
  formDefinition: FormDefinition | null
): TextWithFieldName[] => {
  const data = getItemFromErrorKeys(errors, formData);
  return data
    .map(({ item, fieldName, message }) => {
      return { item: getQuestionnaireDefinitionItem(item.linkId, formDefinition?.Content?.item), fieldName, message };
    })
    .filter((item): item is QuestionnaureItemsWithFieldNames => item.item !== undefined)
    .map(({ fieldName, item, message }) => ({ text: getText(item), fieldName, message }));
};
