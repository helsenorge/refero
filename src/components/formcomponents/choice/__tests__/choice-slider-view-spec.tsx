import { renderRefero, screen, userEvent, waitFor } from '@test/test-utils.tsx';
import { Questionnaire } from 'fhir/r4';
import { vi } from 'vitest';

import { ReferoProps } from '../../../../types/referoProps';

import { convertToEmoji, getCodePoint, isValidDecimal, isValidHex, isValidHtmlCode, isValidUnicodeHex } from '../sliderUtils';
import { sliderView as q, sliderViewValueSet as q2 } from './__data__/index';
import { getResources } from '../../../../../preview/resources/referoResources';
import { clickButtonTimes, clickSliderValue, repeatSliderTimes, submitForm } from '../../../../../test/selectors';
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
    //TODO: Fix when component is updated and can be given refs
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
        const { container } = await createWrapper(questionnaire, { onChange });
        const NeiElement = container.querySelectorAll('div.slider__track__step')[1];

        await waitFor(async () => {
          if (NeiElement) {
            await userEvent.click(NeiElement);
          }
        });
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(
          expect.any(Object),
          {
            valueCoding: {
              code: 'nei',
              display: 'Nei',
              system: 'urn:uuid:791a62b0-6ca0-4cb9-8924-7d4f0a286228',
            },
          },
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
          expect(container.querySelector('.page_refero__helpComponent--open')).toBeInTheDocument();
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

        await repeatSliderTimes('3dec9e0d-7b78-424e-8a59-f0909510985d', 3);
        await waitFor(async () => {
          expect(screen.queryAllByTestId(/test-slider/i)).toHaveLength(4);
        });
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
        await repeatSliderTimes('3dec9e0d-7b78-424e-8a59-f0909510985d', 2);

        expect(screen.queryAllByTestId(/-delete-button/i)).toHaveLength(2);
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

        await repeatSliderTimes('3dec9e0d-7b78-424e-8a59-f0909510985d', 1);

        expect(screen.getByTestId(/-delete-button/i)).toBeInTheDocument();
        await clickButtonTimes(/-delete-button/i, 1);

        expect(screen.getByTestId(/-delete-confirm-modal/i)).toBeInTheDocument();
      });
      it('Should remove item when delete button is clicked', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, repeats: true })),
        };
        await createWrapper(questionnaire);

        await repeatSliderTimes('3dec9e0d-7b78-424e-8a59-f0909510985d', 1);

        expect(screen.getByTestId(/-delete-button/i)).toBeInTheDocument();

        await clickButtonTimes(/-delete-button/i, 1);

        // const confirmModal = screen.getByTestId(/-delete-confirm-modal/i);
        await userEvent.click(await screen.findByRole('button', { name: /Forkast endringer/i }));

        expect(screen.queryByTestId(/-delete-button/i)).not.toBeInTheDocument();
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
            expect(screen.getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();
          });
        });
        it('Should not show error if required and has value', async () => {
          const questionnaire: Questionnaire = {
            ...q,
            item: q.item?.map(x => ({ ...x, required: true, repeats: false })),
          };
          await createWrapper(questionnaire);
          await clickSliderValue(`3dec9e0d-7b78-424e-8a59-f0909510985d`, 0);
          await submitForm();

          expect(screen.queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
        });
        it('Should remove error on change if form is submitted', async () => {
          const questionnaire: Questionnaire = {
            ...q,
            item: q.item?.map(x => ({ ...x, required: true, repeats: false })),
          };
          await createWrapper(questionnaire);
          await submitForm();
          await waitFor(async () => {
            expect(screen.getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();
          });
          await clickSliderValue(`3dec9e0d-7b78-424e-8a59-f0909510985d`, 0);
          await userEvent.tab();
          expect(screen.queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
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
