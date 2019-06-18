import * as React from 'react';
import constants, { VALID_FILE_TYPES } from '../../../constants';
import { Resources } from '../../../util/resources';
import MultiDropzone from '@helsenorge/toolkit/components/atoms/multi-dropzone';
import Validation, { ValidationProps } from '@helsenorge/toolkit/components/molecules/form/validation';
import { sizeIsValid, mimeTypeIsValid } from '@helsenorge/toolkit/components/atoms/dropzone/validation';
import { UploadedFile } from '@helsenorge/toolkit/components/atoms/dropzone';
import { TextMessage } from '../../../types/text-message';
import { QuestionnaireItem } from '../../../types/fhir';
import { getValidationTextExtension } from '../../../util/extension';

interface Props {
  onUpload: (files: Array<File>, cb: (success: boolean, errormessage: TextMessage | null, uploadedFile?: UploadedFile) => void) => void;
  onDelete: (fileId: string, cb: (success: boolean, errormessage: TextMessage | null) => void) => void;
  onOpen?: (fileId: string) => void;
  uploadButtonText: string;
  label: string | JSX.Element;
  id: string;
  getComponentToValidate?: (el: MultiDropzone) => void;
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

  helpButton?: JSX.Element;
  helpElement?: JSX.Element;
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
  uploadedFiles,
  onRequestAttachmentLink,
  helpButton,
  helpElement,
  multiple,
  maxFiles,
  attachmentMaxFileSize,
  attachmentValidTypes,
  minFiles,
  item,
  ...other
}) => {
  const maxFilesize = attachmentMaxFileSize ? attachmentMaxFileSize : constants.MAX_FILE_SIZE;
  const validFileTypes = attachmentValidTypes ? attachmentValidTypes : VALID_FILE_TYPES;

  return (
    <div className="page_skjemautfyller__component page_skjemautfyller__component_attachment">
      <Validation {...other}>
        <MultiDropzone
          id={id}
          label={label}
          onDrop={onUpload}
          onDelete={onDelete}
          onOpenFile={onOpen}
          uploadButtonText={uploadButtonText}
          uploadedFiles={uploadedFiles}
          maxFileSize={maxFilesize}
          validMimeTypes={validFileTypes}
          supportedFileFormatsText={resources ? resources.supportedFileFormats : undefined}
          errorMessage={file => {
            return getErrorMessage(validFileTypes, maxFilesize, item, errorText, file, resources);
          }}
          isRequired={isRequired}
          wrapperClasses="page_skjemautfyller__input"
          onRequestLink={onRequestAttachmentLink}
          helpButton={helpButton}
          helpElement={helpElement}
          multiple={multiple}
          maxFiles={maxFiles}
          minFiles={minFiles}
        />
      </Validation>
    </div>
  );
};

function getErrorMessage(
  validFileTypes: Array<string>,
  maxFileSize: number,
  item: QuestionnaireItem,
  genericErrorText?: string,
  file?: File,
  resources?: Resources,
) {
  if (file && resources) {
    if (!mimeTypeIsValid(file, validFileTypes)) {
      return resources.validationFileType;
    } else if (!sizeIsValid(file, maxFileSize)) {
      return resources.validationFileMax;
    }
  }

  let validationText = getValidationTextExtension(item);
  if (validationText) {
    return validationText;
  }

  if (genericErrorText) {
    return genericErrorText;
  }
  return '';
}

export default attachmentHtml;
