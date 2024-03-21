import { QuestionnaireItem, QuestionnaireItemEnableWhen, QuestionnaireResponseItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';

import { QuestionnaireItemEnableBehaviorCodes } from '../../types/fhirEnums';

import ItemType from '../../constants/itemType';
import { getCalculatedExpressionExtension, getCopyExtension } from '../../util/extension';
import { evaluateFhirpathExpressionToGetString } from '../../util/fhirpathHelper';
import {
  Path,
  enableWhenMatchesAnswer,
  getQuestionnaireResponseItemWithLinkid,
  getResponseItems,
  isInGroupContext,
} from '../../util/refero-core';
import { GlobalState } from '../reducers';
import { FormData, FormDefinition } from '../reducers/form';

export function getFormDefinition(state: GlobalState): FormDefinition | null {
  if (!state.refero.form.FormDefinition) {
    return null;
  }
  return state.refero.form.FormDefinition;
}
export function getFormData(state: GlobalState): FormData | null {
  if (!state.refero.form.FormData) {
    return null;
  }
  return state.refero.form.FormData;
}
export function isEnableWhenEnabledForItem(state: GlobalState, item: QuestionnaireItem, path: Path[] = []): boolean {
  const enableMatches: Array<boolean> = [];
  item?.enableWhen?.forEach((enableWhen: QuestionnaireItemEnableWhen) => {
    const responseItems = getResponseItems(getFormData(state));
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
  return item.enableBehavior === QuestionnaireItemEnableBehaviorCodes.ALL
    ? enableMatches.every(x => x === true)
    : enableMatches.some(x => x === true);
}

export function getValueIfDataReceiver(
  state: GlobalState,
  item?: QuestionnaireItem
): QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[] | undefined {
  if (item) {
    const extension = getCopyExtension(item);
    if (extension) {
      const formData = getFormData(state);
      let result = evaluateFhirpathExpressionToGetString(extension, formData?.Content);
      if (!!getCalculatedExpressionExtension(item)) {
        result = result.map((m: any) => m.value as number);
      }

      return getQuestionnaireResponseItemAnswer(item.type, result);
    }
    return undefined;
  }
  return undefined;
}

function getQuestionnaireResponseItemAnswer(
  type: string,
  result: any
): QuestionnaireResponseItemAnswer | Array<QuestionnaireResponseItemAnswer> {
  const answerArray: Array<QuestionnaireResponseItemAnswer> = [];
  if (type === ItemType.BOOLEAN) {
    return { valueBoolean: result[0] };
  }

  result.forEach((answer: any) => {
    switch (String(type)) {
      case ItemType.TEXT:
      case ItemType.STRING:
        answerArray.push({ valueString: answer });
        break;
      case ItemType.INTEGER:
        answerArray.push({ valueInteger: answer });
        break;
      case ItemType.DECIMAL:
        answerArray.push({ valueDecimal: answer });
        break;
      case ItemType.QUANTITY:
        answerArray.push({ valueQuantity: answer });
        break;
      case ItemType.DATETIME:
        answerArray.push({ valueDateTime: answer });
        break;
      case ItemType.DATE:
        answerArray.push({ valueDate: answer });
        break;
      case ItemType.TIME:
        answerArray.push({ valueTime: answer });
        break;
      default: {
        if (typeof answer === 'string') {
          answerArray.push({ valueString: answer });
        } else {
          answerArray.push({ valueCoding: answer });
        }
      }
    }
  });
  return answerArray;
}
