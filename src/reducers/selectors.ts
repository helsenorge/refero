import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { GlobalState } from '.';
import { FormData, FormDefinition, getFormDefinition } from './form';
import { getItemWithIdFromResponseItemArray, getRootQuestionnaireResponseItemFromData, Path } from '@/util/refero-core';
import { createSelector } from 'reselect';

export const questionnaireSelector = createSelector(
  [(state: GlobalState): FormDefinition | undefined | null => getFormDefinition(state)],
  (formDefinition: FormDefinition | undefined | null) => formDefinition?.Content
);
export const questionnaireResponseSelector = createSelector(
  [(state: GlobalState): FormData => state.refero.form.FormData],
  formData => formData?.Content
);

export const findQuestionnaireItem = createSelector(
  [
    (state: GlobalState): QuestionnaireItem[] | undefined => getFormDefinition(state)?.Content?.item,
    (_: GlobalState, linkId: string): string => linkId,
  ],
  (items, linkId): QuestionnaireItem | undefined => {
    if (!items) {
      return undefined;
    }

    function findItem(items: QuestionnaireItem[]): QuestionnaireItem | undefined {
      for (const item of items) {
        if (item.linkId === linkId) {
          return item;
        }
        if (item.item) {
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
  [(state: GlobalState): FormData => state.refero.form.FormData, (_: GlobalState, path: Path[]): Path[] => path],
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
      let itemsWithLinkIdFromPath = getItemWithIdFromResponseItemArray(path[i].linkId, item.item);

      if (!itemsWithLinkIdFromPath || itemsWithLinkIdFromPath.length === 0) {
        const itemsFromAnswer = item.answer?.map(a => a.item).reduce((a, b) => (a || []).concat(b || []), []);

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
        if (item.item) {
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
