import {
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireItemEnableWhen,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
} from 'fhir/r4';

import {
  copyPath,
  enableWhenMatchesAnswer,
  getQuestionnaireResponseItemWithLinkid,
  IActionRequester,
  isInGroupContext,
  isRepeat,
  Path,
  QuestionnaireItemEnableBehaviorCodes,
  resetAnswerValueAction,
  deleteRepeatItemAction,
  ClearAction,
} from '..';

import { createQuestionnaireResponseAnswer } from '@/util/createQuestionnaireResponseAnswer';

type Input = {
  questionnaire: Questionnaire | null | undefined;
  questionnaireResponse: QuestionnaireResponse | null | undefined;
  requester?: IActionRequester;
};

// ---- Public API -----------------------------------------------------
export function runEnableWhenNew({ questionnaire, questionnaireResponse }: Input): ClearAction[] {
  if (!questionnaire || !questionnaireResponse) return [];
  if (!questionnaire.item || questionnaire.item.length === 0) return [];
  if (!questionnaireResponse.item || questionnaireResponse.item.length === 0) return [];
  let actions: ClearAction[] = [];
  //Find all items with enableWhen recursively
  actions = findItemsWithEnableWhen(questionnaire.item, questionnaireResponse.item);
  // requester.console.log('runEnableWhenNew actions', actions);
  return actions;
}

/* helpers */
const findItemsWithEnableWhen = (
  items: QuestionnaireItem[],
  responseItems: QuestionnaireResponseItem[],
  parentPath: Path[] = [],
  acc: ClearAction[] = []
): ClearAction[] => {
  for (const item of items) {
    const matches = getResponseItemsWithLinkId(item.linkId, responseItems);
    for (let i = 0; i < matches.length; i++) {
      const path = [...parentPath, { linkId: item.linkId, index: item.repeats ? i : 0 }];
      if (item.enableWhen && item.enableWhen.length > 0) {
        const enabled = isEnableWhenEnabled(item.enableWhen, item.enableBehavior, path, responseItems);

        if (!enabled) {
          acc.push(...collectClearAnswerActions(items, matches, parentPath));
        }
        continue;
      }

      if (item.item && item.item.length > 0) {
        findItemsWithEnableWhen(item.item, responseItems, path, acc);
      }
    }
  }
  return acc;
};

function collectClearAnswerActions(
  items: QuestionnaireItem[] | undefined,
  responseItems: QuestionnaireResponseItem[],
  parentPath: Path[]
): ClearAction[] {
  const actions: ClearAction[] = [];
  if (!items || items.length === 0) return actions;

  for (const item of items) {
    const respMatches = getResponseItemsWithLinkId(item.linkId, responseItems);
    for (let i = 0; i < respMatches.length; i++) {
      const respItem = respMatches[i];
      const itemPath = [...parentPath, { linkId: item.linkId, index: item.repeats ? i : 0 }];
      if (item.repeats && i > 0) {
        actions.push(
          deleteRepeatItemAction({
            item,
            itemPath,
          })
        );
        continue;
      }
      if (respItem.answer && respItem.answer.length > 0) {
        for (let ai = 0; ai < respItem.answer.length; ai++) {
          const answer = respItem.answer[ai];
          if (hasValueX(answer)) {
            const isInitial = isInitialAnswer(answer, item);
            if (!isInitial) {
              actions.push(
                resetAnswerValueAction({
                  itemPath: itemPath,
                  rItem: respItem,
                  qItem: item,
                  index: ai,
                })
              );
            }
          }
          if (answer.item && answer.item.length > 0) {
            const nestedActs = collectClearAnswerActions(item.item, answer.item ?? [], itemPath);
            actions.push(...nestedActs);
          }
        }
      }
      if (item.item && item.item.length > 0) {
        const childActs = collectClearAnswerActions(item.item, respItem.item ?? [], itemPath);
        actions.push(...childActs);
      }
    }
  }

  return actions;
}
function isInitialAnswer(answer: QuestionnaireResponseItemAnswer, item: QuestionnaireItem): boolean {
  if (!item.initial || item.initial.length === 0) {
    return false;
  }
  const init = item.initial[0];

  if (answer.valueBoolean !== undefined && init.valueBoolean !== undefined) {
    return answer.valueBoolean === init.valueBoolean;
  }
  if (answer.valueDecimal !== undefined && init.valueDecimal !== undefined) {
    return answer.valueDecimal === init.valueDecimal;
  }
  if (answer.valueInteger !== undefined && init.valueInteger !== undefined) {
    return answer.valueInteger === init.valueInteger;
  }
  if (answer.valueDate !== undefined && init.valueDate !== undefined) {
    return answer.valueDate === init.valueDate;
  }
  if (answer.valueDateTime !== undefined && init.valueDateTime !== undefined) {
    return answer.valueDateTime === init.valueDateTime;
  }
  if (answer.valueTime !== undefined && init.valueTime !== undefined) {
    return answer.valueTime === init.valueTime;
  }
  if (answer.valueString !== undefined && init.valueString !== undefined) {
    return answer.valueString === init.valueString;
  }
  if (answer.valueCoding !== undefined && init.valueCoding !== undefined) {
    const a = answer.valueCoding!;
    const b = init.valueCoding!;
    return (a.system ?? '') === (b.system ?? '') && (a.code ?? '') === (b.code ?? '') && (a.display ?? '') === (b.display ?? '');
  }
  if (answer.valueQuantity !== undefined && init.valueQuantity !== undefined) {
    const a = answer.valueQuantity!;
    const b = init.valueQuantity!;
    return a.value === b.value && a.unit === b.unit && a.system === b.system && a.code === b.code;
  }
  if (answer.valueAttachment !== undefined && init.valueAttachment !== undefined) {
    const a = answer.valueAttachment!;
    const b = init.valueAttachment!;
    return a.url === b.url;
  }

  return false;
}
function hasValueX(answer: QuestionnaireResponseItemAnswer): boolean {
  if ('valueBoolean' in answer) {
    if (answer.valueBoolean !== undefined && answer.valueBoolean !== false) return true;
  }
  const otherKeys: (keyof QuestionnaireResponseItemAnswer)[] = [
    'valueDecimal',
    'valueInteger',
    'valueDate',
    'valueDateTime',
    'valueTime',
    'valueString',
    'valueCoding',
    'valueQuantity',
    'valueAttachment',
  ];
  return otherKeys.some(k => answer[k] !== undefined);
}
const getResponseItemsWithLinkId = (linkId: string, items: QuestionnaireResponseItem[]): QuestionnaireResponseItem[] => {
  let result: QuestionnaireResponseItem[] = [];
  for (const item of items) {
    if (item.linkId === linkId) {
      result.push(item);
    }
    if (item.item && item.item.length > 0) {
      result = result.concat(getResponseItemsWithLinkId(linkId, item.item));
    }
    if (item.answer && item.answer.length > 0) {
      for (const answer of item.answer) {
        if (answer.item && answer.item.length > 0) {
          result = result.concat(getResponseItemsWithLinkId(linkId, answer.item));
        }
      }
    }
  }
  return result;
};

function isEnableWhenEnabled(
  enableWhen: QuestionnaireItemEnableWhen[],
  enableBehavior: string | undefined,
  path: Path[],
  responseItems: QuestionnaireResponseItem[] | undefined
): boolean {
  const enableMatches: boolean[] = [];
  enableWhen.forEach((enableWhen: QuestionnaireItemEnableWhen) => {
    const enableWhenQuestion = enableWhen.question;
    for (let i = 0; responseItems && i < responseItems.length; i++) {
      let responseItem: QuestionnaireResponseItem | undefined = responseItems[i];
      if (!isInGroupContext(path, responseItem, responseItems)) {
        continue;
      }
      if (responseItem.linkId !== enableWhen.question) {
        responseItem = getQuestionnaireResponseItemWithLinkid(enableWhenQuestion, responseItems[i], path);
      }
      if (!responseItem) {
        continue;
      }

      const matchesAnswer = enableWhenMatchesAnswer(enableWhen, responseItem.answer);
      enableMatches.push(matchesAnswer);
    }
  });
  return enableBehavior === QuestionnaireItemEnableBehaviorCodes.ALL
    ? enableMatches.every(x => x === true)
    : enableMatches.some(x => x === true);
}
export function createPathForItem(path?: Path[] | undefined, item?: QuestionnaireItem, index?: number | undefined): Path[] {
  let newPath: Path[];
  if (path === null || path === undefined) {
    newPath = [];
  } else {
    newPath = copyPath(path);
  }

  index = isRepeat(item) ? index : 0;
  if (item) {
    newPath.push({
      linkId: item.linkId,
      ...(isRepeat(item) && { index }),
    });
  }

  return newPath;
}
export function resetAnswerValuePure({
  answer,
  item,
}: {
  answer?: QuestionnaireResponseItemAnswer;
  item?: QuestionnaireItem;
}): QuestionnaireResponseItemAnswer | undefined {
  if (!answer || !item) return undefined;
  const initialAnswer = createQuestionnaireResponseAnswer(item);
  return nullAnswerValue(answer, initialAnswer);
}

export function nullAnswerValue(
  answer: QuestionnaireResponseItemAnswer | undefined,
  initialAnswer?: QuestionnaireResponseItemAnswer
): QuestionnaireResponseItemAnswer | undefined {
  if (!answer) return undefined;

  const valueKeys: (keyof QuestionnaireResponseItemAnswer)[] = [
    'valueBoolean',
    'valueDecimal',
    'valueInteger',
    'valueDate',
    'valueDateTime',
    'valueTime',
    'valueString',
    'valueCoding',
    'valueQuantity',
    'valueAttachment',
  ];

  const key = valueKeys.find(k => answer[k] !== undefined);
  if (!key) {
    return undefined;
  }

  // Clone once
  const out: QuestionnaireResponseItemAnswer = { ...answer };

  if (initialAnswer && initialAnswer[key] !== undefined) {
    // If initialAnswer has that field, use it
    out[key] = initialAnswer[key];
  } else {
    // No initial — for boolean default to false, else delete
    if (key === 'valueBoolean') {
      out[key] = false;
    } else {
      delete out[key];
    }
  }

  return out;
}
