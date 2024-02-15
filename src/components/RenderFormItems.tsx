import React from 'react';

import { QuestionnaireItem, QuestionnaireResponseItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { ReferoProps } from '../types/referoProps';

import { RepeatButton } from './formcomponents/repeat/repeat-button';
import { NewValueAction } from '../actions/newValue';
import constants, { NAVIGATOR_BLINDZONE_ID } from '../constants';
import ItemType from '../constants/itemType';
import { GlobalState } from '../reducers';
import { FormData, FormDefinition, getFormData, getFormDefinition } from '../reducers/form';
import { getComponentForItem, isHiddenItem, shouldRenderRepeatButton } from '../util';
import { ActionRequester } from '../util/actionRequester';
import { getCodingTextTableValues, getNavigatorExtension } from '../util/extension';
import { getTopLevelElements } from '../util/getTopLevelElements';
import { QuestionniareInspector } from '../util/questionnaireInspector';
import {
  Path,
  createIdSuffix,
  createPathForItem,
  getAnswerFromResponseItem,
  getRootQuestionnaireResponseItemFromData,
  shouldRenderDeleteButton,
} from '../util/refero-core';
import { RenderContext } from '../util/renderContext';
import { shouldFormBeDisplayedAsStepView } from '../util/shouldFormBeDisplayedAsStepView';

type Props = {
  runScoringCalculator: (newState: GlobalState) => void;
};

type StateProps = {
  formDefinition?: FormDefinition | null;
  formData?: FormData | null;
};

type DispatchProps = {
  dispatch: ThunkDispatch<GlobalState, void, NewValueAction>;
  path: Path[];
};

export const RenderFormItems = ({
  pdf,
  formDefinition,
  resources,
  formData,
  promptLoginMessage,
  path,
  onChange,
  dispatch,
  runScoringCalculator,
  onRequestAttachmentLink,
  onOpenAttachment,
  onDeleteAttachment,
  onRequestHelpButton,
  uploadAttachment,
  onRequestHelpElement,
  attachmentErrorMessage,
  attachmentMaxFileSize,
  attachmentValidTypes,
  validateScriptInjection,
  onRenderMarkdown,
  fetchValueSet,
  autoSuggestProps,
  fetchReceivers,
}: Props & ReferoProps & StateProps & DispatchProps): JSX.Element | null => {
  if (!formDefinition || !formDefinition.Content || !formDefinition.Content.item) {
    return null;
  }
  const onAnswerChange = (
    newState: GlobalState,
    _path: Array<Path>,
    item: QuestionnaireItem,
    answer: QuestionnaireResponseItemAnswer
  ): void => {
    if (onChange && newState.refero.form.FormDefinition.Content && newState.refero.form.FormData.Content) {
      const actionRequester = new ActionRequester(newState.refero.form.FormDefinition.Content, newState.refero.form.FormData.Content);

      const questionnaireInspector = new QuestionniareInspector(
        newState.refero.form.FormDefinition.Content,
        newState.refero.form.FormData.Content
      );

      onChange(item, answer, actionRequester, questionnaireInspector);

      for (const action of actionRequester.getActions()) {
        dispatch(action);
      }
    }

    runScoringCalculator(newState);
  };
  const contained = formDefinition.Content.contained;
  const renderedItems: Array<JSX.Element> | undefined = [];
  const isNavigatorEnabled = !!getNavigatorExtension(formDefinition.Content);
  let isNavigatorBlindzoneInitiated = false;

  const questionnaireItemArray: QuestionnaireItem[] | undefined = shouldFormBeDisplayedAsStepView(formDefinition)
    ? getTopLevelElements(formDefinition)
    : formDefinition.Content.item;

  questionnaireItemArray?.map(item => {
    if (isHiddenItem(item)) return [];
    const Comp = getComponentForItem(item.type, getCodingTextTableValues(item));
    if (!Comp) {
      return undefined;
    }
    let responseItems: Array<QuestionnaireResponseItem> | undefined;
    if (formData) {
      responseItems = getRootQuestionnaireResponseItemFromData(item.linkId, formData);
    }

    if (responseItems && responseItems.length > 0) {
      responseItems.forEach((responseItem, index) => {
        const repeatButton =
          item.repeats && shouldRenderRepeatButton(item, responseItems, index) ? (
            <div className="page_refero__repeatbutton-wrapper">
              <RepeatButton
                key={`item_${item.linkId}_add_repeat_item`}
                resources={resources}
                item={item}
                responseItems={responseItems}
                parentPath={path}
                renderContext={new RenderContext()}
                disabled={item.type !== ItemType.GROUP && !responseItem.answer}
              />
            </div>
          ) : undefined;
        const pathForItem = createPathForItem(path, item, responseItem, index);
        // legg på blindzone rett over den første seksjonen
        if (isNavigatorEnabled && item.type === ItemType.GROUP && !isNavigatorBlindzoneInitiated) {
          isNavigatorBlindzoneInitiated = true;
          renderedItems.push(<section id={NAVIGATOR_BLINDZONE_ID}></section>);
        }
        renderedItems.push(
          <Comp
            language={formDefinition.Content?.language}
            pdf={pdf}
            includeSkipLink={isNavigatorEnabled && item.type === ItemType.GROUP}
            promptLoginMessage={promptLoginMessage}
            key={`item_${responseItem.linkId}_${index}`}
            id={'item_' + responseItem.linkId + createIdSuffix(pathForItem, index, item.repeats)}
            item={item}
            questionnaire={formDefinition.Content}
            responseItem={responseItem}
            answer={getAnswerFromResponseItem(responseItem)}
            resources={resources}
            containedResources={contained}
            path={path}
            headerTag={constants.DEFAULT_HEADER_TAG}
            visibleDeleteButton={shouldRenderDeleteButton(item, index)}
            repeatButton={repeatButton}
            onRequestAttachmentLink={onRequestAttachmentLink}
            onOpenAttachment={onOpenAttachment}
            onDeleteAttachment={onDeleteAttachment}
            uploadAttachment={uploadAttachment}
            onRequestHelpButton={onRequestHelpButton}
            onRequestHelpElement={onRequestHelpElement}
            attachmentErrorMessage={attachmentErrorMessage}
            attachmentMaxFileSize={attachmentMaxFileSize}
            attachmentValidTypes={attachmentValidTypes}
            validateScriptInjection={validateScriptInjection}
            onAnswerChange={onAnswerChange}
            renderContext={new RenderContext()}
            onRenderMarkdown={onRenderMarkdown}
            fetchValueSet={fetchValueSet}
            autoSuggestProps={autoSuggestProps}
            fetchReceivers={fetchReceivers}
          />
        );
      });
    }
  });
  return <>{renderedItems}</>;
};
function mapStateToProps(state: GlobalState): StateProps {
  return {
    formDefinition: getFormDefinition(state),
    formData: getFormData(state),
  };
}

function mapDispatchToProps(dispatch: ThunkDispatch<GlobalState, void, NewValueAction>): DispatchProps {
  return {
    dispatch,
    path: [],
  };
}

const RenderFormItemsConnected = connect<StateProps, DispatchProps, ReferoProps>(mapStateToProps, mapDispatchToProps)(RenderFormItems);
export default RenderFormItemsConnected;
