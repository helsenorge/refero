import type { QuestionnaireItemEnableWhen, QuestionnaireResponseItem } from 'fhir/r4';

import { QuestionnaireItemEnableBehaviorCodes } from '@/types/fhirEnums';
import { enableWhenMatchesAnswer, getQuestionnaireResponseItemWithLinkid, isInGroupContext, type Path } from '@/util/refero-core';

// Kept free of React and the store, so code that builds a QuestionnaireResponse outside a component can use it.
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
