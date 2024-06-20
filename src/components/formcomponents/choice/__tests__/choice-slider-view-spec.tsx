import { convertToEmoji, getCodePoint, isValidDecimal, isValidHex, isValidHtmlCode, isValidUnicodeHex } from '../slider-view';
import { Questionnaire } from 'fhir/r4';
import { act, findByRole, renderRefero, userEvent } from '../../../__tests__/test-utils/test-utils';
import { sliderView as q } from './__data__/index';
import { ReferoProps } from '../../../../types/referoProps';
import { Extensions } from '../../../../constants/extensions';
import { clickButtonTimes, submitForm } from '../../../__tests__/test-utils/selectors';
import { getResources } from '../../../../../preview/resources/referoResources';

const resources = { ...getResources(''), formRequiredErrorMessage: 'Du må fylle ut dette feltet', oppgiGyldigVerdi: 'ikke gyldig tall' };
const expectedAnswer = {
  valueCoding: {
    code: 'ja',
    display: 'Ja',
    system: 'urn:uuid:791a62b0-6ca0-4cb9-8924-7d4f0a286228',
  },
};

describe('Slider-view', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('initialvalue', () => {
    it('Initial value should not be set', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({
          ...x,
          repeats: false,
        })),
      };
      const { container } = createWrapper(questionnaire);

      expect(container.querySelector('div[role="slider"]')).toHaveAttribute('aria-valuetext', '&#9917 Nei');
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
      const { container } = createWrapper(questionnaire);

      expect(container.querySelector('div[role="slider"]')).toHaveAttribute('aria-valuetext', '&#9917 Ja');
    });
  });
  //TODO: Fix when component is updated and can be given refs
  describe.skip('onChange', () => {
    it('Should update component with value from answer', async () => {
      const onChange = jest.fn();

      const { container, getByRole } = createWrapper(q, { onChange });

      await act(async () => {
        userEvent.click(getByRole('slider'));
      });
      await act(async () => {
        userEvent.keyboard('{ArrowRight}');
      });

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(container.querySelector('div[role="slider"]')).toHaveAttribute('aria-valuetext', '&#9917 Ja');
      expect(container.querySelector('div[role="slider"]')).toHaveAttribute('aria-valuenow', '1');
    });
    it('Should call onChange with correct value', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: false })),
      };
      const onChange = jest.fn();
      const { container } = createWrapper(questionnaire, { onChange });
      await act(async () => {
        const JaElement = container.querySelectorAll('div.slider__value');
        if (JaElement[1]) {
          await act(async () => {
            userEvent.click(JaElement[1]);
          });
        }
      });
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(expect.any(Object), expectedAnswer, expect.any(Object), expect.any(Object));
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
  describe('repeat button', () => {
    it('Should render repeat button if item repeats', () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: true })),
      };

      const { getByTestId } = createWrapper(questionnaire);
      const repeatButton = getByTestId(/-repeat-button/i);
      expect(repeatButton).toBeInTheDocument();
    });

    it('Should not render repeat button if item does not repeats', () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: false })),
      };
      const { queryByTestId } = createWrapper(questionnaire);
      const repeatButton = queryByTestId(/-repeat-button/i);
      expect(repeatButton).not.toBeInTheDocument();
    });
    it('Should add item when repeat is clicked and remove button when maxOccurance(4) is reached', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: true })),
        extension: q.extension?.map(y => {
          if (y.url === Extensions.MIN_OCCURS_URL) {
            return { ...y, valueInteger: 2 };
          }
          return y;
        }),
      };
      const { queryAllByText, queryByTestId } = createWrapper(questionnaire);
      await clickButtonTimes(/-repeat-button/i, 3);
      expect(queryAllByText(/Slider view label/i)).toHaveLength(4);
      expect(queryByTestId(/-repeat-button/i)).not.toBeInTheDocument();
    });
  });
  describe('delete button', () => {
    it('Should render delete button if item repeats and number of repeated items is greater than minOccurance(2)', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: true })),
      };
      const { queryAllByTestId } = createWrapper(questionnaire);

      await clickButtonTimes(/-repeat-button/i, 2);

      expect(queryAllByTestId(/-delete-button/i)).toHaveLength(2);
    });
    it('Should not render delete button if item repeats and number of repeated items is lower or equal than minOccurance(2)', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: true })),
      };
      const { queryByTestId } = createWrapper(questionnaire);

      expect(queryByTestId(/-delete-button/i)).not.toBeInTheDocument();
    });
    it('Should show confirmationbox when deletebutton is clicked', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: true })),
      };
      const { getByTestId } = createWrapper(questionnaire);

      await clickButtonTimes(/-repeat-button/i, 1);
      expect(getByTestId(/-delete-button/i)).toBeInTheDocument();
      await clickButtonTimes(/-delete-button/i, 1);

      expect(getByTestId(/-delete-confirm-modal/i)).toBeInTheDocument();
    });
    it('Should remove item when delete button is clicked', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: true })),
      };
      const { getByTestId, queryByTestId } = createWrapper(questionnaire);

      await clickButtonTimes(/-repeat-button/i, 1);

      expect(getByTestId(/-delete-button/i)).toBeInTheDocument();

      await clickButtonTimes(/-delete-button/i, 1);

      const confirmModal = getByTestId(/-delete-confirm-modal/i);
      await act(async () => {
        userEvent.click(await findByRole(confirmModal, 'button', { name: /Forkast endringer/i }));
      });

      expect(queryByTestId(/-delete-button/i)).not.toBeInTheDocument();
    });
  });
  //TODO: Fix when component is updated and can be given refs
  describe.skip('Validation', () => {
    describe('Required', () => {
      it('Should show error if field is required and value is empty', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, required: true, repeats: false })),
        };
        const { container, getByText } = createWrapper(questionnaire);
        expect(container.querySelector('div[role="slider"]')).toBeInTheDocument();
        await submitForm();

        expect(getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();
      });
      it('Should not show error if required and has value', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, required: true, repeats: false })),
        };
        const { queryByText, getByText } = createWrapper(questionnaire);
        await act(async () => {
          userEvent.click(getByText(/Ja/i));
        });
        await submitForm();

        expect(queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
      });
      it('Should remove error on change if form is submitted', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, required: true, repeats: false })),
        };
        const { getByText, queryByText } = createWrapper(questionnaire);
        await submitForm();

        expect(getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();

        await act(async () => {
          userEvent.click(getByText(/Ja/i));
          userEvent.tab();
        });
        expect(queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
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
const createWrapper = (questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) => {
  return renderRefero({ questionnaire, props: { ...props, resources } });
};
