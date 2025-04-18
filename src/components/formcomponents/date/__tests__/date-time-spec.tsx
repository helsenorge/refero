/* eslint-disable testing-library/no-node-access */
import { renderRefero, userEvent, waitFor } from '@test/test-utils.tsx';
import { screen } from '@testing-library/react';
import { format } from 'date-fns';
import { Questionnaire, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { vi } from 'vitest';

import { ReferoProps } from '../../../../types/referoProps';

import { q, qMinMax, qMinMaxCustomError } from './__data__/date-time';
import { getResources } from '../../../../../preview/resources/referoResources';
import { clickButtonTimes, repeatDateTimeNTimes, submitForm } from '../../../../../test/selectors';
import { Extensions } from '../../../../constants/extensions';

import { DateFormat } from '@/types/dateTypes';

const resources = {
  ...getResources(''),
  formRequiredErrorMessage: 'Du må fylle ut dette feltet',
  oppgiGyldigVerdi: 'ikke gyldig tall',
  dateError_invalid: 'Ugyldig dato',
  errorBeforeMinDate: 'Dato kan ikke være før minimums dato',
  errorAfterMaxDate: 'Dato kan ikke være etter maksimum dato',
  dateError_time_invalid: 'Ugyldig klokkeslett',
};

describe('Date time', () => {
  beforeEach(() => {
    process.env.TZ = 'Europe/Oslo';
  });
  afterEach(() => {
    delete process.env.TZ;
  });
  describe('Render', () => {
    it('Should render as text if props.pdf', async () => {
      await createWrapper(q, { pdf: true });
      await screen.findByText('Ikke besvart');
    });
    it('Should render text if item is readonly', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, readOnly: true })),
      };
      await createWrapper(questionnaire);
      await screen.findByText('Ikke besvart');
    });
    it('Should render as input if props.pdf === false && item is not readonly', async () => {
      await createWrapper(q);
      await waitFor(async () => expect(screen.queryByText('Ikke besvart')).not.toBeInTheDocument());
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
      await createWrapper(questionnaire);

      await waitFor(async () => expect(screen.getByLabelText(/Dato/i)).toHaveValue(''));
    });
    it.skip('Initial value should be set', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({
          ...x,
          repeats: false,
          initial: [
            {
              valueDateTime: '1994-05-31T14:30:00+02:00',
            },
          ],
        })),
      };
      await createWrapper(questionnaire);
      const dateInput = screen.getByLabelText(/Dato/i);
      const hoursElement = screen.getByTestId(/hours-test/i);
      const minutesElement = screen.getByTestId(/minutes-test/i);

      const hoursInput = hoursElement.querySelector('input');

      const minutesInput = minutesElement.querySelector('input');

      await waitFor(async () => expect(dateInput).toHaveValue('31.05.1994'));
      await waitFor(async () => expect(hoursInput).toHaveValue(14));
      await waitFor(async () => expect(minutesInput).toHaveValue(30));
    });
  });
  describe('help button', () => {
    it('Should render helpButton', async () => {
      const { container } = await createWrapper(q);

      await waitFor(async () => expect(container.querySelector('.page_refero__helpButton')).toBeInTheDocument());
    });
    it('Should render helpElement when helpbutton is clicked', async () => {
      const { container } = await createWrapper(q);

      await waitFor(async () => expect(container.querySelector('.page_refero__helpButton')).toBeInTheDocument());

      await waitFor(async () => expect(container.querySelector('.page_refero__helpComponent--open')).not.toBeInTheDocument());

      const helpButton = container.querySelector('.page_refero__helpButton');
      if (helpButton) {
        await userEvent.click(helpButton);
      }

      await waitFor(async () => expect(container.querySelector('.page_refero__helpComponent--open')).toBeInTheDocument());
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
      await waitFor(async () => expect(repeatButton).toBeInTheDocument());
    });

    it('Should not render repeat button if item does not repeats', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: false })),
      };
      await createWrapper(questionnaire);
      const repeatButton = screen.queryByTestId(/-repeat-button/i);
      await waitFor(async () => expect(repeatButton).not.toBeInTheDocument());
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

      await repeatDateTimeNTimes(/Dato/i, 'hours-test', 'minutes-test', '12.12.2024', '12', '30', 3);

      await waitFor(async () => expect(screen.queryAllByLabelText(/Dato/i)).toHaveLength(4));
      await waitFor(async () => expect(screen.queryByTestId(/-repeat-button/i)).not.toBeInTheDocument());
    });
  });
  describe('delete button', () => {
    it('Should render delete button if item repeats and number of repeated items is greater than minOccurance(2)', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: true })),
      };
      await createWrapper(questionnaire);

      await repeatDateTimeNTimes(/Dato/i, 'hours-test', 'minutes-test', '12.12.2024', '12', '30', 2);

      await waitFor(async () => expect(screen.queryAllByTestId(/-delete-button/i)).toHaveLength(2));
    });
    it('Should not render delete button if item repeats and number of repeated items is lower or equal than minOccurance(2)', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: true })),
      };
      await createWrapper(questionnaire);
      await waitFor(async () => expect(screen.queryByTestId(/-delete-button/i)).not.toBeInTheDocument());
    });
    it('Should show confirmationbox when deletebutton is clicked', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: true })),
      };
      await createWrapper(questionnaire);

      await repeatDateTimeNTimes(/Dato/i, 'hours-test', 'minutes-test', '12.12.2024', '12', '30', 1);
      const dateElement2 = screen.queryAllByLabelText(/Dato/i)[1];
      const hoursElement2 = screen.queryAllByTestId('hours-test')[1];
      const minutesElement2 = screen.queryAllByTestId('minutes-test')[1];
      if (dateElement2 && hoursElement2 && minutesElement2) {
        const hoursInput2 = hoursElement2.querySelector('input');
        const minutesInput2 = minutesElement2.querySelector('input');

        await userEvent.type(dateElement2, '12.12.2024');

        if (hoursInput2 && minutesInput2) {
          await userEvent.type(hoursInput2, '12');
          await userEvent.type(minutesInput2, '30');
        }
      }

      await screen.findByTestId(/-delete-button/i);

      await clickButtonTimes(/-delete-button/i, 1);

      await screen.findByTestId(/-delete-confirm-modal/i);
    });
    it('Should remove item when delete button is clicked', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: true })),
      };
      await createWrapper(questionnaire);

      await repeatDateTimeNTimes(/Dato/i, 'hours-test', 'minutes-test', '12.12.2024', '12', '30', 1);
      const dateElement2 = screen.queryAllByLabelText(/Dato/i)[1];
      const hoursElement2 = screen.queryAllByTestId('hours-test')[1];
      const minutesElement2 = screen.queryAllByTestId('minutes-test')[1];
      if (dateElement2 && hoursElement2 && minutesElement2) {
        const hoursInput2 = hoursElement2.querySelector('input');
        const minutesInput2 = minutesElement2.querySelector('input');

        await userEvent.type(dateElement2, '12.12.2024');

        if (hoursInput2 && minutesInput2) {
          await userEvent.type(hoursInput2, '12');
          await userEvent.type(minutesInput2, '30');
        }
      }
      await screen.findByTestId(/-delete-button/i);

      await clickButtonTimes(/-delete-button/i, 1);

      // const confirmModal = screen.getByTestId(/-delete-confirm-modal/i);

      await userEvent.click(await screen.findByRole('button', { name: /Forkast endringer/i }));

      await waitFor(async () => expect(screen.queryByTestId(/-delete-button/i)).not.toBeInTheDocument());
    });
  });
  describe('onChange', () => {
    it('Should update date field with value from answer', async () => {
      await createWrapper(q);

      const inputElement = screen.getByLabelText(/Dato/i);

      expect(inputElement).toBeInTheDocument();
      expect(inputElement).toHaveAttribute('type', 'text');
      expect(inputElement).toHaveAttribute('id', `item_${q?.item?.[0].linkId}^0-datepicker`);

      await userEvent.type(inputElement, '31.05.1994');

      await waitFor(async () => expect(inputElement).toHaveValue('31.05.1994'));
    });
    it('Should update hours field with value from answer', async () => {
      await createWrapper(q);

      const hoursElement = screen.getByTestId(/hours-test/i);

      const hoursInput = hoursElement.querySelector('input');

      if (hoursInput) {
        await userEvent.clear(hoursInput);
        await userEvent.type(hoursInput, '14');
      }

      await waitFor(async () => expect(hoursInput).toHaveValue(14));
    });
    it('Should update minutes field with value from answer', async () => {
      await createWrapper(q);

      const minutesElement = screen.getByTestId(/minutes-test/i);

      const minutesInput = minutesElement.querySelector('input');

      if (minutesInput) {
        await userEvent.type(minutesInput, '00');
      }
      await waitFor(async () => expect(minutesInput).toHaveValue(Number('00')));
    });
    it('Should call onChange with correct value when date field changes', async () => {
      const onChange = vi.fn();
      await createWrapper(q, { onChange });

      const dateElement = screen.getByLabelText(/Dato/i);
      const hoursElement = await screen.findByTestId('hours-test');
      const minutesElement = await screen.findByTestId('minutes-test');

      const hoursInput = hoursElement.querySelector('input');

      const minutesInput = minutesElement.querySelector('input');

      expect(screen.getByLabelText(/Dato/i)).toBeInTheDocument();

      await userEvent.type(dateElement, '12.12.2024');
      if (hoursInput && minutesInput) {
        await userEvent.type(hoursInput, '12');
        await userEvent.type(minutesInput, '30');
      }

      const expectedDateHoursMinutes = new Date('2024-12-12T12:30:00');
      const expectedDateString = format(expectedDateHoursMinutes, DateFormat.yyyyMMddHHmmssXXX);
      const expectedAnswer: QuestionnaireResponseItemAnswer = {
        valueDateTime: expectedDateString,
      };

      await waitFor(async () => expect(onChange).toHaveBeenCalledTimes(14));
      await waitFor(async () =>
        expect(onChange).toHaveBeenCalledWith(expect.any(Object), expectedAnswer, expect.any(Object), expect.any(Object))
      );
    });
  });
  describe('Validation', () => {
    it('Should show error if field is required and value is empty', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, required: true })),
      };
      await createWrapper(questionnaire);

      await submitForm();

      await screen.findByText(resources.formRequiredErrorMessage);
    });
    it('Should not show error if required and has value', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, required: true })),
      };
      await createWrapper(questionnaire);

      const hoursElement = screen.getByTestId(/hours-test/i);
      const minutesElement = screen.getByTestId(/minutes-test/i);

      const hoursInput = hoursElement.querySelector('input');

      const minutesInput = minutesElement.querySelector('input');

      await userEvent.type(screen.getByLabelText(/Dato/i), '12.12.2024');
      if (hoursInput && minutesInput) {
        await userEvent.type(hoursInput, '12');
        await userEvent.type(minutesInput, '30');
      }

      await submitForm();
      await waitFor(async () => expect(screen.queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument());
    });
    it('Should show error if date is invalid', async () => {
      await createWrapper(q);

      await userEvent.type(screen.getByLabelText(/Dato/i), '313131');
      await submitForm();

      await screen.findByText(resources.dateError_invalid);
    });
    it('Should show error message for min value', async () => {
      await createWrapper(qMinMax);

      await userEvent.type(screen.getByLabelText(/Dato/i), '31.05.1904');
      await submitForm();

      await screen.findByText(resources.errorBeforeMinDate + ': 31.05.1994');
    });
    it('Should show error message for max value', async () => {
      await createWrapper(qMinMax);

      await userEvent.type(screen.getByLabelText(/Dato/i), '31.05.2095');
      await submitForm();

      await screen.findByText(resources.errorAfterMaxDate + ': 31.05.2094');
    });
    it('Should show custom error message for min value', async () => {
      await createWrapper(qMinMaxCustomError);

      await userEvent.type(screen.getByLabelText(/Dato/i), '31.05.1904');
      await submitForm();

      await screen.findByText('Custom errormessage');
    });
    it('Should show custom error message for max value', async () => {
      await createWrapper(qMinMaxCustomError);

      await userEvent.type(screen.getByLabelText(/Dato/i), '31.05.2095');
      await submitForm();

      await screen.findByText('Custom errormessage');
    });
    it('Should not show error if date value is between min value and max value', async () => {
      await createWrapper(qMinMax);

      await userEvent.type(screen.getByLabelText(/Dato/i), '31.05.2024');
      await submitForm();

      await waitFor(async () => expect(screen.queryByText(resources.errorBeforeMinDate + ': 31.05.1994')).not.toBeInTheDocument());
      await waitFor(async () => expect(screen.queryByText(resources.errorAfterMaxDate + ': 31.05.2094')).not.toBeInTheDocument());
    });
    it('Should show error if hour value is invalid', async () => {
      await createWrapper(qMinMax);

      const hoursElement = screen.getByTestId(/hours-test/i);
      const minutesElement = screen.getByTestId(/minutes-test/i);

      const hoursInput = hoursElement.querySelector('input');

      const minutesInput = minutesElement.querySelector('input');

      await userEvent.type(screen.getByLabelText(/Dato/i), '31.05.1994');
      if (hoursInput) {
        await userEvent.clear(hoursInput);
        await userEvent.type(hoursInput, '90');
      }
      if (minutesInput) {
        await userEvent.clear(minutesInput);
        await userEvent.type(minutesInput, '00');
        await submitForm();
      }

      await screen.findByText(resources.dateError_time_invalid);
    });
    it('Should show error if minutes value is invalid', async () => {
      await createWrapper(qMinMax);

      const hoursElement = screen.getByTestId(/hours-test/i);
      const minutesElement = screen.getByTestId(/minutes-test/i);

      const hoursInput = hoursElement.querySelector('input');

      const minutesInput = minutesElement.querySelector('input');

      await userEvent.type(screen.getByLabelText(/Dato/i), '31.05.1994');
      if (hoursInput) {
        await userEvent.clear(hoursInput);
        await userEvent.type(hoursInput, '00');
      }
      if (minutesInput) {
        await userEvent.clear(minutesInput);
        await userEvent.type(minutesInput, '90');
      }
      await submitForm();

      await screen.findByText(resources.dateError_time_invalid);
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

      expect(screen.getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();
    });
  });
});
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createWrapper = async (questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) => {
  return await waitFor(async () => await renderRefero({ questionnaire, props: { ...props, resources } }));
};
