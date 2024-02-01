import * as React from 'react';

import { Matcher, render, screen } from '@testing-library/react';

import userEvent from '@testing-library/user-event';

import '@testing-library/jest-dom';

import {
  MimeType_For_Test_Util as MIME_TYPES_TEST,
  createMockAttachmentProps,
  createMockFile,
  createMockQuestionnaireItem,
  createMockQuestionnaireItemWithEmptyValue,
} from '../mockUtil';
import { Resources } from '../../../../util/resources';
import { convertBytesToMBString, convertMBToBytes } from '../attachmentUtil';
import constants from '../../../../constants';
import { AttachmentComponent } from '../attachment';

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // Deprecated but included for compatibility
      removeListener: jest.fn(), // Deprecated but included for compatibility
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

const mockFileTooLarge = 'Filstørrelsen må være mindre enn {0} MB';
const wrongFileTypeMsg = 'Feil filtype';
const mockFileName = 'testFile.txt';
const defaulMockSize = 3;
const qItemMockName = 'qItem';
const PLAIN_TEXT_3_MB = createMockFile(mockFileName, MIME_TYPES_TEST.PlainText, convertMBToBytes(defaulMockSize));
const PLAIN_TEXT_4_MB = createMockFile(mockFileName, MIME_TYPES_TEST.PlainText, convertMBToBytes(4));
const PLAIN_TEXT_5_MB = createMockFile(mockFileName, MIME_TYPES_TEST.PlainText, convertMBToBytes(5));
const JPEG_5_MB = createMockFile(mockFileName, MIME_TYPES_TEST.JPG, convertMBToBytes(5));
const PLAIN_TEXT_6_MB = createMockFile(mockFileName, MIME_TYPES_TEST.PlainText, convertMBToBytes(6));
const PLAIN_TEXT_30_MB = createMockFile(mockFileName, MIME_TYPES_TEST.PlainText, convertMBToBytes(30));

const mockResources: Partial<Resources> = {
  validationFileMax: mockFileTooLarge,
  validationFileType: wrongFileTypeMsg,
};

const expectReplacedFileSizeError = (number: any) => {
  const resourceStringWithNumber = mockFileTooLarge.replace('{0}', number);
  expect(screen.getByText(resourceStringWithNumber)).toBeInTheDocument();
};

async function uploadMockFile(mockFile: File | File[], label = 'Last opp fil') {
  const input = screen.getByLabelText(label);
  await userEvent.upload(input, mockFile);
}

export const expectNotToFindByText = (text: Matcher) => {
  expect(screen.queryByText(text)).toBeNull();
};

function expectNoFileErrors() {
  expect(screen.queryByText(wrongFileTypeMsg)).toBe(null);
  expect(screen.queryByText(mockFileTooLarge)).toBe(null);
}

describe('<AttachmentComponent />', () => {
  describe('File Type validation', () => {
    it('When uploading a file - Show error if mime type is NOT among valid types', async () => {
      const qItem = createMockQuestionnaireItem(qItemMockName, undefined, true);
      const validTypes = [MIME_TYPES_TEST.PNG, MIME_TYPES_TEST.JPG, MIME_TYPES_TEST.PDF];
      const mockProps = createMockAttachmentProps(qItem, mockResources, undefined, undefined, validTypes);
      render(<AttachmentComponent {...mockProps} />);
      await uploadMockFile(PLAIN_TEXT_3_MB);
      expect(screen.getByText(wrongFileTypeMsg)).toBeInTheDocument();
    });

    it('When uploading a file - Do NOT show error file type error message when valid mime', async () => {
      const qItem = createMockQuestionnaireItem(qItemMockName, undefined, false);
      const validTypes = [MIME_TYPES_TEST.PNG, MIME_TYPES_TEST.JPG, MIME_TYPES_TEST.PDF, MIME_TYPES_TEST.PlainText];
      const mockProps = createMockAttachmentProps(qItem, mockResources, undefined, undefined, validTypes);
      render(<AttachmentComponent {...mockProps} />);
      await uploadMockFile(PLAIN_TEXT_3_MB);
      expectNotToFindByText(wrongFileTypeMsg);
    });
  });

  describe('File Size validation - Questionnaire Extension', () => {
    it('When uploading a file - Show resource size error if size > max rule in qItem', async () => {
      const qItem = createMockQuestionnaireItem(qItemMockName, 5, true);
      const validTypes = [MIME_TYPES_TEST.PlainText];
      const mockProps = createMockAttachmentProps(qItem, mockResources, undefined, undefined, validTypes);
      render(<AttachmentComponent {...mockProps} />);

      await uploadMockFile(PLAIN_TEXT_6_MB);

      screen.debug(undefined, 6000000);
      expectReplacedFileSizeError(5);
      expectNotToFindByText(wrongFileTypeMsg);
    });

    it('When uploading a file - Do NOT show resource size error if size <= max rule in qItem', async () => {
      const qItem = createMockQuestionnaireItem(qItemMockName, 5, true);
      const validTypes = [MIME_TYPES_TEST.PlainText];
      const mockProps = createMockAttachmentProps(qItem, mockResources, undefined, undefined, validTypes);
      render(<AttachmentComponent {...mockProps} />);
      await uploadMockFile(PLAIN_TEXT_4_MB);
      expectNoFileErrors();
    });

    it('When uploading a file - Do NOT show resource size error if file size excactly max rule from qItem', async () => {
      const qItem = createMockQuestionnaireItem(qItemMockName, 5, true);
      const validTypes = [MIME_TYPES_TEST.PlainText];
      const mockProps = createMockAttachmentProps(qItem, mockResources, undefined, undefined, validTypes);
      render(<AttachmentComponent {...mockProps} />);
      await uploadMockFile(PLAIN_TEXT_5_MB);
      expectNoFileErrors();
    });

    it('When uploading a file - And not set Questionnaire item max rule will be read as null and should be skipped', async () => {
      const qItem = createMockQuestionnaireItemWithEmptyValue('test', null);
      const validTypes = [MIME_TYPES_TEST.PlainText];
      const mockProps = createMockAttachmentProps(qItem, mockResources, convertMBToBytes(4), undefined, validTypes);
      render(<AttachmentComponent {...mockProps} />);
      await uploadMockFile(PLAIN_TEXT_5_MB);
      expectReplacedFileSizeError(4);
    });

    it('When uploading a file - And not set Questionnaire item max rule with undefined value should be skipped', async () => {
      const qItem = createMockQuestionnaireItemWithEmptyValue('test', undefined);
      const validTypes = [MIME_TYPES_TEST.PlainText];
      const mockProps = createMockAttachmentProps(qItem, mockResources, convertMBToBytes(4), undefined, validTypes);
      render(<AttachmentComponent {...mockProps} />);
      await uploadMockFile(PLAIN_TEXT_5_MB);
      expectReplacedFileSizeError(4);
    });
  });

  describe('File Size validation - Max Setttings From Props', () => {
    it('When uploading a file - Show resource size error if filesize > Props Max', async () => {
      const qItem = createMockQuestionnaireItem(qItemMockName, undefined, false);
      const validTypes = [MIME_TYPES_TEST.PlainText];
      const mockProps = createMockAttachmentProps(qItem, mockResources, convertMBToBytes(5), undefined, validTypes);
      render(<AttachmentComponent {...mockProps} />);
      await uploadMockFile(PLAIN_TEXT_6_MB);
      expectReplacedFileSizeError(5);
      expectNotToFindByText(wrongFileTypeMsg);
    });

    it('When uploading a file - Do NOT show size error message - when file size excatly == props max value', async () => {
      const qItem = createMockQuestionnaireItem(qItemMockName, undefined, false);
      const validTypes = [MIME_TYPES_TEST.PlainText];
      const mockProps = createMockAttachmentProps(qItem, mockResources, convertMBToBytes(4), undefined, validTypes);
      render(<AttachmentComponent {...mockProps} />);
      await uploadMockFile(PLAIN_TEXT_4_MB);
      expectNoFileErrors();
    });

    it('When uploading a file - Do NOT show resource size error if size == excactly props max value', async () => {
      const qItem = createMockQuestionnaireItem(qItemMockName, undefined, false);
      const validTypes = [MIME_TYPES_TEST.PlainText];
      const mockProps = createMockAttachmentProps(qItem, mockResources, convertMBToBytes(5), undefined, validTypes);
      render(<AttachmentComponent {...mockProps} />);
      await uploadMockFile(PLAIN_TEXT_5_MB);
      expectNoFileErrors();
    });
  });

  describe('File validation - Prioritiy of rules', () => {
    it('When uploading a file - File type errors should have priority over other errors', async () => {
      const qItem = createMockQuestionnaireItem(qItemMockName, 2, true);
      const validTypes = [MIME_TYPES_TEST.PlainText];
      const mockProps = createMockAttachmentProps(qItem, mockResources, convertMBToBytes(4), undefined, validTypes);
      render(<AttachmentComponent {...mockProps} />);
      await uploadMockFile(JPEG_5_MB);
      expect(screen.getByText(wrongFileTypeMsg)).toBeInTheDocument();
    });

    it('When uploading a file - Questionniare Item Max Rule has priority over props if both set', async () => {
      const qItem = createMockQuestionnaireItem(qItemMockName, 2, true);
      const validTypes = [MIME_TYPES_TEST.PlainText];
      const mockProps = createMockAttachmentProps(qItem, mockResources, convertMBToBytes(4), undefined, validTypes);
      render(<AttachmentComponent {...mockProps} />);
      await uploadMockFile(PLAIN_TEXT_3_MB);
      expectReplacedFileSizeError(2);
      expectNotToFindByText(wrongFileTypeMsg);
    });

    it('When uploading a file - And questionnaire max rule is not set, use props max value if set', async () => {
      const qItem = createMockQuestionnaireItem(qItemMockName, undefined, false);
      const validTypes = [MIME_TYPES_TEST.PlainText];
      const mockProps = createMockAttachmentProps(qItem, mockResources, convertMBToBytes(4), undefined, validTypes);
      render(<AttachmentComponent {...mockProps} />);
      await uploadMockFile(PLAIN_TEXT_5_MB);
      expectReplacedFileSizeError(4);
      expectNotToFindByText(wrongFileTypeMsg);
    });

    it('When uploading a file - Refero constant should be fallback if neither qItem rule or props', async () => {
      const qItem = createMockQuestionnaireItem(qItemMockName, 2, false);
      const validTypes = [MIME_TYPES_TEST.PlainText];
      const mockProps = createMockAttachmentProps(qItem, mockResources, undefined, undefined, validTypes);
      render(<AttachmentComponent {...mockProps} />);
      await uploadMockFile(PLAIN_TEXT_30_MB);
      expectReplacedFileSizeError(convertBytesToMBString(constants.MAX_FILE_SIZE));
      expectNotToFindByText(wrongFileTypeMsg);
    });
  });
});
