import * as React from 'react';

import classNames from 'classnames';
import DOMPurify from 'dompurify';
import {
  Resource,
  Questionnaire,
  QuestionnaireResponseItem,
  QuestionnaireItem,
  QuestionnaireResponseItemAnswer,
  Attachment,
  ValueSet,
} from 'fhir/r4';
import { Collapse } from 'react-collapse';
import { ThunkDispatch } from 'redux-thunk';

import { AutoSuggestProps } from '../types/autoSuggestProps';
import { OrgenhetHierarki } from '../types/orgenhetHierarki';

import Icon from '@helsenorge/designsystem-react/components/Icons';
import HelpSign from '@helsenorge/designsystem-react/components/Icons/HelpSign';

import { UploadedFile } from '@helsenorge/file-upload/components/dropzone';

import DeleteButton from './formcomponents/repeat/DeleteButton';
import RepeatButton from './formcomponents/repeat/RepeatButton';
import HelpButton from './help-button/HelpButton';
import { NewValueAction } from '../actions/newValue';
import itemControlConstants from '../constants/itemcontrol';
import itemType from '../constants/itemType';
import { GlobalState } from '../reducers';
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
import { Resources } from '../util/resources';

export interface WithCommonFunctionsProps {
  idWithLinkIdAndItemIndex: string;
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  resources?: Resources;
  responseItem?: QuestionnaireResponseItem;
  containedResources?: Resource[];
  item: QuestionnaireItem;
  questionnaire?: Questionnaire | null;
  headerTag?: number;
  pdf?: boolean;
  language?: string;
  includeSkipLink?: boolean;
  promptLoginMessage?: () => void;
  path?: Array<Path>;
  enable?: boolean;
  id?: string;
  answer?: QuestionnaireResponseItemAnswer | Array<QuestionnaireResponseItemAnswer>;
  optionalLabel?: string;
  requiredLabel?: string;
  validateScriptInjection?: boolean;
  showOptionalLabel?: boolean;
  showRequiredLabel?: boolean;
  visibleDeleteButton?: boolean;
  repeatButton?: JSX.Element;
  attachmentErrorMessage?: string;
  attachmentMaxFileSize?: number;
  attachmentValidTypes?: Array<string>;
  onRequestAttachmentLink?: (file: string) => string;
  onOpenAttachment?: (fileId: string) => void;
  onDeleteAttachment?: (fileId: string, onSuccess: () => void) => void;
  uploadAttachment?: (
    files: File[],
    onSuccess: (attachment: Attachment) => void
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
  isHelpOpen?: boolean;
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

export interface EnhancedProps {
  renderChildrenItems?: (renderContext: RenderContext) => Array<JSX.Element> | null;
  renderDeleteButton?: (classname?: string) => JSX.Element | null;
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

export interface WithCommonFunctionsAndEnhancedProps extends WithCommonFunctionsProps, EnhancedProps {}

export default function withCommonFunctions<T extends WithCommonFunctionsProps>(
  WrappedComponent: React.ComponentType<T>
): React.ComponentType<T & EnhancedProps> {
  const WithCommonFunctions = (props: T): JSX.Element | null => {
    const [isHelpVisible, setIsHelpVisible] = React.useState(false);

    const renderDeleteButton = (className?: string): JSX.Element | null => {
      if (!props.visibleDeleteButton) {
        return null;
      }

      let mustShowConfirm: boolean = hasAnwer(props.answer);

      if (!mustShowConfirm && props.responseItem && props.responseItem.item) {
        mustShowConfirm = props.responseItem.item.some(item => (item ? hasAnwer(item.answer) : false));
      }
      const idWithLinkIdAndItemIndex = props.item.linkId;
      return (
        <div className="page_refero__deletebutton-wrapper">
          <DeleteButton
            idWithLinkIdAndItemIndex={idWithLinkIdAndItemIndex}
            className={className}
            item={props.item}
            path={props.path}
            resources={props.resources}
            mustShowConfirm={mustShowConfirm}
            onAnswerChange={props.onAnswerChange}
            renderContext={props.renderContext}
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
      const idWithLinkIdAndItemIndex = path ? `${path[0].linkId}${path[0].index ? `-${path[0].index}` : ''}` : item.linkId ?? '';

      return (
        <div className="page_refero__repeatbutton-wrapper">
          <RepeatButton
            key={`item_${item.linkId}_add_repeat_item`}
            resources={props.resources}
            item={item}
            idWithLinkIdAndItemIndex={idWithLinkIdAndItemIndex}
            responseItems={response}
            parentPath={path}
            renderContext={props.renderContext}
            disabled={item.type !== itemType.GROUP && !responseItem?.answer}
          />
        </div>
      );
    };

    const hasAnwer = (answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[] | undefined): boolean => {
      return !!answer && Object.keys(answer as object).length > 0;
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

    const renderHelpElement = (): JSX.Element | null => {
      const { item, onRequestHelpElement } = props;
      if (!item) {
        return null;
      }
      const qItem = item as QuestionnaireItem;

      const helpItem = findHelpItem(qItem);
      if (!helpItem) {
        return null;
      }

      const helpItemType = getHelpItemType(helpItem) || itemControlConstants.HELP;

      if (onRequestHelpElement) {
        return onRequestHelpElement(qItem, helpItem, helpItemType, getText(helpItem), isHelpVisible);
      }

      const collapseClasses: string = classNames({
        page_refero__helpComponent: true,
        'page_refero__helpComponent--open': isHelpVisible,
      });
      return (
        <Collapse isOpened={isHelpVisible}>
          <div
            className={collapseClasses}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`${getText(helpItem)}`, { RETURN_TRUSTED_TYPE: true, ADD_ATTR: ['target'] }) as unknown as string,
            }}
          />
        </Collapse>
      );
    };

    const renderItem = (item: QuestionnaireItem, renderContext: RenderContext): Array<JSX.Element> => {
      const { resources, containedResources, responseItem, pdf, path, headerTag, promptLoginMessage, onRenderMarkdown } = props;
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
          const idWithLinkIdAndItemIndex = `${item.linkId}${path && path[0] && path[0].index ? `-${path[0].index}` : ''}${
            index ? `-${index}` : ''
          }`;

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
              answer={getAnswerFromResponseItem(responseItem)}
              resources={resources}
              containedResources={containedResources}
              path={createPathForItem(path, item, responseItem, index)}
              headerTag={getChildHeaderTag(props.item, headerTag)}
              validateScriptInjection={props.validateScriptInjection}
              optionalLabel={props.optionalLabel}
              requiredLabel={props.requiredLabel}
              showOptionalLabel={props.showOptionalLabel}
              showRequiredLabel={props.showRequiredLabel}
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

    const renderChildrenItems = (renderContext: RenderContext): Array<JSX.Element> | null => {
      const { item } = props;
      if (!item || !item.item) {
        return null;
      }

      if (item.type === itemType.GROUP && renderContext.RenderChildren) {
        return renderContext.RenderChildren(item.item, renderItem);
      }

      const renderedItems: Array<JSX.Element> = [];
      item.item.forEach(i => renderedItems.push(...renderItem(i, renderContext)));
      return renderedItems;
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
          isHelpOpen={isHelpVisible}
          {...props}
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
