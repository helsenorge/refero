import * as React from 'react';

import { QuestionnaireItem } from 'fhir/r4';
import { useFormContext } from 'react-hook-form';

import { Resources } from '../../../types/resources';
import { TextMessage } from '../../../types/text-message';

import NotificationPanel from '@helsenorge/designsystem-react/components/NotificationPanel';
// import Validation from '@helsenorge/designsystem-react/components/Validation';

import Dropzone from '@helsenorge/file-upload/components/dropzone';
import { UploadedFile } from '@helsenorge/file-upload/components/dropzone';
import { sizeIsValid, mimeTypeIsValid } from '@helsenorge/file-upload/components/dropzone/validation';

import constants, { VALID_FILE_TYPES } from '../../../constants';
import { getId } from '../../../util';
import { getValidationTextExtension } from '../../../util/extension';

interface Props {
  onUpload: (files: Array<File>, cb: (success: boolean, errormessage: TextMessage | null, uploadedFile?: UploadedFile) => void) => void;
  onDelete: (fileId: string, cb: (success: boolean, errormessage: TextMessage | null) => void) => void;
  onOpen?: (fileId: string) => void;
  uploadButtonText: string;
  label: string | JSX.Element;
  subLabel?: string | JSX.Element;
  id: string;
  attachmentErrorMessage?: string;
  getComponentToValidate?: (el: Dropzone) => void;
  resources?: Resources;
  isRequired?: boolean;
  multiple?: boolean;
  errorText?: string;
  uploadedFiles: UploadedFile[] | undefined;
  onRequestAttachmentLink?: (file: string) => string;
  maxFiles?: number;
  minFiles?: number;
  item: QuestionnaireItem;
  attachmentMaxFileSize?: number;
  attachmentValidTypes?: Array<string>;
  children?: React.ReactNode;
  helpButton?: JSX.Element;
  helpElement?: JSX.Element;
}

const attachmentHtml = ({
  id,
  onUpload,
  onDelete,
  onOpen,
  uploadButtonText,
  label,
  subLabel,
  resources,
  isRequired,
  errorText,
  uploadedFiles,
  onRequestAttachmentLink,
  attachmentErrorMessage,
  helpButton,
  helpElement,
  multiple,
  maxFiles,
  attachmentMaxFileSize,
  attachmentValidTypes,
  minFiles,
  item,
  children,
}: Props): JSX.Element => {
  const { register } = useFormContext();
  const maxFilesize = attachmentMaxFileSize ? attachmentMaxFileSize : constants.MAX_FILE_SIZE;
  const validFileTypes = attachmentValidTypes ? attachmentValidTypes : VALID_FILE_TYPES;
  const deleteText = resources ? resources.deleteAttachmentText : undefined;

  return (
    <div className="page_refero__component page_refero__component_attachment">
      <Dropzone
        {...register(getId(item.linkId))}
        id={id}
        label={label}
        subLabel={subLabel}
        onDrop={onUpload}
        onDelete={onDelete}
        onOpenFile={onOpen}
        uploadButtonText={uploadButtonText}
        uploadedFiles={uploadedFiles}
        maxFileSize={maxFilesize}
        validMimeTypes={validFileTypes}
        dontShowHardcodedText={!!deleteText}
        deleteText={deleteText}
        supportedFileFormatsText={resources ? resources.supportedFileFormats : undefined}
        errorMessage={(file: File): string => {
          return getErrorMessage(validFileTypes, maxFilesize, item, errorText, file, resources);
        }}
        isRequired={isRequired}
        wrapperClasses="page_refero__input"
        onRequestLink={onRequestAttachmentLink}
        helpButton={helpButton}
        helpElement={helpElement}
        shouldUploadMultiple={multiple}
        maxFiles={maxFiles}
        minFiles={minFiles}
        chooseFilesText={resources?.chooseFilesText}
      />
      {attachmentErrorMessage && <NotificationPanel variant="alert">{attachmentErrorMessage}</NotificationPanel>}
      {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
    </div>
  );
};

function getErrorMessage(
  validFileTypes: Array<string>,
  maxFileSize: number,
  item: QuestionnaireItem,
  genericErrorText?: string,
  file?: File,
  resources?: Resources
): string {
  if (file && resources) {
    if (!mimeTypeIsValid(file, validFileTypes)) {
      return resources.validationFileType;
    } else if (!sizeIsValid(file, maxFileSize)) {
      return resources.validationFileMax;
    }
  }

  const validationText = getValidationTextExtension(item);
  if (validationText) {
    return validationText;
  }

  if (genericErrorText) {
    return genericErrorText;
  }
  return '';
}

export default attachmentHtml;
