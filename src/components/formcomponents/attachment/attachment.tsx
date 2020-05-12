import * as React from 'react';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { GlobalState } from '../../../reducers';
import { NewValueAction, newAttachmentAsync, removeAttachmentAsync } from '../../../actions/newValue';

import withCommonFunctions from '../../with-common-functions';
import AttachmentHtml from './attachmenthtml';
import { UploadedFile } from '@helsenorge/toolkit/components/atoms/dropzone';
import { ValidationProps } from '@helsenorge/toolkit/components/molecules/form/validation';

import { Path } from '../../../util/skjemautfyller-core';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { isRequired, getId, renderPrefix, getText, isReadOnly, isRepeat } from '../../../util/index';
import { getValidationTextExtension, getMaxOccursExtensionValue, getMinOccursExtensionValue } from '../../../util/extension';
import { QuestionnaireItem, QuestionnaireResponseAnswer, Attachment, QuestionnaireResponseItem } from '../../../types/fhir';
import { Resources } from '../../../util/resources';
import TextView from '../textview';
import { TextMessage } from '../../../types/text-message';

export interface Props {
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  path: Array<Path>;
  item: QuestionnaireItem;
  responseItem: QuestionnaireResponseItem;
  answer: Array<QuestionnaireResponseAnswer> | QuestionnaireResponseAnswer;
  pdf?: boolean;
  id?: string;
  resources?: Resources;
  renderDeleteButton: () => JSX.Element | undefined;
  repeatButton: JSX.Element;
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
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseAnswer) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

class AttachmentComponent extends React.Component<Props & ValidationProps> {
  onUpload = (files: File[], cb: (success: boolean, errormessage: TextMessage | null, uploadedFile?: UploadedFile) => void): void => {
    const { uploadAttachment, path, item, onAnswerChange } = this.props;
    if (uploadAttachment) {
      for (const file of files) {
        const onSuccess = (uploadedFile: UploadedFile, attachment: Attachment): void => {
          if (this.props.dispatch && attachment) {
            this.props
              .dispatch(newAttachmentAsync(this.props.path, attachment, this.props.item, isRepeat(this.props.item)))
              ?.then(newState => onAnswerChange(newState, path, item, { valueAttachment: attachment } as QuestionnaireResponseAnswer));
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
            ?.then(newState => onAnswerChange(newState, path, item, { valueAttachment: attachment } as QuestionnaireResponseAnswer));
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

  shouldComponentUpdate(nextProps: Props, _nextState: {}) {
    const responseItemHasChanged = this.props.responseItem !== nextProps.responseItem;
    const helpItemHasChanged = this.props.isHelpOpen !== nextProps.isHelpOpen;

    return responseItemHasChanged || helpItemHasChanged;
  }

  render(): JSX.Element | null {
    const { pdf, id, item, resources, onOpenAttachment, onRenderMarkdown, ...other } = this.props;
    if (pdf || isReadOnly(item)) {
      return (
        <TextView item={item} value={this.getPdfValue()} onRenderMarkdown={onRenderMarkdown}>
          {this.props.children}
        </TextView>
      );
    } else {
      return (
        <AttachmentHtml
          onUpload={this.onUpload}
          onDelete={this.onDelete}
          onOpen={onOpenAttachment}
          id={getId(id)}
          label={
            <span
              dangerouslySetInnerHTML={{
                __html: `${renderPrefix(item)} ${getText(item, onRenderMarkdown)}`,
              }}
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
          {...other}
        />
      );
    }
  }
}

const withCommonFunctionsComponent = withCommonFunctions(AttachmentComponent);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(withCommonFunctionsComponent);
export default connectedComponent;
