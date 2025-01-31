import { NewValuePayload } from '@/actions/newValue';
import { Form, FormData, FormDefinition, nullAnswerValue } from './form';
import {
  createPathForItem,
  enableWhenMatchesAnswer,
  getArrayContainingResponseItemFromItems,
  getDefinitionItems,
  getQuestionnaireDefinitionItem,
  getQuestionnaireResponseItemWithLinkid,
  getResponseItemAndPathWithLinkId,
  getResponseItems,
  Path,
} from '@/util/refero-core';
import { QuestionnaireItem, QuestionnaireItemEnableWhen, QuestionnaireResponseItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { QuestionnaireItemEnableBehaviorCodes } from '@/types/fhirEnums';
import { getMinOccursExtensionValue } from '@/util/extension';
import { createQuestionnaireResponseAnswer } from '@/util/createQuestionnaireResponseAnswer';

/**
 * Data structure used to track which items must be cleared
 * when enableWhen conditions are no longer satisfied.
 */
type QrItemsToClear = {
  qItemWithEnableWhen: QuestionnaireItem;
  linkId: string;
  path: Path[];
};

/**
 * Orchestrates logic to determine which items are enabled vs. disabled
 * and clears child items (wipes answers) if enableWhen conditions fail.
 */
export function runEnableWhen(action: NewValuePayload, state: Form): Form {
  const state2 = JSON.parse(JSON.stringify(state));
  // Ensures we only proceed if there's a valid item in the action and the form data is present
  if (action.item && state2.FormData.Content) {
    // Holds the items that must be cleared after evaluating enableWhen conditions
    const qrItemsToClear: QrItemsToClear[] = [];

    /*
     * Because we're using immer internally, accessing "state2" repeatedly can be expensive
     * if it creates multiple proxy objects. We make a copy for certain operations to
     * improve performance in large forms.
     */
    const responseItems = getResponseItems(state2.FormData);

    // Make a deep copy of responseItems for intermediate calculations
    const calculatedResponseItems = JSON.parse(JSON.stringify(responseItems));

    // Populates qrItemsToClear with items that fail enableWhen
    calculateEnableWhenItemsToClear(
      [action.item],
      state2.FormData,
      state2.FormDefinition,
      action.itemPath,
      qrItemsToClear,
      calculatedResponseItems
    );
    // If we have items in the top-level array, we iterate and clear as needed
    if (responseItems && responseItems.length > 0) {
      for (let w = 0; w < qrItemsToClear.length; w++) {
        // Attempt to find the specific repeated item (if present)
        const qrItemWithEnableWhen = getResponseItemWithLinkIdPossiblyContainingRepeat(
          qrItemsToClear[w].linkId,
          responseItems,
          action.itemPath
        );

        if (qrItemWithEnableWhen) {
          // Remove extra repeated items if needed (e.g., if repeats > minOccurs)
          removeAddedRepeatingItems(qrItemsToClear[w].qItemWithEnableWhen, qrItemWithEnableWhen, responseItems);
          // Wipe all answers (child data) for this item
          wipeAnswerItems(qrItemWithEnableWhen, qrItemsToClear[w].qItemWithEnableWhen);
        } else {
          // If not found under the current path, search the entire form data
          const qrItemWithEnableWhen = getResponseItemAndPathWithLinkId(qrItemsToClear[w].linkId, state2.FormData.Content);

          // Clear each found occurrence
          for (let r = 0; r < qrItemWithEnableWhen.length; r++) {
            removeAddedRepeatingItems(qrItemsToClear[w].qItemWithEnableWhen, qrItemWithEnableWhen[r].item, responseItems);
            wipeAnswerItems(qrItemWithEnableWhen[r].item, qrItemsToClear[w].qItemWithEnableWhen);
          }
        }
      }
    }
  }
  return state2;
}

/**
 * Recursively searches for items whose enableWhen condition is now false,
 * and pushes them into `qrItemsToClear`.
 */
function calculateEnableWhenItemsToClear(
  items: QuestionnaireItem[],
  formData: FormData,
  formDefinition: FormDefinition,
  path: Path[] | undefined,
  qrItemsToClear: QrItemsToClear[],
  responseItems: QuestionnaireResponseItem[] | undefined
): void {
  // If no items or no form content, nothing to do
  if (!items || !formData.Content) {
    return;
  }
  const definitionItems = getDefinitionItems(formDefinition);
  // If no response items, nothing to do
  if (!responseItems || responseItems.length === 0) {
    return;
  }

  // Gather all definition items that have enableWhen referencing the linkIds of our current items
  const qitemsWithEnableWhen: QuestionnaireItem[] = [];
  for (let i = 0; i < items.length; i++) {
    if (definitionItems) {
      qitemsWithEnableWhen.push(...getItemsWithEnableWhen(items[i].linkId, definitionItems));
    }
  }

  // If no items have enableWhen references, return early
  if (!qitemsWithEnableWhen || qitemsWithEnableWhen.length === 0) {
    return;
  }

  // Evaluate each item that has an enableWhen referencing our current items
  for (const qItemWithEnableWhen of qitemsWithEnableWhen) {
    const enableWhenClauses = qItemWithEnableWhen.enableWhen;
    if (!enableWhenClauses) {
      continue;
    }

    // Locate all QuestionnaireResponseItems in the response that correspond to qItemWithEnableWhen.linkId
    const qrItemsWithEnableWhen = getResponseItemAndPathWithLinkId(qItemWithEnableWhen.linkId, formData.Content);

    // For each repeated instance of that item, check if enableWhen is still satisfied
    for (const qrItemWithEnableWhen of qrItemsWithEnableWhen) {
      const enableMatches: boolean[] = [];
      const enableBehavior = qItemWithEnableWhen.enableBehavior;

      // Check each enableWhen clause
      enableWhenClauses.forEach((enableWhen: QuestionnaireItemEnableWhen) => {
        const enableWhenQuestionItem = getQuestionnaireDefinitionItem(enableWhen.question, definitionItems);
        if (!enableWhenQuestionItem) return;
        if (path?.[0].index === 1) {
          // console.log('enableWhen.question', enableWhen.question);
          // console.log('responseItems', responseItems);
          // console.log('path', path);
        }
        // Find the response item for enableWhen.question, supporting repeats

        //TODO: Denne plukker alltid ut første element i listen, selv om det er flere. Dette er en feil.
        const responseItem = getResponseItemWithLinkIdPossiblyContainingRepeat(enableWhen.question, responseItems, path);
        if (path?.[0].index === 1) {
          // console.log('responseItem - after', responseItem);
        }
        if (responseItem) {
          // Evaluate whether the existing answers match the expected enableWhen condition
          const matchesAnswer = enableWhenMatchesAnswer(enableWhen, responseItem.answer);
          // if (path?.[0].index === 1) {
          //   console.log('matchesAnswer', responseItem.answer);
          // }
          enableMatches.push(matchesAnswer);
        }
      });
      // if (path?.[0].index === 1) {
      //   console.log('enableMatches', enableMatches);
      // }
      // Combine the results according to enableBehavior = ALL or ANY
      const enable =
        enableBehavior === QuestionnaireItemEnableBehaviorCodes.ALL
          ? enableMatches.every(x => x === true)
          : enableMatches.some(x => x === true);
      // if (path?.[0].index === 1) {
      //   console.log('enable', enable);
      // }

      // If not enabled, we mark it for clearing
      if (!enable) {
        const item = getResponseItemWithLinkIdPossiblyContainingRepeat(qrItemWithEnableWhen.item.linkId, responseItems, path);
        if (item) {
          if (path?.[0].index === 1) {
            console.log('item - qItemWithEnableWhen', item, qItemWithEnableWhen);
          }
          // Remove repeated instances beyond minOccurs threshold
          removeAddedRepeatingItems(qItemWithEnableWhen, item, responseItems);
          // Wipe the child's answers entirely
          wipeAnswerItems(item, qItemWithEnableWhen);
        }
        // Push into qrItemsToClear so runEnableWhen can handle final clearing logic
        qrItemsToClear.push({
          qItemWithEnableWhen: qItemWithEnableWhen,
          linkId: qrItemWithEnableWhen.item.linkId,
          path: createPathForItem(path, qItemWithEnableWhen),
        });
      }
    }
  }

  // Recursively check deeper levels of these enableWhen items
  calculateEnableWhenItemsToClear(qitemsWithEnableWhen, formData, formDefinition, path, qrItemsToClear, responseItems);

  // Also descend into each child's items
  qitemsWithEnableWhen.forEach(
    i => i.item && calculateEnableWhenItemsToClear(i.item, formData, formDefinition, path, qrItemsToClear, responseItems)
  );
}

/**
 * Removes extra repeated items if the item definition has `repeats = true`
 * and the total count exceeds `minOccurs`.
 */
function removeAddedRepeatingItems(
  defItem: QuestionnaireItem,
  repeatingItemLinkId: QuestionnaireResponseItem,
  responseItems: QuestionnaireResponseItem[]
): void {
  // Only do something if repeats is true
  if (defItem.repeats) {
    // Find the array that contains this repeated item
    const arrayToDeleteItem = getArrayContainingResponseItemFromItems(repeatingItemLinkId.linkId, responseItems);
    const minOccurs = getMinOccursExtensionValue(defItem);

    if (arrayToDeleteItem) {
      const keepThreshold = minOccurs ? minOccurs : 1;
      let repeatingItemIndex = arrayToDeleteItem.filter(item => item.linkId === repeatingItemLinkId.linkId).length;

      // Iterate backwards to remove extra repeated instances if we exceed minOccurs
      for (let i = arrayToDeleteItem.length - 1; i >= 0; i--) {
        const e = arrayToDeleteItem[i];
        if (e.linkId === defItem.linkId) {
          if (repeatingItemIndex > keepThreshold) {
            arrayToDeleteItem.splice(i, 1);
          }
          repeatingItemIndex--;
        }
      }
    }
  }
}

/**
 * Traverses the given QuestionnaireResponseItem and wipes
 * all answer values, including nested child items.
 */
function wipeAnswerItems(answerItem: QuestionnaireResponseItem | undefined, item: QuestionnaireItem | undefined): undefined {
  if (!answerItem || !item) {
    return undefined;
  }

  // For each answer, reset its value
  if (answerItem.answer) {
    answerItem.answer.forEach(answer => {
      resetAnswerValue(answer, item);
    });

    // Remove answers that became completely empty
    for (let i = answerItem.answer.length - 1; i >= 0; i--) {
      const a = answerItem.answer[i];
      if (Object.keys(a).length === 0) answerItem.answer.splice(i, 1);
    }
  }

  // Recursively wipe child items
  for (let i = 0; answerItem.item && item.item && i < answerItem.item.length; i++) {
    wipeAnswerItems(answerItem.item[i], item.item[i]);
  }

  // For each answer, also wipe nested items inside it
  for (let i = 0; answerItem.answer && item.item && i < answerItem.answer.length; i++) {
    const nestedItems = answerItem.answer[i].item;
    if (nestedItems && nestedItems.length > 0) {
      for (let j = 0; j < nestedItems.length; j++) {
        wipeAnswerItems(nestedItems[j], item.item[i]);
      }
    }
  }
  return undefined;
}

/**
 * Resets an answer back to its initial value or removes it if none.
 * Uses `createQuestionnaireResponseAnswer` to figure out what 'initial' should be.
 */
function resetAnswerValue(answer: QuestionnaireResponseItemAnswer, item: QuestionnaireItem): void {
  const initialAnswer = createQuestionnaireResponseAnswer(item);
  nullAnswerValue(answer, initialAnswer);
}

/**
 * Gets the first QuestionnaireResponseItem that matches linkId,
 * potentially including repeats. If path is provided, it might help
 * locate the correct repeated instance.
 */
function getResponseItemWithLinkIdPossiblyContainingRepeat(
  linkId: string,
  items: QuestionnaireResponseItem[],
  path: Path[] | undefined
): QuestionnaireResponseItem | undefined {
  // if (path?.[0].index === 1) {
  //   console.log('responseItem - getResponseItemWithLinkIdPossiblyContainingRepeat', items);
  //   console.log('items.length', items.length);
  // }
  //TODO: Denne plukker alltid første item
  for (const item of items) {
    // Search recursively for a matching linkId
    const result = getQuestionnaireResponseItemWithLinkid(linkId, item, path || []);
    if (path?.[0].index === 1) {
      console.log('result - getResponseItemWithLinkIdPossiblyContainingRepeat', result);
    }
    if (result) return result;
  }
  // If none found, returns undefined
  return undefined;
}

/**
 * Gathers all definition items (QuestionnaireItem) that have an enableWhen referencing a given linkId.
 */
function getItemsWithEnableWhen(linkId: string, definitionItems: QuestionnaireItem[]): QuestionnaireItem[] {
  const relatedItems: QuestionnaireItem[] = [];

  // Recursively checks if child QuestionnaireItems have enableWhen referencing linkId
  const getQuestionnaireItemHasEnableWhenLinkid = function (linkId: string, definitionItem: QuestionnaireItem | undefined): void {
    if (!definitionItem) {
      return undefined;
    }
    const hasItems = definitionItem.item && definitionItem.item.length > 0;
    if (!hasItems) {
      return undefined;
    }

    // Gather all items that explicitly reference this linkId in enableWhen
    const itemsEnableWhenMatchLinkId: QuestionnaireItem[] | undefined = getItemEnableWhenQuestionMatchIdFromArray(
      linkId,
      definitionItem.item
    );
    if (itemsEnableWhenMatchLinkId && itemsEnableWhenMatchLinkId.length >= 0) {
      itemsEnableWhenMatchLinkId.forEach(i => {
        relatedItems.push(i);
      });
    }

    // Descend further into child items
    for (let i = 0; definitionItem.item && i < definitionItem.item.length; i++) {
      getQuestionnaireItemHasEnableWhenLinkid(linkId, definitionItem.item[i]);
    }
  };

  // Check top-level items for direct enableWhen referencing linkId
  for (let k = 0; k < definitionItems.length; k++) {
    const enableWhen = definitionItems[k].enableWhen;
    if (enableWhen) {
      for (let n = 0; n < enableWhen.length; n++) {
        if (enableWhen[n].question === linkId) {
          relatedItems.push(definitionItems[k]);
        }
      }
    }
    getQuestionnaireItemHasEnableWhenLinkid(linkId, definitionItems[k]);
  }

  return relatedItems;
}

/**
 * Filters a list of QuestionnaireItems to find those whose enableWhen references a given linkId.
 */
function getItemEnableWhenQuestionMatchIdFromArray(linkId: string, definitionItems: QuestionnaireItem[] | undefined): QuestionnaireItem[] {
  if (!definitionItems) {
    return [];
  }
  const matchedItems: QuestionnaireItem[] = [];
  for (let i = 0; i < definitionItems.length; i++) {
    const enableWhen = definitionItems[i].enableWhen;
    if (!enableWhen) {
      continue;
    }
    for (let j = 0; j < enableWhen.length; j++) {
      if (enableWhen[j].question === linkId) {
        matchedItems.push(definitionItems[i]);
      }
    }
  }
  return matchedItems;
}
