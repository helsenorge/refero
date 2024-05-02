import { UploadFile } from '@helsenorge/file-upload/components/file-upload';
import { convertBytesToMBString, getFileExtension } from './attachmentUtil';

// export const validateMinFiles = (files: UploadFile, minFiles: number): true | string => {
//   // return !minFiles || (files && files.length >= minFiles) || `Legg til minst ${minFiles} filer`;
//   return 'skjerp deg';
// };
// export const validateMaxFiles = (files: UploadFile, maxFiles: number): true | string => {
//   // return !maxFiles || (files && files.length <= maxFiles) || `Max ${maxFiles} filer er tillat`;
//   return 'skjerp deg 2';
// };
export const validateFileSize = (file: UploadFile, maxSize: number): true | string => {
  return !maxSize || file.size <= maxSize || `Filstørrelsen må være mindre enn ${convertBytesToMBString(maxSize)} MB.`;
};
export const validateFileType = (file: UploadFile, validTypes: string[]): true | string => {
  return validTypes.includes(getFileExtension(file.name).toLowerCase()) || `Filtypen må være ${validTypes.join(', ')}.`;
};

export const mockMinFiles: number = 1;
export const mockMaxFiles: number = 2;
export const mockMaxSize: number = 1 * 1024 * 1024;
export const mockValidTypes: string[] = ['jpg', 'png'];
