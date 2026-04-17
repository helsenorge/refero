import { renderRefero, screen, userEvent, waitFor } from '@test/test-utils.tsx';
import { vi } from 'vitest';

import type { ReferoProps } from '../../../../types/referoProps';
import type { Questionnaire } from 'fhir/r4';

import { convertToEmoji, getCodePoint, isValidDecimal, isValidHex, isValidHtmlCode, isValidUnicodeHex } from '../sliderUtils';
import { sliderView as q, sliderViewValueSet as q2 } from './__data__/index';
import { getResources } from '../../../../../preview/resources/referoResources';
import { submitForm } from '../../../../../test/selectors';
import { Extensions } from '../../../../constants/extensions';

const resources = { ...getResources(''), formRequiredErrorMessage: 'Du må fylle ut dette feltet', oppgiGyldigVerdi: 'ikke gyldig tall' };
const expectedAnswer = {
  valueCoding: {
    id: '540c894e-29ef-46bf-f961-851921c87d57',
    code: 'vet-ikke',
    system: 'urn:uuid:791a62b0-6ca0-4cb9-8924-7d4f0a286228',
    display: 'Vet ikke',
    extension: [
      {
        url: 'http://hl7.org/fhir/StructureDefinition/valueset-label',
        valueString: '&#9917',
      },
      {
        url: 'http://hl7.org/fhir/StructureDefinition/ordinalValue',
        valueDecimal: 3.3,
      },
    ],
  },
};

describe('Slider-view', () => {
  const runSliderTests = (q: Questionnaire): void => {
    describe('initialvalue', () => {
      it('Initial value should not be set', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({
            ...x,
            repeats: false,
            initial: [],
          })),
        };
        const { container } = await createWrapper(questionnaire);
        await waitFor(async () => {
          const inputEl = container.querySelector(`input[name="${questionnaire?.item?.[0].linkId}"]`);
          expect(inputEl).toHaveAttribute('value', '1');
        });
      });
      it('Initial value should be set', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({
            ...x,
            repeats: false,
            initial: [expectedAnswer],
          })),
        };
        await waitFor(async () => {
          const { container } = await createWrapper(questionnaire);
          const inputEl = container.querySelector(`input[name="${questionnaire?.item?.[0].linkId}"]`);
          expect(inputEl).toHaveAttribute('value', '2');
        });
      });
    });
    describe('onChange', () => {
      it('Should update component with value from answer', async () => {
        const onChange = vi.fn();

        const { container } = await createWrapper(q, { onChange });

        await userEvent.click(screen.getByRole('slider'));
        await userEvent.keyboard('{ArrowRight}');
        await waitFor(async () => {
          expect(onChange).toHaveBeenCalledTimes(1);
        });
        const inputEl = container.querySelector(`input[name="${q?.item?.[0].linkId}^0"]`);
        await waitFor(async () => {
          expect(inputEl).toHaveAttribute('value', '2');
        });
        await waitFor(async () => {
          expect(inputEl).toHaveAttribute('aria-valuetext', '&#9917 Vet ikke');
        });
      });
      it('Should call onChange with correct value', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, repeats: false })),
        };
        const onChange = vi.fn();
        await createWrapper(questionnaire, { onChange });
        // Use getByRole to select the slider and keyboard interaction
        await userEvent.click(screen.getByRole('slider'));
        await userEvent.keyboard('{ArrowRight}');
        await waitFor(() => {
          expect(onChange).toHaveBeenCalledTimes(1);
        });
        expect(onChange).toHaveBeenCalledWith(
          expect.any(Object),
          expect.objectContaining({
            valueCoding: expect.objectContaining({
              code: 'vet-ikke',
              display: 'Vet ikke',
              system: 'urn:uuid:791a62b0-6ca0-4cb9-8924-7d4f0a286228',
            }),
          }),
          expect.any(Object),
          expect.any(Object)
        );
      });
    });
    describe('help button', () => {
      it('Should render helpButton', async () => {
        const { container } = await createWrapper(q);
        await waitFor(async () => {
          expect(container.querySelector('.page_refero__helpButton')).toBeInTheDocument();
        });
      });
      it('Should render helpElement when helpbutton is clicked', async () => {
        const { container } = await createWrapper(q);

        expect(container.querySelector('.page_refero__helpButton')).toBeInTheDocument();

        expect(container.querySelector('.page_refero__helpComponent--open')).not.toBeInTheDocument();
        const helpButton = container.querySelector('.page_refero__helpButton');
        if (helpButton) {
          await userEvent.click(helpButton);
        }
        await waitFor(async () => {
          expect(await screen.findByText('Help text')).toBeInTheDocument();
        });
      });
    });
    describe('repeat button', () => {
      it('Should render repeat button if item repeats', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, repeats: true })),
        };

        await createWrapper(questionnaire);
        const repeatButton = screen.getByTestId(/-repeat-button/i);
        await waitFor(async () => {
          expect(repeatButton).toBeInTheDocument();
        });
      });

      it('Should not render repeat button if item does not repeats', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, repeats: false })),
        };
        await createWrapper(questionnaire);
        const repeatButton = screen.queryByTestId(/-repeat-button/i);
        await waitFor(async () => {
          expect(repeatButton).not.toBeInTheDocument();
        });
      });
      it('Should add item when repeat is clicked and remove button when maxOccurance(4) is reached', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({
            ...x,
            repeats: true,
            readOnly: false,
            extension: x.extension?.map(y => {
              if (y.url === Extensions.MIN_OCCURS_URL) {
                return { ...y, valueInteger: 2 };
              }
              return y;
            }),
          })),
        };
        await createWrapper(questionnaire);
        const linkId = questionnaire.item![0].linkId!;
        // minOccurs: 2 pre-renders 2 sliders; both need answers before repeat button enables
        // (descendantsHasPrimitiveAnswer requires ALL items to have answers)
        await waitFor(() => expect(screen.getAllByRole('slider')).toHaveLength(2));
        await userEvent.click(screen.getAllByRole('slider')[0]);
        await userEvent.keyboard('{ArrowRight}');
        await userEvent.click(screen.getAllByRole('slider')[1]);
        await userEvent.keyboard('{ArrowRight}');
        await waitFor(() => expect(screen.getByTestId(`${linkId}-repeat-button`)).not.toBeDisabled());
        // Click repeat → 3 sliders; give slider[2] an answer before next repeat
        await userEvent.click(screen.getByTestId(`${linkId}-repeat-button`));
        await waitFor(() => expect(screen.getAllByRole('slider')).toHaveLength(3));
        await userEvent.click(screen.getAllByRole('slider')[2]);
        await userEvent.keyboard('{ArrowRight}');
        await waitFor(() => expect(screen.getByTestId(`${linkId}-repeat-button`)).not.toBeDisabled());
        // Click repeat → 4 sliders (maxOccurs reached)
        await userEvent.click(screen.getByTestId(`${linkId}-repeat-button`));
        await waitFor(() => expect(screen.getAllByRole('slider')).toHaveLength(4));
        await waitFor(async () => {
          expect(screen.queryByTestId(/-repeat-button/i)).not.toBeInTheDocument();
        });
      });
    });
    describe('delete button', () => {
      it('Should render delete button if item repeats and number of repeated items is greater than minOccurance(2)', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, repeats: true })),
        };
        await createWrapper(questionnaire);
        const linkId = questionnaire.item![0].linkId!;
        // Give initial slider an answer to enable the repeat button
        await userEvent.click(screen.getAllByRole('slider')[0]);
        await userEvent.keyboard('{ArrowRight}');
        await waitFor(() => expect(screen.getByTestId(`${linkId}-repeat-button`)).not.toBeDisabled());
        // First repeat → 2 sliders; give slider[1] an answer to enable repeat button again
        await userEvent.click(screen.getByTestId(`${linkId}-repeat-button`));
        await waitFor(() => expect(screen.getAllByRole('slider')).toHaveLength(2));
        await userEvent.click(screen.getAllByRole('slider')[1]);
        await userEvent.keyboard('{ArrowRight}');
        await waitFor(() => expect(screen.getByTestId(`${linkId}-repeat-button`)).not.toBeDisabled());
        // Second repeat → 3 sliders (index 0, 1, 2)
        await userEvent.click(screen.getByTestId(`${linkId}-repeat-button`));
        await waitFor(() => expect(screen.getAllByRole('slider')).toHaveLength(3));
        // Delete buttons appear for index >= minOccurs (1), so indices 1 and 2 → 2 buttons
        await waitFor(() => {
          expect(screen.queryAllByTestId(/-delete-button/i)).toHaveLength(2);
        });
      });
      it('Should not render delete button if item repeats and number of repeated items is lower or equal than minOccurance(2)', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, repeats: true })),
        };
        await createWrapper(questionnaire);
        await waitFor(async () => {
          expect(screen.queryByTestId(/-delete-button/i)).not.toBeInTheDocument();
        });
      });
      it('Should show confirmationbox when deletebutton is clicked', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, repeats: true })),
        };
        await createWrapper(questionnaire);
        const linkId = questionnaire.item![0].linkId!;
        // Give initial slider an answer to enable the repeat button
        await userEvent.click(screen.getAllByRole('slider')[0]);
        await userEvent.keyboard('{ArrowRight}');
        await waitFor(() => expect(screen.getByTestId(`${linkId}-repeat-button`)).not.toBeDisabled());
        // Add one repeated slider
        await userEvent.click(screen.getByTestId(`${linkId}-repeat-button`));
        await waitFor(() => expect(screen.getAllByRole('slider')).toHaveLength(2));
        // Give the second slider an answer so mustShowConfirm becomes true
        await userEvent.click(screen.getAllByRole('slider')[1]);
        await userEvent.keyboard('{ArrowRight}');
        // Wait for Redux state to update (both sliders answered → repeat button re-enabled)
        // This ensures the async mustShowConfirm effect has also had time to run
        await waitFor(() => expect(screen.getByTestId(`${linkId}-repeat-button`)).not.toBeDisabled());
        // Click the delete button for the second slider (index 1)
        await userEvent.click(screen.getByTestId(`${linkId}-1-delete-button`));
        expect(await screen.findByTestId(`${linkId}-1-delete-confirm-modal`)).toBeInTheDocument();
      });
      it('Should remove item when delete button is clicked', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, repeats: true })),
        };
        await createWrapper(questionnaire);
        const linkId = questionnaire.item![0].linkId!;
        // Give initial slider an answer to enable the repeat button
        await userEvent.click(screen.getAllByRole('slider')[0]);
        await userEvent.keyboard('{ArrowRight}');
        await waitFor(() => expect(screen.getByTestId(`${linkId}-repeat-button`)).not.toBeDisabled());
        // Add one repeated slider
        await userEvent.click(screen.getByTestId(`${linkId}-repeat-button`));
        await waitFor(() => expect(screen.getAllByRole('slider')).toHaveLength(2));
        // Click the delete button for the second slider (no answer → no confirm modal needed)
        expect(await screen.findByTestId(`${linkId}-1-delete-button`)).toBeInTheDocument();
        await userEvent.click(screen.getByTestId(`${linkId}-1-delete-button`));
        // Item should be removed (no confirmation since second slider has no answer)
        await waitFor(() => expect(screen.queryByTestId(/-delete-button/i)).not.toBeInTheDocument());
      });
    });
    describe('Validation', () => {
      describe('Required', () => {
        it('Should show error if field is required and value is empty', async () => {
          const questionnaire: Questionnaire = {
            ...q,
            item: q.item?.map(x => ({ ...x, required: true, repeats: false })),
          };
          await createWrapper(questionnaire);

          const sliderInput = screen.queryByTestId(/test-slider/i);
          await waitFor(async () => {
            expect(sliderInput).toBeInTheDocument();
          });
          await submitForm();

          await waitFor(async () => {
            expect(screen.getAllByText(resources.formRequiredErrorMessage)).toHaveLength(2);
          });
        });
        it.skip('Should not show error if required and has value', async () => {
          const questionnaire: Questionnaire = {
            ...q,
            item: q.item?.map(x => ({ ...x, required: true, repeats: false })),
          };
          await createWrapper(questionnaire);
          await userEvent.click(screen.getByRole('slider'));
          await userEvent.keyboard('{ArrowRight}');
          await userEvent.click(screen.getByTestId('refero-submit-button'));
          await waitFor(() => {
            expect(screen.queryAllByText(resources.formRequiredErrorMessage).length).toBe(0);
          });
        });
        it('Should remove error on change if form is submitted', async () => {
          const questionnaire: Questionnaire = {
            ...q,
            item: q.item?.map(x => ({ ...x, required: true, repeats: false })),
          };
          await createWrapper(questionnaire);
          await userEvent.click(screen.getByTestId('refero-submit-button'));
          await waitFor(async () => {
            expect(screen.getAllByText(resources.formRequiredErrorMessage)).toHaveLength(2);
          });
          await userEvent.click(screen.getByRole('slider'));
          await userEvent.keyboard('{ArrowRight}');
          await userEvent.tab();
          await waitFor(() => {
            expect(screen.queryAllByText(resources.formRequiredErrorMessage).length).toBe(0);
          });
        });
        it('Should get required error on readOnly if noe value', async () => {
          const questionnaire: Questionnaire = {
            ...q,
            item: q.item?.map(x => ({
              ...x,
              repeats: false,
              initial: [],
            })),
          };
          const { container } = await createWrapper(questionnaire);
          await waitFor(async () => {
            const inputEl = container.querySelector(`input[name="${questionnaire?.item?.[0].linkId}"]`);
            expect(inputEl).toHaveAttribute('value', '1');
          });
        });
        it('Initial value should be set', async () => {
          const questionnaire: Questionnaire = {
            ...q,
            item: q.item?.map(x => ({
              ...x,
              repeats: false,
              initial: [expectedAnswer],
            })),
          };
          await waitFor(async () => {
            const { container } = await createWrapper(questionnaire);
            const inputEl = container.querySelector(`input[name="${questionnaire?.item?.[0].linkId}"]`);
            expect(inputEl).toHaveAttribute('value', '2');
          });
        });
      });

      describe('Validation functions', () => {
        test('isValidDecimal', () => {
          expect(isValidDecimal('123')).toBe(true);
          expect(isValidDecimal('abc')).toBe(false);
          expect(isValidDecimal('123abc')).toBe(false);
          expect(isValidDecimal('')).toBe(false);
        });

        test('isValidHtmlCode', () => {
          expect(isValidHtmlCode('&#128512;')).toBe(true);
          expect(isValidHtmlCode('&#x1F600;')).toBe(true);
          expect(isValidHtmlCode('&#123abc;')).toBe(false);
          expect(isValidHtmlCode('&128512;')).toBe(false);
          expect(isValidHtmlCode('&#abc;')).toBe(false);
          expect(isValidHtmlCode('')).toBe(false);
        });

        test('isValidHex', () => {
          // Valid hex values
          expect(isValidHex('0x1F600')).toBe(true);
          expect(isValidHex('1F600')).toBe(true);
          expect(isValidHex('123')).toBe(true);
          expect(isValidHex('abc')).toBe(true);
          expect(isValidHex('123abc')).toBe(true);

          // Invalid hex values
          expect(isValidHex('0xGHI')).toBe(false);
          expect(isValidHex('GHI')).toBe(false);
          expect(isValidHex('')).toBe(false);
          expect(isValidHex('0x')).toBe(false);
          expect(isValidHex('0x1F6001')).toBe(true);
          expect(isValidHex('1F6001')).toBe(true);
        });

        test('isValidUnicodeHex', () => {
          // Valid Unicode hex values
          expect(isValidUnicodeHex('U+1F600')).toBe(true);
          expect(isValidUnicodeHex('U+1234')).toBe(true);

          // Invalid Unicode hex values
          expect(isValidUnicodeHex('1F600')).toBe(false);
          expect(isValidUnicodeHex('U+GHI')).toBe(false);
          expect(isValidUnicodeHex('U+abc')).toBe(false);
          expect(isValidUnicodeHex('')).toBe(false);
          expect(isValidUnicodeHex('U+123')).toBe(false);
          expect(isValidUnicodeHex('U+1F6001')).toBe(true);
        });
      });
    });
  };
  runSliderTests(q);
  runSliderTests(q2);
  // Tests for getCodePoint function
  describe('getCodePoint', () => {
    test('decimal input', () => {
      expect(getCodePoint('128512')).toBe(128512);
    });

    test('hex input with 0x', () => {
      expect(getCodePoint('0x1F600')).toBe(0x1f600);
    });

    test('hex input without 0x', () => {
      expect(getCodePoint('1F600')).toBe(0x1f600);
    });

    test('HTML code decimal input', () => {
      expect(getCodePoint('&#128512;')).toBe(128512);
    });

    test('HTML code hex input', () => {
      expect(getCodePoint('&#x1F600;')).toBe(0x1f600);
    });

    test('Unicode hex input', () => {
      expect(getCodePoint('U+1F600')).toBe(0x1f600);
    });

    test('invalid input', () => {
      expect(getCodePoint('')).toBeNull();
    });
  });

  // Tests for convertToEmoji function
  describe('convertToEmoji', () => {
    test('valid decimal input', () => {
      expect(convertToEmoji('128512')).toBe('😀');
    });

    test('valid hex input with 0x', () => {
      expect(convertToEmoji('0x1F600')).toBe('😀');
    });

    test('valid hex input without 0x', () => {
      expect(convertToEmoji('1F600')).toBe('😀');
    });

    test('valid HTML code decimal input', () => {
      expect(convertToEmoji('&#128512;')).toBe('😀');
    });

    test('valid HTML code hex input', () => {
      expect(convertToEmoji('&#x1F600;')).toBe('😀');
    });

    test('valid Unicode hex input', () => {
      expect(convertToEmoji('U+1F600')).toBe('😀');
    });

    test('out of range input', () => {
      expect(convertToEmoji('1212966')).toBe('1212966');
    });

    test('invalid input', () => {
      expect(convertToEmoji('')).toBe('');
    });
  });
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createWrapper = async (questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) => {
  return await renderRefero({ questionnaire, props: { ...props, resources } });
};
