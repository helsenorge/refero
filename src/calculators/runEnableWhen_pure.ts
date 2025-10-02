// --- eksisterende imports beholdes ---
import { QuestionnaireItem, QuestionnaireResponseItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';

import { NewValuePayload } from '@/actions/newValue';
import { FormData, FormDefinition, nullAnswerValue } from '@/reducers/form';
import { QuestionnaireItemEnableBehaviorCodes } from '@/types/fhirEnums';
import { createQuestionnaireResponseAnswer } from '@/util/createQuestionnaireResponseAnswer';
import { getMinOccursExtensionValue } from '@/util/extension';
import {
  enableWhenMatchesAnswer,
  getArrayContainingResponseItemFromItems,
  getDefinitionItems,
  getQuestionnaireResponseItemWithLinkid,
  getResponseItemAndPathWithLinkId,
  getResponseItems,
  Path,
} from '@/util/refero-core';

// ---- Types ----------------------------------------------------------
export type RunEnableWhenParams = {
  action: NewValuePayload;
  formData: FormData;
  formDefinition: FormDefinition;
};

export type RepeatRemoval = { itemPath: Path[]; item: QuestionnaireItem | undefined };

export type RunEnableWhenResult = {
  answerValues: Array<NewValuePayload>;
  repeatRemovals: RepeatRemoval[];
};

// NB: legger til instancePath så vi kan scope clearing til riktig instans
type QrItemsToClear = {
  qItemWithEnableWhen: QuestionnaireItem;
  linkId: string;
  instancePath: Path[];
};

// ---- Små utils (lokale) --------------------------------------------

// Sjekker at alle indekserte segmenter i contextPath matcher kandidatens path.
// Fungerer for nestede repeats: alle felles linkId med index må matche.
function isSameInstance(contextPath: Path[] | undefined, candidatePath: Path[] | undefined): boolean {
  if (!contextPath || !candidatePath) return true; // konservativt: ikke blokker
  const indexed = contextPath.filter(s => s.index !== undefined);
  for (const seg of indexed) {
    const hit = candidatePath.find(s => s.linkId === seg.linkId);
    if (!hit || (hit.index !== undefined && hit.index !== seg.index)) {
      return false;
    }
  }
  return true;
}

export function runEnableWhenPure({ action, formData, formDefinition }: RunEnableWhenParams): RunEnableWhenResult {
  if (!action?.item || !formData?.Content) return { answerValues: [], repeatRemovals: [] };

  const responseItems = getResponseItems(formData);
  if (!responseItems || responseItems.length === 0) return { answerValues: [], repeatRemovals: [] };

  // sim-kopi for å beregne transitive effekter – speiler legacy
  const simulatedResponseItems: QuestionnaireResponseItem[] =
    typeof structuredClone === 'function' ? structuredClone(responseItems) : JSON.parse(JSON.stringify(responseItems));
  const qrItemsToClear: Array<QrItemsToClear> = [];

  calculateEnableWhenItemsToClearPure([action.item], formData, formDefinition, action.itemPath, qrItemsToClear, simulatedResponseItems);

  if (qrItemsToClear.length === 0) return { answerValues: [], repeatRemovals: [] };

  const answerValues: NewValuePayload[] = [];
  const repeatRemovals: RepeatRemoval[] = [];

  for (const entry of qrItemsToClear) {
    const { qItemWithEnableWhen, linkId, instancePath } = entry;

    const defDescendants = collectDefinitionDescendants(qItemWithEnableWhen);

    for (const defChild of defDescendants) {
      const childLinkId = defChild.linkId;
      const allChildInstances = getResponseItemAndPathWithLinkId(childLinkId, formData.Content);
      if (!allChildInstances.length) {
        continue;
      }

      // scope til samme repeterende instans som trigget disable
      const childInstances = allChildInstances.filter(ip => isSameInstance(instancePath, ip.path));

      if (childInstances.length === 0) continue;

      // initialAnswer matcher legacy reset (gir f.eks. { valueBoolean: false } for bool)
      const initial = createQuestionnaireResponseAnswer(defChild);

      for (const ip of childInstances) {
        answerValues.push({
          itemPath: ip.path,
          item: defChild,
          newAnswer: initial ? [initial] : [],
        });
      }
    }

    // Strukturelle slettinger utover minOccurs – match legacy removeAddedRepeatingItems
    const minOccurs = getMinOccursExtensionValue(qItemWithEnableWhen);
    const keepThreshold = minOccurs ?? 1;
    const allInstances = getResponseItemAndPathWithLinkId(linkId, formData.Content);
    const instances = allInstances.filter(ip => isSameInstance(instancePath, ip.path));

    for (const ip of instances) {
      const last = ip.path[ip.path.length - 1];
      if (qItemWithEnableWhen.repeats && typeof last?.index === 'number' && last.index >= keepThreshold) {
        repeatRemovals.push({ itemPath: ip.path, item: qItemWithEnableWhen });
      }
    }
  }

  return { answerValues, repeatRemovals };
}

// -------------------- Pure helpers (speiler legacy-adferd) --------------------

function calculateEnableWhenItemsToClearPure(
  items: QuestionnaireItem[] | undefined,
  formData: FormData,
  formDefinition: FormDefinition,
  path: Array<Path> | undefined,
  qrItemsToClear: Array<QrItemsToClear>,
  simulatedResponseItems: QuestionnaireResponseItem[] | undefined
): void {
  if (!items || !formData.Content) return;
  const definitionItems = getDefinitionItems(formDefinition);
  if (!simulatedResponseItems || simulatedResponseItems.length === 0) return;

  const qitemsWithEnableWhen: QuestionnaireItem[] = [];
  for (const i of items) {
    if (definitionItems) qitemsWithEnableWhen.push(...getItemsWithEnableWhenPure(i.linkId, definitionItems));
  }

  if (qitemsWithEnableWhen.length === 0) return;

  for (const qItemWithEnableWhen of qitemsWithEnableWhen) {
    const enableWhenClauses = qItemWithEnableWhen.enableWhen;
    if (!enableWhenClauses) continue;

    const qrInstances = getResponseItemAndPathWithLinkId(qItemWithEnableWhen.linkId, formData.Content);

    for (const qrInstance of qrInstances) {
      const enableMatches: boolean[] = [];
      const enableBehavior = qItemWithEnableWhen.enableBehavior;

      // VIKTIG: bruk instansens path som kontekst for å slå opp enableWhen.question
      const contextPath = qrInstance.path;

      enableWhenClauses.forEach(enableWhen => {
        const responseItem = getResponseItemWithLinkIdPossiblyContainingRepeat(enableWhen.question, simulatedResponseItems, contextPath);
        if (responseItem) {
          enableMatches.push(enableWhenMatchesAnswer(enableWhen, responseItem.answer));
        }
      });

      const enable =
        enableBehavior === QuestionnaireItemEnableBehaviorCodes.ALL ? enableMatches.every(Boolean) : enableMatches.some(Boolean);

      if (!enable) {
        // Simuler legacy-wipe i lokal kopi for transitive beregninger (også scoped til instans)
        const itemSim = getResponseItemWithLinkIdPossiblyContainingRepeat(qrInstance.item.linkId, simulatedResponseItems, contextPath);
        if (itemSim) {
          removeAddedRepeatingItemsSim(qItemWithEnableWhen, itemSim, simulatedResponseItems);
          wipeAnswerItemsSim(itemSim, qItemWithEnableWhen);
        }
        qrItemsToClear.push({
          qItemWithEnableWhen,
          linkId: qrInstance.item.linkId,
          instancePath: qrInstance.path,
        });
      }
    }
  }

  // transitiv nedover som i legacy
  calculateEnableWhenItemsToClearPure(qitemsWithEnableWhen, formData, formDefinition, path, qrItemsToClear, simulatedResponseItems);
  qitemsWithEnableWhen.forEach(i => {
    if (i.item) {
      calculateEnableWhenItemsToClearPure(i.item, formData, formDefinition, path, qrItemsToClear, simulatedResponseItems);
    }
  });
}

function getResponseItemWithLinkIdPossiblyContainingRepeat(
  linkId: string,
  items: Array<QuestionnaireResponseItem>,
  path: Array<Path> | undefined
): QuestionnaireResponseItem | undefined {
  for (const item of items) {
    const result = getQuestionnaireResponseItemWithLinkid(linkId, { item: [item], linkId: 'x' }, path || []);
    if (result) return result;
  }
  return undefined;
}

function removeAddedRepeatingItemsSim(
  defItem: QuestionnaireItem,
  repeatingItemInstance: QuestionnaireResponseItem,
  responseItemsSim: QuestionnaireResponseItem[]
): void {
  if (!defItem.repeats) return;
  const arrayToDeleteItem = getArrayContainingResponseItemFromItems(repeatingItemInstance.linkId, responseItemsSim);
  const minOccurs = getMinOccursExtensionValue(defItem);
  if (!arrayToDeleteItem) return;

  const keepThreshold = minOccurs ?? 1;
  let repeatingItemIndex = arrayToDeleteItem.filter(item => item.linkId === repeatingItemInstance.linkId).length;

  for (let i = arrayToDeleteItem.length - 1; i >= 0; i--) {
    const e = arrayToDeleteItem[i];
    if (e.linkId === defItem.linkId) {
      if (repeatingItemIndex > keepThreshold) arrayToDeleteItem.splice(i, 1);
      repeatingItemIndex--;
    }
  }
}

function wipeAnswerItemsSim(answerItem: QuestionnaireResponseItem | undefined, item: QuestionnaireItem | undefined): void {
  if (!answerItem || !item) return;

  if (answerItem.answer) {
    answerItem.answer.forEach(ans => resetAnswerValueSim(ans, item));
    for (let i = answerItem.answer.length - 1; i >= 0; i--) {
      const a = answerItem.answer[i];
      if (Object.keys(a).length === 0) answerItem.answer.splice(i, 1);
    }
  }

  for (let i = 0; answerItem.item && item.item && i < answerItem.item.length; i++) {
    wipeAnswerItemsSim(answerItem.item[i], item.item[i]);
  }

  for (let i = 0; answerItem.answer && item.item && i < answerItem.answer.length; i++) {
    const nestedItems = answerItem.answer[i].item;
    if (nestedItems && nestedItems.length > 0) {
      for (let j = 0; j < nestedItems.length; j++) {
        wipeAnswerItemsSim(nestedItems[j], item.item[i]);
      }
    }
  }
}

function resetAnswerValueSim(answer: QuestionnaireResponseItemAnswer, item: QuestionnaireItem): void {
  const initialAnswer = createQuestionnaireResponseAnswer(item);
  nullAnswerValue(answer, initialAnswer);
}

// Def-util: hent ALLE descendants (inkl. noden selv)
function collectDefinitionDescendants(root: QuestionnaireItem | undefined): QuestionnaireItem[] {
  if (!root) return [];
  const all: QuestionnaireItem[] = [];
  const stack: QuestionnaireItem[] = [root];
  while (stack.length) {
    const cur = stack.pop()!;
    all.push(cur);
    if (cur.item && cur.item.length) {
      for (let i = cur.item.length - 1; i >= 0; i--) stack.push(cur.item[i]);
    }
  }
  return all;
}

// Finn alle def-items med enableWhen som peker på given linkId (speiler legacy)
function getItemsWithEnableWhenPure(linkId: string, definitionItems: QuestionnaireItem[]): QuestionnaireItem[] {
  const relatedItems: QuestionnaireItem[] = [];
  const scanChildren = (lid: string, definitionItem: QuestionnaireItem | undefined): void => {
    if (!definitionItem?.item?.length) return;
    const matches = getItemEnableWhenQuestionMatchIdFromArrayPure(lid, definitionItem.item);
    matches.forEach(i => relatedItems.push(i));
    for (let i = 0; i < definitionItem.item.length; i++) scanChildren(lid, definitionItem.item[i]);
  };

  for (let k = 0; k < definitionItems.length; k++) {
    const enableWhen = definitionItems[k].enableWhen;
    if (enableWhen) {
      for (let n = 0; n < enableWhen.length; n++) {
        if (enableWhen[n].question === linkId) relatedItems.push(definitionItems[k]);
      }
    }
    scanChildren(linkId, definitionItems[k]);
  }
  return relatedItems;
}

function getItemEnableWhenQuestionMatchIdFromArrayPure(
  linkId: string,
  definitionItems: QuestionnaireItem[] | undefined
): QuestionnaireItem[] {
  if (!definitionItems) return [];
  const matched: QuestionnaireItem[] = [];
  for (let i = 0; i < definitionItems.length; i++) {
    const enableWhen = definitionItems[i].enableWhen;
    if (!enableWhen) continue;
    for (let j = 0; j < enableWhen.length; j++) {
      if (enableWhen[j].question === linkId) matched.push(definitionItems[i]);
    }
  }
  return matched;
}
