import { userEvent, Matcher, renderRefero, screen } from '@test/test-utils.tsx';
import { Questionnaire } from 'fhir/r4';
import { vi } from 'vitest';

import { q } from './__data__/';
import { getResources } from '../../../../../preview/resources/referoResources';

import { ReferoProps } from '@/types/referoProps';
import { MimeType } from '@/util/attachmentHelper';

export const expectNotToFindByText = (text: Matcher): void => {
  expect(screen.queryByText(text)).toBeNull();
};

const resources = { ...getResources(''), formRequiredErrorMessage: 'Du må fylle ut dette feltet', ikkeBesvart: 'ikkeBesvart' };

// class MockDataTransfer {
//   items = {
//     add: vi.fn(),
//   };
// }

// global.DataTransfer = MockDataTransfer;

describe('Attachment', () => {
  describe('Render', () => {
    it('Should render as text if props.pdf', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: false })),
      };
      await createWrapper(questionnaire, { pdf: true });
      expect(screen.getByText(resources.ikkeBesvart)).toBeInTheDocument();
    });

    it('Should render text if item is readonly', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, readOnly: true, repeats: false })),
      };

      await createWrapper(questionnaire);
      expect(screen.getByText(resources.ikkeBesvart)).toBeInTheDocument();
    });

    it('Should render as input if props.pdf === false && item is not readonly', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: false })),
      };
      await createWrapper(questionnaire);
      expect(screen.queryByText(resources.ikkeBesvart)).not.toBeInTheDocument();
    });
  });

  describe('help button', () => {
    it('Should render helpButton', async () => {
      const { container } = await createWrapper(q);

      expect(container.querySelector('.page_refero__helpButton')).toBeInTheDocument();
    });

    it('Should render helpElement when helpbutton is clicked', async () => {
      const { container } = await createWrapper(q);

      expect(container.querySelector('.page_refero__helpButton')).toBeInTheDocument();

      expect(container.querySelector('.page_refero__helpComponent--open')).not.toBeInTheDocument();

      const helpButton = container.querySelector('.page_refero__helpButton');
      if (helpButton) {
        await userEvent.click(helpButton);
      }
      expect(container.querySelector('.page_refero__helpComponent--open')).toBeInTheDocument();
    });
  });

  describe.skip('validation', () => {
    // it('readOnly value should get validation error if error exist', async () => {
    //   const questionnaire: Questionnaire = {
    //     ...q,
    //     item: q.item?.map(x => ({
    //       ...x,
    //       readOnly: true,
    //       required: true,
    //       code: [
    //         {
    //           code: 'ValidateReadOnly',
    //           display: 'Valider skrivebeskyttet felt',
    //           system: 'http://helsenorge.no/fhir/CodeSystem/ValidationOptions',
    //         },
    //       ],
    //     })),
    //   };
    //   await createWrapper(questionnaire);
    //   await submitForm();
    //   expect(screen.getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();
    // });
    //   describe('File Type validation', () => {
    // it('When uploading a file - Do NOT show error file type error message when valid mime', async () => {
    //   const validTypes = [MimeType.PNG, MimeType.JPG, MimeType.PDF, MimeType.PlainText];
    //   const questionnaire: Questionnaire = {
    //     ...q,
    //   };
    //   createWrapper(questionnaire, { attachmentValidTypes: validTypes });
    //   await uploadMockFile(PLAIN_TEXT_3_MB);
    //   await submitForm();
    //   hasFiletypeError(false);
    // });
    //   });
    //   describe('File Size validation - Questionnaire Extension', () => {
    //     it('When uploading a file - Do NOT show resource size error if file size excactly max rule from qItem', async () => {
    //       const validTypes = [MimeType.PlainText];
    //       const questionnaire: Questionnaire = {
    //         ...q,
    //         item: q.item?.map(x => addOReplaceMaxSizeExtension(x, 6)),
    //       };
    //       createWrapper(questionnaire, { attachmentValidTypes: validTypes, attachmentMaxFileSize: undefined });
    //       await uploadMockFile(PLAIN_TEXT_6_MB);
    //       await submitForm();
    //       hasFileSizeError(false);
    //     });
    //     it('When uploading a file - And not set Questionnaire item max rule will be read as null and should be skipped', async () => {
    //       const validTypes = [MimeType.PlainText];
    //       const questionnaire: Questionnaire = {
    //         ...q,
    //         item: q.item?.map(x => ({
    //           ...x,
    //           extension: removeExtensionFromItemByUrl(x.extension, ExtensionConstants.MAX_SIZE_URL),
    //         })),
    //       };
    //       createWrapper(questionnaire, { attachmentValidTypes: validTypes, attachmentMaxFileSize: undefined });
    //       await uploadMockFile(PLAIN_TEXT_6_MB);
    //       await submitForm();
    //       hasFileSizeError(false);
    //     });
    //     it('When uploading a file - And not set Questionnaire item max rule with undefined value should be skipped', async () => {
    //       const validTypes = [MimeType.PlainText];
    //       const questionnaire: Questionnaire = {
    //         ...q,
    //         item: q.item?.map(x => addOReplaceMaxSizeExtension(x, undefined)),
    //       };
    //       createWrapper(questionnaire, { attachmentValidTypes: validTypes, attachmentMaxFileSize: undefined });
    //       await uploadMockFile(PLAIN_TEXT_6_MB);
    //       await submitForm();
    //       hasFileSizeError(false);
    //     });
    //   });
    //   describe('File validation - Prioritiy of rules', () => {
    //     it('When uploading a file - Questionniare Item Max Rule has priority over props if both set', async () => {
    //       const validTypes = [MimeType.PNG, MimeType.PlainText];
    //       const questionnaire: Questionnaire = {
    //         ...q,
    //         item: q.item?.map(x => addOReplaceMaxSizeExtension(x, 8)),
    //       };
    //       createWrapper(questionnaire, { attachmentValidTypes: validTypes, attachmentMaxFileSize: 4 });
    //       await uploadMockFile(PLAIN_TEXT_6_MB);
    //       await submitForm();
    //       hasFiletypeError(false);
    //       hasFileSizeError(false);
    //     });
    //   });
  });
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function createWrapper(questionnaire: Questionnaire, props: Partial<ReferoProps> = {}, resource = resources) {
  const attahchmentProps: Partial<ReferoProps> = {
    attachmentErrorMessage: undefined,
    attachmentMaxFileSize: 20,
    attachmentValidTypes: [MimeType.JPG, MimeType.PNG, MimeType.PDF, MimeType.PlainText],
    onRequestAttachmentLink: vi.fn(),
    onOpenAttachment: vi.fn(),
    onDeleteAttachment: vi.fn(),
    uploadAttachment: vi.fn(),
  };
  return await renderRefero({ questionnaire, props: { ...attahchmentProps, ...props }, resources: resource });
}
