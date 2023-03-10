import { MimeTypes } from '@helsenorge/file-upload/components/dropzone';

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

export const OPEN_CHOICE_ID: string = 'other';
export const OPEN_CHOICE_SYSTEM: string = 'http://helsenorge.no/fhir/CodeSystem/open-choice';
export const OPEN_CHOICE_LABEL: string = 'annet';
export const NAVIGATOR_BLINDZONE_ID: string = 'navigator_blindzone'

