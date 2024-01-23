import { ThunkDispatch } from 'redux-thunk';

import {
  QuestionnaireResponseItem,
  QuestionnaireItemEnableWhen,
  QuestionnaireItemEnableBehaviorCodes,
  QuestionnaireResponseItemAnswer,
} from '../types/fhir';

import { enableWhenMatchesAnswer, getQuestionnaireResponseItemWithLinkid, getResponseItems, Path, isInGroupContext } from './refero-core';
import { NewValueAction } from '../actions/newValue';
import { WithCommonFunctionsProps } from '../components/with-common-functions';
import ItemType from '../constants/itemType';
import { getFormData } from '../reducers/form';
import { GlobalState } from '../reducers/index';
import { getCopyExtension, getCalculatedExpressionExtension } from '../util/extension';
import { evaluateFhirpathExpressionToGetString } from '../util/fhirpathHelper';

export function mapStateToProps(state: GlobalState, originalProps: WithCommonFunctionsProps): WithCommonFunctionsProps {
  getValueIfDataReceiver(state, originalProps);
  if (!originalProps.item || !originalProps.item.enableWhen) {
    return { ...originalProps, enable: true } as WithCommonFunctionsProps;
  }
  const enable = isEnableWhenEnabled(originalProps.item.enableWhen, originalProps.item.enableBehavior, originalProps.path || [], state);
  return { ...originalProps, enable } as WithCommonFunctionsProps;
}

function isEnableWhenEnabled(
  enableWhen: QuestionnaireItemEnableWhen[],
  enableBehavior: string | undefined,
  path: Path[],
  state: GlobalState
): boolean {
  const enableMatches: Array<boolean> = [];
  enableWhen.forEach((enableWhen: QuestionnaireItemEnableWhen) => {
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
  return enableBehavior === QuestionnaireItemEnableBehaviorCodes.ALL
    ? enableMatches.every(x => x === true)
    : enableMatches.some(x => x === true);
}

function getValueIfDataReceiver(state: GlobalState, originalProps: WithCommonFunctionsProps): void {
  if (originalProps.item) {
    const extension = getCopyExtension(originalProps.item);
    if (extension) {
      const formData = getFormData(state);
      let result = evaluateFhirpathExpressionToGetString(formData?.Content, extension);

      if (!!getCalculatedExpressionExtension(originalProps.item)) {
        result = result.map((m: any) => m.value as number);
      }

      originalProps.answer = getQuestionnaireResponseItemAnswer(originalProps.item.type, result);
    }
  }
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
  dispatchProps: WithCommonFunctionsProps,
  ownProps: WithCommonFunctionsProps
): WithCommonFunctionsProps {
  return Object.assign({}, ownProps, stateProps, dispatchProps);
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<GlobalState, void, NewValueAction>,
  props: WithCommonFunctionsProps
): WithCommonFunctionsProps {
  return {
    dispatch,
    path: props.path,
    renderContext: props.renderContext,
  };
}
