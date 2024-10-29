import { Questionnaire, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { findByRole, renderRefero, userEvent } from '@test/test-utils.tsx';
import { q, qMinMax, qMinMaxCustomError } from './__data__/date-month';
import { ReferoProps } from '../../../../types/referoProps';
import { Extensions } from '../../../../constants/extensions';
import { clickButtonTimes, repeatNTimes, submitForm } from '../../../../../test/selectors';
import { getResources } from '../../../../../preview/resources/referoResources';
import { vi } from 'vitest';
import { screen } from '@testing-library/dom';

const resources = {
  ...getResources(''),
  year_field_required: 'Årstall er påkrevd',
  year_field_invalid: 'Ugyldig verdi',
  year_field_maxdate: 'Årstall er etter det eldste tillatte år',
  year_field_mindate: 'Årstall er før det minste tillatte år',
  yearmonth_field_required: 'Årstall og måned er påkrevd',
  yearmonth_field_invalid: 'Ugyldig verdi',
  yearmonth_field_invalid_year: 'Du må skrive inn et gyldig årstall',
  errorAfterMaxDate: 'Dato kan ikke være etter maksimum dato',
};

describe('Date month', () => {
  describe('Render', () => {
    it('Should render as text if props.pdf', () => {
      const { queryByText } = createWrapper(q, { pdf: true });
      expect(queryByText('Ikke besvart')).toBeInTheDocument();
    });
    it('Should render text if item is readonly', () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, readOnly: true })),
      };
      const { queryByText } = createWrapper(questionnaire);
      expect(queryByText('Ikke besvart')).toBeInTheDocument();
    });
    it('Should render as input if props.pdf === false && item is not readonly', () => {
      const { queryByText } = createWrapper(q);
      expect(queryByText('Ikke besvart')).not.toBeInTheDocument();
    });
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
      const { getByLabelText } = createWrapper(questionnaire);

      expect(getByLabelText(/Dato/i)).toHaveValue(null);
    });

    it('Initial value should be set', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({
          ...x,
          repeats: false,
          initial: [
            {
              valueDate: '1994-05',
            },
          ],
        })),
      };
      const { getByLabelText } = createWrapper(questionnaire);

      const monthElement = await screen.findByTestId('month-select');
      const monthInput = monthElement.querySelector('select');

      expect(getByLabelText(/Dato/i)).toHaveValue(1994);
      expect(monthInput).toHaveValue('05');
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
      const { queryAllByLabelText, queryByTestId } = createWrapper(questionnaire);
      const input = '1994';
      await repeatNTimes(input, 3, /Dato/i);

      expect(queryAllByLabelText(/Dato/i)).toHaveLength(4);
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
      const input = '1994';
      await repeatNTimes(input, 2, /Dato/i);

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

      const input = '1994';
      await repeatNTimes(input, 1, /Dato/i);

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

      const input = '1994';
      await repeatNTimes(input, 1, /Dato/i);

      expect(getByTestId(/-delete-button/i)).toBeInTheDocument();
      await clickButtonTimes(/-delete-button/i, 1);

      const confirmModal = getByTestId(/-delete-confirm-modal/i);
      await userEvent.click(await findByRole(confirmModal, 'button', { name: /Forkast endringer/i }));

      expect(queryByTestId(/-delete-button/i)).not.toBeInTheDocument();
    });
  });
  describe('onChange', () => {
    it('Should update component with value from answer', async () => {
      const { getByLabelText } = createWrapper(q);

      const inputElement = getByLabelText(/Dato/i);
      expect(inputElement).toBeInTheDocument();
      expect(inputElement).toHaveAttribute('type', 'number');
      expect(inputElement).toHaveAttribute('id', `item_${q?.item?.[0].linkId}^0#id-input`);
      await userEvent.type(inputElement, '1994');
      expect(getByLabelText(/Dato/i)).toHaveValue(1994);
    });
    it('Should call onChange with correct value', async () => {
      const onChange = vi.fn();
      const { getByLabelText } = createWrapper(q, { onChange });
      expect(getByLabelText(/Dato/i)).toBeInTheDocument();

      const monthElement = await screen.findByTestId('month-select');
      const monthSelect = monthElement.querySelector('select');

      await userEvent.type(getByLabelText(/Dato/i), '1994');
      if (monthSelect) {
        await userEvent.selectOptions(monthSelect, '05');
      }

      const expectedAnswer: QuestionnaireResponseItemAnswer = {
        valueDate: '1994-05',
      };

      expect(onChange).toHaveBeenCalledTimes(5);
      expect(onChange).toHaveBeenCalledWith(expect.any(Object), expectedAnswer, expect.any(Object), expect.any(Object));
    });
  });
  describe('Validation', () => {
    describe('Required', () => {
      it('Should show error if field is required and value is empty', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, required: true })),
        };
        const { getByText } = createWrapper(questionnaire);
        await submitForm();

        expect(getByText(resources.yearmonth_field_required)).toBeInTheDocument();
      });
      it('Should not show error if required and has value', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, required: true })),
        };
        const { getByLabelText, queryByText } = createWrapper(questionnaire);
        await userEvent.type(getByLabelText(/Dato/i), '31.05.1994');
        await submitForm();

        expect(queryByText(resources.yearmonth_field_required)).not.toBeInTheDocument();
      });
      it('Should remove error on change if form is submitted', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, required: true })),
        };
        const { getByText, queryByText, getByLabelText } = createWrapper(questionnaire);
        await submitForm();
        expect(getByText(resources.yearmonth_field_required)).toBeInTheDocument();

        const monthElement = await screen.findByTestId('month-select');
        const monthSelect = monthElement.querySelector('select');

        await userEvent.type(getByLabelText(/Dato/i), '1994');
        await userEvent.tab();
        if (monthSelect) {
          await userEvent.selectOptions(monthSelect, '05');
        }

        expect(queryByText(resources.yearmonth_field_required)).not.toBeInTheDocument();
      });
      it('Should show error if date is invalid', async () => {
        const { getByLabelText, getByText } = createWrapper(q);

        await userEvent.type(getByLabelText(/Dato/i), '333');

        await submitForm();
        expect(getByText(resources.yearmonth_field_invalid)).toBeInTheDocument();
      });
      it('Should show error message for min value, if month is correct but year is too low', async () => {
        const { getByLabelText, getByText } = createWrapper(qMinMax);

        const monthElement = await screen.findByTestId('month-select');
        const monthSelect = monthElement.querySelector('select');

        await userEvent.type(getByLabelText(/Dato/i), '1993');
        await userEvent.tab();
        if (monthSelect) {
          await userEvent.selectOptions(monthSelect, '05');
        }

        await submitForm();
        expect(getByText(resources.errorBeforeMinDate + ': mai 1994')).toBeInTheDocument();
      });
      it('Should show error message for max value, if month is correct but year is too high', async () => {
        const { getByLabelText, getByText } = createWrapper(qMinMax);

        const monthElement = await screen.findByTestId('month-select');
        const monthSelect = monthElement.querySelector('select');

        await userEvent.type(getByLabelText(/Dato/i), '1997');
        await userEvent.tab();
        if (monthSelect) {
          await userEvent.selectOptions(monthSelect, '05');
        }

        await submitForm();
        expect(getByText(resources.errorAfterMaxDate + ': mai 1996')).toBeInTheDocument();
      });
      it('Should show error message for min value, if year is correct but month is too low', async () => {
        const { getByLabelText, getByText } = createWrapper(qMinMax);

        const monthElement = await screen.findByTestId('month-select');
        const monthSelect = monthElement.querySelector('select');

        await userEvent.type(getByLabelText(/Dato/i), '1994');
        await userEvent.tab();
        if (monthSelect) {
          await userEvent.selectOptions(monthSelect, '04');
        }

        await submitForm();
        expect(getByText(resources.errorBeforeMinDate + ': mai 1994')).toBeInTheDocument();
      });
      it('Should show error message for max value, if year is correct but month is too high', async () => {
        const { getByLabelText, getByText } = createWrapper(qMinMax);

        const monthElement = await screen.findByTestId('month-select');
        const monthSelect = monthElement.querySelector('select');

        await userEvent.type(getByLabelText(/Dato/i), '1996');
        await userEvent.tab();
        if (monthSelect) {
          await userEvent.selectOptions(monthSelect, '06');
        }

        await submitForm();
        expect(getByText(resources.errorAfterMaxDate + ': mai 1996')).toBeInTheDocument();
      });
      it('Should show custom error message if error', async () => {
        const { getByLabelText, getByText } = createWrapper(qMinMaxCustomError);

        await userEvent.type(getByLabelText(/Dato/i), '1997');

        await submitForm();
        expect(getByText('Custom errormessage')).toBeInTheDocument();
      });
      it('Should not show error if date value is between min value and max value', async () => {
        const { getByLabelText, queryByText } = createWrapper(qMinMax);

        const monthElement = await screen.findByTestId('month-select');
        const monthSelect = monthElement.querySelector('select');

        await userEvent.type(getByLabelText(/Dato/i), '1995');
        await userEvent.tab();
        if (monthSelect) {
          await userEvent.selectOptions(monthSelect, '05');
        }

        await submitForm();
        expect(queryByText(resources.errorAfterMaxDate + ': mai 1994')).not.toBeInTheDocument();
        expect(queryByText(resources.errorBeforeMinDate + ': mai 1996')).not.toBeInTheDocument();
      });
      it('Should remove error on change if form is submitted', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, required: true })),
        };
        const { getByLabelText, getByText, queryByText } = createWrapper(questionnaire);
        await submitForm();

        expect(getByText(resources.yearmonth_field_required)).toBeInTheDocument();

        const monthElement = await screen.findByTestId('month-select');
        const monthSelect = monthElement.querySelector('select');

        await userEvent.type(getByLabelText(/Dato/i), '2024');
        if (monthSelect) {
          await userEvent.selectOptions(monthSelect, '05');
        }

        expect(queryByText(resources.yearmonth_field_required)).not.toBeInTheDocument();
      });
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

        expect(getByText(resources.yearmonth_field_required)).toBeInTheDocument();
      });
    });
  });
});

const createWrapper = (questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) => {
  return renderRefero({ questionnaire, props: { ...props, resources } });
};
