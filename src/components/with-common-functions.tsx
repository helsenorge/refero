import * as React from 'react';

import {
  QuestionnaireResponseItem,
  QuestionnaireItem,
  QuestionnaireResponseItemAnswer,
  Attachment,
  ValueSet,
} from 'fhir/r4';

import { AutoSuggestProps } from '../types/autoSuggestProps';
import { OrgenhetHierarki } from '../types/orgenhetHierarki';
import { Resources } from '../types/resources';
import { TextMessage } from '../types/text-message';

import Icon from '@helsenorge/designsystem-react/components/Icon';
import HelpSign from '@helsenorge/designsystem-react/components/Icons/HelpSign';

import { UploadedFile } from '@helsenorge/file-upload/components/dropzone';

import DeleteButton from './formcomponents/repeat/delete-button';
import RepeatButton from './formcomponents/repeat/repeat-button';
import HelpButton from './help-button/help-button';
import { HelpElement } from './HelpElement';
import itemControlConstants from '../constants/itemcontrol';
import itemType from '../constants/itemType';
import { GlobalState } from '../store/reducers';
import { getCodingTextTableValues } from '../util/extension';
import { findHelpItem, isHelpItem, getHelpItemType } from '../util/help';
import { getComponentForItem, getChildHeaderTag, shouldRenderRepeatButton, getText, isHiddenItem } from '../util/index';
import {
  Path,
  getAnswerFromResponseItem,
  getItemWithIdFromResponseItemArray,
  createPathForItem,
  shouldRenderDeleteButton,
  createIdSuffix,
} from '../util/refero-core';
import { RenderContext } from '../util/renderContext';
import { isJsxElement } from '../util/typeguards';

export interface WithFormComponentsProps {
  resources?: Resources;
  responseItem?: QuestionnaireResponseItem;
  item?: QuestionnaireItem;
  headerTag?: number;
  pdf?: boolean;
  includeSkipLink?: boolean;
  promptLoginMessage?: () => void;
  path?: Array<Path>;
  enable?: boolean;
  id?: string;
  answer?: QuestionnaireResponseItemAnswer | Array<QuestionnaireResponseItemAnswer>;
  validateScriptInjection?: boolean;
  visibleDeleteButton?: boolean;
  repeatButton?: JSX.Element;
  attachmentErrorMessage?: string;
  attachmentMaxFileSize?: number;
  attachmentValidTypes?: Array<string>;
  onRequestAttachmentLink?: (file: string) => string;
  onOpenAttachment?: (fileId: string) => void;
  onDeleteAttachment?: (fileId: string, onSuccess: () => void, onError: (errormessage: TextMessage | null) => void) => void;
  uploadAttachment?: (
    files: File[],
    onSuccess: (uploadedFile: UploadedFile, attachment: Attachment) => void,
    onError: (errormessage: TextMessage | null) => void
  ) => void;
  onRequestHelpButton?: (
    item: QuestionnaireItem,
    itemHelp: QuestionnaireItem,
    helpType: string,
    helpText: string,
    opening: boolean
  ) => JSX.Element;
  onRequestHelpElement?: (
    item: QuestionnaireItem,
    itemHelp: QuestionnaireItem,
    helpType: string,
    helpText: string,
    opening: boolean
  ) => JSX.Element;
  onAnswerChange?: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  renderContext: RenderContext;
  onRenderMarkdown?: (item: QuestionnaireItem, markup: string) => string;
  fetchValueSet?: (
    searchString: string,
    item: QuestionnaireItem,
    successCallback: (valueSet: ValueSet) => void,
    errorCallback: (error: string) => void
  ) => void;
  autoSuggestProps?: AutoSuggestProps;
  fetchReceivers?: (successCallback: (receivers: Array<OrgenhetHierarki>) => void, errorCallback: () => void) => void;
}

export interface EnhancedWithCommonFunctionProps extends WithFormComponentsProps {
  renderChildrenItems?: (renderContext: RenderContext) => Array<JSX.Element> | undefined;
  renderDeleteButton?: () => JSX.Element | undefined;
  renderRepeatButton: (
    item: QuestionnaireItem,
    index: number,
    path?: Array<Path>,
    response?: Array<QuestionnaireResponseItem>,
    responseItem?: QuestionnaireResponseItem
  ) => JSX.Element | undefined;
  renderHelpButton: () => JSX.Element | undefined;
  renderHelpElement: () => JSX.Element | null;
}

export default function withCommonFunctions<T extends WithFormComponentsProps>(
  WrappedComponent: React.ComponentType<T & EnhancedWithCommonFunctionProps>
): React.ComponentType<T> {
  const WithCommonFunctions = (props: T): JSX.Element | null => {
    const [isHelpVisible, setIsHelpVisible] = React.useState(false);

    const renderDeleteButton = (className?: string): JSX.Element | undefined => {
      if (!props.visibleDeleteButton) {
        return undefined;
      }

      let mustShowConfirm: boolean = hasAnwer(props.answer);

      if (!mustShowConfirm && props.responseItem && props.responseItem.item) {
        mustShowConfirm = props.responseItem.item.some(item => (item ? hasAnwer(item.answer) : false));
      }

      return (
        <div className="page_refero__deletebutton-wrapper">
          <DeleteButton
            className={className}
            item={props.item}
            path={props.path}
            resources={props.resources}
            mustShowConfirm={mustShowConfirm}
            onAnswerChange={props.onAnswerChange}
          />
        </div>
      );
    };

    const renderRepeatButton = (
      item: QuestionnaireItem,
      index: number,
      path?: Array<Path>,
      response?: Array<QuestionnaireResponseItem>,
      responseItem?: QuestionnaireResponseItem
    ): JSX.Element | undefined => {
      if (!item.repeats || !shouldRenderRepeatButton(item, response, index)) {
        return undefined;
      }
      return (
        <div className="page_refero__repeatbutton-wrapper">
          <RepeatButton
            key={`item_${item.linkId}_add_repeat_item`}
            resources={props.resources}
            item={item}
            responseItems={response}
            parentPath={path}
            disabled={item.type !== itemType.GROUP && !responseItem?.answer}
          />
        </div>
      );
    };

    const hasAnwer = (answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[] | undefined): boolean => {
      return !!answer && Object.keys(answer).length > 0;
    };

    const renderHelpButton = (): JSX.Element | undefined => {
      const { item, onRequestHelpButton } = props;

      if (!item) return;
      const qItem = item as QuestionnaireItem;

      const helpItem = findHelpItem(qItem);
      if (!helpItem) return;

      const helpItemType = getHelpItemType(helpItem) || itemControlConstants.HELP;

      if (onRequestHelpButton) {
        return (
          <HelpButton item={helpItem} callback={setIsHelpVisible}>
            {onRequestHelpButton(qItem, helpItem, helpItemType, getText(helpItem), isHelpVisible)}
          </HelpButton>
        );
      }
      return (
        <HelpButton item={helpItem} callback={setIsHelpVisible}>
          <Icon svgIcon={HelpSign} />
        </HelpButton>
      );
    };

    const renderHelpElement = (): JSX.Element | null => (
      <HelpElement onRequestHelpElement={props.onRequestHelpElement} item={props.item} isHelpVisible={isHelpVisible} />
    );

    const renderItem = (item: QuestionnaireItem, renderContext: RenderContext): Array<JSX.Element | undefined> => {
      const { resources, responseItem, pdf, path, headerTag, promptLoginMessage, onRenderMarkdown } = props;
      if (isHelpItem(item) || isHiddenItem(item)) return [];

      const Comp = getComponentForItem(item.type, getCodingTextTableValues(item));

      if (!Comp) {
        return [];
      }

      let response: Array<QuestionnaireResponseItem> | undefined;

      if (responseItem) {
        const childItem = responseItem.item;
        const childAnswer = responseItem.answer;
        const linkId = item.linkId;

        if (childItem) {
          response = getItemWithIdFromResponseItemArray(linkId, childItem);
        } else if (childAnswer) {
          response = getItemWithIdFromResponseItemArray(linkId, childAnswer[0].item);
        }
      }
      const renderedItems: Array<JSX.Element | undefined> = [];
      if (response && response.length > 0) {
        response.forEach((responseItem, index) => {
          renderedItems.push(
            <Comp
              key={'item_' + responseItem.linkId + createIdSuffix(path, index, item.repeats)}
              pdf={pdf}
              includeSkipLink={props.includeSkipLink}
              promptLoginMessage={promptLoginMessage}
              id={'item_' + responseItem.linkId + createIdSuffix(path, index, item.repeats)}
              item={item}
              responseItem={responseItem}
              answer={getAnswerFromResponseItem(responseItem)}
              resources={resources}
              path={createPathForItem(path, item, responseItem, index)}
              headerTag={getChildHeaderTag(props.item, headerTag)}
              validateScriptInjection={props.validateScriptInjection}
              visibleDeleteButton={shouldRenderDeleteButton(item, index)}
              repeatButton={renderRepeatButton(item, index, path, response, responseItem)}
              onRequestAttachmentLink={props.onRequestAttachmentLink}
              onOpenAttachment={props.onOpenAttachment}
              onDeleteAttachment={props.onDeleteAttachment}
              uploadAttachment={props.uploadAttachment}
              onRequestHelpButton={props.onRequestHelpButton}
              onRequestHelpElement={props.onRequestHelpElement}
              attachmentErrorMessage={props.attachmentErrorMessage}
              attachmentMaxFileSize={props.attachmentMaxFileSize}
              attachmentValidTypes={props.attachmentValidTypes}
              onAnswerChange={props.onAnswerChange}
              renderContext={renderContext}
              onRenderMarkdown={onRenderMarkdown}
              fetchValueSet={props.fetchValueSet}
              autoSuggestProps={props.autoSuggestProps}
              fetchReceivers={props.fetchReceivers}
            />
          );
        });
      }
      return renderedItems;
    };

    const renderChildrenItems = (renderContext: RenderContext): Array<JSX.Element> | undefined => {
      const { item } = props;
      if (!item || !item.item) {
        return undefined;
      }

      let renderedItems: Array<JSX.Element> = [];

      if (item.type === itemType.GROUP && renderContext.RenderChildren) {
        const children = renderContext.RenderChildren(item.item, renderItem);
        if (children) {
          renderedItems = children.filter(isJsxElement);
        }
      } else {
        item.item.forEach(i => {
          const items = renderItem(i, renderContext).filter(isJsxElement);
          renderedItems.push(...items);
        });
      }

      return renderedItems.length > 0 ? renderedItems : undefined;
    };

    if (!props.enable) {
      return null;
    } else {
      return (
        <WrappedComponent
          renderChildrenItems={renderChildrenItems}
          renderDeleteButton={renderDeleteButton}
          renderRepeatButton={renderRepeatButton}
          renderHelpButton={renderHelpButton}
          renderHelpElement={renderHelpElement}
          {...(props as T)}
        >
          {renderChildrenItems(props.renderContext)}
        </WrappedComponent>
      );
    }
  };
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'WithCommonFunctions';

  WithCommonFunctions.displayName = `WithCommonFunctions(${displayName})`;
  return WithCommonFunctions;
}
