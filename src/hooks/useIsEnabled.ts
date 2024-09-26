import { GlobalState } from '@/reducers';
import { FormData, getFormData } from '@/reducers/form';
import { QuestionnaireItemEnableBehaviorCodes } from '@/types/fhirEnums';
import {
  enableWhenMatchesAnswer,
  getQuestionnaireResponseItemWithLinkid,
  getResponseItems,
  isInGroupContext,
  Path,
} from '@/util/refero-core';
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
  const formData = useSelector<GlobalState, FormData | null>(state => getFormData(state));
  return !item || !item.enableWhen
    ? true
    : isEnableWhenEnabled(item.enableWhen, item.enableBehavior, path || [], getResponseItems(formData));
};

export const useCheckIfEnabled = (): ((item?: QuestionnaireItem, path?: Path[]) => boolean) => {
  const formData = useSelector<GlobalState, FormData | null>(state => getFormData(state));
  const checkIfEneabled = (item?: QuestionnaireItem, path?: Path[]): boolean =>
    !path || !item || !item.enableWhen ? true : isEnableWhenEnabled(item.enableWhen, item.enableBehavior, path, getResponseItems(formData));
  return checkIfEneabled;
};
