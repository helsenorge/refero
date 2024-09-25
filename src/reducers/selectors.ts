import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { GlobalState } from '.';
import { getFormData, getFormDefinition } from './form';
import { getItemWithIdFromResponseItemArray, getRootQuestionnaireResponseItemFromData, Path } from '@/util/refero-core';

export function findQuestionnaireItem(state: GlobalState, linkId: string): QuestionnaireItem | undefined {
  const items = getFormDefinition(state)?.Content?.item;
  if (!items) {
    return undefined;
  }
  function findItem(items: QuestionnaireItem[]): QuestionnaireItem | undefined {
    for (const item of items) {
      if (item.linkId === linkId) {
        return item; // Return immediately after finding the first match
      }
      if (item.item) {
        const found = findItem(item.item);
        if (found !== undefined) {
          return found; // Return the found items from deeper levels
        }
      }
    }
    return undefined;
  }
  return findItem(items);
}
export const getResponseItemByLinkIdAndIndex = (
  state: GlobalState,
  linkId: string,
  index: number
): QuestionnaireResponseItem | undefined => {
  const responseItems = findResponseItemsWithLinkId(state, linkId);
  return responseItems[index];
};
export function getResponseItemWithPathSelector(state: GlobalState, path: Path[]): QuestionnaireResponseItem | undefined {
  const formData = getFormData(state);

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
export const findResponseItemsWithLinkId = (state: GlobalState, linkId?: string): QuestionnaireResponseItem[] => {
  const formData = getFormData(state);
  const items = formData?.Content?.item;
  if (!items || !linkId) {
    return [];
  }

  function findItem(items: QuestionnaireResponseItem[]): QuestionnaireResponseItem[] {
    const responseItems: QuestionnaireResponseItem[] = [];

    for (const item of items) {
      if (item.linkId === linkId) {
        responseItems.push(item);
      }

      if (item.item) {
        const found = findItem(item.item);
        if (found && found.length > 0) {
          responseItems.push(...found);
        }
      }
    }
    return responseItems;
  }

  return findItem(items);
};
export const getAllResponseItems = (state: GlobalState): QuestionnaireResponseItem[] => {
  const formData = getFormData(state);
  const items = formData?.Content?.item;
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
};
