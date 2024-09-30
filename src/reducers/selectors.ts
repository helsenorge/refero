import { QuestionnaireItem, QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';
import { GlobalState } from '.';
import { Form, FormData, FormDefinition, getFormDefinition } from './form';
import { getItemWithIdFromResponseItemArray, getRootQuestionnaireResponseItemFromData, Path } from '@/util/refero-core';
import { createSelector } from 'reselect';

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
    if (!path || path.length === 0) {
      return undefined;
    }

    if (!formData?.Content || !formData.Content.item) {
      return undefined;
    }

    const rootItems = getRootQuestionnaireResponseItemFromData(path[0].linkId, formData);

    if (!rootItems || rootItems.length === 0) {
      return undefined;
    }

    let item = rootItems[path[0].index || 0];

    for (let i = 1; i < path.length; i++) {
      let itemsWithLinkIdFromPath = getItemWithIdFromResponseItemArray(path[i].linkId, item?.item);

      if (!itemsWithLinkIdFromPath || itemsWithLinkIdFromPath.length === 0) {
        const itemsFromAnswer = item?.answer?.map(a => a.item).reduce((a, b) => (a || []).concat(b || []), []);

        itemsWithLinkIdFromPath = getItemWithIdFromResponseItemArray(path[i].linkId, itemsFromAnswer);

        if (!itemsWithLinkIdFromPath || itemsWithLinkIdFromPath.length === 0) {
          break;
        }
      }

      item = itemsWithLinkIdFromPath[path[i].index || 0];
    }

    return item;
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
