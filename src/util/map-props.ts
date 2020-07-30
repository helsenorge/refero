import { QuestionnaireResponseItem, QuestionnaireItemEnableWhen } from '../types/fhir';
import { GlobalState } from '../reducers/index';
import { getFormData } from '../reducers/form';
import { Props } from '../components/with-common-functions';

import {
  enableWhenMatchesAnswer,
  getQuestionnaireResponseItemWithLinkid,
  getResponseItems,
  Path,
  isInGroupContext,
} from './skjemautfyller-core';
import { ThunkDispatch } from 'redux-thunk';
import { NewValueAction } from '../actions/newValue';

export function mapStateToProps(state: GlobalState, originalProps: Props): Props {
  if (!originalProps.item || !originalProps.item.enableWhen) {
    return { ...originalProps, enable: true } as Props;
  }
  const enable = isEnableWhenEnabled(originalProps.item.enableWhen, originalProps.path || [], state);
  return { ...originalProps, enable } as Props;
}

function isEnableWhenEnabled(enableWhen: QuestionnaireItemEnableWhen[], path: Path[], state: GlobalState): boolean {
  let enable = false;
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

      enable = enable || enableWhenMatchesAnswer(enableWhen, responseItem.answer);
    }
  });
  return enable;
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
