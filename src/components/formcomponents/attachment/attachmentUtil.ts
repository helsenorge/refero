import { QuestionnaireItem } from 'fhir/r4';

import { UploadFile } from '@helsenorge/file-upload/components/file-upload';

import constants from '@/constants';
import { getMaxSizeExtensionValue, getValidationTextExtension } from '@/util/extension';
import { Resources } from '@/util/resources';

export function convertMBToBytes(mb: number): number {
  if (typeof mb !== 'number' || isNaN(mb)) {
    throw new Error('Input must be a valid number.');
  }
  if (mb < 0) {
    throw new Error('Input cannot be a negative number.');
  }
  if (!isFinite(mb)) {
    throw new Error('Input must be a finite number.');
  }
  return Math.round(mb * 1024 * 1024);
}

export function convertBytesToMBString(bytes: number, precision: number = 0): string {
  return convertBytesToMB(bytes).toFixed(precision);
}

export function convertBytesToMB(bytes: number): number {
  if (typeof bytes !== 'number' || isNaN(bytes)) {
    throw new Error('Input must be a valid number.');
  }
  if (bytes < 0) {
    throw new Error('Input cannot be a negative number.');
  }
  if (!isFinite(bytes)) {
    throw new Error('Input must be a finite number.');
  }
  return bytes / 1024 / 1024;
}

export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

export function getAttachmentMaxSizeBytesToUse(defaultMaxProps: number | undefined): number {
  if (defaultMaxProps !== undefined) {
    return defaultMaxProps;
  }
  return constants.MAX_FILE_SIZE;
}
export function getAttachmentMaxSizePerFileBytesToUse(item?: QuestionnaireItem): number {
  if (item) {
    const questionnaireMaxRuleSizeMB = getMaxSizeExtensionValue(item);
    if (questionnaireMaxRuleSizeMB !== undefined) {
      return convertMBToBytes(questionnaireMaxRuleSizeMB);
    }
  }

  return constants.MAX_FILE_SIZE_PER_FILE;
}

export const validateRequired = (item?: QuestionnaireItem, resources?: Resources, files?: UploadFile[]): string | true => {
  const validationTextExtension = getValidationTextExtension(item);
  const filesLength = files?.length ?? 0;
  return item?.required && filesLength <= 0
    ? (validationTextExtension ?? resources?.formRequiredErrorMessage ?? 'Feltet er påkrevd')
    : true;
};
