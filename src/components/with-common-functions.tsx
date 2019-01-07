import * as React from 'react';
import { Dispatch } from 'redux';
import {
  Path,
  getAnswerFromResponseItem,
  getItemWithIdFromResponseItemArray,
  createPathForItem,
  wrappedByRepeatItem,
  shouldRenderDeleteButton,
} from '../util/skjemautfyller-core';
import { Resource, QuestionnaireResponseItem, QuestionnaireItem, QuestionnaireResponseAnswer } from '../types/fhir';
import { Resources } from '../../npm/types/Resources';
import { getComponentForItem, getChildHeaderTag, shouldRenderRepeatButton } from '../util/index';
import { ValidationProps } from '@helsenorge/toolkit/components/molecules/form/validation';
import { FormChild } from '@helsenorge/toolkit/components/molecules/form';
import RepeatButton from './formcomponents/repeat/repeat-button';
import DeleteButton from './formcomponents/repeat/delete-button';
import { UploadedFile, TextMessage } from '@helsenorge/toolkit/components/atoms/dropzone';

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
  showOptionalLabel?: boolean;
  showRequiredLabel?: boolean;
  dispatch?: Dispatch<{}>;
  visibleDeleteButton?: boolean;
  repeatButton?: JSX.Element;
  onRequestAttachmentLink?: (file: string) => string;
  onOpenAttachment?: (fileId: string) => void;
  onDeleteAttachment?: (
    itemPath: Array<Path>,
    item: QuestionnaireItem | undefined,
    fileId: string,
    cb: (success: boolean, errorMessage: TextMessage | null) => void
  ) => void;
  uploadAttachment?: (
    itemPath: Array<Path>,
    files: File[],
    item: QuestionnaireItem | undefined,
    cb: (success: boolean, errormessage: TextMessage | null, uploadedFile?: UploadedFile) => void
  ) => void;
}

interface EnhancedProps {
  renderChildrenItems?: (repeatIndex: number) => Array<JSX.Element> | undefined;
  renderDeleteButton?: () => JSX.Element | undefined;
}

interface State {
  childComponents?: Array<React.Component<Props>>;
}

export default function withCommonFunctions<T>(WrappedComponent: React.ComponentClass<T & EnhancedProps>) {
  return class WithCommonFunctions extends React.Component<T & ValidationProps & Props, State> {
    constructor(props: T & ValidationProps & Props) {
      super(props);
      this.state = {
        childComponents: [],
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

    renderItem = (item: QuestionnaireItem): Array<JSX.Element | undefined> => {
      const { resources, containedResources, responseItem, pdf, path, headerTag, promptLoginMessage } = this.props;
      const Comp = getComponentForItem(item.type);
      if (!Comp) {
        return [];
      }
      let response: Array<QuestionnaireResponseItem> | undefined;
      // let suffix = repeatIndex === undefined ? '' : '^' + repeatIndex.toString();

      if (responseItem) {
        let childItem = responseItem.item;
        let childAnswer = responseItem.answer;

        let linkId = item.linkId;
        let isWrappedByRepeatItem = wrappedByRepeatItem(this.props.path);
        linkId += isWrappedByRepeatItem ? '^' + responseItem.linkId.split('^')[1] : '';

        if (childItem) {
          response = getItemWithIdFromResponseItemArray(linkId, childItem, !isWrappedByRepeatItem);
        } else if (childAnswer) {
          response = getItemWithIdFromResponseItemArray(linkId, childAnswer[0].item, !isWrappedByRepeatItem);
        }
      }
      let renderedItems: Array<JSX.Element | undefined> = [];

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
      let renderedItems = new Array();
      item.item.forEach(i => {
        renderedItems.push(this.renderItem(i));
      });
      return renderedItems;
    };

    render() {
      if (!this.props.enable) {
        return null;
      } else {
        return (
          /* tslint:disable no-any */
          <WrappedComponent
            children={this.renderChildrenItems()}
            renderChildrenItems={this.renderChildrenItems}
            renderDeleteButton={this.renderDeleteButton}
            renderRepeatButton={this.renderRepeatButton}
            {...this.props as any}
          />
        );
      }
    }
  };
}
