import { MimeTypes } from '@helsenorge/file-upload/components/file-upload';

import codeSystems from './codingsystems';

export default {
  DATE_TIME_FORMAT: "yyyy-MM-dd'T'HH:mm:ssX",
  DATE_FORMAT: 'YYYY-MM-DD',
  DATE_SEPARATOR: '-',
  TIME_SEPARATOR: ':',
  DEFAULT_TEXTAREA_HEIGHT: 5,
  QUESTIONNAIRE_RESPONSE_RESOURCE_TYPE: 'QuestionnaireResponse',
  CHOICE_DROPDOWN_TRESHOLD: 6,
  DEFAULT_HEADER_TAG: 2,
  ITEM_TYPE_GROUP: 'group',
  MAX_FILE_SIZE: 25000000,
} as const;

export const VALID_FILE_TYPES: Array<MimeTypes> = ['image/jpeg', 'image/png', 'application/pdf'];

export const OPEN_CHOICE_ID = 'other' as const;
export const OPEN_CHOICE_SYSTEM = codeSystems.OpenChoice_system;
export const OPEN_CHOICE_LABEL = 'annet' as const;
export const NAVIGATOR_BLINDZONE_ID = 'navigator_blindzone' as const;
