import { act, findByRole, Matcher, render, renderRefero, screen } from '@test/test-utils.tsx';
import { q } from './__data__/';
import userEvent from '@testing-library/user-event';

import {
  MimeType_For_Test_Util as MIME_TYPES_TEST,
  createMockAttachmentProps,
  createMockFile,
  createMockQuestionnaireItem,
  createMockQuestionnaireItemWithEmptyValue,
} from './__data__/mockUtil';
import { Resources } from '../../../../util/resources';
import { convertBytesToMBString, convertMBToBytes } from '../attachmentUtil';
import constants from '../../../../constants';
import { AttachmentComponent } from '../attachment';
import { vi } from 'vitest';
import { Questionnaire, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { ReferoProps } from '@/types/referoProps';
import { getResources } from '../../../../../preview/resources/referoResources';
import { clickButtonTimes } from '@test/selectors';
import { Extensions } from '@/constants/extensions';

vi.mock('@helsenorge/file-upload/components/file-upload/useFileUpload', () => ({
  useFileUpload: vi.fn(() => ({
    register: vi.fn(),
    acceptedFiles: [],
    rejectedFiles: [],
    setAcceptedFiles: vi.fn(),
    setRejectedFiles: vi.fn(),
  })),
}));

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
const resources = { ...getResources(''), formRequiredErrorMessage: 'Du må fylle ut dette feltet', ikkeBesvart: 'ikkeBesvart' };
describe('Attachment', () => {
  describe('Render', () => {
    it('Should render as text if props.pdf', () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: false })),
      };
      const { queryByText, debug } = createWrapper(questionnaire, { pdf: true });
      debug(undefined, 20000);
      expect(queryByText(resources.ikkeBesvart)).toBeInTheDocument();
    });
    it('Should render text if item is readonly', () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, readOnly: true, repeats: false })),
      };

      const { queryByText } = createWrapper(questionnaire);
      expect(queryByText(resources.ikkeBesvart)).toBeInTheDocument();
    });
    it('Should render as input if props.pdf === false && item is not readonly', () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: false })),
      };
      const { queryByText } = createWrapper(questionnaire);
      expect(queryByText(resources.ikkeBesvart)).not.toBeInTheDocument();
    });
  });
  describe('help button', () => {
    it('Should render helpButton', async () => {
      const { container } = createWrapper(q);

      expect(container.querySelector('.page_refero__helpButton')).toBeInTheDocument();
    });
    it('Should render helpElement when helpbutton is clicked', async () => {
      const { container } = createWrapper(q);

      expect(container.querySelector('.page_refero__helpButton')).toBeInTheDocument();

      expect(container.querySelector('.page_refero__helpComponent--open')).not.toBeInTheDocument();

      const helpButton = container.querySelector('.page_refero__helpButton');
      if (helpButton) {
        await act(async () => {
          userEvent.click(helpButton);
        });
      }
      expect(container.querySelector('.page_refero__helpComponent--open')).toBeInTheDocument();
    });
  });

  describe('onChange', () => {
    it('Should update component with value from answer', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({
          ...x,
          repeats: false,
        })),
      };
      const { getByLabelText } = createWrapper(questionnaire);

      const inputElement = getByLabelText(/Attachment/i);
      expect(inputElement).toBeInTheDocument();
      expect(inputElement).toHaveAttribute('type', 'text');
      expect(inputElement).toHaveAttribute('id', `item_${q?.item?.[0].linkId}`);
      await act(async () => {
        userEvent.type(inputElement, '123');
      });
      expect(getByLabelText(/Attachment/i)).toHaveValue('123');
    });
    it('Should call onChange with correct value', async () => {
      const questionnaire: Questionnaire = {
        ...q,
      };
      const onChange = vi.fn();
      const { getByLabelText } = createWrapper(questionnaire, { onChange });
      expect(getByLabelText(/Attachment/i)).toBeInTheDocument();
      const input = 'string';
      await act(async () => {
        userEvent.type(getByLabelText(/Attachment/i), input);
      });
      const expectedAnswer: QuestionnaireResponseItemAnswer = {
        valueString: input,
      };
      expect(onChange).toHaveBeenCalledTimes(input.length);
      expect(onChange).toHaveBeenCalledWith(expect.any(Object), expectedAnswer, expect.any(Object), expect.any(Object));
    });
  });
  describe.skip('File Type validation', () => {
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

  describe.skip('File Size validation - Questionnaire Extension', () => {
    it('When uploading a file - Show resource size error if size > max rule in qItem', async () => {
      const qItem = createMockQuestionnaireItem(qItemMockName, 5, true);
      const validTypes = [MIME_TYPES_TEST.PlainText];
      const mockProps = createMockAttachmentProps(qItem, mockResources, undefined, undefined, validTypes);
      render(<AttachmentComponent {...mockProps} />);

      await uploadMockFile(PLAIN_TEXT_6_MB);

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

  describe.skip('File Size validation - Max Setttings From Props', () => {
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

  describe.skip('File validation - Prioritiy of rules', () => {
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

function createWrapper(questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) {
  const attahchmentProps: Partial<ReferoProps> = {
    attachmentErrorMessage: 'attachmentErrorMessage',
    attachmentMaxFileSize: 20,
    attachmentValidTypes: ['json', 'jpg', 'png', 'pdf'],
    onRequestAttachmentLink: vi.fn(),
    onOpenAttachment: vi.fn(),
    onDeleteAttachment: vi.fn(),
    uploadAttachment: vi.fn(),
  };
  return renderRefero({ questionnaire, props: { ...props, ...attahchmentProps }, resources });
}
