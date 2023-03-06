import * as React from 'react';

import DOMPurify from 'dompurify';

import classNames from 'classnames';
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
import { OrgenhetHierarki } from '../types/orgenhetHierarki';
import { TextMessage } from '../types/text-message';

import Icon from '@helsenorge/designsystem-react/components/Icons';
import HelpSign from '@helsenorge/designsystem-react/components/Icons/HelpSign';

import { UploadedFile } from '@helsenorge/file-upload/components/dropzone';
import { FormChild } from '@helsenorge/form/components/form';
import { ValidationProps } from '@helsenorge/form/components/form/validation';

import { NewValueAction } from '../actions/newValue';
import itemControlConstants from '../constants/itemcontrol';
import itemType from '../constants/itemType';
import { GlobalState } from '../reducers';
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
import DeleteButton from './formcomponents/repeat/delete-button';
import RepeatButton from './formcomponents/repeat/repeat-button';
import HelpButton from './help-button/help-button';

export interface Props {
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

interface EnhancedProps {
  renderChildrenItems?: (renderContext: RenderContext) => Array<JSX.Element> | undefined;
  renderDeleteButton?: () => JSX.Element | undefined;
}

interface State {
  childComponents?: Array<React.Component<Props>>;
  isHelpVisible: boolean;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function withCommonFunctions<T>(WrappedComponent: React.ComponentClass<T & EnhancedProps>) {
  return class WithCommonFunctions extends React.Component<T & ValidationProps & Props, State> {
    constructor(props: T & ValidationProps & Props) {
      super(props);

      this.state = {
        childComponents: [],
        isHelpVisible: false,
      };
    }

    renderDeleteButton = (className?: string): JSX.Element | undefined => {
      if (!this.props.visibleDeleteButton) {
        return undefined;
      }

      let mustShowConfirm: boolean = this.hasAnwer(this.props.answer);

      if (!mustShowConfirm && this.props.responseItem && this.props.responseItem.item) {
        mustShowConfirm = this.props.responseItem.item.some(item => (item ? this.hasAnwer(item.answer) : false));
      }

      return (
        <div className="page_refero__deletebutton-wrapper">
          <DeleteButton
            className={className}
            item={this.props.item}
            path={this.props.path}
            resources={this.props.resources}
            mustShowConfirm={mustShowConfirm}
            onAnswerChange={this.props.onAnswerChange}
            renderContext={this.props.renderContext}
          />
        </div>
      );
    };

    renderRepeatButton = (
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
            resources={this.props.resources}
            item={item}
            responseItems={response}
            parentPath={path}
            renderContext={this.props.renderContext}
            disabled={item.type !== itemType.GROUP && !responseItem?.answer}
          />
        </div>
      );
    };

    hasAnwer(answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[] | undefined): boolean {
      return !!answer && Object.keys(answer as object).length > 0;
    }

    toggleHelp = (isOpen: boolean): void => {
      this.setState({ isHelpVisible: isOpen });
    };

    renderHelpButton = (): JSX.Element | undefined => {
      const { item, onRequestHelpButton } = this.props;

      if (!item) return;
      const qItem = item as QuestionnaireItem;

      const helpItem = findHelpItem(qItem);
      if (!helpItem) return;

      const helpItemType = getHelpItemType(helpItem) || itemControlConstants.HELP;

      if (onRequestHelpButton) {
        return (
          <HelpButton item={helpItem} callback={this.toggleHelp}>
            {onRequestHelpButton(qItem, helpItem, helpItemType, getText(helpItem), this.state.isHelpVisible)}
          </HelpButton>
        );
      }
      return (
        <HelpButton item={helpItem} callback={this.toggleHelp}>
          <Icon svgIcon={HelpSign} />
        </HelpButton>
      );
    };

    renderHelpElement = (): JSX.Element | undefined => {
      const { item, onRequestHelpElement } = this.props;
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
        return onRequestHelpElement(qItem, helpItem, helpItemType, getText(helpItem), this.state.isHelpVisible);
      }

      const collapseClasses: string = classNames({
        page_refero__helpComponent: true,
        'page_refero__helpComponent--open': this.state.isHelpVisible,
      });
      return (
        <Collapse isOpened={this.state.isHelpVisible}>
          <div
            className={collapseClasses}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`${getText(helpItem)}`, { RETURN_TRUSTED_TYPE: true, ADD_ATTR: ['target'], }) as unknown as string,
            }}
          />
        </Collapse>
      );
    };

    renderItem = (item: QuestionnaireItem, renderContext: RenderContext): Array<JSX.Element | undefined> => {
      const { resources, containedResources, responseItem, pdf, path, headerTag, promptLoginMessage, onRenderMarkdown } = this.props;
      if (isHelpItem(item)) return [];
      if (isHiddenItem(item)) return [];

      const Comp = getComponentForItem(item.type);
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
              language={this.props.language}
              includeSkipLink={this.props.includeSkipLink}
              promptLoginMessage={promptLoginMessage}
              id={'item_' + responseItem.linkId + createIdSuffix(path, index, item.repeats)}
              item={item}
              questionnaire={this.props.questionnaire}
              responseItem={responseItem}
              answer={getAnswerFromResponseItem(responseItem)}
              resources={resources}
              containedResources={containedResources}
              path={createPathForItem(path, item, responseItem, index)}
              headerTag={getChildHeaderTag(this.props.item, headerTag)}
              onValidated={this.props.onValidated}
              validateScriptInjection={this.props.validateScriptInjection}
              addFormComponent={this.props.addFormComponent}
              removeFormComponent={this.props.removeFormComponent}
              optionalLabel={this.props.optionalLabel}
              requiredLabel={this.props.requiredLabel}
              showOptionalLabel={this.props.showOptionalLabel}
              showRequiredLabel={this.props.showRequiredLabel}
              visibleDeleteButton={shouldRenderDeleteButton(item, index)}
              repeatButton={this.renderRepeatButton(item, index, path, response, responseItem)}
              onRequestAttachmentLink={this.props.onRequestAttachmentLink}
              onOpenAttachment={this.props.onOpenAttachment}
              onDeleteAttachment={this.props.onDeleteAttachment}
              uploadAttachment={this.props.uploadAttachment}
              onRequestHelpButton={this.props.onRequestHelpButton}
              onRequestHelpElement={this.props.onRequestHelpElement}
              attachmentErrorMessage={this.props.attachmentErrorMessage}
              attachmentMaxFileSize={this.props.attachmentMaxFileSize}
              attachmentValidTypes={this.props.attachmentValidTypes}
              onAnswerChange={this.props.onAnswerChange}
              renderContext={renderContext}
              onRenderMarkdown={onRenderMarkdown}
              fetchValueSet={this.props.fetchValueSet}
              autoSuggestProps={this.props.autoSuggestProps}
              fetchReceivers={this.props.fetchReceivers}
            />
          );
        });
      }
      return renderedItems;
    };

    renderChildrenItems = (renderContext: RenderContext): Array<JSX.Element | undefined> | undefined => {
      const { item } = this.props;
      if (!item || !item.item) {
        return undefined;
      }

      if (item.type === itemType.GROUP && renderContext.RenderChildren) {
        return renderContext.RenderChildren(item.item, this.renderItem);
      }

      const renderedItems: Array<JSX.Element | undefined> = [];
      item.item.forEach(i => renderedItems.push(...this.renderItem(i, renderContext)));
      return renderedItems;
    };

    render(): JSX.Element | null {
      if (!this.props.enable) {
        return null;
      } else {
        return (
          <WrappedComponent
            renderChildrenItems={this.renderChildrenItems}
            renderDeleteButton={this.renderDeleteButton}
            renderRepeatButton={this.renderRepeatButton}
            renderHelpButton={this.renderHelpButton}
            renderHelpElement={this.renderHelpElement}
            isHelpOpen={this.state.isHelpVisible}
            onRenderMarkdown={this.props.onRenderMarkdown}
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            {...(this.props as any)}
          >
            {this.renderChildrenItems(this.props.renderContext)}
          </WrappedComponent>
        );
      }
    }
  };
}
