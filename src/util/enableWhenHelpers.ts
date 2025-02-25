import { Questionnaire, QuestionnaireItem, QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';

import { enableWhenMatchesAnswer, getQuestionnaireDefinitionItem, Path, QrItemEntry } from './refero-core';

const pathToString = (p: Path[]): string => p.map(x => (x.index !== undefined ? `${x.linkId}^${x.index}` : x.linkId)).join('/');

export function evaluateEnablementForAll(qrEntries: QrItemEntry[]): Record<string, boolean> {
  // We'll store "enabled" or "disabled" in a dictionary keyed by path
  const isEnabledMap: Record<string, boolean> = {};

  // We'll produce a function to turn path[] into a string so we can store it as a key

  for (const entry of qrEntries) {
    const pathKey = pathToString(entry.path);

    // Step 1: If any ancestor was disabled, this is disabled
    if (hasDisabledAncestor(entry.path, isEnabledMap, pathToString)) {
      isEnabledMap[pathKey] = false;
      continue;
    }

    // Step 2: If it has enableWhen, check them
    let satisfied = true;
    const enableClauses = entry.definitionItem.enableWhen;
    if (enableClauses && enableClauses.length > 0) {
      // We interpret enableBehavior = 'all' or 'any'
      const behavior = entry.definitionItem.enableBehavior || 'all';

      const clauseResults = enableClauses.map(clause => {
        // find the item that answers the question = clause.question
        // but specifically *in the same repeated group*
        // We'll do a small function to find that item in qrEntries by path
        const questionEntry = findItemInSameRepeat(entry.path, clause.question, qrEntries);
        if (!questionEntry) {
          // no item => answer can't match
          return false;
        }
        return enableWhenMatchesAnswer(clause, questionEntry.responseItem.answer ?? []);
      });

      if (behavior === 'all') {
        satisfied = clauseResults.every(Boolean);
      } else {
        // 'any'
        satisfied = clauseResults.some(Boolean);
      }
    }

    isEnabledMap[pathKey] = satisfied;
  }

  return isEnabledMap;
}

function hasDisabledAncestor(path: Path[], isEnabledMap: Record<string, boolean>, pathToString: (p: Path[]) => string): boolean {
  // If any parent's path is disabled, return true
  // parent's path is all but the last element
  for (let i = 1; i < path.length; i++) {
    const parentPath = path.slice(0, i);
    const parentKey = pathToString(parentPath);
    if (isEnabledMap[parentKey] === false) {
      return true;
    }
  }
  return false;
}

/**
 * Looks at 'entryPath' and tries to find the item with linkId=questionLinkId
 * that is in the *same repeated group ancestors*.
 */
function findItemInSameRepeat(entryPath: Path[], questionLinkId: string, allEntries: QrItemEntry[]): QrItemEntry | undefined {
  // We'll compare allEntries to see who shares the same "parent repeated group" path
  // up to the first repeated group that encloses questionLinkId or entryPath.
  //
  // In practice, you might do a narrower approach, but here's a simple one:
  return allEntries.find(e => {
    if (e.definitionItem.linkId !== questionLinkId) return false;

    // Now compare path segment by segment for repeated groups
    // We'll only require that any repeated group linkIds have the same index
    // if they appear in both.
    return isInSameRepeatedContext(entryPath, e.path);
  });
}

function isInSameRepeatedContext(pathA: Path[], pathB: Path[]): boolean {
  // e.g. check each linkId, if there's a repeated index in one, it must match in the other
  // or we decide how far up the tree we unify them. This can get elaborate.
  // Minimal approach: they share the same top repeated group index
  // for each linkId that appears in both paths in the same position.
  const len = Math.min(pathA.length, pathB.length);
  for (let i = 0; i < len; i++) {
    if (pathA[i].linkId === pathB[i].linkId) {
      // if one has index and the other doesn't => mismatch
      if (pathA[i].index !== undefined || pathB[i].index !== undefined) {
        if (pathA[i].index !== pathB[i].index) {
          return false;
        }
      }
    } else {
      // as soon as linkId differs, we can break
      break;
    }
  }
  return true;
}
export function buildQrItemMap(qr: QuestionnaireResponse, questionnaire: Questionnaire): QrItemEntry[] {
  const results: QrItemEntry[] = [];

  function traverse(
    parentPath: Path[],
    responseItems: QuestionnaireResponseItem[] | undefined,
    definitionItems: QuestionnaireItem[] | undefined
  ): void {
    if (!responseItems || !definitionItems) return;

    // We'll maintain a count of how many times each linkId appears,
    // so we can keep track of "which repetition index" we're on.
    const seenCount: Record<string, number> = {};

    for (const rItem of responseItems) {
      if (!rItem.linkId) continue;
      const idx = seenCount[rItem.linkId] || 0;
      seenCount[rItem.linkId] = idx + 1;

      // Build the new path: parent's path plus { linkId, index = idx }
      const thisPath = [...parentPath, { linkId: rItem.linkId, index: idx }];

      // Find the definition item for rItem.linkId
      const defItem = getQuestionnaireDefinitionItem(rItem.linkId, definitionItems);
      if (!defItem) {
        // Possibly continue if you want to be resilient
        continue;
      }

      // Add to our results map
      results.push({
        path: thisPath,
        definitionItem: defItem,
        responseItem: rItem,
      });

      // Descend further
      const childDefItems = defItem.item ?? [];
      const childRespItems = rItem.item;
      traverse(thisPath, childRespItems, childDefItems);

      // Also handle rItem.answer[].item
      if (rItem.answer) {
        for (const ans of rItem.answer) {
          if (ans.item && ans.item.length > 0) {
            // We use the same childDefItems in many FHIR structures,
            // or we could try to match each sub-item's linkId to defItem.item.
            traverse(thisPath, ans.item, childDefItems);
          }
        }
      }
    }
  }

  traverse([], qr.item, questionnaire.item);
  return results;
}
function reevaluateUntilStable(qr: QuestionnaireResponse, q: Questionnaire): void {
  while (true) {
    const entries = buildQrItemMap(qr, q);
    const enabledMap = evaluateEnablementForAll(entries, q, qr);

    const wasDisabled = entries.some(e => !enabledMap[pathToString(e.path)]);
    if (!wasDisabled) {
      // no new items got disabled => stable
      break;
    }
    // wipe them
    applyDisabling(entries, enabledMap);

    // after wiping, let's see if that leads to more items
    // (some items might have references to the newly wiped items)
    // If so, the loop continues
  }
}
function applyDisabling(qrEntries: QrItemEntry[], isEnabledMap: Record<string, boolean>): void {
  // sort them so children appear before parents
  // because we enumerated depth-first, we can just reverse
  const reversed = [...qrEntries].reverse();

  for (const entry of reversed) {
    const pathKey = entry.path.map(x => (x.index !== undefined ? `${x.linkId}^${x.index}` : x.linkId)).join('/');

    if (!isEnabledMap[pathKey]) {
      // This item is disabled => wipe answers
      wipeAnswerItems(entry.responseItem, entry.definitionItem);

      // If repeated, remove if above the minOccurs threshold
      removeAddedRepeatingItems(entry.definitionItem, entry.responseItem /* top-level array or root QR items */);
    }
  }
}
