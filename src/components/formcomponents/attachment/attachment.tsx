import * as React from 'react';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer, Attachment, QuestionnaireResponseItem, Questionnaire } from 'fhir/r4';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { TextMessage } from '../../../types/text-message';

import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';

import { UploadedFile } from '@helsenorge/file-upload/components/dropzone';

import AttachmentHtml from './attachmenthtml';
import { NewValueAction, newAttachmentAsync, removeAttachmentAsync } from '../../../actions/newValue';
import { GlobalState } from '../../../reducers';
import { getValidationTextExtension, getMaxOccursExtensionValue, getMinOccursExtensionValue } from '../../../util/extension';
import { isRequired, getId, isReadOnly, isRepeat, getSublabelText, renderPrefix, getText } from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Path } from '../../../util/refero-core';
import { Resources } from '../../../util/resources';
import ReactHookFormHoc, { FormProps } from '../../../validation/ReactHookFormHoc';
import withCommonFunctions, { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';
import TextView from '../textview';

export interface Props extends WithCommonFunctionsAndEnhancedProps, FormProps {
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  path: Array<Path>;
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  responseItem: QuestionnaireResponseItem;
  answer: Array<QuestionnaireResponseItemAnswer> | QuestionnaireResponseItemAnswer;
  pdf?: boolean;
  id?: string;
  resources?: Resources;
  renderDeleteButton: () => JSX.Element | null;
  repeatButton: JSX.Element;
  attachmentErrorMessage?: string;
  attachmentMaxFileSize?: number;
  attachmentValidTypes?: Array<string>;
  uploadAttachment?: (
    files: File[],
    onSuccess: (uploadedFile: UploadedFile, attachment: Attachment) => void,
    onError: (errorMessage: TextMessage | null) => void
  ) => void;
  onDeleteAttachment?: (fileId: string, onSuccess: () => void, onError: (errorMessage: TextMessage | null) => void) => void;
  onOpenAttachment?: (fileId: string) => void;
  onRequestAttachmentLink?: (file: string) => string;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  isHelpOpen?: boolean;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

export class AttachmentComponent extends React.Component<Props> {
  onUpload = (files: File[], cb: (success: boolean, errormessage: TextMessage | null, uploadedFile?: UploadedFile) => void): void => {
    const { uploadAttachment, path, item, onAnswerChange } = this.props;
    if (uploadAttachment) {
      for (const file of files) {
        const onSuccess = (uploadedFile: UploadedFile, attachment: Attachment): void => {
          if (this.props.dispatch && attachment) {
            this.props
              .dispatch(newAttachmentAsync(this.props.path, attachment, this.props.item, isRepeat(this.props.item)))
              ?.then(newState => onAnswerChange(newState, path, item, { valueAttachment: attachment } as QuestionnaireResponseItemAnswer));
          }

          cb(true, null, uploadedFile);
        };

        const onError = (errorMessage: TextMessage | null): void => {
          cb(false, errorMessage);
        };

        uploadAttachment([file], onSuccess, onError);
      }
    }
  };

  onDelete = (fileId: string, cb: (success: boolean, errormessage: TextMessage | null) => void): void => {
    const { onDeleteAttachment, path, item, onAnswerChange } = this.props;

    if (onDeleteAttachment) {
      const onSuccess = (): void => {
        if (this.props.dispatch) {
          const attachment = { url: fileId } as Attachment;
          this.props
            .dispatch(removeAttachmentAsync(this.props.path, attachment, this.props.item))
            ?.then(newState => onAnswerChange(newState, path, item, { valueAttachment: attachment } as QuestionnaireResponseItemAnswer));
        }

        cb(true, null);
      };

      const onError = (errormessage: TextMessage | null): void => {
        cb(false, errormessage);
      };

      onDeleteAttachment(fileId, onSuccess, onError);
    }
  };

  getButtonText = (): string => {
    let buttonText = '';
    const { resources } = this.props;
    if (resources && resources.uploadButtonText) {
      buttonText = resources.uploadButtonText;
    }
    return buttonText;
  };

  getAttachment = (): UploadedFile[] => {
    const { answer } = this.props;
    if (Array.isArray(answer)) {
      return answer.map(v => {
        return {
          id: v.valueAttachment && v.valueAttachment.url ? v.valueAttachment.url : -1,
          name: v.valueAttachment && v.valueAttachment.title ? v.valueAttachment.title : '',
        } as UploadedFile;
      });
    } else {
      if (answer && answer.valueAttachment && answer.valueAttachment.url) {
        return [
          {
            id: answer.valueAttachment.url,
            name: answer.valueAttachment.title ? answer.valueAttachment.title : '',
          } as UploadedFile,
        ];
      }
    }
    return [];
  };

  getPdfValue = (): string => {
    const attachments = this.getAttachment();
    if (attachments) {
      return attachments.map(v => v.name).join(', ');
    } else if (this.props.resources) {
      return this.props.resources.ikkeBesvart;
    }

    return '';
  };

  shouldComponentUpdate(nextProps: Props): boolean {
    const responseItemHasChanged = this.props.responseItem !== nextProps.responseItem;
    const helpItemHasChanged = this.props.isHelpOpen !== nextProps.isHelpOpen;
    const resourcesHasChanged = JSON.stringify(this.props.resources) !== JSON.stringify(nextProps.resources);
    const attachmentErrorMessageHasChanged = this.props.attachmentErrorMessage !== nextProps.attachmentErrorMessage;
    const repeats = this.props.item.repeats ?? false;

    return responseItemHasChanged || helpItemHasChanged || resourcesHasChanged || attachmentErrorMessageHasChanged || repeats;
  }

  render(): JSX.Element | null {
    const { pdf, id, item, resources, onOpenAttachment, onRenderMarkdown, questionnaire } = this.props;
    const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);
    const labelText = `${renderPrefix(this.props.item)} ${getText(
      this.props.item,
      this.props.onRenderMarkdown,
      this.props.questionnaire,
      this.props.resources
    )}`;
    if (pdf || isReadOnly(item)) {
      return (
        <TextView
          id={id}
          item={item}
          value={this.getPdfValue()}
          onRenderMarkdown={onRenderMarkdown}
          helpButton={this.props.renderHelpButton()}
          helpElement={this.props.renderHelpElement()}
        >
          {this.props.children}
        </TextView>
      );
    } else {
      return (
        <>
          <AttachmentHtml
            onUpload={this.onUpload}
            onDelete={this.onDelete}
            onOpen={onOpenAttachment}
            id={getId(id)}
            label={
              <Label
                labelTexts={[{ text: labelText, type: 'semibold' }]}
                sublabel={<Sublabel id={`${getId(id)}-attachemnt-sublabel`} sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
                afterLabelChildren={this.props.renderHelpButton()}
              />
            }
            uploadButtonText={this.getButtonText()}
            resources={resources}
            isRequired={isRequired(item)}
            multiple={isRepeat(item)}
            errorText={getValidationTextExtension(item)}
            uploadedFiles={this.getAttachment()}
            onRequestAttachmentLink={this.props.onRequestAttachmentLink}
            helpButton={this.props.renderHelpButton()}
            helpElement={this.props.renderHelpElement()}
            maxFiles={getMaxOccursExtensionValue(item)}
            minFiles={getMinOccursExtensionValue(item)}
            attachmentMaxFileSize={this.props.attachmentMaxFileSize}
            attachmentValidTypes={this.props.attachmentValidTypes}
            item={item}
            attachmentErrorMessage={this.props.attachmentErrorMessage}
            register={this.props.register}
            setValue={this.props.setValue}
          >
            {this.props.children}
          </AttachmentHtml>
        </>
      );
    }
  }
}

const withFormProps = ReactHookFormHoc(AttachmentComponent);
const withCommonFunctionsComponent = withCommonFunctions(withFormProps);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(withCommonFunctionsComponent);
export default connectedComponent;
