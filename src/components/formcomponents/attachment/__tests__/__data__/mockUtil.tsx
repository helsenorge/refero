import { Questionnaire, QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';

import { QuestionnaireStatusCodes } from '../../../../../types/fhirEnums';

import { Resources } from '../../../../../util/resources';
import { vi } from 'vitest';
import { ReferoProps } from '@/types/referoProps';

const mockQuestionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  status: QuestionnaireStatusCodes.ACTIVE,
};

const mockQuestionnaireResponseMock: QuestionnaireResponseItem = {
  linkId: '',
};

export const mockMinFiles: number = 2;
export const mockMaxFiles: number = 2;
export const mockMaxSize: number = 1 * 1024 * 1024;
export const mockValidMimeTypes: string[] = ['image/jpeg', 'image/png'];

/** Mock Testing Enum */
export const MimeType_For_Test_Util = {
  PlainText: 'text/plain',
  HTML: 'text/html',
  CSV: 'text/csv',
  JPG: 'image/jpeg',
  PNG: 'image/png',
  GIF: 'image/gif',
  PDF: 'application/pdf',
  JSON: 'application/json',
};

/** Mock Testing Util method */
export function createMockFile(fileName: string, mimeType: string, size: number): File {
  // Initialize content with the specified size (the content itself doesn't matter for the mock)
  // const fileContent = new Array(size).fill('a').join('');
  const blob = new Blob(['a'], { type: mimeType });
  const lastModifiedDate = new Date();
  const mockFile = new File([blob], fileName, {
    type: mimeType,
    lastModified: lastModifiedDate.getTime(),
  });
  // Emulate the actual size (the size of the content may differ from the 'size' parameter due to encoding)
  Object.defineProperty(mockFile, 'size', {
    value: size,
    writable: false,
  });
  return mockFile;
}

/** Mock Testing Util method */
export function createMockAttachmentProps(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: QuestionnaireItem | any,
  partialResources: Partial<Resources>,
  attachmentMaxFileSize?: number,
  attachmentErrorMessage?: string,
  attachmentValidTypes?: string[]
): Partial<ReferoProps> {
  // Create a base mock with required and default properties.
  const mockProps: Partial<ReferoProps> = {
    dispatch: vi.fn(),
    path: [],
    item, // Required parameter
    questionnaire: mockQuestionnaire,
    responseItem: mockQuestionnaireResponseMock,
    answer: [],
    resources: partialResources as Resources,
    onAnswerChange: vi.fn(),
    // ... other props with their mock implementations
  };
  if (attachmentMaxFileSize !== undefined) {
    mockProps.attachmentMaxFileSize = attachmentMaxFileSize;
  }
  if (attachmentErrorMessage !== undefined) {
    mockProps.attachmentErrorMessage = attachmentErrorMessage;
  }
  if (attachmentValidTypes !== undefined) {
    mockProps.attachmentValidTypes = attachmentValidTypes;
  }
  return mockProps;
}

/** Mock Testing Util method */
export function createMockQuestionnaireItem(text: string, valueDecimal: number | undefined, includeExtension: boolean): QuestionnaireItem {
  const questionnaireItem: QuestionnaireItem = {
    linkId: '4c71df6e-d743-46ba-d81f-f62777ffddb4',
    type: 'attachment',
    text: text,
  };
  if (includeExtension) {
    questionnaireItem.extension = [
      {
        url: 'http://hl7.org/fhir/StructureDefinition/maxSize',
        valueDecimal: valueDecimal,
      },
    ];
  }
  return questionnaireItem;
}

/** Mock Testing Util method */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createMockQuestionnaireItemWithEmptyValue(text: string, valueDecimalEmpty: null | undefined) {
  const questionnaireItem = {
    linkId: '4c71df6e-d743-46ba-d81f-f62777ffddb4',
    type: 'attachment',
    text: text,
    extension: [
      {
        url: 'http://hl7.org/fhir/StructureDefinition/maxSize',
        valueDecimal: valueDecimalEmpty,
      },
    ],
  };
  return questionnaireItem;
}
