import { QuestionnaireItem } from 'fhir/r4';

import { UploadFile } from '@helsenorge/file-upload/components/file-upload';

import { convertBytesToMBString } from './attachmentUtil';
import { getValidationTextExtension } from '../../../util/extension';

export const validateMinFiles = (
  files: UploadFile[],
  minFiles: number,
  item: QuestionnaireItem,
  errorMessage?: string,
  genericErrorText?: string
): string | true => {
  if (!minFiles || (files && files.length >= minFiles)) {
    return true;
  }
  if (getCustomValidationText(item, genericErrorText)) {
    return getCustomValidationText(item, genericErrorText);
  }
  return errorMessage ? errorMessage.replace('{0}', minFiles.toString()) : '';
};

export const validateMaxFiles = (
  files: UploadFile[],
  maxFiles: number,
  item: QuestionnaireItem,
  errorMessage?: string,
  genericErrorText?: string
): string | true => {
  if (!maxFiles || (files && files.length <= maxFiles)) {
    return true;
  }
  if (getCustomValidationText(item, genericErrorText)) {
    return getCustomValidationText(item, genericErrorText);
  }
  return errorMessage ? errorMessage.replace('{0}', maxFiles.toString()) : '';
};

export const validateFileSize = (
  file: UploadFile,
  maxSize: number,
  item: QuestionnaireItem,
  errorMessage?: string,
  genericErrorText?: string
): string | true => {
  if (sizeIsValid(file, maxSize)) {
    return true;
  }
  if (getCustomValidationText(item, genericErrorText)) {
    return getCustomValidationText(item, genericErrorText);
  }
  return errorMessage ? errorMessage.replace('{0}', convertBytesToMBString(maxSize)) : '';
};

export const validateFileType = (
  file: UploadFile,
  validTypes: string[],
  item: QuestionnaireItem,
  errorMessage?: string,
  genericErrorText?: string
): string | true => {
  if (mimeTypeIsValid(file, validTypes)) {
    return true;
  }
  if (getCustomValidationText(item, genericErrorText)) {
    return getCustomValidationText(item, genericErrorText);
  }
  return errorMessage ? errorMessage + ` ${validTypes.join(', ')}.` : '';
};

const mimeTypeIsValid = (file: UploadFile, validMimeTypes: Array<string>): boolean => {
  if (validMimeTypes.indexOf(file.type) < 0) {
    return false;
  }
  return true;
};

const sizeIsValid = (file: UploadFile, size: number): boolean => {
  if (file.size > size) {
    return false;
  }
  return true;
};

export const getCustomValidationText = (item: QuestionnaireItem, genericErrorText?: string): string => {
  const validationText = getValidationTextExtension(item);
  if (validationText) {
    return validationText;
  }

  if (genericErrorText) {
    return genericErrorText;
  }
  return '';
};
