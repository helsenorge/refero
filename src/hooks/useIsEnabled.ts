import { useCallback } from 'react';

import type { QuestionnaireItem, QuestionnaireItemEnableWhen, QuestionnaireResponseItem } from 'fhir/r4';

import { useAppSelector } from '@/reducers';
import { getResponseItemsSelector } from '@/reducers/selectors';
import { QuestionnaireItemEnableBehaviorCodes } from '@/types/fhirEnums';
import { isHiddenItem } from '@/util';
import {
  createPathForItem,
  enableWhenMatchesAnswer,
  getQuestionnaireResponseItemWithLinkid,
  isInGroupContext,
  type Path,
} from '@/util/refero-core';

export function isEnableWhenEnabled(
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

export const useIsEnabled = (item?: QuestionnaireItem, path?: Path[]): boolean => {
  const responseItems = useAppSelector(getResponseItemsSelector);
  return !item || !item.enableWhen ? true : isEnableWhenEnabled(item.enableWhen, item.enableBehavior, path || [], responseItems);
};

export const useCheckIfEnabled = (): ((item?: QuestionnaireItem, path?: Path[]) => boolean) => {
  const responseItems = useAppSelector(getResponseItemsSelector);
  const checkIfEneabled = useCallback(
    (item?: QuestionnaireItem, path?: Path[]): boolean =>
      !path || !item || !item.enableWhen ? true : isEnableWhenEnabled(item.enableWhen, item.enableBehavior, path, responseItems),
    [responseItems]
  );
  return checkIfEneabled;
};

// The one rule for whether the form shows an item, for the repetition at the given index of an item below parentPath:
// the item is not hidden, it is enabled at the first index (otherwise none of its repetitions are shown), and it is
// enabled at its own index. Use this instead of repeating the parts of the rule where an item is rendered or listed.
/**
 * @param item The item to check.
 * @param parentPath The path of the item's parent, without the item itself (unlike the path that useCheckIfEnabled takes).
 * @param index The index of the repetition of the item, 0 for the first.
 */
export const useCheckIfShown = (): ((item: QuestionnaireItem, parentPath?: Path[], index?: number) => boolean) => {
  const checkIfEnabled = useCheckIfEnabled();
  return useCallback(
    (item: QuestionnaireItem, parentPath?: Path[], index = 0): boolean =>
      !isHiddenItem(item) &&
      checkIfEnabled(item, createPathForItem(parentPath, item, 0)) &&
      (index === 0 || checkIfEnabled(item, createPathForItem(parentPath, item, index))),
    [checkIfEnabled]
  );
};
