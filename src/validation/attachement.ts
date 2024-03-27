// import { QuestionnaireItem } from 'fhir/r4';
import { z } from 'zod';

// import { Resources } from '../types/resources';

import { MimeTypes } from '@helsenorge/file-upload/components/dropzone';

import { VALID_FILE_TYPES } from '../constants';
//item: QuestionnaireItem, resources: Resources
export const attachmentValidation = (): z.ZodTypeAny => {
  const schema = z
    .custom<FileList>()
    .transform(val => {
      if (val instanceof File) return val;
      if (val instanceof FileList) return val[0];
      return null;
    })
    .superRefine((file, ctx) => {
      if (!(file instanceof File)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          fatal: true,
          message: 'Not a file',
        });

        return z.NEVER;
      }

      if (file.size > 5 * 1024 * 1024) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Max file size allowed is 5MB',
        });
      }

      if (!VALID_FILE_TYPES.includes(file.type as MimeTypes)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'File must be an image (jpeg, jpg, png, webp)',
        });
      }
    })
    .pipe(z.custom<File>());
  return schema;
};
