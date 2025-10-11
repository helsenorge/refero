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
  isInGroupContext,
  isRepeat,
  Path,
  QuestionnaireItemEnableBehaviorCodes,
  resetAnswerValueAction,
  deleteRepeatItemAction,
  ClearAction,
  AppDispatch,
} from '..';

import { createQuestionnaireResponseAnswer } from '@/util/createQuestionnaireResponseAnswer';
import { calculateEnableWhen } from '@/workers/fhirpath-rpc';

type RunEnableWhenInput = {
  questionnaire: Questionnaire | null | undefined;
  questionnaireResponse: QuestionnaireResponse | null | undefined;
};
export type RunEnableWhenResult = ClearAction[];
// ---- Public API -----------------------------------------------------

export async function startEnableWhenCalculation({
  questionnaire,
  questionnaireResponse,
  dispatch,
}: RunEnableWhenInput & { dispatch: AppDispatch }): Promise<RunEnableWhenResult> {
  let actions: ClearAction[] = [];
  if (typeof window !== 'undefined' && window.Worker) {
    try {
      actions = await calculateEnableWhen({ questionnaireResponse, questionnaire });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_e) {
      actions = runEnableWhenNew({ questionnaire, questionnaireResponse });
    }
  } else {
    actions = runEnableWhenNew({ questionnaire, questionnaireResponse });
  }
  actions.forEach(action => dispatch(action));
  return actions;
}

export function runEnableWhenNew({ questionnaire, questionnaireResponse }: RunEnableWhenInput): ClearAction[] {
  if (!questionnaire || !questionnaireResponse) return [];
  if (!questionnaire.item || questionnaire.item.length === 0) return [];
  if (!questionnaireResponse.item || questionnaireResponse.item.length === 0) return [];
  let actions: ClearAction[] = [];

  actions = findItemsWithEnableWhen(questionnaire.item, questionnaireResponse.item, [], [], questionnaireResponse);

  return actions;
}

/* helpers */
const findItemsWithEnableWhen = (
  items: QuestionnaireItem[],
  responseItems: QuestionnaireResponseItem[],
  parentPath: Path[] = [],
  acc: ClearAction[] = [],
  questionnaireResponse: QuestionnaireResponse | null | undefined = undefined
): ClearAction[] => {
  for (const item of items) {
    const matches = getResponseItemsWithLinkId(item.linkId, responseItems);
    for (let i = 0; i < matches.length; i++) {
      const respMatch = matches[i];
      const itemPath = [...parentPath, { linkId: item.linkId, index: item.repeats ? i : 0 }];
      // if (item.linkId === '7.1.2') {
      //   console.group('collectClearAnswerActions for 7.1.2');
      //   console.log('item:', JSON.stringify(item, null, 2));
      //   console.log('matches:', JSON.stringify(matches, null, 2));

      //   console.log('respMatch:', JSON.stringify(respMatch, null, 2));
      //   console.log('parentPath:', JSON.stringify(parentPath, null, 2));
      //   console.log('i:', i);
      //   console.log('itemPath:', JSON.stringify(itemPath, null, 2));
      //   console.groupEnd();
      // }
      if (item.enableWhen && item.enableWhen.length > 0) {
        const enabled = isEnableWhenEnabled(item.enableWhen, item.enableBehavior, itemPath, questionnaireResponse?.item);

        if (!enabled) {
          const clears = collectClearAnswerActions([item], [respMatch], parentPath, 1, itemPath);
          acc.push(...clears);
        }
        continue;
      }
      const nextScope: QuestionnaireResponseItem[] = [...(respMatch.item ?? []), ...(respMatch.answer ?? []).flatMap(a => a.item ?? [])];
      if (item.item && item.item.length > 0) {
        findItemsWithEnableWhen(item.item, nextScope, itemPath, acc, questionnaireResponse);
      }
    }
  }
  return acc;
};

function collectClearAnswerActions(
  items: QuestionnaireItem[] | undefined,
  responseItems: QuestionnaireResponseItem[],
  parentPath: Path[],
  itteration: number = 1,
  path: Path[] = []
): ClearAction[] {
  const actions: ClearAction[] = [];
  if (!items || items.length === 0) return actions;

  for (const item of items) {
    const respMatches = getResponseItemsWithLinkId(item.linkId, responseItems);
    for (let i = 0; i < respMatches.length; i++) {
      const respItem = respMatches[i];
      let itemPath = [...parentPath, { linkId: item.linkId, index: item.repeats ? i : 0 }];
      if (itteration === 1) {
        itemPath = path;
      }
      // console.group('collectClearAnswerActions for 7.1.2');

      // console.log('itemPath:', JSON.stringify(itemPath, null, 2));
      // console.log('respItem:', JSON.stringify(respItem, null, 2));
      // console.groupEnd();

      const lastIndex = itemPath?.at(-1)?.index ?? 0;
      if (item.repeats && lastIndex > 0) {
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
            const nestedActs = collectClearAnswerActions(item.item, answer.item ?? [], itemPath, itteration + 1);
            actions.push(...nestedActs);
          }
        }
      }
      if (item.item && item.item.length > 0) {
        const childActs = collectClearAnswerActions(item.item, respItem.item ?? [], itemPath, itteration + 1);
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
    const a = answer.valueCoding,
      b = init.valueCoding;
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
  const newAnswer = nullAnswerValue(answer, initialAnswer);

  return newAnswer;
}

export function nullAnswerValue(
  answer: QuestionnaireResponseItemAnswer | undefined,
  initialAnswer?: QuestionnaireResponseItemAnswer
): QuestionnaireResponseItemAnswer | undefined {
  if (!answer) return undefined;

  const valueKeys = [
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
  ] as const;

  type ValueKey = (typeof valueKeys)[number];

  const key = valueKeys.find(k => answer[k] !== undefined) as ValueKey | undefined;
  if (!key) return undefined;

  const out: QuestionnaireResponseItemAnswer = { ...answer };

  switch (key) {
    case 'valueBoolean': {
      const init = initialAnswer?.valueBoolean;
      out.valueBoolean = init !== undefined ? init : false;
      break;
    }
    case 'valueDecimal': {
      const init = initialAnswer?.valueDecimal;
      if (init !== undefined) out.valueDecimal = init;
      else delete out.valueDecimal;
      break;
    }
    case 'valueInteger': {
      const init = initialAnswer?.valueInteger;
      if (init !== undefined) out.valueInteger = init;
      else delete out.valueInteger;
      break;
    }
    case 'valueDate': {
      const init = initialAnswer?.valueDate;
      if (init !== undefined) out.valueDate = init;
      else delete out.valueDate;
      break;
    }
    case 'valueDateTime': {
      const init = initialAnswer?.valueDateTime;
      if (init !== undefined) out.valueDateTime = init;
      else delete out.valueDateTime;
      break;
    }
    case 'valueTime': {
      const init = initialAnswer?.valueTime;
      if (init !== undefined) out.valueTime = init;
      else delete out.valueTime;
      break;
    }
    case 'valueString': {
      const init = initialAnswer?.valueString;
      if (init !== undefined) out.valueString = init;
      else delete out.valueString;
      break;
    }
    case 'valueCoding': {
      const init = initialAnswer?.valueCoding;
      if (init !== undefined) out.valueCoding = init;
      else delete out.valueCoding;
      break;
    }
    case 'valueQuantity': {
      const init = initialAnswer?.valueQuantity;
      if (init !== undefined) out.valueQuantity = init;
      else delete out.valueQuantity;
      break;
    }
    case 'valueAttachment': {
      const init = initialAnswer?.valueAttachment;
      if (init !== undefined) out.valueAttachment = init;
      else delete out.valueAttachment;
      break;
    }
  }

  return isEmptyObject(out) ? undefined : out;
}

function isEmptyObject(obj: object | undefined | null): boolean {
  if (typeof obj !== 'object' || obj === null || obj === undefined) {
    return false;
  }

  return Object.keys(obj).length === 0;
}
export function pruneEmptyAnswers(answers: QuestionnaireResponseItemAnswer[] | undefined): QuestionnaireResponseItemAnswer[] | undefined {
  if (!answers || answers.length === 0) return undefined;
  const answersFiltered = answers.filter(answer => !isEmptyObject(answer));
  return answersFiltered.length > 0 ? answersFiltered : undefined;
}
