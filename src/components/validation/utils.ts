import { QuestionnaireItem, QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';
import { FieldErrors, FieldValues } from 'react-hook-form';

import { FormData, FormDefinition } from '@/reducers/form';
import { getText } from '@/util';
import { findFirstGuidInString, getQuestionnaireDefinitionItem, getResponseItemAndPathWithLinkId } from '@/util/refero-core';

export type ResponseItemsWithFieldNames = { item: QuestionnaireResponseItem; fieldName: string };
export type QuestionnaureItemsWithFieldNames = { item: QuestionnaireItem; fieldName: string };

export type TextWithFieldName = { text: string; fieldName: string };
const getItemFromErrorKeys = (errors: FieldErrors<FieldValues>, formData?: FormData | null): ResponseItemsWithFieldNames[] => {
  if (!formData || !formData.Content || !errors) return [];

  return Object.entries(errors).reduce<ResponseItemsWithFieldNames[]>((items, [fieldName]) => {
    const linkId = findFirstGuidInString(fieldName) ?? fieldName;
    const itm = getResponseItemAndPathWithLinkId(linkId, formData.Content as QuestionnaireResponse);

    if (itm) {
      items.push({ item: itm[0].item, fieldName });
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
    .map(({ item, fieldName }) => {
      return { item: getQuestionnaireDefinitionItem(item.linkId, formDefinition?.Content?.item), fieldName };
    })
    .filter((item): item is QuestionnaureItemsWithFieldNames => item.item !== undefined)
    .map(({ fieldName, item }) => ({ text: getText(item), fieldName }));
};
