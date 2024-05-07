import { UploadFile } from '@helsenorge/file-upload/components/file-upload';
import { convertBytesToMBString, getFileExtension } from './attachmentUtil';

export const validateMinFiles = (files: UploadFile[], minFiles: number, errorMessage?: string): string | true => {
  if (!minFiles || (files && files.length >= minFiles)) {
    return true;
  }
  return errorMessage ? errorMessage.replace('{0}', minFiles.toString()) : '';
};

export const validateMaxFiles = (files: UploadFile[], maxFiles: number, errorMessage?: string): string | true => {
  if (!maxFiles || (files && files.length <= maxFiles)) {
    return true;
  }
  return errorMessage ? errorMessage.replace('{0}', maxFiles.toString()) : '';
};

export const validateFileSize = (file: UploadFile, maxSize: number, errorMessage?: string): string | true => {
  if (!maxSize || file.size <= maxSize) {
    return true;
  }
  return errorMessage ? errorMessage.replace('{0}', convertBytesToMBString(maxSize)) : '';
};

export const validateFileType = (file: UploadFile, validTypes: string[], errorMessage?: string): string | true => {
  if (validTypes.includes(getFileExtension(file.name).toLowerCase())) {
    return true;
  }
  return errorMessage ? errorMessage + ` ${validTypes.join(', ')}.` : '';
};

// function getErrorMessage(
//   validFileTypes: Array<string>,
//   maxFileSize: number,
//   maxFileSizeMBStringToReplace: string,
//   item: QuestionnaireItem,
//   genericErrorText?: string,
//   file?: File,
//   resources?: Resources
// ): string {
//   if (file && resources) {
//     if (!mimeTypeIsValid(file, validFileTypes)) {
//       return resources.validationFileType;
//     } else if (!sizeIsValid(file, maxFileSize)) {
//       return resources.validationFileMax.replace('{0}', maxFileSizeMBStringToReplace);
//     }
//   }

//   const validationText = getValidationTextExtension(item);
//   if (validationText) {
//     return validationText;
//   }

//   if (genericErrorText) {
//     return genericErrorText;
//   }
//   return '';
// }

export const mockMinFiles: number = 2;
export const mockMaxFiles: number = 2;
export const mockMaxSize: number = 1 * 1024 * 1024;
export const mockValidTypes: string[] = ['jpg', 'png'];
