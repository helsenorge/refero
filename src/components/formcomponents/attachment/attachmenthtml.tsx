import * as React from 'react';
import constants, { VALID_FILE_TYPES } from '../../../constants';
import { Resources } from '../../../util/resources';
import Dropzone, { MimeTypes } from '@helsenorge/toolkit/components/atoms/dropzone';
import Validation, { ValidationProps } from '@helsenorge/toolkit/components/molecules/form/validation';
import { typeIsValid, sizeIsValid } from '@helsenorge/toolkit/components/atoms/dropzone/validation';
import { UploadedFile } from '@helsenorge/toolkit/components/atoms/dropzone';
import { TextMessage } from '../../../types/text-message';

interface Props {
  onUpload: (files: Array<File>, cb: (success: boolean, errormessage: TextMessage | null, uploadedFile?: UploadedFile) => void) => void;
  onDelete: (cb: (success: boolean, errormessage: TextMessage | null) => void) => void;
  onOpen?: (fileId: string) => void;
  uploadButtonText: string;
  label: string | JSX.Element;
  id: string;
  getComponentToValidate?: (el: Dropzone) => void;
  resources?: Resources;
  isRequired?: boolean;
  errorText?: string;
  uploadedFile: UploadedFile | undefined;
  renderDeleteButton: (className?: string) => JSX.Element | undefined;
  onRequestAttachmentLink?: (file: string) => string;
  repeatButton: JSX.Element;

  helpButton?: JSX.Element;
  helpElement?: JSX.Element;
  isHelpVisible?: boolean;
}

const attachmentHtml: React.SFC<Props & ValidationProps> = ({
  id,
  onUpload,
  onDelete,
  onOpen,
  uploadButtonText,
  label,
  resources,
  isRequired,
  errorText,
  uploadedFile,
  renderDeleteButton,
  repeatButton,
  onRequestAttachmentLink,
  helpButton,
  helpElement,
  isHelpVisible,
  ...other
}) => {
  return (
    <div className="page_skjemautfyller__component page_skjemautfyller__component_attachment">
      <Validation {...other}>
        <Dropzone
          id={id}
          label={label}
          onDrop={onUpload}
          onDelete={onDelete}
          onOpenFile={onOpen}
          uploadButtonText={uploadButtonText}
          uploadedFile={uploadedFile}
          maxFileSize={constants.MAX_FILE_SIZE}
          validFileTypes={VALID_FILE_TYPES}
          supportedFileFormatsText={resources ? resources.supportedFileFormats : undefined}
          errorMessage={file => {
            return getErrorMessage(VALID_FILE_TYPES, constants.MAX_FILE_SIZE, errorText, file, resources);
          }}
          isRequired={isRequired}
          wrapperClasses="page_skjemautfyller__input"
          onRequestLink={onRequestAttachmentLink}
          helpButton={helpButton}
          helpElement={helpElement}
          isHelpVisible={isHelpVisible}
        />
      </Validation>
      {renderDeleteButton('page_skjemautfyller__deletebutton--margin-top')}
      {repeatButton}
    </div>
  );
};

function getErrorMessage(
  validFileTypes: Array<MimeTypes>,
  maxFileSize: number,
  genericErrorText?: string,
  file?: File,
  resources?: Resources
) {
  if (file && resources) {
    if (!typeIsValid(file, validFileTypes)) {
      return resources.validationFileType;
    } else if (!sizeIsValid(file, maxFileSize)) {
      return resources.validationFileMax;
    }
  }
  if (genericErrorText) {
    return genericErrorText;
  }
  return '';
}

export default attachmentHtml;
