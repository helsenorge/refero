// --- eksisterende imports beholdes ---
import { QuestionnaireItem, QuestionnaireResponseItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';

import { NewValuePayload } from '@/actions/newValue';
import { FormData, FormDefinition, nullAnswerValue } from '@/reducers/form';
import { QuestionnaireItemEnableBehaviorCodes } from '@/types/fhirEnums';
import { createQuestionnaireResponseAnswer } from '@/util/createQuestionnaireResponseAnswer';
import { getMinOccursExtensionValue } from '@/util/extension';
import {
  enableWhenMatchesAnswer,
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

type QrItemsToClear = {
  qItemWithEnableWhen: QuestionnaireItem;
  linkId: string;
  instancePath: Path[];
};

// ---- Lokale pure utils ---------------------------------------------

/** Robust deep clone (JSON-safe datastrukturer). */
function deepClone<T>(value: T): T {
  if (typeof structuredClone === 'function') return structuredClone(value);

  return JSON.parse(JSON.stringify(value));
}

/** Konservativ sjekk: mangler path → regn som samme instans (ikke blokker). */
function isSameInstance(contextPath: Path[] | undefined, candidatePath: Path[] | undefined): boolean {
  if (!contextPath || !candidatePath) return true;
  for (const seg of contextPath) {
    if (seg.index === undefined) continue;
    const hit = candidatePath.find(s => s.linkId === seg.linkId);
    if (!hit) return false;
    if (hit.index !== undefined && hit.index !== seg.index) return false;
  }
  return true;
}

/** DFS som returnerer alle descendants inkl. root. Pure (ingen mutasjon). */
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

/** Finn definisjonsnoder med enableWhen som peker på linkId. */
function getItemsWithEnableWhenPure(linkId: string, definitionItems: QuestionnaireItem[]): QuestionnaireItem[] {
  const relatedItems: QuestionnaireItem[] = [];

  const scanChildren = (lid: string, defItem: QuestionnaireItem | undefined): void => {
    if (!defItem?.item?.length) return;
    const matches = getItemEnableWhenQuestionMatchIdFromArrayPure(lid, defItem.item);
    for (const m of matches) relatedItems.push(m);
    for (const child of defItem.item) scanChildren(lid, child);
  };

  for (const def of definitionItems) {
    const enableWhen = def.enableWhen;
    if (enableWhen) {
      for (const clause of enableWhen) {
        if (clause.question === linkId) relatedItems.push(def);
      }
    }
    scanChildren(linkId, def);
  }
  return relatedItems;
}

function getItemEnableWhenQuestionMatchIdFromArrayPure(
  linkId: string,
  definitionItems: QuestionnaireItem[] | undefined
): QuestionnaireItem[] {
  if (!definitionItems) return [];
  const matched: QuestionnaireItem[] = [];
  for (const it of definitionItems) {
    const enableWhen = it.enableWhen;
    if (!enableWhen) continue;
    for (const clause of enableWhen) {
      if (clause.question === linkId) matched.push(it);
    }
  }
  return matched;
}

/** Søk etter QR-item (i riktig repeater-context) fra rotliste. */
function getResponseItemWithLinkIdPossiblyContainingRepeat(
  linkId: string,
  items: Array<QuestionnaireResponseItem>,
  referencePath: Array<Path> | undefined
): QuestionnaireResponseItem | undefined {
  for (const root of items) {
    const result = getQuestionnaireResponseItemWithLinkid(linkId, { item: [root], linkId: 'x' }, referencePath || []);
    if (result) return result;
  }
  return undefined;
}

/** Hjelper: klone svar før nulling (gjør operasjonen pure). */
function resetAnswerValueSimPure(answer: QuestionnaireResponseItemAnswer, item: QuestionnaireItem): QuestionnaireResponseItemAnswer {
  const initialAnswer = createQuestionnaireResponseAnswer(item);
  const clone = deepClone(answer);
  nullAnswerValue(clone, initialAnswer);
  return clone;
}

/** True hvis objektet ikke har noen egne keys. */
function isEmptyObject(obj: object | undefined): boolean {
  return !obj || Object.keys(obj).length === 0;
}

/**
 * Bygger et nytt node-subtre der svar er nullstilt iht. definisjon (pure).
 * Replikerer semantikken i den muterende `wipeAnswerItemsSim`.
 */
function wipeNodeAndDescendantsPure(answerItem: QuestionnaireResponseItem, defItem: QuestionnaireItem): QuestionnaireResponseItem {
  // Null ut svar og fjern tomme
  let newAnswers = answerItem.answer ? answerItem.answer.map(a => resetAnswerValueSimPure(a, defItem)) : undefined;
  if (newAnswers) {
    newAnswers = newAnswers.filter(a => !isEmptyObject(a));
    if (newAnswers.length === 0) newAnswers = undefined;
  }

  // Rydd barn i item-barn hvis parallell struktur finnes
  let newChildItems: QuestionnaireResponseItem[] | undefined = answerItem.item;
  if (answerItem.item && defItem.item) {
    newChildItems = answerItem.item.map((child, i) =>
      defItem.item && defItem.item[i] ? wipeNodeAndDescendantsPure(child, defItem.item[i]) : child
    );
  }

  // Rydd nested items under hvert svar (FHIR: answer[].item[])
  let newAnswersWithNested = newAnswers;
  if (answerItem.answer && defItem.item) {
    newAnswersWithNested = (newAnswers ?? []).map((ans, i) => {
      const nested = ans.item;
      if (nested && nested.length > 0 && defItem.item && defItem.item[i]) {
        const cleanedNested = nested.map(n => wipeNodeAndDescendantsPure(n, defItem.item![i]));
        return { ...ans, item: cleanedNested };
      }
      return ans;
    });
    if (newAnswersWithNested.length === 0) newAnswersWithNested = undefined;
  }

  return {
    ...answerItem,
    answer: newAnswersWithNested,
    item: newChildItems,
  };
}

/**
 * Immutable oppdatering: finn element ved `instancePath` og erstatt det med `updater(node)`.
 * Navigasjon følger samme prioritet som lesingen: først .item, deretter answer[].item.
 */
function updateAtPath(
  roots: QuestionnaireResponseItem[],
  instancePath: Path[],
  updater: (node: QuestionnaireResponseItem) => QuestionnaireResponseItem
): QuestionnaireResponseItem[] {
  if (instancePath.length === 0) return roots;

  // finn posisjon (n-te forekomst av linkId på dette nivået)
  const findPos = (arr: QuestionnaireResponseItem[], seg: Path): number => {
    let count = -1;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].linkId === seg.linkId) {
        count++;
        if ((seg.index ?? 0) === count) return i;
      }
    }
    return -1;
  };

  const recur = (arr: QuestionnaireResponseItem[], depth: number): QuestionnaireResponseItem[] => {
    const seg = instancePath[depth];
    const pos = findPos(arr, seg);
    if (pos === -1) return arr;

    const before = arr.slice(0, pos);
    const target = arr[pos];
    const after = arr.slice(pos + 1);

    if (depth === instancePath.length - 1) {
      // Erstatt selve noden
      return [...before, updater(target), ...after];
    }

    // Forsøk først å gå via .item
    let updatedTarget: QuestionnaireResponseItem = target;
    const nextSeg = instancePath[depth + 1];

    const tryUpdateItems = (): QuestionnaireResponseItem | undefined => {
      const items = target.item ?? [];
      // sjekk om neste segment finnes i items
      const hasNext = items.filter(i => i.linkId === nextSeg.linkId).length > 0;
      if (!hasNext) return undefined;
      const newItems = recur(items, depth + 1);
      if (newItems === items) return undefined;
      return { ...target, item: newItems };
    };

    const tryUpdateAnswers = (): QuestionnaireResponseItem | undefined => {
      if (!target.answer || target.answer.length === 0) return undefined;
      let changed = false;
      const newAnswers = target.answer.map(ans => {
        if (!ans.item || ans.item.length === 0) return ans;
        // sjekk om neste segment finnes i denne answer.item-listen
        const hasNextHere = ans.item.filter(i => i.linkId === nextSeg.linkId).length > 0;
        if (!hasNextHere) return ans;
        const newAnsItems = recur(ans.item, depth + 1);
        if (newAnsItems !== ans.item) {
          changed = true;
          return { ...ans, item: newAnsItems };
        }
        return ans;
      });
      if (!changed) return undefined;
      return { ...target, answer: newAnswers };
    };

    updatedTarget = tryUpdateItems() ?? tryUpdateAnswers() ?? target;
    if (updatedTarget === target) return arr; // ingen endring

    return [...before, updatedTarget, ...after];
  };

  return recur(roots, 0);
}

/**
 * Immutable: finn **forelder-noden** til `instancePath` og transformer den **første** barne-listen
 * (enten .item eller en av answer[k].item) som inneholder elementer med `childLinkId`.
 */
function updateChildrenAtParentPath(
  roots: QuestionnaireResponseItem[],
  instancePath: Path[],
  childLinkId: string,
  transform: (children: QuestionnaireResponseItem[]) => QuestionnaireResponseItem[]
): QuestionnaireResponseItem[] {
  if (instancePath.length === 0) return roots;
  const parentPath = instancePath.slice(0, -1);

  const applyOnNode = (node: QuestionnaireResponseItem): QuestionnaireResponseItem => {
    // 1) Forsøk på .item
    if (node.item && node.item.some(it => it.linkId === childLinkId)) {
      const newItems = transform(node.item);
      if (newItems !== node.item) return { ...node, item: newItems };
    }
    // 2) Forsøk på første answer[].item som matcher
    if (node.answer && node.answer.length > 0) {
      let applied = false;
      const newAnswers = node.answer.map(ans => {
        if (applied || !ans.item || ans.item.length === 0) return ans;
        if (!ans.item.some(it => it.linkId === childLinkId)) return ans;
        applied = true;
        const newItems = transform(ans.item);
        return { ...ans, item: newItems };
      });
      if (applied) return { ...node, answer: newAnswers };
    }
    return node;
  };

  return updateAtPath(roots, parentPath, applyOnNode);
}

/**
 * PURE variant: fjern overflødige repetisjoner i **samme container** som holder instansen.
 * Beholder [0 .. keepThreshold-1], fjerner index >= keepThreshold (identisk semantikk).
 */
function removeAddedRepeatingItemsSimPure(
  defItem: QuestionnaireItem,
  instancePath: Path[],
  responseItemsSim: QuestionnaireResponseItem[]
): QuestionnaireResponseItem[] {
  if (!defItem.repeats) return responseItemsSim;
  const minOccurs = getMinOccursExtensionValue(defItem);
  const keepThreshold = minOccurs ?? 1;

  const transformSiblings = (siblings: QuestionnaireResponseItem[]): QuestionnaireResponseItem[] => {
    // Telle antall forekomster av defItem.linkId
    const total = siblings.filter(s => s.linkId === defItem.linkId).length;
    if (total <= keepThreshold) return siblings;

    // Gå baklengs og fjern til vi er på/under terskel
    let remaining = total;
    const out: QuestionnaireResponseItem[] = [];
    for (let i = siblings.length - 1; i >= 0; i--) {
      const e = siblings[i];
      if (e.linkId === defItem.linkId && remaining > keepThreshold) {
        remaining--;
        // dropp denne (ikke push)
      } else {
        out.push(e);
      }
    }
    return out.reverse();
  };

  return updateChildrenAtParentPath(responseItemsSim, instancePath, defItem.linkId, transformSiblings);
}

/**
 * PURE variant: null ut svar på valgt instans (og dens descendants) iht. definisjon.
 */
function wipeAnswerItemsSimPure(
  instancePath: Path[],
  defItem: QuestionnaireItem,
  responseItemsSim: QuestionnaireResponseItem[]
): QuestionnaireResponseItem[] {
  const updater = (node: QuestionnaireResponseItem): QuestionnaireResponseItem => wipeNodeAndDescendantsPure(node, defItem);
  return updateAtPath(responseItemsSim, instancePath, updater);
}

/**
 * Traverser enableWhen-grafen og akkumuler hvilke instanser som må ryddes.
 * Muterer ikke, men oppdaterer og returnerer simulert tre ved hver “disable”.
 */
function calculateEnableWhenItemsToClearPure(
  items: QuestionnaireItem[] | undefined,
  formData: FormData,
  formDefinition: FormDefinition,
  path: Array<Path> | undefined,
  simulatedResponseItems: QuestionnaireResponseItem[] | undefined
): { sim: QuestionnaireResponseItem[]; itemsToClear: QrItemsToClear[] } {
  // Sikre definert sim-array (ingen mutasjon av input)
  const baseSim: QuestionnaireResponseItem[] = simulatedResponseItems ?? [];
  if (!items || !formData.Content || baseSim.length === 0) {
    return { sim: baseSim, itemsToClear: [] };
  }

  const definitionItems = getDefinitionItems(formDefinition);
  const withEnable: QuestionnaireItem[] = [];

  if (definitionItems) {
    for (const i of items) {
      withEnable.push(...getItemsWithEnableWhenPure(i.linkId, definitionItems));
    }
  }

  if (withEnable.length === 0) {
    return { sim: baseSim, itemsToClear: [] };
  }

  let sim = baseSim;
  const itemsToClear: QrItemsToClear[] = [];

  for (const qItemWithEnableWhen of withEnable) {
    const clauses = qItemWithEnableWhen.enableWhen;
    if (!clauses) continue;

    const qrInstances = getResponseItemAndPathWithLinkId(qItemWithEnableWhen.linkId, formData.Content);

    for (const qrInstance of qrInstances) {
      const enableMatches: boolean[] = [];
      const enableBehavior = qItemWithEnableWhen.enableBehavior;
      const contextPath = qrInstance.path;

      for (const clause of clauses) {
        const responseItem = getResponseItemWithLinkIdPossiblyContainingRepeat(clause.question, sim, contextPath);
        if (responseItem) {
          enableMatches.push(enableWhenMatchesAnswer(clause, responseItem.answer));
        }
      }

      const enable =
        enableBehavior === QuestionnaireItemEnableBehaviorCodes.ALL ? enableMatches.every(Boolean) : enableMatches.some(Boolean);

      if (!enable) {
        // PURE: bygg nytt sim-tre uten å mutere eksisterende
        sim = removeAddedRepeatingItemsSimPure(qItemWithEnableWhen, contextPath, sim);
        sim = wipeAnswerItemsSimPure(contextPath, qItemWithEnableWhen, sim);

        itemsToClear.push({
          qItemWithEnableWhen,
          linkId: qrInstance.item.linkId,
          instancePath: contextPath,
        });
      }
    }
  }

  // Samme rekursive struktur som før (ingen dedupe for identisk atferd)
  const siblings = calculateEnableWhenItemsToClearPure(withEnable, formData, formDefinition, path, sim);
  sim = siblings.sim;
  itemsToClear.push(...siblings.itemsToClear);

  for (const i of withEnable) {
    if (i.item) {
      const children = calculateEnableWhenItemsToClearPure(i.item, formData, formDefinition, path, sim);
      sim = children.sim;
      itemsToClear.push(...children.itemsToClear);
    }
  }

  return { sim, itemsToClear };
}

// ---- Public API -----------------------------------------------------
export function runEnableWhenPure({ action, formData, formDefinition }: RunEnableWhenParams): RunEnableWhenResult {
  if (!action?.item || !formData?.Content) return { answerValues: [], repeatRemovals: [] };

  const responseItems = getResponseItems(formData);
  if (!responseItems || responseItems.length === 0) return { answerValues: [], repeatRemovals: [] };

  // PURE kall – ingen mutasjon av innsendte argumenter
  const { itemsToClear: qrItemsToClear } = calculateEnableWhenItemsToClearPure(
    [action.item],
    formData,
    formDefinition,
    action.itemPath,
    deepClone(responseItems)
  );

  if (qrItemsToClear.length === 0) return { answerValues: [], repeatRemovals: [] };

  const answerValues: NewValuePayload[] = [];
  const repeatRemovals: RepeatRemoval[] = [];

  for (const entry of qrItemsToClear) {
    const { qItemWithEnableWhen, linkId, instancePath } = entry;

    const defDescendants = collectDefinitionDescendants(qItemWithEnableWhen);

    for (const defChild of defDescendants) {
      const childLinkId = defChild.linkId;
      const allChildInstances = getResponseItemAndPathWithLinkId(childLinkId, formData.Content);
      if (!allChildInstances.length) continue;

      const childInstances = allChildInstances.filter(ip => isSameInstance(instancePath, ip.path));
      if (childInstances.length === 0) continue;

      const initial = createQuestionnaireResponseAnswer(defChild);
      for (const ip of childInstances) {
        answerValues.push({
          itemPath: ip.path,
          item: defChild,
          newAnswer: initial ? [initial] : [],
        });
      }
    }

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
