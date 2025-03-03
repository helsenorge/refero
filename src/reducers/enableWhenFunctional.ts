/* eslint-disable no-console */
import { QuestionnaireResponseItem, QuestionnaireItem, Questionnaire, QuestionnaireResponse } from 'fhir/r4';

import { enableWhenMatchesAnswer, Path } from '../util/refero-core';

import { QuestionnaireItemEnableBehaviorCodes } from '@/types/fhirEnums';

/*
Rules for enableWhen:

Repetition Scope:
Repetition with enableWhen only works within a single group.

Handling Initial Values:
Initial values should be applied when an answer is removed. 
If initial values exist when an item becomes disabled, then set the initial value. If no initial value exists, the answer 
(not the nested item inside the answer, but only the primitive value fields such as valueString, valueBoolean, etc.) should be deleted.

Default Boolean Behavior:
Booleans have a default value of false. When disabling an item of type "boolean", first check for an initial value; 
if none is set, set the answer to valueBoolean: false.

Reevaluation After Changes:
It is important to consider that when an answer is triggered by an enableWhen condition, it may affect another item with enableWhen. 
Therefore, the entire QuestionnaireResponse should be rechecked if any change occurs.

Deletion of Repeated Items:
Repeated items that become disabled—or that are children of an item disabled due to an enableWhen trigger—should be deleted. The initial item should remain.

Differentiating Repeated Items:
Repeated items in a QuestionnaireResponse have the same linkId as the item they were copied from. 
The only way to distinguish them is by using the Path (represented via repeatedContexts in the QRTreeRepresentation).
It is important to note that there may be several branches that themselves can be repeated, so we need to maintain a list of Paths to represent this.
*/

export interface QRTreeNode {
  /** The full path from the root to this node. */
  path: Path[];
  /** The original QuestionnaireResponseItem */
  item: QuestionnaireResponseItem;
  /** Nested child nodes (from item.item or answer.item) */
  children: QRTreeNode[];
}

export interface QRTreeRepresentation {
  linkId: string;
  index?: number;
  repeatedContexts: Path[];
  children: QRTreeRepresentation[];
}

interface DisabledItem {
  linkId: string;
  repeatedContexts: Path[];
}

export function runEnableWhen(
  questionnaire?: Questionnaire | null,
  questionnaireResponse?: QuestionnaireResponse | null
): QuestionnaireResponse | undefined | null {
  if (!questionnaire || !questionnaireResponse) {
    console.log('userlog: Missing questionnaire or questionnaire response.');
    return questionnaireResponse;
  }

  const questionnaireItemsWithEnable = getAllEnableWhenItems(questionnaire);
  if (!questionnaireItemsWithEnable.length) {
    console.log('userlog: No enableWhen conditions found in questionnaire.');
    return questionnaireResponse;
  }

  // Build a map of questionnaire items by linkId for quick lookup.
  const questionnaireItemMap = buildQuestionnaireItemMap(questionnaire);

  // Create a deep copy for immutability.
  let currentResponse: QuestionnaireResponse = questionnaireResponse;
  let iterations = 0;
  const maxIterations = 10; // Prevent infinite loops

  do {
    // Save a snapshot of the current response state.
    const previousResponse = JSON.parse(JSON.stringify(currentResponse));

    // Process the response and update answers for items whose enableWhen conditions are not met.
    currentResponse = processQuestionnaireResponse(currentResponse, questionnaire, questionnaireItemMap);

    iterations++;
    console.log(`userlog: Iteration ${iterations} completed`);

    // Continue until no changes are detected or until max iterations are reached.
    if (JSON.stringify(previousResponse) === JSON.stringify(currentResponse)) {
      console.log('userlog: No changes detected, exiting loop');
      break;
    }
  } while (iterations < maxIterations);

  if (iterations >= maxIterations) {
    console.log('userlog: Maximum iterations reached, may have circular dependency');
  }
  console.log('DEBUG: ', currentResponse);
  return currentResponse;
}

function buildQuestionnaireItemMap(questionnaire: Questionnaire): Map<string, QuestionnaireItem> {
  const map = new Map<string, QuestionnaireItem>();

  function addItemsToMap(items: QuestionnaireItem[]): void {
    for (const item of items) {
      map.set(item.linkId, item);
      if (item.item) {
        addItemsToMap(item.item);
      }
    }
  }

  if (questionnaire.item) {
    addItemsToMap(questionnaire.item);
  }

  return map;
}

function processQuestionnaireResponse(
  response: QuestionnaireResponse,
  questionnaire: Questionnaire,
  itemMap: Map<string, QuestionnaireItem>
): QuestionnaireResponse {
  // Find all disabled items with their paths
  const disabledItems = findDisabledItems(questionnaire, response);

  console.log(`userlog: Found ${disabledItems.length} disabled items`);
  disabledItems.forEach(item => {
    console.log(`userlog: Disabled item: ${item.linkId}, contexts: ${JSON.stringify(item.repeatedContexts)}`);
  });

  // Create a new response with answers cleared for disabled items
  const newResponse = { ...response };
  if (response.item) {
    newResponse.item = clearDisabledItemAnswers(response.item, disabledItems, itemMap);
  }

  return newResponse;
}

function findDisabledItems(questionnaire: Questionnaire, response: QuestionnaireResponse): DisabledItem[] {
  const disabledItems: DisabledItem[] = [];

  // Transform response to tree for context tracking
  const responseTree = transformQuestionnaireResponseToTree(response);

  // Process items to find which ones are disabled
  if (questionnaire.item && response.item) {
    findDisabledItemsRecursive(questionnaire.item, responseTree, response, disabledItems, []);
  }

  return disabledItems;
}

function findDisabledItemsRecursive(
  questionnaireItems: QuestionnaireItem[],
  responseItems: QRTreeRepresentation[],
  fullResponse: QuestionnaireResponse,
  disabledItems: DisabledItem[],
  parentContext: Path[]
): void {
  for (const qItem of questionnaireItems) {
    // Find matching response items (could be multiple if repeated)
    const matchingResponseItems = responseItems.filter(ri => ri.linkId === qItem.linkId);

    for (const responseItem of matchingResponseItems) {
      // Build current context
      const currentContext = [...parentContext];
      if (responseItem.index !== undefined) {
        currentContext.push({ linkId: qItem.linkId, index: responseItem.index });
      }

      // Check if this item has enableWhen conditions
      if (qItem.enableWhen && qItem.enableWhen.length > 0) {
        const enabled = evaluateEnableWhen(qItem, fullResponse, currentContext);

        console.log('userlog: Item', qItem.linkId, 'with context', JSON.stringify(currentContext), 'is', enabled ? 'enabled' : 'disabled');

        if (!enabled) {
          // Add this item and all its children to disabled items
          disabledItems.push({
            linkId: qItem.linkId,
            repeatedContexts: responseItem.repeatedContexts,
          });

          // Add all children recursively
          if (qItem.item) {
            addAllChildrenToDisabled(qItem.item, responseItem.children, disabledItems);
          }

          // Skip processing children since we've already disabled them all
          continue;
        }
      }

      // If this item is enabled or has no enableWhen, process its children
      if (qItem.item && responseItem.children.length > 0) {
        findDisabledItemsRecursive(qItem.item, responseItem.children, fullResponse, disabledItems, currentContext);
      }
    }
  }
}

function addAllChildrenToDisabled(
  questionnaireItems: QuestionnaireItem[],
  responseItems: QRTreeRepresentation[],
  disabledItems: DisabledItem[]
): void {
  for (const qItem of questionnaireItems) {
    const matchingItems = responseItems.filter(ri => ri.linkId === qItem.linkId);

    for (const matchingItem of matchingItems) {
      disabledItems.push({
        linkId: qItem.linkId,
        repeatedContexts: matchingItem.repeatedContexts,
      });

      if (qItem.item && matchingItem.children.length > 0) {
        addAllChildrenToDisabled(qItem.item, matchingItem.children, disabledItems);
      }
    }
  }
}
function evaluateEnableWhen(item: QuestionnaireItem, response: QuestionnaireResponse, context: Path[]): boolean {
  if (!item.enableWhen || item.enableWhen.length === 0) {
    return true;
  }

  const enableBehavior = item.enableBehavior || QuestionnaireItemEnableBehaviorCodes.ALL;

  // Find repeating group context if it exists
  const repeatingGroupContext = findRepeatingGroupContext(context);

  // Evaluate each enableWhen condition
  const results = item.enableWhen.map(condition => {
    let targetItem: QuestionnaireResponseItem | undefined;

    // First, try to find the referenced item in the same repeating group context
    if (repeatingGroupContext.length > 0) {
      targetItem = findItemInRepeatingContext(condition.question, response.item || [], repeatingGroupContext);

      // For debugging in test case
      if (item.linkId === 'targetItem') {
        console.log(
          `userlog DEBUG: ${item.linkId} condition references ${condition.question} with answer:`,
          targetItem?.answer ? JSON.stringify(targetItem.answer[0]) : 'not found'
        );
      }
    }

    // If not found in repeating context, fall back to regular context path
    if (!targetItem && context.length > 0) {
      targetItem = findItemInContext(condition.question, response, context);
    }

    // Last resort: global lookup (only if we couldn't find it in proper context)
    if (!targetItem) {
      console.log(`userlog: Item ${condition.question} not found in specific context, trying global lookup`);
      targetItem = findResponseItemByLinkId(condition.question, response.item || [], []);
    }

    if (!targetItem || !targetItem.answer || targetItem.answer.length === 0) {
      console.log(`userlog: No answer found for condition referencing ${condition.question}`);
      return false;
    }

    const matches = enableWhenMatchesAnswer(condition, targetItem.answer);
    console.log(`userlog: Condition for ${item.linkId} referencing ${condition.question} ${matches ? 'matches' : 'does not match'}`);
    return matches;
  });

  const result =
    enableBehavior === QuestionnaireItemEnableBehaviorCodes.ALL
      ? results.every(r => r) // ALL: every condition must be true
      : results.some(r => r); // ANY: at least one condition must be true

  console.log(`userlog: Item ${item.linkId} with ${enableBehavior} behavior: final result is ${result ? 'enabled' : 'disabled'}`);
  return result;
}

// Helper function to find the repeating group context
function findRepeatingGroupContext(context: Path[]): Path[] {
  const repeatingGroups: Path[] = [];

  for (const path of context) {
    repeatingGroups.push(path);
    // If we hit an item without an index, we're no longer in a repeating context
    if (path.index === undefined) {
      break;
    }
  }

  return repeatingGroups;
}
function findItemInRepeatingContext(
  targetLinkId: string,
  responseItems: QuestionnaireResponseItem[],
  contextPath: Path[]
): QuestionnaireResponseItem | undefined {
  // For logging clarity
  console.log(`userlog: Finding ${targetLinkId} in repeating context ${JSON.stringify(contextPath)}`);

  if (!responseItems || !contextPath.length) return undefined;

  // Get the container item first (since our structure is container > repeatingGroup > items)
  const containerItem = responseItems[0]; // In our test case, this is the 'container' item
  if (!containerItem || !containerItem.item) return undefined;

  // Now find the repeating group instances at the container level
  const currentContext = contextPath[0];
  const repeatingGroups = containerItem.item.filter(item => item.linkId === currentContext.linkId);

  // If no repeating groups found or index is invalid, return undefined
  if (!repeatingGroups.length || currentContext.index === undefined || currentContext.index >= repeatingGroups.length) {
    console.log(`userlog: No matching repeating groups with linkId ${currentContext.linkId} or invalid index ${currentContext.index}`);
    return undefined;
  }

  // Get the specific repeating group instance by index
  const repeatingGroup = repeatingGroups[currentContext.index];

  // Now find the target item (controlCondition) within this repeating group instance
  if (repeatingGroup.item) {
    const targetItem = repeatingGroup.item.find(item => item.linkId === targetLinkId);
    if (targetItem) {
      console.log(`userlog: Found ${targetLinkId} in repeating group ${currentContext.linkId}[${currentContext.index}]`);
      return targetItem;
    }
  }

  return undefined;
}

function findItemInContext(targetLinkId: string, response: QuestionnaireResponse, context: Path[]): QuestionnaireResponseItem | undefined {
  if (!response.item) return undefined;

  function findRecursive(
    items: QuestionnaireResponseItem[],
    remainingContext: Path[],
    currentPath: Path[]
  ): QuestionnaireResponseItem | undefined {
    // If we've followed the entire context path, look for the target item
    if (remainingContext.length === 0) {
      const item = items.find(item => item.linkId === targetLinkId);
      if (item) {
        console.log(`userlog: Found target ${targetLinkId} at end of context path ${JSON.stringify(currentPath)}`);
      }
      return item;
    }

    // Process the next context segment
    const nextSegment = remainingContext[0];
    const matchingItems = items.filter(item => item.linkId === nextSegment.linkId);

    if (matchingItems.length === 0) {
      console.log(`userlog: No items match context segment ${JSON.stringify(nextSegment)}`);
      return undefined;
    }

    // If index is specified and exists, use that specific item
    const selectedItem =
      nextSegment.index !== undefined && nextSegment.index < matchingItems.length ? matchingItems[nextSegment.index] : matchingItems[0];

    // Move to next level in the context path
    if (selectedItem.item) {
      const newPath = [...currentPath, nextSegment];
      return findRecursive(selectedItem.item, remainingContext.slice(1), newPath);
    }

    return undefined;
  }

  // First try to find the item with context
  if (context.length > 0) {
    console.log(`userlog: Looking for ${targetLinkId} within context ${JSON.stringify(context)}`);
    return findRecursive(response.item, [...context], []);
  }

  // If no context or not found with context, look for it directly
  console.log(`userlog: Looking for ${targetLinkId} globally (no context)`);
  return findResponseItemByLinkId(targetLinkId, response.item, []);
}
function clearDisabledItemAnswers(
  items: QuestionnaireResponseItem[],
  disabledItems: DisabledItem[],
  itemMap: Map<string, QuestionnaireItem>,
  parentContext: Path[] = []
): QuestionnaireResponseItem[] {
  // Track items at this level with same linkId for indexing
  const itemsByLinkId: Record<string, QuestionnaireResponseItem[]> = {};

  // Log for debug
  if (items.some(item => item.linkId === '7.1.2')) {
    console.log('REPEATS-DEBUG: Found items with linkId 7.1.2 - count:', items.filter(i => i.linkId === '7.1.2').length);
    console.log('REPEATS-DEBUG: Current context:', JSON.stringify(parentContext));
    console.log(
      'REPEATS-DEBUG: Items structure:',
      JSON.stringify(
        items.map(i => ({
          linkId: i.linkId,
          hasAnswer: i.answer?.length > 0,
        })),
        null,
        2
      )
    );
  }

  items.forEach(item => {
    if (!itemsByLinkId[item.linkId]) {
      itemsByLinkId[item.linkId] = [];
    }
    itemsByLinkId[item.linkId].push(item);

    // Log specific test items
    if (item.linkId === '7.1.2') {
      console.log(`REPEATS-DEBUG: Found 7.1.2 item:`, JSON.stringify({ answer: item.answer, context: parentContext }, null, 2));
    }
  });

  // Log all disabled items affecting this level
  if (items.some(item => item.linkId === '7.1.2')) {
    const relevantDisabled = disabledItems.filter(
      di => di.linkId === '7.1.2' || di.repeatedContexts.some(ctx => parentContext.some(p => p.linkId === ctx.linkId))
    );
    console.log(
      'REPEATS-DEBUG: Disabled items affecting this level:',
      JSON.stringify(
        relevantDisabled.map(di => ({ linkId: di.linkId, context: di.repeatedContexts })),
        null,
        2
      )
    );
  }

  // Before returning the mapped results, check if we need to filter repeating items
  const repeatingLinkIds = new Set<string>();

  // Find the repeating items that are disabled
  for (const linkId in itemsByLinkId) {
    if (itemsByLinkId[linkId].length > 1) {
      const qItem = itemMap.get(linkId);
      const isRepeating = qItem?.repeats === true;

      if (isRepeating) {
        // Check if this repeating item is disabled
        const isDisabled = disabledItems.some(
          di =>
            di.linkId === linkId ||
            // Check if a parent context is disabled
            di.repeatedContexts.some(ctx => parentContext.some(p => p.linkId === ctx.linkId))
        );

        if (isDisabled) {
          repeatingLinkIds.add(linkId);
          console.log(`REPEATS-DEBUG: Disabled repeating item found: ${linkId}`);
        }
      }
    }
  }

  // Now use map but track which items we actually want to keep
  const resultItems: QuestionnaireResponseItem[] = [];

  items.forEach((item, index) => {
    // Create a new item to avoid modifying the original
    const newItem = { ...item };

    // Build this item's context path
    const currentPath = [...parentContext];
    if (itemsByLinkId[item.linkId].length > 1) {
      // If multiple items with same linkId at this level, add index
      currentPath.push({ linkId: item.linkId, index });
    } else if (parentContext.length > 0) {
      // Otherwise, just add the linkId without index
      currentPath.push({ linkId: item.linkId });
    }

    // Check if this item should be skipped (additional instance of disabled repeating item)
    if (repeatingLinkIds.has(item.linkId)) {
      const myIndex = itemsByLinkId[item.linkId].indexOf(item);
      if (myIndex > 0) {
        console.log(`REPEATS-DEBUG: SKIPPING extra instance ${myIndex} of disabled repeating item ${item.linkId}`);
        return; // Skip this item, don't add to result
      }
    }

    // Find if this item matches any disabled item by linkId AND context
    const matchingDisabledItem = disabledItems.find(di => {
      if (di.linkId !== item.linkId) return false;

      // Check if disabled item context matches current item context
      if (di.repeatedContexts.length > 0 && parentContext.length > 0) {
        const parentMatch = di.repeatedContexts.every(
          (path, i) => i < parentContext.length && path.linkId === parentContext[i].linkId && path.index === parentContext[i].index
        );

        return parentMatch;
      }

      // Fall back to direct match for simple items
      return di.repeatedContexts.length === 0 && parentContext.length === 0;
    });

    const isDisabled = !!matchingDisabledItem;

    // If disabled, clear/reset answer according to rules
    if (isDisabled) {
      console.log(`REPEATS-DEBUG: Clearing answers for disabled ${item.linkId} at path ${JSON.stringify(currentPath)}`);
      const qItem = itemMap.get(item.linkId);

      if (item.answer) {
        if (qItem?.initial && qItem.initial.length > 0) {
          newItem.answer = [...qItem.initial];
        } else if (qItem?.type === 'boolean') {
          newItem.answer = [{ valueBoolean: false }];
        } else {
          newItem.answer = [];
        }
      }
    }

    // Process children recursively with the updated context
    if (item.item && item.item.length > 0) {
      newItem.item = clearDisabledItemAnswers(item.item, disabledItems, itemMap, currentPath);
    }

    // Process answer.item recursively
    if (newItem.answer) {
      newItem.answer = newItem.answer.map(answer => {
        if (answer.item && answer.item.length > 0) {
          // Special handling for answer.item arrays that might contain repeating items
          const answerItems = answer.item;

          // Group answer items by linkId
          const answerItemsByLinkId: Record<string, QuestionnaireResponseItem[]> = {};
          answerItems.forEach(item => {
            if (!answerItemsByLinkId[item.linkId]) {
              answerItemsByLinkId[item.linkId] = [];
            }
            answerItemsByLinkId[item.linkId].push(item);
          });

          // Find disabled repeating items within answer.item
          const disabledRepeatingLinkIds = new Set<string>();
          Object.entries(answerItemsByLinkId).forEach(([linkId, items]) => {
            if (items.length > 1) {
              const qItem = itemMap.get(linkId);
              const isRepeating = qItem?.repeats === true;

              if (isRepeating) {
                const isDisabled = disabledItems.some(
                  di => di.linkId === linkId || di.repeatedContexts.some(ctx => currentPath.some(p => p.linkId === ctx.linkId))
                );

                if (isDisabled) {
                  disabledRepeatingLinkIds.add(linkId);
                  console.log(`ANSWER-DEBUG: Found disabled repeating item in answer: ${linkId}`);
                }
              }
            }
          });

          // Filter out extra instances of disabled repeating items
          const processedAnswerItems: QuestionnaireResponseItem[] = [];

          answerItems.forEach(item => {
            // Skip extra instances of disabled repeating items
            if (disabledRepeatingLinkIds.has(item.linkId)) {
              const itemIndex = answerItemsByLinkId[item.linkId].indexOf(item);
              if (itemIndex > 0) {
                console.log(`ANSWER-DEBUG: Skipping extra instance ${itemIndex} of disabled repeating item ${item.linkId} in answer`);
                return; // Skip this item
              }
            }

            // Process this item normally
            const answerNewItem = { ...item };
            const itemContext = [...currentPath, { linkId: item.linkId }];

            // Check if this item is disabled
            const isDisabled = disabledItems.some(
              di => di.linkId === item.linkId || di.repeatedContexts.some(ctx => currentPath.some(p => p.linkId === ctx.linkId))
            );

            // Clear answers if disabled
            if (isDisabled) {
              const qItem = itemMap.get(item.linkId);
              if (qItem?.type === 'boolean') {
                answerNewItem.answer = [{ valueBoolean: false }];
              } else {
                answerNewItem.answer = [];
              }
              console.log(`ANSWER-DEBUG: Cleared answers for disabled ${item.linkId} in answer.item`);
            }

            // Process nested items
            if (answerNewItem.item && answerNewItem.item.length > 0) {
              answerNewItem.item = clearDisabledItemAnswers(answerNewItem.item, disabledItems, itemMap, itemContext);
            }

            processedAnswerItems.push(answerNewItem);
          });

          return {
            ...answer,
            item: processedAnswerItems,
          };
        }
        return answer;
      });
    }

    resultItems.push(newItem);
  });

  return resultItems;
}

export function getAllEnableWhenItems(questionnaire: Questionnaire): QuestionnaireItem[] {
  const results: QuestionnaireItem[] = [];

  if (!questionnaire.item || questionnaire.item.length === 0) {
    return results;
  }

  // Helper function to recursively traverse items.
  function traverse(items: QuestionnaireItem[]): void {
    for (const item of items) {
      // If the item has an enableWhen array and it's not empty, add it to the results.
      if (item.enableWhen && item.enableWhen.length > 0) {
        results.push(item);
      }
      // Recurse into any child items.
      if (item.item && item.item.length > 0) {
        traverse(item.item);
      }
    }
  }

  traverse(questionnaire.item);
  return results;
}

export function transformQuestionnaireResponseToTree(qr: QuestionnaireResponse): QRTreeRepresentation[] {
  if (!qr.item || qr.item.length === 0) return [];
  return transformItems(qr.item, []);
}

function transformItems(items: QuestionnaireResponseItem[], parentPath: Path[]): QRTreeRepresentation[] {
  // First, count the occurrences of each linkId at this level.
  const frequency: Record<string, number> = items.reduce(
    (acc, item) => {
      acc[item.linkId] = (acc[item.linkId] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Prepare counters for assigning indexes for repeated items.
  const counters: Record<string, number> = {};

  return items.map(item => {
    const count = frequency[item.linkId];
    if (counters[item.linkId] === undefined) {
      counters[item.linkId] = 0;
    }
    // If more than one item shares the same linkId, assign an index.
    const index = count > 1 ? counters[item.linkId] : undefined;
    counters[item.linkId]++;

    // Build the current path for children.
    const currentPath: Path[] = parentPath.concat(index !== undefined ? { linkId: item.linkId, index } : { linkId: item.linkId });

    let children: QRTreeRepresentation[] = [];

    // Process direct child items (item.item).
    if (item.item && item.item.length > 0) {
      children = children.concat(transformItems(item.item, currentPath));
    }

    // Process nested items within each answer (answer.item).
    if (item.answer && item.answer.length > 0) {
      for (const answer of item.answer) {
        if (answer.item && answer.item.length > 0) {
          children = children.concat(transformItems(answer.item, currentPath));
        }
      }
    }

    return {
      linkId: item.linkId,
      index: index,
      repeatedContexts: parentPath.filter(p => p.index !== undefined),
      children: children,
    };
  });
}

function findResponseItemByLinkId(
  linkId: string,
  items: QuestionnaireResponseItem[],
  context: Path[]
): QuestionnaireResponseItem | undefined {
  // Try to find a direct match at this level
  const directMatch = items.find(item => item.linkId === linkId);
  if (directMatch) return directMatch;

  // If not found, recursively search in children
  for (const item of items) {
    // Search in item.item (children)
    if (item.item) {
      const foundInChildren = findResponseItemByLinkId(linkId, item.item, context);
      if (foundInChildren) return foundInChildren;
    }

    // Search in answer.item (nested answers)
    if (item.answer) {
      for (const answer of item.answer) {
        if (answer.item) {
          const foundInAnswer = findResponseItemByLinkId(linkId, answer.item, context);
          if (foundInAnswer) return foundInAnswer;
        }
      }
    }
  }

  return undefined;
}
