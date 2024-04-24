import { convertBytesToMBString, getFileExtension } from './attachmentUtil';

export const validateMinFiles = (files: File[], minFiles: number): boolean | string => {
  return !minFiles || (files && files.length >= minFiles) || `Minst ${minFiles} filer er påkrevd`;
};
export const validateMaxFiles = (files: File[], maxFiles: number): boolean | string => {
  return !maxFiles || (files && files.length <= maxFiles) || `Max ${maxFiles} filer er tillat`;
};
export const validateFileSize = (files: File[], maxSize: number): boolean | string => {
  return (
    !maxSize ||
    (files.length && files.every(file => file.size <= maxSize)) ||
    `Filen overstiger maxstørrelse. Maxstørrelse er: ${convertBytesToMBString(maxSize)} MB.`
  );
};
export const validateFileType = (files: File[], validTypes: string[]): boolean | string => {
  return (
    (files.length && files.every(file => validTypes.includes(getFileExtension(file.name).toLowerCase()))) ||
    `Ugyldig filtype. Tillate filtyper er: ${validTypes.join(', ')}.`
  );
};

export const mockMinFiles: number = 1;
export const mockMaxFiles: number = 2;
export const mockMaxSize: number = 1 * 1024 * 1024;
export const mockValidTypes: string[] = ['jpg', 'png'];
