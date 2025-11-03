/* eslint-disable testing-library/no-node-access */
import { renderRefero, userEvent } from '@test/test-utils.tsx';
import { Matcher, screen, waitFor } from '@testing-library/react';
import { Questionnaire, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { vi } from 'vitest';

import { ReferoProps } from '../../../../types/referoProps';

import { q, qMinMax, qMinMaxCustomError } from './__data__/date-month';
import { getResources } from '../../../../../preview/resources/referoResources';
import { clickButtonTimes, getByLabelTextInsideElement, repeatNTimes, submitForm } from '../../../../../test/selectors';
import { Extensions } from '../../../../constants/extensions';

const resources = {
  ...getResources(''),
  year_field_required: 'Årstall er påkrevd',
  year_field_invalid: 'Ugyldig verdi',
  year_field_maxdate: 'Årstall er etter det eldste tillatte år',
  year_field_mindate: 'Årstall er før det minste tillatte år',
  yearmonth_field_required: 'Årstall og måned er påkrevd',
  errorAfterMaxDate: 'Dato kan ikke være etter maksimum dato',
};

const getTestId = (questionnaire: Questionnaire): string => {
  const dateItem = questionnaire.item?.find(item => item.type === 'date');
  const dateInputTestId = `test-yearmonth-item_${dateItem?.linkId}`;
  return dateInputTestId;
};

const getDateInput = (questionnaire: Questionnaire, labelText: Matcher): HTMLElement => {
  const dateInputTestId = getTestId(questionnaire);
  const dateInput = getByLabelTextInsideElement(dateInputTestId, labelText);
  return dateInput;
};

describe('Date month', () => {
  describe('Render', () => {
    it('Should render as text if props.pdf', async () => {
      await createWrapper(q, { pdf: true });
      expect(screen.getByText('Ikke besvart')).toBeInTheDocument();
    });
    it('Should render text if item is readonly', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, readOnly: true })),
      };
      await createWrapper(questionnaire);
      expect(screen.getByText('Ikke besvart')).toBeInTheDocument();
    });
    it('Should render as input if props.pdf === false && item is not readonly', async () => {
      await createWrapper(q);
      expect(screen.queryByText('Ikke besvart')).not.toBeInTheDocument();
    });
  });
  describe('initialvalue', () => {
    it('Initial value should not be set', async () => {
      await createWrapper(q);

      const dateInput = getDateInput(q, /Dato/i);

      expect(dateInput).toHaveValue(null);
    });

    it('Initial value should be set', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({
          ...x,
          initial: [
            {
              valueDate: '1994-05',
            },
          ],
        })),
      };
      await waitFor(async () => {
        await createWrapper(questionnaire);
      });
      const dateInput = getDateInput(questionnaire, /Dato/i);

      const monthElement = await screen.findByTestId('month-select');
      const monthInput = monthElement.querySelector('select');

      expect(dateInput).toHaveValue(1994);
      expect(monthInput).toHaveValue('05');
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
      expect(repeatButton).toBeInTheDocument();
    });

    it('Should not render repeat button if item does not repeats', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: false })),
      };
      await createWrapper(questionnaire);
      const repeatButton = screen.queryByTestId(/-repeat-button/i);
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
      await createWrapper(questionnaire);

      const testId = getTestId(questionnaire);
      const input = '1994';
      await repeatNTimes(input, 3, testId, /Dato/i);

      expect(screen.queryAllByTestId(/test-yearmonth/i)).toHaveLength(4);
      expect(screen.queryByTestId(/-repeat-button/i)).not.toBeInTheDocument();
    });
  });
  describe('delete button', () => {
    it('Should render delete button if item repeats and number of repeated items is greater than minOccurance(2)', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: true })),
      };
      await createWrapper(questionnaire);

      const testId = getTestId(questionnaire);
      const input = '1994';
      await repeatNTimes(input, 2, testId, /Dato/i);

      expect(screen.queryAllByTestId(/-delete-button/i)).toHaveLength(2);
    });
    it('Should not render delete button if item repeats and number of repeated items is lower or equal than minOccurance(2)', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: true })),
      };
      await createWrapper(questionnaire);

      expect(screen.queryByTestId(/-delete-button/i)).not.toBeInTheDocument();
    });
    it('Should show confirmationbox when deletebutton is clicked', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: true })),
      };
      await createWrapper(questionnaire);

      const testId = getTestId(questionnaire);
      const input = '1994';
      await repeatNTimes(input, 1, testId, /Dato/i);

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

      const testId = getTestId(questionnaire);
      const input = '1994';
      await repeatNTimes(input, 1, testId, /Dato/i);

      expect(screen.getByTestId(/-delete-button/i)).toBeInTheDocument();
      await clickButtonTimes(/-delete-button/i, 1);
      await userEvent.click(await screen.findByRole('button', { name: /Forkast endringer/i }));

      expect(screen.queryByTestId(/-delete-button/i)).not.toBeInTheDocument();
    });
  });
  describe('onChange', () => {
    it('Should update component with value from answer', async () => {
      await createWrapper(q);

      const dateInput = getDateInput(q, /Dato/i);

      expect(dateInput).toBeInTheDocument();
      expect(dateInput).toHaveAttribute('type', 'number');
      expect(dateInput).toHaveAttribute('id', `item_${q?.item?.[0].linkId}-input`);

      await userEvent.type(dateInput, '1994');

      expect(dateInput).toHaveValue(1994);
    });
    it('Should call onChange with correct value', async () => {
      const onChange = vi.fn();
      await createWrapper(q, { onChange });

      const dateInput = getDateInput(q, /Dato/i);

      expect(dateInput).toBeInTheDocument();

      const monthElement = await screen.findByTestId('month-select');
      const monthSelect = monthElement.querySelector('select');

      await userEvent.type(dateInput, '1994');
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
        await createWrapper(questionnaire);
        await submitForm();

        expect(screen.getAllByText(resources.yearmonth_field_required)).toHaveLength(3);
      });
      it('Should not show error if required and has value', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, required: true })),
        };
        await createWrapper(questionnaire);

        const dateInput = getDateInput(questionnaire, /Dato/i);
        const monthElement = await screen.findByTestId('month-select');
        const monthSelect = monthElement.querySelector('select');

        await userEvent.type(dateInput, '1994');
        await userEvent.tab();
        if (monthSelect) {
          await userEvent.selectOptions(monthSelect, '05');
        }
        await submitForm();

        expect(screen.queryByText(resources.yearmonth_field_required)).not.toBeInTheDocument();
      });
      it('Should remove error on change if form is submitted', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, required: true })),
        };
        await createWrapper(questionnaire);
        await submitForm();

        expect(screen.getAllByText(resources.yearmonth_field_required)).toHaveLength(3);

        const dateInput = getDateInput(questionnaire, /Dato/i);
        const monthElement = await screen.findByTestId('month-select');
        const monthSelect = monthElement.querySelector('select');

        await userEvent.type(dateInput, '1994');
        await userEvent.tab();
        if (monthSelect) {
          await userEvent.selectOptions(monthSelect, '05');
        }

        expect(screen.queryByText(resources.yearmonth_field_required)).not.toBeInTheDocument();
      });
      it('Should show error if date is invalid', async () => {
        await createWrapper(q);

        const dateInput = getDateInput(q, /Dato/i);
        await userEvent.type(dateInput, '333');
        await submitForm();

        expect(screen.getAllByText(resources.year_field_invalid)).toHaveLength(2);
        expect(screen.getByText(resources.yearmonth_field_required)).toBeInTheDocument();
      });
      it('Should show error message for min value, if month is correct but year is too low', async () => {
        await createWrapper(qMinMax);

        const dateInput = getDateInput(qMinMax, /Dato/i);
        const monthElement = await screen.findByTestId('month-select');
        const monthSelect = monthElement.querySelector('select');

        await userEvent.type(dateInput, '1993');
        await userEvent.tab();
        if (monthSelect) {
          await userEvent.selectOptions(monthSelect, '05');
        }
        await submitForm();

        expect(screen.getAllByText(resources.errorBeforeMinDate + ': mai 1994')).toHaveLength(2);
      });
      it('Should show error message for max value, if month is correct but year is too high', async () => {
        await createWrapper(qMinMax);

        const dateInput = getDateInput(qMinMax, /Dato/i);
        const monthElement = await screen.findByTestId('month-select');
        const monthSelect = monthElement.querySelector('select');

        await userEvent.type(dateInput, '1997');
        await userEvent.tab();
        if (monthSelect) {
          await userEvent.selectOptions(monthSelect, '05');
        }
        await submitForm();

        expect(screen.getAllByText(resources.errorAfterMaxDate + ': mai 1996')).toHaveLength(2);
      });
      it('Should show error message for min value, if year is correct but month is too low', async () => {
        await createWrapper(qMinMax);

        const dateInput = getDateInput(qMinMax, /Dato/i);
        const monthElement = await screen.findByTestId('month-select');
        const monthSelect = monthElement.querySelector('select');

        await userEvent.type(dateInput, '1994');
        await userEvent.tab();
        if (monthSelect) {
          await userEvent.selectOptions(monthSelect, '04');
        }
        await submitForm();

        expect(screen.getAllByText(resources.errorBeforeMinDate + ': mai 1994')).toHaveLength(2);
      });
      it('Should show error message for max value, if year is correct but month is too high', async () => {
        await createWrapper(qMinMax);

        const dateInput = getDateInput(qMinMax, /Dato/i);
        const monthElement = await screen.findByTestId('month-select');
        const monthSelect = monthElement.querySelector('select');

        await userEvent.type(dateInput, '1996');
        await userEvent.tab();
        if (monthSelect) {
          await userEvent.selectOptions(monthSelect, '06');
        }

        await submitForm();
        expect(screen.getAllByText(resources.errorAfterMaxDate + ': mai 1996')).toHaveLength(2);
      });
      it('Should show custom error message if error', async () => {
        await createWrapper(qMinMaxCustomError);

        const dateInput = getDateInput(qMinMaxCustomError, /Dato/i);
        await userEvent.type(dateInput, '1997');
        await submitForm();

        expect(screen.getAllByText('Custom errormessage')).toHaveLength(2);
      });
      it('Should not show error if date value is between min value and max value', async () => {
        await createWrapper(qMinMax);

        const dateInput = getDateInput(qMinMax, /Dato/i);
        const monthElement = await screen.findByTestId('month-select');
        const monthSelect = monthElement.querySelector('select');

        await userEvent.type(dateInput, '1995');
        await userEvent.tab();
        if (monthSelect) {
          await userEvent.selectOptions(monthSelect, '05');
        }
        await submitForm();

        expect(screen.queryByText(resources.errorAfterMaxDate + ': mai 1994')).not.toBeInTheDocument();
        expect(screen.queryByText(resources.errorBeforeMinDate + ': mai 1996')).not.toBeInTheDocument();
      });
      it('Should remove error on change if form is submitted', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, required: true })),
        };
        await createWrapper(questionnaire);
        await submitForm();

        expect(screen.getAllByText(resources.yearmonth_field_required)).toHaveLength(3);

        const dateInput = getDateInput(questionnaire, /Dato/i);
        const monthElement = await screen.findByTestId('month-select');
        const monthSelect = monthElement.querySelector('select');

        await userEvent.type(dateInput, '2024');
        if (monthSelect) {
          await userEvent.selectOptions(monthSelect, '05');
        }

        expect(screen.queryByText(resources.yearmonth_field_required)).not.toBeInTheDocument();
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
        await createWrapper(questionnaire);
        await submitForm();

        expect(screen.getAllByText(resources.yearmonth_field_required)).toHaveLength(3);
      });
    });
  });
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createWrapper = async (questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) => {
  return await renderRefero({ questionnaire, props: { ...props, resources } });
};
