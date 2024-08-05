import React from 'react';

import {
  Resource,
  Questionnaire,
  QuestionnaireResponseItem,
  QuestionnaireItem,
  QuestionnaireResponseItemAnswer,
  Attachment,
  ValueSet,
} from 'fhir/r4';

import { ThunkDispatch } from 'redux-thunk';

import { AutoSuggestProps } from '../types/autoSuggestProps';
import { OrgenhetHierarki } from '../types/orgenhetHierarki';

import { NewValueAction } from '../actions/newValue';

import itemType from '../constants/itemType';
import { GlobalState } from '../reducers';
import { getCodingTextTableValues } from '../util/extension';
import { isHelpItem } from '../util/help';
import { getComponentForItem, getChildHeaderTag, isHiddenItem } from '../util/index';
import { Path, getItemWithIdFromResponseItemArray, createPathForItem, createIdSuffix } from '../util/refero-core';
import { RenderContext } from '../util/renderContext';
import { Resources } from '../util/resources';

export interface WithCommonFunctionsProps {
  idWithLinkIdAndItemIndex: string;
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  resources?: Resources;
  responseItem: QuestionnaireResponseItem;
  containedResources?: Resource[];
  item: QuestionnaireItem;
  questionnaire?: Questionnaire | null;
  headerTag?: number;
  pdf?: boolean;
  language?: string;
  includeSkipLink?: boolean;
  promptLoginMessage?: () => void;
  path?: Array<Path>;
  id?: string;
  validateScriptInjection?: boolean;
  index?: number;
  attachmentErrorMessage?: string;
  attachmentMaxFileSize?: number;
  attachmentValidTypes?: Array<string>;
  onRequestAttachmentLink?: (file: string) => string;
  onOpenAttachment?: (fileId: string) => void;
  onDeleteAttachment?: (fileId: string, onSuccess: () => void) => void;
  uploadAttachment?: (files: File[], onSuccess: (attachment: Attachment) => void) => void;
  onAnswerChange?: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  renderContext: RenderContext;
  fetchValueSet?: (
    searchString: string,
    item: QuestionnaireItem,
    successCallback: (valueSet: ValueSet) => void,
    errorCallback: (error: string) => void
  ) => void;
  autoSuggestProps?: AutoSuggestProps;
  fetchReceivers?: (successCallback: (receivers: Array<OrgenhetHierarki>) => void, errorCallback: () => void) => void;
}

export interface EnhancedProps {
  renderChildrenItems?: (renderContext: RenderContext) => JSX.Element[] | null;
  renderDeleteButton?: (classname?: string) => JSX.Element | null;
}

export interface WithCommonFunctionsAndEnhancedProps extends WithCommonFunctionsProps, EnhancedProps {
  responseItems?: QuestionnaireResponseItem[];
}

export default function withCommonFunctions<T extends WithCommonFunctionsProps>(
  WrappedComponent: React.ComponentType<T>
): React.ComponentType<T & EnhancedProps> {
  const WithCommonFunctions = (props: T): JSX.Element | null => {
    const renderItem = (item: QuestionnaireItem, renderContext: RenderContext): JSX.Element[] => {
      const { resources, containedResources, responseItem, pdf, path, headerTag, promptLoginMessage } = props;
      if (isHelpItem(item)) return [];
      if (isHiddenItem(item)) return [];

      const Comp = getComponentForItem(item.type, getCodingTextTableValues(item));

      if (!Comp) {
        return [];
      }

      let response: Array<QuestionnaireResponseItem> | undefined;
      const linkId = item.linkId;

      if (responseItem) {
        const childItem = responseItem.item;
        const childAnswer = responseItem.answer;

        if (childItem) {
          response = getItemWithIdFromResponseItemArray(linkId, childItem);
        } else if (childAnswer) {
          response = getItemWithIdFromResponseItemArray(linkId, childAnswer[0].item);
        }
      }
      const renderedItems: Array<JSX.Element> = [];
      if (response && response.length > 0) {
        response.forEach((responseItem, index) => {
          const idWithLinkIdAndItemIndex = `${item.linkId}${createIdSuffix(path, index, item.repeats)}`;

          renderedItems.push(
            <Comp
              idWithLinkIdAndItemIndex={idWithLinkIdAndItemIndex}
              key={'item_' + responseItem.linkId + createIdSuffix(path, index, item.repeats)}
              pdf={pdf}
              language={props.language}
              includeSkipLink={props.includeSkipLink}
              promptLoginMessage={promptLoginMessage}
              id={'item_' + responseItem.linkId + createIdSuffix(path, index, item.repeats)}
              item={item}
              questionnaire={props.questionnaire}
              responseItem={responseItem}
              resources={resources}
              containedResources={containedResources}
              path={createPathForItem(path, item, responseItem, index)}
              headerTag={getChildHeaderTag(props.item, headerTag)}
              validateScriptInjection={props.validateScriptInjection}
              index={index}
              responseItems={response}
              onRequestAttachmentLink={props.onRequestAttachmentLink}
              onOpenAttachment={props.onOpenAttachment}
              onDeleteAttachment={props.onDeleteAttachment}
              uploadAttachment={props.uploadAttachment}
              attachmentErrorMessage={props.attachmentErrorMessage}
              attachmentMaxFileSize={props.attachmentMaxFileSize}
              attachmentValidTypes={props.attachmentValidTypes}
              onAnswerChange={props.onAnswerChange}
              renderContext={renderContext}
              fetchValueSet={props.fetchValueSet}
              autoSuggestProps={props.autoSuggestProps}
              fetchReceivers={props.fetchReceivers}
            />
          );
        });
      }
      return renderedItems;
    };

    const renderChildrenItems = (renderContext: RenderContext): JSX.Element[] | null => {
      const { item } = props;
      if (!item || !item.item) {
        return null;
      }

      if (item.type === itemType.GROUP && renderContext.RenderChildren) {
        return renderContext.RenderChildren(item.item, renderItem);
      }

      const renderedItems: JSX.Element[] = [];
      item.item.forEach(i => renderedItems.push(...renderItem(i, renderContext)));

      return renderedItems;
    };

    return (
      <WrappedComponent renderChildrenItems={renderChildrenItems} {...props}>
        {renderChildrenItems(props.renderContext)}
      </WrappedComponent>
    );
  };
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'WithCommonFunctions';

  WithCommonFunctions.displayName = `WithCommonFunctions(${displayName})`;
  return WithCommonFunctions;
}
