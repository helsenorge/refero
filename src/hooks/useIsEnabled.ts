import { GlobalState } from '@/reducers';
import { getResponseItemsSelector } from '@/reducers/selectors';
import { QuestionnaireItemEnableBehaviorCodes } from '@/types/fhirEnums';
import { enableWhenMatchesAnswer, getQuestionnaireResponseItemWithLinkid, isInGroupContext, Path } from '@/util/refero-core';
import { QuestionnaireItem, QuestionnaireItemEnableWhen, QuestionnaireResponseItem } from 'fhir/r4';
import { useSelector } from 'react-redux';

export function isEnableWhenEnabled(
  enableWhen: QuestionnaireItemEnableWhen[],
  enableBehavior: string | undefined,
  path: Path[],
  responseItems: QuestionnaireResponseItem[] | undefined
): boolean {
  const enableMatches: Array<boolean> = [];
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
  const responseItems = useSelector<GlobalState, QuestionnaireResponseItem[] | undefined>(getResponseItemsSelector);
  return !item || !item.enableWhen ? true : isEnableWhenEnabled(item.enableWhen, item.enableBehavior, path || [], responseItems);
};

export const useCheckIfEnabled = (): ((item?: QuestionnaireItem, path?: Path[]) => boolean) => {
  const responseItems = useSelector<GlobalState, QuestionnaireResponseItem[] | undefined>(getResponseItemsSelector);
  const checkIfEneabled = (item?: QuestionnaireItem, path?: Path[]): boolean =>
    !path || !item || !item.enableWhen ? true : isEnableWhenEnabled(item.enableWhen, item.enableBehavior, path, responseItems);
  return checkIfEneabled;
};
