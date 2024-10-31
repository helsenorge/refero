import { userEvent, Matcher, renderRefero, screen } from '@test/test-utils.tsx';
import { q } from './__data__/';

import { createMockFile } from './__data__/mockUtil';
import { convertMBToBytes } from '../attachmentUtil';
import { vi } from 'vitest';
import { Extension, Questionnaire, QuestionnaireItem } from 'fhir/r4';
import { ReferoProps } from '@/types/referoProps';
import { getResources } from '../../../../../preview/resources/referoResources';
import { submitForm } from '@test/selectors';
import { ExtensionConstants } from '@/index';
import { MimeType } from '@/util/attachmentHelper';

const mockFileName = 'testFile.txt';
const defaulMockSize = 3;
const PLAIN_TEXT_3_MB = createMockFile(mockFileName, MimeType.PlainText, convertMBToBytes(defaulMockSize));
const PLAIN_TEXT_6_MB = createMockFile(mockFileName, MimeType.PlainText, convertMBToBytes(6));

async function uploadMockFile(
  mockFile: File | File[],
  testId = 'item_5fece702-bf32-445b-979d-862ade17306a-attachment-label'
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

  describe('validation', () => {
    it.skip('readOnly value should get validation error if error exist', async () => {
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
      it('When uploading a file - Do NOT show error file type error message when valid mime', async () => {
        const validTypes = [MimeType.PNG, MimeType.JPG, MimeType.PDF, MimeType.PlainText];
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
      it('When uploading a file - Do NOT show resource size error if file size excactly max rule from qItem', async () => {
        const validTypes = [MimeType.PlainText];
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
        const validTypes = [MimeType.PlainText];
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
        const validTypes = [MimeType.PlainText];
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
      it('When uploading a file - Questionniare Item Max Rule has priority over props if both set', async () => {
        const validTypes = [MimeType.PNG, MimeType.PlainText];
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
    });
  });
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function createWrapper(questionnaire: Questionnaire, props: Partial<ReferoProps> = {}, resource = resources) {
  const attahchmentProps: Partial<ReferoProps> = {
    attachmentErrorMessage: undefined,
    attachmentMaxFileSize: 20,
    attachmentValidTypes: [MimeType.JPG, MimeType.PNG, MimeType.PDF, MimeType.PlainText],
    onRequestAttachmentLink: vi.fn(),
    onOpenAttachment: vi.fn(),
    onDeleteAttachment: vi.fn(),
    uploadAttachment: vi.fn(),
  };
  return renderRefero({ questionnaire, props: { ...attahchmentProps, ...props }, resources: resource });
}
