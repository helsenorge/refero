import { act, userEvent, Matcher, render, renderRefero, screen } from '@test/test-utils.tsx';
import { q } from './__data__/';

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
import { Attachment, Questionnaire, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { ReferoProps } from '@/types/referoProps';
import { getResources } from '../../../../../preview/resources/referoResources';
import { UploadFile } from '@helsenorge/file-upload/components/file-upload';
import { submitForm } from '@test/selectors';

// vi.mock('@helsenorge/file-upload/components/file-upload/useFileUpload', () => ({
//   useFileUpload: vi.fn(() => ({
//     register: vi.fn(),
//     acceptedFiles: [],
//     setAcceptedFiles: vi.fn(),
//     rejectedFiles: [],
//     setRejectedFiles: vi.fn(),
//   })),
// }));

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

async function uploadMockFile(mockFile: File | File[], testId = 'item_5fece702-bf32-445b-979d-862ade17306a-attachment-label') {
  const input = screen.getByTestId(testId);

  await act(async () => {
    userEvent.upload(input, mockFile);
  });
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
      };
      const upload = vi.fn();
      const { getByLabelText, getByTestId } = createWrapper(questionnaire, { uploadAttachment: upload });

      const inputElement = getByLabelText(/Attachment/i);
      expect(inputElement).toBeInTheDocument();
      expect(inputElement).toHaveAttribute('type', 'file');
      expect(inputElement).toHaveAttribute('id', `item_${q?.item?.[0].linkId}`);
      let fileString =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg==';
      const file = new UploadFile([fileString], 'hello.png', '2', 2, { type: 'image/png' });
      const input = getByTestId('item_5fece702-bf32-445b-979d-862ade17306a-attachment-label');

      await act(async () => {
        userEvent.upload(input, file);
      });
      expect(screen.getByText('hello.png')).toBeInTheDocument();
      expect(upload).toHaveBeenCalledTimes(1);
    });
    it('Should call onChange with correct value', async () => {
      const questionnaire: Questionnaire = {
        ...q,
      };
      const onChange = vi.fn();
      const attchmt: Attachment = { url: 'test' };
      const uploadAttachment = (files: File[], onSuccess: (attachment: Attachment) => void) => {
        onSuccess(attchmt);
      };
      const { getByLabelText, getByTestId } = createWrapper(questionnaire, { uploadAttachment, onChange });

      const inputElement = getByLabelText(/Attachment/i);
      expect(inputElement).toBeInTheDocument();
      expect(inputElement).toHaveAttribute('type', 'file');
      expect(inputElement).toHaveAttribute('id', `item_${q?.item?.[0].linkId}`);
      let fileString =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg==';
      const file = new UploadFile([fileString], 'hello.png', '2', 2, { type: 'image/png' });
      const input = getByTestId('item_5fece702-bf32-445b-979d-862ade17306a-attachment-label');

      await act(async () => {
        userEvent.upload(input, file);
      });
      const expectedAnswer: QuestionnaireResponseItemAnswer = {
        valueAttachment: attchmt,
      };
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(expect.any(Object), expectedAnswer, expect.any(Object), expect.any(Object));
    });
    it('Should call onChange with correct value on delete', async () => {
      const questionnaire: Questionnaire = {
        ...q,
      };
      const onChange = vi.fn();
      const attchmt: Attachment = { url: 'test' };
      const uploadAttachment = (files: File[], onSuccess: (attachment: Attachment) => void) => {
        onSuccess(attchmt);
      };
      const onDeleteAttachment = (fileId: string, onSuccess: () => void) => {
        onSuccess();
      };
      const { getByLabelText, getByTestId } = createWrapper(questionnaire, { uploadAttachment, onChange, onDeleteAttachment });

      const inputElement = getByLabelText(/Attachment/i);
      expect(inputElement).toBeInTheDocument();
      expect(inputElement).toHaveAttribute('type', 'file');
      expect(inputElement).toHaveAttribute('id', `item_${q?.item?.[0].linkId}`);
      let fileString =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg==';
      const file = new UploadFile([fileString], 'hello.png', '2', 2, { type: 'image/png' });
      const input = getByTestId('item_5fece702-bf32-445b-979d-862ade17306a-attachment-label');

      await act(async () => {
        userEvent.upload(input, file);
      });
      const expectedAnswer: QuestionnaireResponseItemAnswer = {
        valueAttachment: attchmt,
      };
      const expectedAttachementDelete: QuestionnaireResponseItemAnswer = {
        valueAttachment: { url: '2' },
      };
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(expect.any(Object), expectedAnswer, expect.any(Object), expect.any(Object));
      const deleteButton = screen.getByText('Slett');
      await act(async () => {
        userEvent.click(deleteButton);
      });
      expect(onChange).toHaveBeenCalledTimes(2);
      expect(onChange).toHaveBeenCalledWith(expect.any(Object), expectedAttachementDelete, expect.any(Object), expect.any(Object));
    });
  });
  describe('File Type validation', () => {
    it('When uploading a file - Show error if mime type is NOT among valid types', async () => {
      const validTypes = [MIME_TYPES_TEST.PNG, MIME_TYPES_TEST.JPG, MIME_TYPES_TEST.PDF];
      const questionnaire: Questionnaire = {
        ...q,
      };
      const { getByText } = createWrapper(questionnaire, { attachmentValidTypes: validTypes });
      await act(async () => {
        await uploadMockFile(PLAIN_TEXT_3_MB);
      });
      await act(async () => {
        await submitForm();
      });
      expect(getByText(/Last opp fil. Tillatte filtyper er:/i)).toBeInTheDocument();
    });

    it('When uploading a file - Do NOT show error file type error message when valid mime', async () => {
      const validTypes = [MIME_TYPES_TEST.PNG, MIME_TYPES_TEST.JPG, MIME_TYPES_TEST.PDF, MIME_TYPES_TEST.PlainText];
      const questionnaire: Questionnaire = {
        ...q,
      };
      const { getByText } = createWrapper(questionnaire, { attachmentValidTypes: validTypes });
      await act(async () => {
        await uploadMockFile(PLAIN_TEXT_3_MB);
      });
      await act(async () => {
        await submitForm();
      });
      expect(getByText(/Last opp fil. Tillatte filtyper er:/i)).not.toBeInTheDocument();
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

function createWrapper(questionnaire: Questionnaire, props: Partial<ReferoProps> = {}, resource = resources) {
  const attahchmentProps: Partial<ReferoProps> = {
    attachmentErrorMessage: undefined,
    attachmentMaxFileSize: 20,
    attachmentValidTypes: ['image/jpeg', 'image/png'],
    onRequestAttachmentLink: vi.fn(),
    onOpenAttachment: vi.fn(),
    onDeleteAttachment: vi.fn(),
    uploadAttachment: vi.fn(),
  };
  return renderRefero({ questionnaire, props: { ...attahchmentProps, ...props }, resources: resource });
}
