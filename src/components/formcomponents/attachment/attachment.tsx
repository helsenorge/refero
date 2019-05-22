import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import withCommonFunctions from '../../with-common-functions';
import AttachmentHtml from './attachmenthtml';
import { UploadedFile } from '@helsenorge/toolkit/components/atoms/dropzone';
import { ValidationProps } from '@helsenorge/toolkit/components/molecules/form/validation';

import { Path } from '../../../util/skjemautfyller-core';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { isRequired, getId, renderPrefix, getText, isReadOnly } from '../../../util/index';
import { getValidationTextExtension } from '../../../util/extension';
import { QuestionnaireItem, QuestionnaireResponseAnswer, Attachment } from '../../../types/fhir';
import { Resources } from '../../../util/resources';
import TextView from '../textview';
import { newAttachment } from '../../../actions/newValue';
import { TextMessage } from '../../../types/text-message';

export interface Props {
  dispatch?: Dispatch<{}>;
  path: Array<Path>;
  item: QuestionnaireItem;
  answer: QuestionnaireResponseAnswer;
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
      const onSuccess = (uploadedFile: UploadedFile, attachment: Attachment) => {
        if (this.props.dispatch && attachment) {
          this.props.dispatch(newAttachment(this.props.path, attachment, this.props.item));
        }

        cb(true, null, uploadedFile);
      };

      const onError = (errorMessage: TextMessage | null) => {
        cb(false, errorMessage);
      };

      uploadAttachment(files, onSuccess, onError);
    }
  };

  onDelete = (cb: (success: boolean, errormessage: TextMessage | null) => void) => {
    const { answer, onDeleteAttachment } = this.props;

    if (onDeleteAttachment && answer && answer.valueAttachment && answer.valueAttachment.url) {
      const onSuccess = () => {
        if (this.props.dispatch) {
          this.props.dispatch(newAttachment(this.props.path, {} as Attachment, this.props.item));
        }

        cb(true, null);
      };
      const onError = (errormessage: TextMessage | null) => {
        cb(false, errormessage);
      };

      onDeleteAttachment(answer.valueAttachment.url, onSuccess, onError);
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

  getAttachment = (): UploadedFile | undefined => {
    const { answer } = this.props;
    let attachment: UploadedFile | undefined;
    if (answer && answer.valueAttachment && answer.valueAttachment.url) {
      attachment = {
        id: answer.valueAttachment.url,
        name: answer.valueAttachment.title ? answer.valueAttachment.title : '',
      };
    }
    return attachment;
  };

  getPdfValue = () => {
    let value = '';
    const attachment = this.getAttachment();
    if (attachment) {
      value = attachment.name;
    } else if (this.props.resources) {
      value = this.props.resources.ikkeBesvart;
    }
    return value;
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
          errorText={getValidationTextExtension(item)}
          uploadedFile={this.getAttachment()}
          renderDeleteButton={this.props.renderDeleteButton}
          repeatButton={this.props.repeatButton}
          onRequestAttachmentLink={this.props.onRequestAttachmentLink}
          helpButton={this.props.renderHelpButton()}
          helpElement={this.props.renderHelpElement()}
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
