import { createSelector } from '@reduxjs/toolkit';
import { Questionnaire, QuestionnaireItem, QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';

import { Form, FormData, FormDefinition, getFormDefinition } from './form';

import { GlobalState } from '.';

import { getItemWithIdFromResponseItemArray, getRootQuestionnaireResponseItemFromData, Path } from '@/util/refero-core';

export const questionnaireSelector = createSelector(
  [(state: GlobalState): FormDefinition | undefined | null => state?.refero?.form.FormDefinition],
  (formDefinition: FormDefinition | undefined | null) => formDefinition?.Content
);
export const getFormDataSelector = createSelector([(state: GlobalState): Form | undefined => state?.refero?.form], formData => {
  return formData?.FormData;
});
export const questionnaireResponseSelector = createSelector([getFormDataSelector], formData => formData?.Content);

export const findQuestionnaireItem = createSelector(
  [
    (state: GlobalState): QuestionnaireItem[] | undefined => getFormDefinition(state)?.Content?.item,
    (_: GlobalState, linkId?: string): string | undefined => linkId,
  ],
  (items, linkId): QuestionnaireItem | undefined => {
    if (!items || !linkId) {
      return undefined;
    }

    function findItem(items: QuestionnaireItem[]): QuestionnaireItem | undefined {
      for (const item of items) {
        if (item.linkId === linkId) {
          return item;
        }
        if (item?.item) {
          const found = findItem(item.item);
          if (found !== undefined) {
            return found;
          }
        }
      }
      return undefined;
    }

    return findItem(items);
  }
);

export const getResponseItemWithPathSelector = createSelector(
  [(state: GlobalState): FormData => state.refero.form.FormData, (_: GlobalState, path?: Path[]): Path[] | undefined => path],
  (formData, path) => {
    return getResponseItemWithPath(path, formData?.Content?.item || []);
  }
);

export const getAllResponseItems = createSelector(
  [(state: GlobalState): QuestionnaireItem[] | undefined => getFormDefinition(state)?.Content?.item],
  (items): QuestionnaireResponseItem[] | undefined => {
    if (!items) {
      return [];
    }

    function findItem(items: QuestionnaireResponseItem[]): QuestionnaireResponseItem[] {
      const responseItems: QuestionnaireResponseItem[] = [];
      for (const item of items) {
        responseItems.push(item);
        if (item.answer) {
          for (const answer of item.answer) {
            if (answer.item) {
              responseItems.push(...answer.item);
            }
          }
        }
        if (item?.item) {
          const items = findItem(item.item);
          if (items && items.length > 0) {
            responseItems.push(...items);
          }
        }
      }
      return responseItems;
    }

    return findItem(items);
  }
);

export const getResponseItemsSelector = createSelector([(state: GlobalState): FormData => state?.refero?.form?.FormData], formData => {
  const response = formData?.Content?.item;
  if (!response || response.length === 0) {
    return undefined;
  }
  return response;
});

export const getFlatMapResponseItemsForItemSelector = createSelector(
  [
    (state: GlobalState, linkId?: string): QuestionnaireItem | undefined => findQuestionnaireItem(state, linkId),
    (state: GlobalState): FormData | undefined => getFormDataSelector(state),
    (_: GlobalState, _linkId?: string, path?: Path[]): Path[] | undefined => path,
  ],
  (item?: QuestionnaireItem, formData?: FormData, path?: Path[]): QuestionnaireResponseItem[] | undefined => {
    if (!formData?.Content?.item) {
      return undefined;
    }
    const responseItemsFromData = getRootQuestionnaireResponseItemFromData(item?.linkId, formData);

    if (responseItemsFromData) {
      return responseItemsFromData;
    }
    // Navigate to the response item corresponding to the current path
    const responseItem = getResponseItemWithPath(path, formData.Content.item);

    if (!responseItem) {
      return undefined;
    }

    if (responseItem.linkId === item?.linkId) {
      // If the response item matches the current item, return it
      return [responseItem];
    } else {
      // Otherwise, search within its child items
      const childItems = responseItem?.item;
      const childAnswers = responseItem.answer?.flatMap(ans => ans.item || []);

      const matchingItems = getItemWithIdFromResponseItemArray(item?.linkId, [...(childItems || []), ...(childAnswers || [])]);

      return matchingItems;
    }
  }
);
function getResponseItemWithPath(path: Path[] = [], items: QuestionnaireResponseItem[]): QuestionnaireResponseItem | undefined {
  let currentItems = items;
  let responseItem: QuestionnaireResponseItem | undefined;

  for (const pathPart of path) {
    const index = pathPart.index ?? 0;

    const matchingItems = currentItems.filter(item => item.linkId === pathPart.linkId);
    if (matchingItems.length <= index) {
      return undefined;
    }

    responseItem = matchingItems[index];

    if (!responseItem) {
      return undefined;
    }

    // Prepare for the next iteration
    currentItems = responseItem.item || responseItem.answer?.flatMap(ans => ans?.item || []) || [];
  }

  return responseItem;
}
export const getLinkIdFromResponseItems = createSelector([getFlatMapResponseItemsForItemSelector], responseItems => {
  const ids = responseItems?.map(item => item.linkId);
  return ids;
});
export const languageSelector = createSelector(
  [(state: GlobalState): QuestionnaireResponse | null | undefined => state.refero.form.FormData?.Content],
  formData => formData?.language
);

// const formFieldTagVariantSelector = createSelector(
//   [
//     (state: GlobalState): Questionnaire | undefined | null => state?.refero?.form.FormDefinition.Content,
//     (_: GlobalState, linkId?: string): string | undefined => linkId,
//   ],
//   (
//     formDefinition: Questionnaire | undefined | null,
//     linkId?: string
//   ): 'allRequired' | 'allOptional' | 'singleItemQuestionnaire' | null => {}
// );

const INPUT_ITEM_TYPES: ReadonlySet<QuestionnaireItem['type']> = new Set([
  'boolean',
  'decimal',
  'integer',
  'date',
  'dateTime',
  'time',
  'string',
  'text',
  'url',
  'choice',
  'open-choice',
  'attachment',
  'reference',
  'quantity',
]);
function countInputItems(items: QuestionnaireItem[] | undefined): number {
  if (!items || items.length === 0) return 0;

  let count = 0;

  for (const item of items) {
    if (INPUT_ITEM_TYPES.has(item.type)) {
      count += 1;
    }

    if (item.item && item.item.length > 0) {
      count += countInputItems(item.item);
    }
  }

  return count;
}
function allInputItemsMatchPredicate(items: QuestionnaireItem[] | undefined, predicate: (item: QuestionnaireItem) => boolean): boolean {
  if (!items || items.length === 0) return true;

  for (const item of items) {
    if (INPUT_ITEM_TYPES.has(item.type)) {
      if (!predicate(item)) {
        return false;
      }
    }

    if (item.item && item.item.length > 0) {
      if (!allInputItemsMatchPredicate(item.item, predicate)) {
        return false;
      }
    }
  }

  return true;
}
export function areAllInputItemsRequired(questionnaire?: Questionnaire | null): boolean {
  return allInputItemsMatchPredicate(questionnaire?.item, item => item.required === true && item.readOnly !== true);
}
export function areAllInputItemsOptional(questionnaire?: Questionnaire | null): boolean {
  return allInputItemsMatchPredicate(questionnaire?.item, item => item.required !== true || item.readOnly === true);
}
export function hasExactlyOneInputItem(questionnaire: Questionnaire | undefined | null): boolean {
  if (!questionnaire) return false;
  const totalInputItems = countInputItems(questionnaire.item);
  return totalInputItems === 1;
}
type QuestionnaireRequiredState = {
  allRequired: boolean;
  allOptional: boolean;
  singleItemQuestionnaire: boolean;
  showLabelPerItem: boolean;
};
export const questionnaireRequiredStateSelector = createSelector(
  [(state: GlobalState): Questionnaire | undefined | null => state?.refero?.form.FormDefinition.Content],
  (q: Questionnaire | undefined | null): QuestionnaireRequiredState => {
    const singleItemQuestionnaire = hasExactlyOneInputItem(q);
    return {
      allRequired: areAllInputItemsRequired(q || undefined),
      allOptional: areAllInputItemsOptional(q || undefined),
      singleItemQuestionnaire: singleItemQuestionnaire ?? false,
      showLabelPerItem: !singleItemQuestionnaire && !areAllInputItemsRequired(q || undefined) && !areAllInputItemsOptional(q || undefined),
    };
  }
);
