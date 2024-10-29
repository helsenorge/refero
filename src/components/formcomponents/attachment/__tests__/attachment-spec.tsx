import { userEvent, Matcher, renderRefero, screen, waitFor } from '@test/test-utils.tsx';
import { q } from './__data__/';

import { MimeType_For_Test_Util as MIME_TYPES_TEST, createMockFile } from './__data__/mockUtil';
import { convertMBToBytes } from '../attachmentUtil';
import { vi } from 'vitest';
import { Attachment, Extension, Questionnaire, QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { ReferoProps } from '@/types/referoProps';
import { getResources } from '../../../../../preview/resources/referoResources';
import { UploadFile } from '@helsenorge/file-upload/components/file-upload';
import { submitForm } from '@test/selectors';
import { ExtensionConstants } from '@/index';

const mockFileName = 'testFile.txt';
const defaulMockSize = 3;
const PLAIN_TEXT_3_MB = createMockFile(mockFileName, MIME_TYPES_TEST.PlainText, convertMBToBytes(defaulMockSize));
const JPEG_5_MB = createMockFile(mockFileName, MIME_TYPES_TEST.JPG, convertMBToBytes(5));
const PLAIN_TEXT_6_MB = createMockFile(mockFileName, MIME_TYPES_TEST.PlainText, convertMBToBytes(6));
const PLAIN_TEXT_30_MB = createMockFile(mockFileName, MIME_TYPES_TEST.PlainText, convertMBToBytes(30));

async function uploadMockFile(
  mockFile: File | File[],
  testId = 'item_5fece702-bf32-445b-979d-862ade17306a#id-attachment-label'
): Promise<void> {
  const input = screen.getByTestId(testId);

  await userEvent.upload(input, mockFile);
}

export const expectNotToFindByText = (text: Matcher): void => {
  expect(screen.queryByText(text)).toBeNull();
};
const addOReplaceMaxSizeExtension = (item: QuestionnaireItem, maxSize: number | undefined): QuestionnaireItem => ({
  ...item,
  extension: item.extension?.map(e => (e.url === ExtensionConstants.MAX_SIZE_URL ? { ...e, valueDecimal: maxSize } : e)),
});
const removeExtensionFromItemByUrl = (extension?: Extension[], url?: Extension['url'] | undefined): Extension[] | undefined =>
  extension?.filter(e => e.url !== url);

const hasFiletypeError = (hasError: boolean): void => {
  if (hasError) expect(screen.getByText(/Tillatte filtyper er:/i)).toBeInTheDocument();
  else expect(screen.queryByText(/Tillatte filtyper er:/i)).not.toBeInTheDocument();
};
const hasFileSizeError = (hasError: boolean): void => {
  if (hasError) expect(screen.getByText(/Filstørrelse må være mindre enn/i)).toBeInTheDocument();
  else expect(screen.queryByText(/Filstørrelse må være mindre enn/i)).not.toBeInTheDocument();
};
const resources = { ...getResources(''), formRequiredErrorMessage: 'Du må fylle ut dette feltet', ikkeBesvart: 'ikkeBesvart' };
describe('Attachment', () => {
  describe('Render', () => {
    it('Should render as text if props.pdf', () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: false })),
      };
      const { getByText } = createWrapper(questionnaire, { pdf: true });
      expect(getByText(resources.ikkeBesvart)).toBeInTheDocument();
    });
    it('Should render text if item is readonly', () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, readOnly: true, repeats: false })),
      };

      const { getByText } = createWrapper(questionnaire);
      expect(getByText(resources.ikkeBesvart)).toBeInTheDocument();
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
        await userEvent.click(helpButton);
      }
      expect(container.querySelector('.page_refero__helpComponent--open')).toBeInTheDocument();
    });
  });
  describe.skip('onChange', () => {
    it('Should update component with value from answer', async () => {
      const questionnaire: Questionnaire = {
        ...q,
      };
      const upload = vi.fn();
      const { getByLabelText, findByText } = createWrapper(questionnaire, {
        uploadAttachment: upload,
        attachmentValidTypes: ['image/png'],
      });

      const inputElement = getByLabelText(/Attachment/i);
      expect(inputElement).toBeInTheDocument();
      expect(inputElement).toHaveAttribute('type', 'file');
      expect(inputElement).toHaveAttribute('id', `item_${q?.item?.[0].linkId}`);
      const fileString =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg==';
      const file = new UploadFile([fileString], 'hello.png', '2', 2, { type: 'image/png' });
      await userEvent.click(inputElement);
      await userEvent.upload(inputElement, file);
      // await waitFor(async () => expect(upload).toHaveBeenCalledTimes(1));
      await waitFor(async () => expect(await findByText('hello.png')).toBeInTheDocument());
    });
    it('Should call onChange with correct value', async () => {
      const questionnaire: Questionnaire = {
        ...q,
      };
      const onChange = vi.fn();
      const attchmt: Attachment = { url: 'test' };
      //@ts-expect-error - mock function
      const uploadAttachment = (files: File[], onSuccess: (attachment: Attachment) => void): void => {
        onSuccess(attchmt);
      };
      const { getByLabelText, getByTestId } = createWrapper(questionnaire, { uploadAttachment, onChange });

      const inputElement = getByLabelText(/Attachment/i);
      expect(inputElement).toBeInTheDocument();
      expect(inputElement).toHaveAttribute('type', 'file');
      expect(inputElement).toHaveAttribute('id', `item_${q?.item?.[0].linkId}`);
      const fileString =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg==';
      const file = new UploadFile([fileString], 'hello.png', '2', 2, { type: 'image/png' });
      const input = getByTestId('item_5fece702-bf32-445b-979d-862ade17306a-attachment-label');
      await userEvent.upload(input, file);

      const expectedAnswer: QuestionnaireResponseItemAnswer = {
        valueAttachment: attchmt,
      };
      await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1000));
      await waitFor(() =>
        expect(onChange).toHaveBeenCalledWith(expect.any(Object), expectedAnswer, expect.any(Object), expect.any(Object))
      );
    });
    it('Should call onChange with correct value on delete', async () => {
      const questionnaire: Questionnaire = {
        ...q,
      };
      const onChange = vi.fn();
      const attchmt: Attachment = { url: 'test' };
      //@ts-expect-error - mock function
      const uploadAttachment = (files: File[], onSuccess: (attachment: Attachment) => void): void => {
        onSuccess(attchmt);
      };
      const { getByLabelText, getByTestId, findByText } = createWrapper(questionnaire, { uploadAttachment, onChange });

      const inputElement = getByLabelText(/Attachment/i);
      expect(inputElement).toBeInTheDocument();
      expect(inputElement).toHaveAttribute('type', 'file');
      expect(inputElement).toHaveAttribute('id', `item_${q?.item?.[0].linkId}`);
      const fileString =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg==';
      const file = new UploadFile([fileString], 'hello.png', '2', 2, { type: 'image/png' });
      const input = getByTestId('item_5fece702-bf32-445b-979d-862ade17306a-attachment-label');
      await userEvent.upload(input, file);

      const expectedAttachementDelete: QuestionnaireResponseItemAnswer = {
        valueAttachment: { url: '2' },
      };
      const deleteButton = await waitFor(async () => await findByText('Slett'));
      await userEvent.click(deleteButton);
      await waitFor(async () => expect(onChange).toHaveBeenCalledTimes(2));
      await waitFor(async () =>
        expect(onChange).toHaveBeenCalledWith(expect.any(Object), expectedAttachementDelete, expect.any(Object), expect.any(Object))
      );
    });
  });
  describe('validation', () => {
    it('readOnly value should get validation error if error exist', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({
          ...x,
          readOnly: true,
          required: true,
          code: [
            {
              code: 'ValidateReadOnly',
              display: 'Valider skrivebeskyttet felt',
              system: 'http://helsenorge.no/fhir/CodeSystem/ValidationOptions',
            },
          ],
        })),
      };
      const { getByText } = createWrapper(questionnaire);
      await submitForm();

      expect(getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();
    });
    describe('File Type validation', () => {
      it.skip('When uploading a file - Show error if mime type is NOT among valid types', async () => {
        const validTypes = [MIME_TYPES_TEST.PNG, MIME_TYPES_TEST.JPG, MIME_TYPES_TEST.PDF];
        const questionnaire: Questionnaire = {
          ...q,
        };
        createWrapper(questionnaire, { attachmentValidTypes: validTypes });
        await uploadMockFile(PLAIN_TEXT_3_MB);
        await submitForm();
        hasFiletypeError(true);
      });

      it('When uploading a file - Do NOT show error file type error message when valid mime', async () => {
        const validTypes = [MIME_TYPES_TEST.PNG, MIME_TYPES_TEST.JPG, MIME_TYPES_TEST.PDF, MIME_TYPES_TEST.PlainText];
        const questionnaire: Questionnaire = {
          ...q,
        };
        createWrapper(questionnaire, { attachmentValidTypes: validTypes });
        await uploadMockFile(PLAIN_TEXT_3_MB);
        await submitForm();
        hasFiletypeError(false);
      });
    });

    describe('File Size validation - Questionnaire Extension', () => {
      it.skip('When uploading a file - Show resource size error if size > max rule in qItem, item has priority', async () => {
        const validTypes = [MIME_TYPES_TEST.PlainText];
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => addOReplaceMaxSizeExtension(x, 1)),
        };
        createWrapper(questionnaire, { attachmentValidTypes: validTypes, attachmentMaxFileSize: 8 });
        await uploadMockFile(PLAIN_TEXT_6_MB);
        await submitForm();
        hasFileSizeError(true);
      });

      it.skip('When uploading a file - Show resource size error if size > max rule in referoProps and no maxSize extension is set on the item', async () => {
        const validTypes = [MIME_TYPES_TEST.PlainText];
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({
            ...x,
            extension: removeExtensionFromItemByUrl(x.extension, ExtensionConstants.MAX_SIZE_URL),
          })),
        };
        createWrapper(questionnaire, { attachmentValidTypes: validTypes, attachmentMaxFileSize: 3 });
        await uploadMockFile(PLAIN_TEXT_6_MB);
        await submitForm();

        hasFileSizeError(true);
      });

      it('When uploading a file - Do NOT show resource size error if file size excactly max rule from qItem', async () => {
        const validTypes = [MIME_TYPES_TEST.PlainText];
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => addOReplaceMaxSizeExtension(x, 6)),
        };

        createWrapper(questionnaire, { attachmentValidTypes: validTypes, attachmentMaxFileSize: undefined });
        await uploadMockFile(PLAIN_TEXT_6_MB);
        await submitForm();

        hasFileSizeError(false);
      });

      it('When uploading a file - And not set Questionnaire item max rule will be read as null and should be skipped', async () => {
        const validTypes = [MIME_TYPES_TEST.PlainText];
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({
            ...x,
            extension: removeExtensionFromItemByUrl(x.extension, ExtensionConstants.MAX_SIZE_URL),
          })),
        };
        createWrapper(questionnaire, { attachmentValidTypes: validTypes, attachmentMaxFileSize: undefined });
        await uploadMockFile(PLAIN_TEXT_6_MB);
        await submitForm();

        hasFileSizeError(false);
      });

      it('When uploading a file - And not set Questionnaire item max rule with undefined value should be skipped', async () => {
        const validTypes = [MIME_TYPES_TEST.PlainText];
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => addOReplaceMaxSizeExtension(x, undefined)),
        };
        createWrapper(questionnaire, { attachmentValidTypes: validTypes, attachmentMaxFileSize: undefined });
        await uploadMockFile(PLAIN_TEXT_6_MB);
        await submitForm();

        hasFileSizeError(false);
      });
    });

    describe('File validation - Prioritiy of rules', () => {
      it.skip('When uploading a file - File type errors should have priority over other errors', async () => {
        const validTypes = [MIME_TYPES_TEST.PNG, MIME_TYPES_TEST.PDF];
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => addOReplaceMaxSizeExtension(x, 1)),
        };
        createWrapper(questionnaire, { attachmentValidTypes: validTypes });
        await uploadMockFile(JPEG_5_MB);
        await submitForm();

        hasFiletypeError(true);
        hasFileSizeError(false);
      });

      it('When uploading a file - Questionniare Item Max Rule has priority over props if both set', async () => {
        const validTypes = [MIME_TYPES_TEST.PNG, MIME_TYPES_TEST.PlainText];
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => addOReplaceMaxSizeExtension(x, 8)),
        };
        createWrapper(questionnaire, { attachmentValidTypes: validTypes, attachmentMaxFileSize: 4 });
        await uploadMockFile(PLAIN_TEXT_6_MB);
        await submitForm();
        hasFiletypeError(false);
        hasFileSizeError(false);
      });

      it.skip('When uploading a file - And questionnaire max rule is not set, use props max value if set', async () => {
        const validTypes = [MIME_TYPES_TEST.PlainText];
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({
            ...x,
            extension: removeExtensionFromItemByUrl(x.extension, ExtensionConstants.MAX_SIZE_URL),
          })),
        };
        createWrapper(questionnaire, { attachmentValidTypes: validTypes, attachmentMaxFileSize: 4 });
        await uploadMockFile(PLAIN_TEXT_6_MB);
        await submitForm();

        hasFileSizeError(true);
      });

      it.skip('When uploading a file - Refero constant should be fallback if neither qItem rule or props', async () => {
        const validTypes = [MIME_TYPES_TEST.PlainText];
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({
            ...x,
            extension: removeExtensionFromItemByUrl(x.extension, ExtensionConstants.MAX_SIZE_URL),
          })),
        };
        createWrapper(questionnaire, { attachmentValidTypes: validTypes, attachmentMaxFileSize: undefined });
        await uploadMockFile(PLAIN_TEXT_30_MB);
        await submitForm();

        hasFileSizeError(true);
      });
    });
  });
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function createWrapper(questionnaire: Questionnaire, props: Partial<ReferoProps> = {}, resource = resources) {
  const attahchmentProps: Partial<ReferoProps> = {
    attachmentErrorMessage: undefined,
    attachmentMaxFileSize: 20,
    attachmentValidTypes: [MIME_TYPES_TEST.JPG, MIME_TYPES_TEST.PNG, MIME_TYPES_TEST.PDF, MIME_TYPES_TEST.PlainText],
    onRequestAttachmentLink: vi.fn(),
    onOpenAttachment: vi.fn(),
    onDeleteAttachment: vi.fn(),
    uploadAttachment: vi.fn(),
  };
  return renderRefero({ questionnaire, props: { ...attahchmentProps, ...props }, resources: resource });
}
