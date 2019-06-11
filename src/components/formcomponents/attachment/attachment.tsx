import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import withCommonFunctions from '../../with-common-functions';
import AttachmentHtml from './attachmenthtml';
import { UploadedFile } from '@helsenorge/toolkit/components/atoms/dropzone';
import { ValidationProps } from '@helsenorge/toolkit/components/molecules/form/validation';

import { Path } from '../../../util/skjemautfyller-core';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { isRequired, getId, renderPrefix, getText, isReadOnly, isRepeat } from '../../../util/index';
import { getValidationTextExtension, getMaxOccursExtensionValue, getMinOccursExtensionValue } from '../../../util/extension';
import { QuestionnaireItem, QuestionnaireResponseAnswer, Attachment } from '../../../types/fhir';
import { Resources } from '../../../util/resources';
import TextView from '../textview';
import { newAttachment, removeAttachment } from '../../../actions/newValue';
import { TextMessage } from '../../../types/text-message';

export interface Props {
  dispatch?: Dispatch<{}>;
  path: Array<Path>;
  item: QuestionnaireItem;
  answer: Array<QuestionnaireResponseAnswer> | QuestionnaireResponseAnswer;
  pdf?: boolean;
  id?: string;
  resources?: Resources;
  renderDeleteButton: () => JSX.Element | undefined;
  repeatButton: JSX.Element;
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
}

class AttachmentComponent extends React.Component<Props & ValidationProps> {
  onUpload = (files: File[], cb: (success: boolean, errormessage: TextMessage | null, uploadedFile?: UploadedFile) => void) => {
    const { uploadAttachment } = this.props;
    if (uploadAttachment) {
      for (let file of files) {
        const onSuccess = (uploadedFile: UploadedFile, attachment: Attachment) => {
          if (this.props.dispatch && attachment) {
            this.props.dispatch(newAttachment(this.props.path, attachment, this.props.item, isRepeat(this.props.item)));
          }

          cb(true, null, uploadedFile);
        };

        const onError = (errorMessage: TextMessage | null) => {
          cb(false, errorMessage);
        };

        uploadAttachment([file], onSuccess, onError);
      }
    }
  };

  onDelete = (fileId: string, cb: (success: boolean, errormessage: TextMessage | null) => void) => {
    const { onDeleteAttachment } = this.props;

    if (onDeleteAttachment) {
      const onSuccess = () => {
        if (this.props.dispatch) {
          this.props.dispatch(removeAttachment(this.props.path, { url: fileId } as Attachment, this.props.item));
        }

        cb(true, null);
      };

      const onError = (errormessage: TextMessage | null) => {
        cb(false, errormessage);
      };

      onDeleteAttachment(fileId, onSuccess, onError);
    }
  };

  getButtonText = () => {
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
          name: v.valueAttachment && v.valueAttachment.title ? v.valueAttachment.title : ''
        } as UploadedFile
      })
    } else {
      if (answer && answer.valueAttachment && answer.valueAttachment.url) {
        return [{
          id: answer.valueAttachment.url,
          name: answer.valueAttachment.title ? answer.valueAttachment.title : '',
        } as UploadedFile];
      }
    }
    return [];
  };

  getPdfValue = () => {
    const attachments = this.getAttachment();
    if (attachments) {
      return attachments.map(v => v.name).join(", ");
    } else if (this.props.resources) {
      return this.props.resources.ikkeBesvart;
    }

    return '';
  };

  render(): JSX.Element | null {
    const { pdf, id, item, resources, onOpenAttachment, ...other } = this.props;
    if (pdf || isReadOnly(item)) {
      return <TextView item={item} value={this.getPdfValue()} children={this.props.children} />;
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
                __html: `${renderPrefix(item)} ${getText(item)}`,
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
          item={item}
          {...other}
        />
      );
    }
  }
}

const withCommonFunctionsComponent = withCommonFunctions(AttachmentComponent);
const connectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(withCommonFunctionsComponent);
export default connectedComponent;
