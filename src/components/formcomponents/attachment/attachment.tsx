import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import withCommonFunctions from '../../with-common-functions';
import AttachmentHtml from './attachmenthtml';
import { UploadedFile, TextMessage } from '@helsenorge/toolkit/components/atoms/dropzone';
import { ValidationProps } from '@helsenorge/toolkit/components/molecules/form/validation';

import { selectComponent, mergeProps, mapDispatchToProps, Path } from '../../../util/skjemautfyller-core';
import { isRequired, getId, renderPrefix, getText, isReadOnly } from '../../../util/index';
import { getValidationTextExtension } from '../../../util/extension';
import { log } from '@helsenorge/toolkit/utils/logger';
import { QuestionnaireItem, QuestionnaireResponseAnswer } from '../../../types/fhir';
import { Resources } from '../../../../npm/types/Resources';
import TextView from '../textview';
interface Props {
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
    itemPath: Array<Path>,
    files: File[],
    item: QuestionnaireItem | undefined,
    cb: (success: boolean, errormessage: TextMessage | null, uploadedFile?: UploadedFile) => void
  ) => void;
  onDeleteAttachment?: (
    itemPath: Array<Path>,
    item: QuestionnaireItem | undefined,
    fileId: string,
    cb: (success: boolean, errorMessage: TextMessage | null) => void
  ) => void;
  onOpenAttachment?: (fileId: string) => void;
  onRequestAttachmentLink?: (file: string) => string;
}

class Attachment extends React.Component<Props & ValidationProps> {
  onUpload = (files: File[], cb: (success: boolean, errormessage: TextMessage | null) => void) => {
    log(files);
    const { uploadAttachment } = this.props;
    if (uploadAttachment) {
      uploadAttachment(this.props.path, files, this.props.item, cb);
    }
  };

  onDelete = (cb: (success: boolean, errormessage: TextMessage | null) => void) => {
    const { answer, onDeleteAttachment } = this.props;

    if (onDeleteAttachment && answer && answer.valueAttachment && answer.valueAttachment.url) {
      onDeleteAttachment(this.props.path, this.props.item, answer.valueAttachment.url, cb);
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
          {...other}
        />
      );
    }
  }
}

const withCommonFunctionsComponent = withCommonFunctions(Attachment);
const connectedComponent = connect(selectComponent, mapDispatchToProps, mergeProps)(withCommonFunctionsComponent);
export default connectedComponent;
