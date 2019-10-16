import * as React from 'react';
import { ThunkDispatch } from 'redux-thunk';
import { GlobalState } from '../reducers';
import {
  Path,
  getAnswerFromResponseItem,
  getItemWithIdFromResponseItemArray,
  createPathForItem,
  wrappedByRepeatItem,
  shouldRenderDeleteButton,
} from '../util/skjemautfyller-core';
import { Resource, QuestionnaireResponseItem, QuestionnaireItem, QuestionnaireResponseAnswer, Attachment } from '../types/fhir';
import { Resources } from '../util/resources';
import { getComponentForItem, getChildHeaderTag, shouldRenderRepeatButton, getText } from '../util/index';
import { ValidationProps } from '@helsenorge/toolkit/components/molecules/form/validation';
import { FormChild } from '@helsenorge/toolkit/components/molecules/form';
import RepeatButton from './formcomponents/repeat/repeat-button';
import DeleteButton from './formcomponents/repeat/delete-button';
import { UploadedFile } from '@helsenorge/toolkit/components/atoms/dropzone';
import { TextMessage } from '../types/text-message';
import { findHelpItem, isHelpItem, getHelpItemType } from '../util/help';
import HelpButton from './help-button/help-button';
import { HelpTrigger } from '@helsenorge/toolkit/components/icons';
import { Collapse } from 'react-collapse';
import itemControlConstants from '../constants/itemcontrol';
import { NewValueAction } from '../actions/newValue';

export interface Props {
  resources?: Resources;
  responseItem?: QuestionnaireResponseItem;
  containedResources?: Resource[];
  item?: QuestionnaireItem;
  headerTag?: number;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  path?: Array<Path>;
  enable?: boolean;
  id?: string;
  answer?: QuestionnaireResponseAnswer | Array<QuestionnaireResponseAnswer>;
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
}

interface EnhancedProps {
  renderChildrenItems?: (repeatIndex: number) => Array<JSX.Element> | undefined;
  renderDeleteButton?: () => JSX.Element | undefined;
}

interface State {
  childComponents?: Array<React.Component<Props>>;
  isHelpVisible: boolean;
}

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
        <DeleteButton
          className={className}
          item={this.props.item}
          path={this.props.path}
          resources={this.props.resources}
          mustShowConfirm={mustShowConfirm}
        />
      );
    };

    renderRepeatButton = (item: QuestionnaireItem, index: number, path?: Array<Path>, response?: Array<QuestionnaireResponseItem>) => {
      if (!item.repeats || !shouldRenderRepeatButton(item, response, index)) {
        return undefined;
      }
      return (
        <RepeatButton
          key={`item_${item.linkId}_add_repeat_item`}
          resources={this.props.resources}
          item={item}
          responseItems={response}
          parentPath={path}
        />
      );
    };

    hasAnwer(answer: QuestionnaireResponseAnswer | QuestionnaireResponseAnswer[] | undefined): boolean {
      return !!answer && Object.keys(answer as object).length > 0;
    }

    toggleHelp = (isOpen: boolean) => {
      this.setState({ isHelpVisible: isOpen });
    };

    renderHelpButton = () => {
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
          <HelpTrigger />
        </HelpButton>
      );
    };

    renderHelpElement = () => {
      const { item, onRequestHelpElement } = this.props;
      if (!item) return;
      const qItem = item as QuestionnaireItem;

      const helpItem = findHelpItem(qItem);
      if (!helpItem) return;

      const helpItemType = getHelpItemType(helpItem) || itemControlConstants.HELP;

      if (onRequestHelpElement) {
        return onRequestHelpElement(qItem, helpItem, helpItemType, getText(helpItem), this.state.isHelpVisible);
      }

      return (
        <Collapse isOpened={this.state.isHelpVisible}>
          <div className="page_skjemautfyller__helpComponent" dangerouslySetInnerHTML={{ __html: `${getText(helpItem)}` }} />
        </Collapse>
      );
    };

    renderItem = (item: QuestionnaireItem): Array<JSX.Element | undefined> => {
      const { resources, containedResources, responseItem, pdf, path, headerTag, promptLoginMessage } = this.props;
      if (isHelpItem(item)) return [];

      const Comp = getComponentForItem(item.type);
      if (!Comp) {
        return [];
      }

      let response: Array<QuestionnaireResponseItem> | undefined;
      // let suffix = repeatIndex === undefined ? '' : '^' + repeatIndex.toString();

      if (responseItem) {
        const childItem = responseItem.item;
        const childAnswer = responseItem.answer;

        let linkId = item.linkId;
        const isWrappedByRepeatItem = wrappedByRepeatItem(this.props.path);
        linkId += isWrappedByRepeatItem ? '^' + responseItem.linkId.split('^')[1] : '';

        if (childItem) {
          response = getItemWithIdFromResponseItemArray(linkId, childItem, !isWrappedByRepeatItem);
        } else if (childAnswer) {
          response = getItemWithIdFromResponseItemArray(linkId, childAnswer[0].item, !isWrappedByRepeatItem);
        }
      }
      const renderedItems: Array<JSX.Element | undefined> = [];

      if (response && response.length > 0) {
        response.forEach((responseItem, index) => {
          renderedItems.push(
            <Comp
              key={`item_${responseItem.linkId}`}
              pdf={pdf}
              promptLoginMessage={promptLoginMessage}
              id={`item_${responseItem.linkId}`}
              item={item}
              responseItem={responseItem}
              answer={getAnswerFromResponseItem(responseItem)}
              ref={(c: React.Component<Props>) => {
                if (!this.state.childComponents) {
                  return;
                }
                this.state.childComponents.push(c);
              }}
              resources={resources}
              containedResources={containedResources}
              path={createPathForItem(path, item, responseItem)}
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
              repeatButton={this.renderRepeatButton(item, index, path, response)}
              onRequestAttachmentLink={this.props.onRequestAttachmentLink}
              onOpenAttachment={this.props.onOpenAttachment}
              onDeleteAttachment={this.props.onDeleteAttachment}
              uploadAttachment={this.props.uploadAttachment}
              onRequestHelpButton={this.props.onRequestHelpButton}
              onRequestHelpElement={this.props.onRequestHelpElement}
              attachmentMaxFileSize={this.props.attachmentMaxFileSize}
              attachmentValidTypes={this.props.attachmentValidTypes}
            />
          );
        });
      }
      return renderedItems;
    };

    renderChildrenItems = (): Array<JSX.Element | undefined> | undefined => {
      const { item } = this.props;
      if (!item || !item.item) {
        return undefined;
      }
      const renderedItems: Array<JSX.Element | undefined> = [];
      item.item.forEach(i => {
        renderedItems.push(...this.renderItem(i));
      });
      return renderedItems;
    };

    render() {
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
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            {...this.props as any}
          >
            {this.renderChildrenItems()}
          </WrappedComponent>
        );
      }
    }
  };
}
