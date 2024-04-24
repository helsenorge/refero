import * as React from 'react';

import { QuestionnaireItem } from 'fhir/r4';

import { TextMessage } from '../../../types/text-message';

import NotificationPanel from '@helsenorge/designsystem-react/components/NotificationPanel';

import Dropzone from '@helsenorge/file-upload/components/dropzone';
import { UploadedFile } from '@helsenorge/file-upload/components/dropzone';
import { sizeIsValid, mimeTypeIsValid } from '@helsenorge/file-upload/components/dropzone/validation';

import { convertBytesToMBString, convertMBToBytes } from './attachmentUtil';
import constants, { VALID_FILE_TYPES } from '../../../constants';
import { getMaxSizeExtensionValue, getValidationTextExtension } from '../../../util/extension';
import { Resources } from '../../../util/resources';
import { FormProps } from '../../../validation/ReactHookFormHoc';
import { mockMaxFiles, mockMaxSize, mockMinFiles, mockValidTypes, validateFileSize, validateFileType, validateMaxFiles, validateMinFiles } from './attachment-validation';

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

  helpButton?: JSX.Element;
  helpElement?: JSX.Element;
  register: FormProps['register'];
  setValue: FormProps['setValue'];
}

const attachmentHtml: React.SFC<Props> = ({
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
  register,
  setValue,
}) => {
  const getMaxValueBytes = getAttachmentMaxSizeBytesToUse(attachmentMaxFileSize, item);
  const getMaxValueMBToReplace = convertBytesToMBString(getMaxValueBytes);
  const validFileTypes = attachmentValidTypes ? attachmentValidTypes : VALID_FILE_TYPES;
  const deleteText = resources ? resources.deleteAttachmentText : undefined;

  const handleUpload = (files: File[], cb: (success: boolean, errormessage: TextMessage | null, uploadedFile?: UploadedFile) => void) => {
    const response: UploadedFile[] = files.map(file => ({
      id: Math.random().toString(),
      name: file.name,
      size: file.size,
      type: file.type,
    }));

    cb(true, null, response[0]);

    setValue(item.linkId, response, { shouldValidate: true });
  };

  return (
    <div className="page_refero__component page_refero__component_attachment">
      <Dropzone
        {...register(item.linkId, {
          required: {
            value: !!isRequired,
            message: 'Dette feltet er påkrevd',
          },
          validate: {
            minFiles: files => files.length ? validateMinFiles(files, mockMinFiles) : true,
            maxFiles: files => files.length ? validateMaxFiles(files, mockMaxFiles) : true,
            fileSize: (files: File[]) => files.length ? validateFileSize(files, mockMaxSize) : true,
            fileType: (files: File[]) => files.length ? validateFileType(files, mockValidTypes) : true,
          },
        })}
        id={id}
        label={label}
        subLabel={subLabel}
        onDrop={handleUpload}
        onDelete={onDelete}
        onOpenFile={onOpen}
        uploadButtonText={uploadButtonText}
        uploadedFiles={uploadedFiles}
        maxFileSize={getMaxValueBytes}
        validMimeTypes={validFileTypes}
        dontShowHardcodedText={!!deleteText}
        deleteText={deleteText}
        supportedFileFormatsText={resources ? resources.supportedFileFormats : undefined}
        errorMessage={(file: File): string => {
          return getErrorMessage(validFileTypes, getMaxValueBytes, getMaxValueMBToReplace, item, errorText, file, resources);
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

export function getAttachmentMaxSizeBytesToUse(defaultMaxProps: number | undefined, item: QuestionnaireItem): number {
  if (item) {
    const questionnaireMaxRuleSizeMB = getMaxSizeExtensionValue(item);
    if (questionnaireMaxRuleSizeMB !== undefined) {
      return convertMBToBytes(questionnaireMaxRuleSizeMB);
    }
  }
  if (defaultMaxProps !== undefined) {
    return defaultMaxProps;
  }
  return constants.MAX_FILE_SIZE;
}

function getErrorMessage(
  validFileTypes: Array<string>,
  maxFileSize: number,
  maxFileSizeMBStringToReplace: string,
  item: QuestionnaireItem,
  genericErrorText?: string,
  file?: File,
  resources?: Resources
): string {
  if (file && resources) {
    if (!mimeTypeIsValid(file, validFileTypes)) {
      return resources.validationFileType;
    } else if (!sizeIsValid(file, maxFileSize)) {
      return resources.validationFileMax.replace('{0}', maxFileSizeMBStringToReplace);
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
