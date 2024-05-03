import * as React from 'react';

import { QuestionnaireItem } from 'fhir/r4';
import { Controller, FieldValues, UseFormRegister, useFormContext } from 'react-hook-form';
import { FieldError } from 'react-hook-form';

import { TextMessage } from '../../../types/text-message';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';
import NotificationPanel from '@helsenorge/designsystem-react/components/NotificationPanel';

import Dropzone from '@helsenorge/file-upload/components/dropzone';
import { UploadedFile } from '@helsenorge/file-upload/components/dropzone';
import { sizeIsValid, mimeTypeIsValid } from '@helsenorge/file-upload/components/dropzone/validation';
import FileUpload, { UploadFile } from '@helsenorge/file-upload/components/file-upload';
import { useFileUpload } from '@helsenorge/file-upload/components/file-upload/useFileUpload';

import {
  mockMaxFiles,
  mockMaxSize,
  mockMinFiles,
  mockValidTypes,
  validateFileSize,
  validateFileType,
  validateMaxFiles,
  validateMinFiles,
  // validateMaxFiles,
  // validateMinFiles,
} from './attachment-validation';
import { convertBytesToMBString, convertMBToBytes } from './attachmentUtil';
import constants, { VALID_FILE_TYPES } from '../../../constants';
import { getMaxSizeExtensionValue, getValidationTextExtension } from '../../../util/extension';
import { Resources } from '../../../util/resources';
import { FormProps } from '../../../validation/ReactHookFormHoc';

interface Props {
  onUpload: (files: UploadFile[]) => void;
  onDelete: (fileId: string) => void;
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
  error?: FieldError;
  resetField: FormProps['resetField'];
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
  setValue,
  error,
  resetField,
  ...rest
}) => {
  const getMaxValueBytes = getAttachmentMaxSizeBytesToUse(attachmentMaxFileSize, item);
  const getMaxValueMBToReplace = convertBytesToMBString(getMaxValueBytes);
  const validFileTypes = attachmentValidTypes ? attachmentValidTypes : VALID_FILE_TYPES;
  const deleteText = resources ? resources.deleteAttachmentText : undefined;

  const registerInterceptor: UseFormRegister<FieldValues> = (ref, rules) => {
    const newRules = { ...rules, required: { value: !!isRequired, message: errorText || 'IKKE NOE MER!' } };
    return rest.register(ref, newRules);
  };

  const { register, acceptedFiles, rejectedFiles, setAcceptedFiles, setRejectedFiles } = useFileUpload(registerInterceptor, [
    // file => (file ? validateMinFiles(file, mockMinFiles) : true),
    // file => (file ? validateMaxFiles(file, mockMaxFiles) : true),
    (file): true | string => (file ? validateFileSize(file, mockMaxSize) : true),
    (file): true | string => (file ? validateFileType(file, mockValidTypes) : true),
  ]);

  const handleUpload = (files: UploadFile[]): void => {
    //oppdater redux
    onUpload(files);
    //oppdater react hook form
    // setValue(item.linkId, files[0], { shouldValidate: true });
  };

  const handleDelete = (fileId: string): void => {
    //oppdater redux
    onDelete(fileId);
    //oppdater react hook form
    resetField(item.linkId);

    setAcceptedFiles(acceptedFiles.filter(x => x.id !== fileId));
    setRejectedFiles(acceptedFiles.filter(x => x.id !== fileId));
  };

  const concatErrorMessages = (): string => {
    return error?.types ? Object.values(error.types).join('. ') : '';
  };

  return (
    <div className="page_refero__component page_refero__component_attachment">
      <FormGroup error={concatErrorMessages()}>
        <FileUpload
          {...register(item.linkId, {
            validate: () => true,
          })}
          inputId={id}
          onChangeFile={handleUpload}
          onDeleteFile={handleDelete}
          chooseFilesText={resources?.chooseFilesText}
          label={
            <Label
              labelTexts={[{ text: label as string, type: 'semibold' }]}
              sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabel as string, type: 'normal' }]} />}
            />
          }
          deleteText={deleteText}
          acceptedFiles={acceptedFiles}
          rejectedFiles={rejectedFiles}
          helpElement={helpElement}
          onOpenFile={onOpen}
        />
        {attachmentErrorMessage && <NotificationPanel variant="alert">{attachmentErrorMessage}</NotificationPanel>}
        {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
      </FormGroup>
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

{
  /* <Dropzone
  uploadedFiles={uploadedFiles}
  validMimeTypes={validFileTypes}
  supportedFileFormatsText={resources ? resources.supportedFileFormats : undefined}
  onRequestLink={onRequestAttachmentLink}
  helpButton={helpButton}
  shouldUploadMultiple={multiple}
  errorMessage={(file: File): string => {
    return getErrorMessage(validFileTypes, getMaxValueBytes, getMaxValueMBToReplace, item, errorText, file, resources);
  }}
  wrapperClasses="page_refero__input"
/> */
}
