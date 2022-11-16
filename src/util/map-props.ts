import { ThunkDispatch } from 'redux-thunk';

import {
  QuestionnaireResponseItem,
  QuestionnaireItemEnableWhen,
  QuestionnaireItemEnableBehaviorCodes,
  QuestionnaireResponseItemAnswer,
} from '../types/fhir';

import { NewValueAction } from '../actions/newValue';
import { Props } from '../components/with-common-functions';
import { getFormData } from '../reducers/form';
import { GlobalState } from '../reducers/index';
import { enableWhenMatchesAnswer, getQuestionnaireResponseItemWithLinkid, getResponseItems, Path, isInGroupContext } from './refero-core';
import { getCopyExtension } from '../util/extension';
import { evaluateFhirpathExpressionToGetString } from '../util/fhirpathHelper';

export function mapStateToProps(state: GlobalState, originalProps: Props): Props {
  getValueIfDataReciever(state, originalProps);
  if (!originalProps.item || !originalProps.item.enableWhen) {
    return { ...originalProps, enable: true } as Props;
  }
  const enable = isEnableWhenEnabled(originalProps.item.enableWhen, originalProps.item.enableBehavior, originalProps.path || [], state);
  return { ...originalProps, enable } as Props;
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

function getValueIfDataReciever(state: GlobalState, originalProps: Props): void {
  if (originalProps.item) {
    const extension = getCopyExtension(originalProps.item);
    if (extension) {
      const formData = getFormData(state);
      const result = evaluateFhirpathExpressionToGetString(formData?.Content, extension);
      originalProps.answer = getQuestionnaireResponseItemAnswer(originalProps.item.type, result);
    }
  }
}

function getQuestionnaireResponseItemAnswer(type: string, result: any): QuestionnaireResponseItemAnswer {
  switch (type) {
    case 'text':
    case 'string':
      return { valueString: result };
    case 'integer':
      return { valueInteger: result };
    case 'decimal':
      return { valueDecimal: result };
    case 'dateTime':
      return { valueDateTime: result };
    case 'date':
      return { valueDate: result };
    case 'boolean':
      return { valueBoolean: result };
    case 'quantity':
      return { valueQuantity: result };
    default:
      return { valueCoding: result };
  }
}

export function mergeProps(stateProps: Props, dispatchProps: Props, ownProps: Props): Props {
  return Object.assign({}, ownProps, stateProps, dispatchProps);
}

export function mapDispatchToProps(dispatch: ThunkDispatch<GlobalState, void, NewValueAction>, props: Props): Props {
  return {
    dispatch,
    path: props.path,
    renderContext: props.renderContext,
  };
}
