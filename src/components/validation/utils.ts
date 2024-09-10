import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { FieldErrors, FieldValues } from 'react-hook-form';

import { FormData, FormDefinition } from '@/reducers/form';
import { getText } from '@/util';
import { findFirstGuidInString, getQuestionnaireDefinitionItem, getResponseItemAndPathWithLinkId } from '@/util/refero-core';

export type ResponseItemsWithFieldNames = { item: QuestionnaireResponseItem; fieldName: string; message?: string };
export type QuestionnaureItemsWithFieldNames = { item: QuestionnaireItem; fieldName: string; message: string };

export type TextWithFieldName = { text: string; fieldName: string };
const getItemFromErrorKeys = (errors: FieldErrors<FieldValues>, formData?: FormData | null): ResponseItemsWithFieldNames[] => {
  const responseItem = formData?.Content;
  if (!formData || !responseItem || !errors) return [];

  return Object.entries(errors).reduce<ResponseItemsWithFieldNames[]>((items, [fieldName]) => {
    const linkId = findFirstGuidInString(fieldName) ?? fieldName;
    const itm = getResponseItemAndPathWithLinkId(linkId, responseItem);

    if (itm) {
      items.push({ item: itm[0].item, fieldName, message: '' });
    }

    return items;
  }, []);
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
