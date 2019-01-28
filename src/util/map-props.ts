import { QuestionnaireResponseItem, QuestionnaireEnableWhen } from '../types/fhir';
import { GlobalState } from '../reducers/index';
import { getFormDefinition, getFormData } from '../reducers/form';
import { Props } from '../components/with-common-functions';

import { Dispatch } from 'redux';
import {
  enableWhenMatchesAnswer,
  getQuestionnaireResponseItemWithLinkid,
  wrappedByRepeatItem,
  getResponseItems,
  getQuestionnaireDefinitionItem,
  getDefinitionItems,
} from './skjemautfyller-core';

export function mapStateToProps(state: GlobalState, originalProps: Props) {
  if (!originalProps.item || !originalProps.item.enableWhen) {
    return { ...originalProps, enable: true } as Props;
  }
  let enable = false;
  originalProps.item.enableWhen.forEach((enableWhen: QuestionnaireEnableWhen) => {
    const definitionItems = getDefinitionItems(getFormDefinition(state));
    const enableWhenQuestionItem = getQuestionnaireDefinitionItem(enableWhen.question, definitionItems);
    const responseItems = getResponseItems(getFormData(state));
    let enableWhenQuestion = enableWhen.question;
    let parentPath = undefined;
    if (originalProps.path) {
      parentPath = originalProps.path.slice(0, -1);
    }

    if (wrappedByRepeatItem(parentPath) && originalProps.id && originalProps.id.includes('^')) {
      enableWhenQuestion += originalProps.id.substring(originalProps.id.indexOf('^'));
    }

    for (let i = 0; responseItems && i < responseItems.length; i++) {
      let responseItem: QuestionnaireResponseItem | undefined = responseItems[i];
      if (responseItem.linkId !== enableWhen.question) {
        responseItem = getQuestionnaireResponseItemWithLinkid(enableWhenQuestion, responseItems[i], true);
      }
      if (!responseItem) {
        continue;
      }
      let deactivated = enableWhenQuestionItem ? enableWhenQuestionItem.deactivated : false;
      enable = enable || (enableWhenMatchesAnswer(enableWhen, responseItem.answer) && !deactivated);
    }
  });
  return { ...originalProps, enable } as Props;
}

export function mergeProps(stateProps: Props, dispatchProps: Props, ownProps: Props) {
  return Object.assign({}, ownProps, stateProps, dispatchProps);
}

export function mapDispatchToProps(dispatch: Dispatch<{}>, props: Props): Props {
  return {
    dispatch,
    path: props.path,
  };
}
