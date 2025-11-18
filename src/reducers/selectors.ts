import { createSelector } from '@reduxjs/toolkit';
import { Questionnaire, QuestionnaireItem, QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';

import { FormFieldTagLevel } from '@helsenorge/designsystem-react/components/FormFieldTag';

import { Form, FormData, FormDefinition, getFormDefinition } from './form';

import { GlobalState } from '.';

import ItemControlConstants from '@/constants/itemcontrol';
import { isReadOnly, isRequired } from '@/util';
import { getItemControlValue } from '@/util/choice';
import { getItemWithIdFromResponseItemArray, getRootQuestionnaireResponseItemFromData, Path } from '@/util/refero-core';
import { Resources } from '@/util/resources';

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
      return [responseItem];
    } else {
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

// --------------------------------------------------------
// Input item classification
// --------------------------------------------------------

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

const INPUT_LIKE_TYPES: ReadonlySet<QuestionnaireItem['type']> = new Set([
  'string',
  'text',
  'date',
  'dateTime',
  'time',
  'url',
  'decimal',
  'integer',
  'quantity',
  'attachment',
  'reference',
]);

const isInputItemType = (type: QuestionnaireItem['type'] | undefined): boolean => !!type && INPUT_ITEM_TYPES.has(type);

const isInputLikeType = (type: QuestionnaireItem['type'] | undefined): boolean => !!type && INPUT_LIKE_TYPES.has(type);

const isChoiceType = (type: QuestionnaireItem['type'] | undefined): boolean => type === 'choice' || type === 'open-choice';

// --------------------------------------------------------
// Core traversal helpers
// --------------------------------------------------------

function countInputItems(items: QuestionnaireItem[] | undefined): number {
  if (!items?.length) return 0;

  let count = 0;
  const stack: QuestionnaireItem[] = [...items];

  while (stack.length > 0) {
    const current = stack.pop()!;

    if (isInputItemType(current.type)) {
      count += 1;
    }

    if (current.item?.length) {
      stack.push(...current.item);
    }
  }

  return count;
}

function allInputItemsMatchPredicate(items: QuestionnaireItem[] | undefined, predicate: (item: QuestionnaireItem) => boolean): boolean {
  if (!items?.length) return true;

  const stack: QuestionnaireItem[] = [...items];

  while (stack.length > 0) {
    const current = stack.pop()!;

    if (isInputItemType(current.type) && !predicate(current)) {
      return false;
    }

    if (current.item?.length) {
      stack.push(...current.item);
    }
  }

  return true;
}

// --------------------------------------------------------
// Public questionnaire helpers
// --------------------------------------------------------

export function areAllInputItemsRequired(questionnaire?: Questionnaire | null): boolean {
  return allInputItemsMatchPredicate(questionnaire?.item, item => item.required === true && item.readOnly !== true);
}

export function areAllInputItemsOptional(questionnaire?: Questionnaire | null): boolean {
  return allInputItemsMatchPredicate(questionnaire?.item, item => item.required !== true || item.readOnly === true);
}

export function hasExactlyOneInputItem(questionnaire: Questionnaire | undefined | null): boolean {
  if (!questionnaire) return false;
  return countInputItems(questionnaire.item) === 1;
}

// --------------------------------------------------------
// Required level per item
// --------------------------------------------------------

type ResolveRequiredLevelArgs = {
  item: QuestionnaireItem | undefined;
  itemType: QuestionnaireItem['type'] | undefined;
};

const CHOICE_REQUIRED_RESOURCE_BY_CONTROL: Record<string, FormFieldTagLevel> = {
  [ItemControlConstants.DROPDOWN]: 'required-radiobutton-list',
  [ItemControlConstants.CHECKBOX]: 'required-checkbox-list',
  [ItemControlConstants.RADIOBUTTON]: 'required-radiobutton-list',
  [ItemControlConstants.SLIDER]: 'required-radiobutton-list',
};

const resolveRequiredLevelPerItem = ({ item, itemType }: ResolveRequiredLevelArgs): FormFieldTagLevel | undefined => {
  if (!itemType) return undefined;

  if (!isRequired(item) || isReadOnly(item)) {
    return 'optional';
  }

  if (isInputLikeType(itemType)) {
    return 'required-field';
  }

  if (itemType === 'boolean') {
    return 'required-single-checkbox';
  }

  if (isChoiceType(itemType)) {
    const itemControlValue = getItemControlValue(item);
    return itemControlValue
      ? (CHOICE_REQUIRED_RESOURCE_BY_CONTROL[itemControlValue] ?? 'required-radiobutton-list')
      : 'required-radiobutton-list';
  }

  return 'optional';
};

// --------------------------------------------------------
// Selector
// --------------------------------------------------------

export const RequiredLevelSelector = createSelector(
  [
    (state: GlobalState): Questionnaire | undefined | null => state?.refero?.form.FormDefinition.Content,
    (_: GlobalState, item?: QuestionnaireItem): QuestionnaireItem | undefined => item,
    (_: GlobalState, __?: QuestionnaireItem, resources?: Resources): Resources | undefined => resources,
  ],
  (
    q: Questionnaire | undefined | null,
    item?: QuestionnaireItem,
    resources?: Resources
  ): {
    level: FormFieldTagLevel | undefined;
    errorLevelResources?: {
      'all-required': string | undefined;
      'required-field': string | undefined;
      optional: string | undefined;
      'all-optional': string | undefined;
      'required-radiobutton-list': string | undefined;
      'required-checkbox-list': string | undefined;
      'required-single-checkbox': string | undefined;
    };
  } => {
    const questionnaire = q || undefined;

    const singleItemQuestionnaire = hasExactlyOneInputItem(questionnaire || null);
    const allRequired = areAllInputItemsRequired(questionnaire);
    const allOptional = areAllInputItemsOptional(questionnaire);

    const showLabelPerItem = !singleItemQuestionnaire && !allRequired && !allOptional;

    let level: FormFieldTagLevel | undefined;

    if (!item) {
      if (singleItemQuestionnaire) {
        level = undefined;
      } else if (allRequired) {
        level = 'all-required';
      } else if (allOptional) {
        level = 'all-optional';
      }
    } else if (showLabelPerItem) {
      level = resolveRequiredLevelPerItem({
        item,
        itemType: item.type,
      });
    } else {
      level = undefined;
    }

    return {
      level,
      errorLevelResources: {
        'all-required': resources?.formAllRequired,
        'required-field': resources?.formRequired,
        optional: resources?.formOptional,
        'all-optional': resources?.formAllOptional,
        'required-radiobutton-list': resources?.formRequiredRadiobuttonList,
        'required-checkbox-list': resources?.formRequiredMultiCheckbox,
        'required-single-checkbox': resources?.formRequiredSingleCheckbox,
      },
    };
  }
);
