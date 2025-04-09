import { QuestionnaireItem, QuestionnaireItemEnableWhen, QuestionnaireResponseItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';

import { Form, FormData, FormDefinition, nullAnswerValue } from '../form';

import { NewValuePayload } from '@/actions/newValue';
import { QuestionnaireItemEnableBehaviorCodes } from '@/types/fhirEnums';
import { createQuestionnaireResponseAnswer } from '@/util/createQuestionnaireResponseAnswer';
import { getMinOccursExtensionValue } from '@/util/extension';
import {
  enableWhenMatchesAnswer,
  getArrayContainingResponseItemFromItems,
  getDefinitionItems,
  getQuestionnaireDefinitionItem,
  getQuestionnaireResponseItemWithLinkid,
  getResponseItemAndPathWithLinkId,
  getResponseItems,
  Path,
} from '@/util/refero-core';

interface QrItemsToClear {
  qItemWithEnableWhen: QuestionnaireItem;
  linkId: string;
}
export function runEnableWhen(action: NewValuePayload, state: Form): void {
  if (action.item && state.FormData.Content) {
    const qrItemsToClear: QrItemsToClear[] = [];
    /*
     * immer lager javascript proxy-objekt av "state"-variablen i produce, og dersom man oppretter nye variabler eller utleder
     * noe fra state, blir disse også proxy-objekter, og denne opprettelsen går tregt. Det beste er å bruke "state"-variablen
     * for beregninger der det lar seg gjøre, for det går raskt. Koden under regner ut hva som må endres ved å bruke state, og
     * så gjøres endringen på state. På skjema med mange enableWhen kan man da spare flere sekunder når noe fylles ut.
     */
    const responseItems = getResponseItems(state.FormData);

    // lag en kopi som kan oppdateres underveis, for å beregne multiple dependent enableWhen items
    const calculatedResponseItems = JSON.parse(JSON.stringify(responseItems));
    calculateEnableWhenItemsToClear(
      [action.item],
      state.FormData,
      state.FormDefinition,
      action.itemPath,
      qrItemsToClear,
      calculatedResponseItems
    );

    if (responseItems && responseItems.length > 0) {
      for (let w = 0; w < qrItemsToClear.length; w++) {
        const qrItemWithEnableWhen = getResponseItemWithLinkIdPossiblyContainingRepeat(
          qrItemsToClear[w].linkId,
          responseItems,
          action.itemPath
        );
        if (qrItemWithEnableWhen) {
          // prøv å finne linkId for item som skal cleares i barn først. (for repeterende elementer som må cleare riktig barn).
          removeAddedRepeatingItems(qrItemsToClear[w].qItemWithEnableWhen, qrItemWithEnableWhen, responseItems);
          wipeAnswerItems(qrItemWithEnableWhen, qrItemsToClear[w].qItemWithEnableWhen);
        } else {
          // let gjennom hele skjema, og clear riktig item. Hvis vi havner her er item som skal cleares ikke et barn under action.itemPath
          const qrItemWithEnableWhen = getResponseItemAndPathWithLinkId(qrItemsToClear[w].linkId, state.FormData.Content);
          for (let r = 0; r < qrItemWithEnableWhen.length; r++) {
            removeAddedRepeatingItems(qrItemsToClear[w].qItemWithEnableWhen, qrItemWithEnableWhen[r].item, responseItems);
            wipeAnswerItems(qrItemWithEnableWhen[r].item, qrItemsToClear[w].qItemWithEnableWhen);
          }
        }
      }
    }
  }
}
function calculateEnableWhenItemsToClear(
  items: QuestionnaireItem[],
  formData: FormData,
  formDefinition: FormDefinition,
  path: Path[] | undefined,
  qrItemsToClear: QrItemsToClear[],
  responseItems: QuestionnaireResponseItem[] | undefined
): void {
  if (!items || !formData.Content) {
    return;
  }
  const definitionItems = getDefinitionItems(formDefinition);
  if (!responseItems || responseItems.length === 0) {
    return;
  }

  // Find all items with an enableWhen-clause
  const qitemsWithEnableWhen: QuestionnaireItem[] = [];
  for (let i = 0; i < items.length; i++) {
    if (definitionItems) {
      qitemsWithEnableWhen.push(...getItemsWithEnableWhen(items[i].linkId, definitionItems));
    }
  }
  if (!qitemsWithEnableWhen || qitemsWithEnableWhen.length === 0) {
    return;
  }

  for (const qItemWithEnableWhen of qitemsWithEnableWhen) {
    const enableWhenClauses = qItemWithEnableWhen.enableWhen;
    if (!enableWhenClauses) {
      continue;
    }

    // There may be several questionnaireResponseItemsWithEnableWhen corresponding to a questionnaireItemWithEnableWhen.
    // F.ex. if the questionnaireItemWithEnableWhen is repeatable
    const qrItemsWithEnableWhen = getResponseItemAndPathWithLinkId(qItemWithEnableWhen.linkId, formData.Content);
    for (const qrItemWithEnableWhen of qrItemsWithEnableWhen) {
      const enableMatches: Array<boolean> = [];
      const enableBehavior = qItemWithEnableWhen.enableBehavior;

      enableWhenClauses.forEach((enableWhen: QuestionnaireItemEnableWhen) => {
        const enableWhenQuestionItem = getQuestionnaireDefinitionItem(enableWhen.question, definitionItems);
        if (!enableWhenQuestionItem) return;

        // find responseItem corresponding to enableWhen.question. Looks both for X.Y.Z and X.Y.Z^r
        const responseItem = getResponseItemWithLinkIdPossiblyContainingRepeat(enableWhen.question, responseItems, path);

        if (responseItem) {
          const matchesAnswer = enableWhenMatchesAnswer(enableWhen, responseItem.answer);
          enableMatches.push(matchesAnswer);
        }
      });

      const enable =
        enableBehavior === QuestionnaireItemEnableBehaviorCodes.ALL
          ? enableMatches.every(x => x === true)
          : enableMatches.some(x => x === true);

      if (!enable) {
        const item = getResponseItemWithLinkIdPossiblyContainingRepeat(qrItemWithEnableWhen.item.linkId, responseItems, path);
        if (item) {
          // fjern svar i responseItems som brukes for å beregne hvilke felter som skal tømmes til slutt
          removeAddedRepeatingItems(qItemWithEnableWhen, item, responseItems);
          wipeAnswerItems(item, qItemWithEnableWhen);
        }
        qrItemsToClear.push({
          qItemWithEnableWhen: qItemWithEnableWhen,
          linkId: qrItemWithEnableWhen.item.linkId,
        });
      }
    }
  }
  calculateEnableWhenItemsToClear(qitemsWithEnableWhen, formData, formDefinition, path, qrItemsToClear, responseItems);

  qitemsWithEnableWhen.forEach(
    i => i.item && calculateEnableWhenItemsToClear(i.item, formData, formDefinition, path, qrItemsToClear, responseItems)
  );
}
function getResponseItemWithLinkIdPossiblyContainingRepeat(
  linkId: string,
  items: Array<QuestionnaireResponseItem>,
  path: Array<Path> | undefined
): QuestionnaireResponseItem | undefined {
  const findResponseItem = (linkId: string, items: Array<QuestionnaireResponseItem>): QuestionnaireResponseItem | undefined => {
    for (const item of items) {
      const result = getQuestionnaireResponseItemWithLinkid(linkId, { item: [item], linkId: 'dette er ikke en gyldig id' }, path || []);
      if (result) return result;
    }
  };

  return findResponseItem(linkId, items);
}

// This should remove repeated items, but not the original, so remove index
// 1 and 2 , but not 0 (remove 4.1^1 and 4.1^2, keep 4.1^0)
// So if you click add on a repeated item in an enableWhen,
// collapse the enableWhen and expand it again, the added items should be gone.
// Go through the array backwards and delete, so not to screw up the indices we're looping over.
function removeAddedRepeatingItems(
  defItem: QuestionnaireItem,
  repeatingItemLinkId: QuestionnaireResponseItem,
  responseItems: QuestionnaireResponseItem[]
): void {
  if (defItem.repeats) {
    const arrayToDeleteItem = getArrayContainingResponseItemFromItems(repeatingItemLinkId.linkId, responseItems);
    const minOccurs = getMinOccursExtensionValue(defItem);
    if (arrayToDeleteItem) {
      const keepThreshold = minOccurs ? minOccurs : 1;
      let repeatingItemIndex = arrayToDeleteItem.filter(item => item.linkId === repeatingItemLinkId.linkId).length;
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
function wipeAnswerItems(answerItem: QuestionnaireResponseItem | undefined, item: QuestionnaireItem | undefined): undefined {
  if (!answerItem || !item) {
    return undefined;
  }

  if (answerItem.answer) {
    answerItem.answer.forEach(answer => {
      resetAnswerValue(answer, item);
    });

    // prune empty answers
    for (let i = answerItem.answer.length - 1; i >= 0; i--) {
      const a = answerItem.answer[i];
      if (Object.keys(a).length === 0) answerItem.answer.splice(i, 1);
    }
  }

  for (let i = 0; answerItem.item && item.item && i < answerItem.item.length; i++) {
    wipeAnswerItems(answerItem.item[i], item.item[i]);
  }

  for (let i = 0; answerItem.answer && item.item && i < answerItem.answer.length; i++) {
    const nestedItems = answerItem.answer[i].item;
    if (nestedItems && nestedItems.length > 0) {
      for (let j = 0; j < nestedItems.length; j++) {
        wipeAnswerItems(nestedItems[j], item.item[i]);
      }
    }
  }
}

function resetAnswerValue(answer: QuestionnaireResponseItemAnswer, item: QuestionnaireItem): void {
  const initialAnswer = createQuestionnaireResponseAnswer(item);
  nullAnswerValue(answer, initialAnswer);
}

function getItemsWithEnableWhen(linkId: string, definitionItems: QuestionnaireItem[]): QuestionnaireItem[] {
  const relatedItems: QuestionnaireItem[] = [];
  const getQuestionnaireItemHasEnableWhenLinkid = function (linkId: string, definitionItem: QuestionnaireItem | undefined): void {
    if (!definitionItem) {
      return undefined;
    }
    const hasItems = definitionItem.item && definitionItem.item.length > 0;
    if (!hasItems) {
      return undefined;
    }

    const itemsEnableWhenMatchLinkId: QuestionnaireItem[] | undefined = getItemEnableWhenQuestionMatchIdFromArray(
      linkId,
      definitionItem.item
    );
    if (itemsEnableWhenMatchLinkId && itemsEnableWhenMatchLinkId.length >= 0) {
      itemsEnableWhenMatchLinkId.forEach(i => {
        relatedItems.push(i);
      });
    }

    for (let i = 0; definitionItem.item && i < definitionItem.item.length; i++) {
      getQuestionnaireItemHasEnableWhenLinkid(linkId, definitionItem.item[i]);
    }
  };

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
