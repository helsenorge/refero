import { MimeTypes } from '@helsenorge/toolkit/components/atoms/dropzone';

export default {
  DATE_TIME_FORMAT: 'YYYY-MM-DDTHH:mm:ssZ',
  DATE_FORMAT: 'YYYY-MM-DD',
  DATE_SEPARATOR: '-',
  TIME_SEPARATOR: ':',
  DEFAULT_TEXTAREA_HEIGHT: 5,
  QUESTIONNAIRE_RESPONSE_RESOURCE_TYPE: 'QuestionnaireResponse',
  CHOICE_DROPDOWN_TRESHOLD: 6,
  DEFAULT_HEADER_TAG: 2,
  ITEM_TYPE_GROUP: 'group',
  MAX_FILE_SIZE: 25000000,
};

export const VALID_FILE_TYPES: Array<MimeTypes> = ['image/jpeg', 'image/png', 'application/pdf'];
