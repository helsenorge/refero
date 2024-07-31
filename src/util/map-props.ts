import { QuestionnaireResponseItem, QuestionnaireItemEnableWhen, QuestionnaireResponseItemAnswer, QuestionnaireItem } from 'fhir/r4';
import { ThunkDispatch } from 'redux-thunk';

import { QuestionnaireItemEnableBehaviorCodes } from '../types/fhirEnums';

import { enableWhenMatchesAnswer, getQuestionnaireResponseItemWithLinkid, getResponseItems, Path, isInGroupContext } from './refero-core';
import { NewValueAction } from '../actions/newValue';
import { WithCommonFunctionsProps } from '../components/with-common-functions';
import ItemType from '../constants/itemType';
import { FormData, getFormData } from '../reducers/form';
import { GlobalState } from '../reducers/index';
import { getCopyExtension, getCalculatedExpressionExtension } from '../util/extension';
import { evaluateFhirpathExpressionToGetString } from '../util/fhirpathHelper';

export function mapStateToProps(state: GlobalState, originalProps: WithCommonFunctionsProps): WithCommonFunctionsProps {
  const formData = getFormData(state);
  const newAnswer = getValueIfDataReceiver(formData, originalProps.item);
  const enable =
    !originalProps.item || !originalProps.item.enableWhen
      ? true
      : isEnableWhenEnabled(originalProps.item.enableWhen, originalProps.item.enableBehavior, originalProps.path || [], formData);

  return { ...originalProps, enable, ...(newAnswer !== undefined && { answer: newAnswer }) };
}

export function isEnableWhenEnabled(
  enableWhen: QuestionnaireItemEnableWhen[],
  enableBehavior: string | undefined,
  path: Path[],
  formData: FormData | null
): boolean {
  const enableMatches: Array<boolean> = [];
  enableWhen.forEach((enableWhen: QuestionnaireItemEnableWhen) => {
    const responseItems = getResponseItems(formData);
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

export function getValueIfDataReceiver(
  formData: FormData | null,
  item?: QuestionnaireItem
): QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[] | undefined {
  if (item) {
    const extension = getCopyExtension(item);
    if (extension) {
      let result = evaluateFhirpathExpressionToGetString(extension, formData?.Content);

      if (getCalculatedExpressionExtension(item)) {
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

export function mergeProps(
  stateProps: WithCommonFunctionsProps,
  dispatchProps: {
    dispatch: ThunkDispatch<GlobalState, void, NewValueAction>;
  },
  ownProps: WithCommonFunctionsProps
): WithCommonFunctionsProps {
  return Object.assign({}, ownProps, stateProps, dispatchProps);
}

export function mapDispatchToProps(dispatch: ThunkDispatch<GlobalState, void, NewValueAction>): {
  dispatch: ThunkDispatch<GlobalState, void, NewValueAction>;
} {
  return {
    dispatch,
  };
}
