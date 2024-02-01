import * as React from 'react';

import classNames from 'classnames';
import DOMPurify from 'dompurify';
import { Collapse } from 'react-collapse';
import { ThunkDispatch } from 'redux-thunk';

import { AutoSuggestProps } from '../types/autoSuggestProps';
import {
  Resource,
  Questionnaire,
  QuestionnaireResponseItem,
  QuestionnaireItem,
  QuestionnaireResponseItemAnswer,
  Attachment,
  ValueSet,
} from '../types/fhir';
import { FormChild } from '../types/formTypes/formChild';
import { ValidationProps } from '../types/formTypes/validation';
import { OrgenhetHierarki } from '../types/orgenhetHierarki';
import { TextMessage } from '../types/text-message';

import Icon from '@helsenorge/designsystem-react/components/Icons';
import HelpSign from '@helsenorge/designsystem-react/components/Icons/HelpSign';

import { UploadedFile } from '@helsenorge/file-upload/components/dropzone';

import DeleteButton from './formcomponents/repeat/delete-button';
import RepeatButton from './formcomponents/repeat/repeat-button';
import HelpButton from './help-button/help-button';
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
  resources?: Resources;
  responseItem?: QuestionnaireResponseItem;
  containedResources?: Resource[];
  item?: QuestionnaireItem;
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
  addFormComponent?: (component: FormChild) => void;
  removeFormComponent?: (component: FormChild) => void;
  onValidated?: (valid: boolean | undefined) => void;
  optionalLabel?: string;
  requiredLabel?: string;
  validateScriptInjection?: boolean;
  showOptionalLabel?: boolean;
  showRequiredLabel?: boolean;
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
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

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function withCommonFunctions<T>(WrappedComponent: React.FC<WithCommonFunctionsProps & ValidationProps>) {
  return function WithCommonFunctions(props: T & ValidationProps & WithCommonFunctionsProps): React.ReactElement | null {
    const [isHelpVisible, setIsHelpVisible] = React.useState<boolean>(false);

    const renderDeleteButton = (className?: string): React.ReactElement | undefined => {
      if (!props.visibleDeleteButton) {
        return undefined;
      }

      let mustShowConfirm: boolean = hasAnwer(props.answer);

      if (!mustShowConfirm && props.responseItem && props.responseItem.item) {
        mustShowConfirm = props.responseItem.item.some((item: QuestionnaireResponseItem) => (item ? hasAnwer(item.answer) : false));
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
    ): React.ReactElement | undefined => {
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
            renderContext={props.renderContext}
            disabled={item.type !== itemType.GROUP && !responseItem?.answer}
          />
        </div>
      );
    };

    const hasAnwer = (answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[] | undefined): boolean => {
      return !!answer && Object.keys(answer as object).length > 0;
    };

    const toggleHelp = (isOpen: boolean): void => {
      setIsHelpVisible(isOpen);
    };

    const renderHelpButton = (): React.ReactElement | undefined => {
      const { item, onRequestHelpButton } = props;

      if (!item) return;
      const qItem = item as QuestionnaireItem;

      const helpItem = findHelpItem(qItem);
      if (!helpItem) return;

      const helpItemType = getHelpItemType(helpItem) || itemControlConstants.HELP;

      if (onRequestHelpButton) {
        return (
          <HelpButton item={helpItem} callback={toggleHelp}>
            {onRequestHelpButton(qItem, helpItem, helpItemType, getText(helpItem), isHelpVisible)}
          </HelpButton>
        );
      }
      return (
        <HelpButton item={helpItem} callback={toggleHelp}>
          <Icon svgIcon={HelpSign} />
        </HelpButton>
      );
    };

    const renderHelpElement = (): React.ReactElement | undefined => {
      const { item, onRequestHelpElement } = props;
      if (!item) {
        return;
      }
      const qItem = item as QuestionnaireItem;

      const helpItem = findHelpItem(qItem);
      if (!helpItem) {
        return;
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

    const renderItem = (item: QuestionnaireItem, renderContext: RenderContext): Array<JSX.Element | undefined> => {
      const { resources, containedResources, responseItem, pdf, path, headerTag, promptLoginMessage, onRenderMarkdown } = props;
      if (isHelpItem(item)) return [];
      if (isHiddenItem(item)) return [];

      const Comp = getComponentForItem(item.type, getCodingTextTableValues(item));

      if (!Comp) {
        return [];
      }

      let response: Array<QuestionnaireResponseItem> | undefined;

      if (responseItem) {
        const childItem = responseItem.item;
        const childAnswer = responseItem.answer;
        const linkId = item.linkId;
        // console.log(childAnswer);

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
              onValidated={props.onValidated}
              validateScriptInjection={props.validateScriptInjection}
              addFormComponent={props.addFormComponent}
              removeFormComponent={props.removeFormComponent}
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

    const renderChildrenItems = (renderContext: RenderContext): Array<JSX.Element | undefined> | undefined => {
      const { item } = props;
      if (!item || !item.item) {
        return undefined;
      }

      if (item.type === itemType.GROUP && renderContext.RenderChildren) {
        return renderContext.RenderChildren(item.item, renderItem);
      }

      const renderedItems: Array<JSX.Element | undefined> = [];
      item.item.forEach((i: QuestionnaireItem) => renderedItems.push(...renderItem(i, renderContext)));
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
          onRenderMarkdown={props.onRenderMarkdown}
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          {...(props as any)}
        >
          {renderChildrenItems(props.renderContext)}
        </WrappedComponent>
      );
    }
  };
}
