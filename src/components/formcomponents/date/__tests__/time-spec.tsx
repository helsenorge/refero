import { renderRefero, userEvent } from '@test/test-utils.tsx';
import { screen, waitFor } from '@testing-library/react';
import { Questionnaire, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { vi } from 'vitest';

import { ReferoProps } from '../../../../types/referoProps';

import { q, qMinMaxCustomError } from './__data__/time';
import { getResources } from '../../../../../preview/resources/referoResources';
import { clickButtonTimes, repeatNTimes, submitForm } from '../../../../../test/selectors';
import { Extensions } from '../../../../constants/extensions';

const resources = {
  ...getResources(''),
  formRequiredErrorMessage: 'Du må fylle ut dette feltet',
  oppgiGyldigVerdi: 'ikke gyldig tall',
  dateError_invalid: 'Ugyldig dato',
  errorBeforeMinDate: 'Dato kan ikke være før minimums dato',
  errorAfterMaxDate: 'Dato kan ikke være etter maksimum dato',
  dateError_time_invalid: 'Ugyldig klokkeslett',
};

describe('Time', () => {
  beforeEach(() => {
    process.env.TZ = 'Europe/Oslo';
  });
  afterEach(() => {
    delete process.env.TZ;
  });
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
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({
          ...x,
          repeats: false,
        })),
      };
      await createWrapper(questionnaire);

      expect(screen.getByLabelText(/Klokkeslett/i)).toHaveValue(null);
    });
    it('Initial value should be set', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({
          ...x,
          repeats: false,
          initial: [
            {
              valueTime: '14:30:00',
            },
          ],
        })),
      };
      await createWrapper(questionnaire);

      const minutesElement = await screen.findByTestId('time-2');

      const hoursInput = screen.getByLabelText(/Klokkeslett/i);
      // eslint-disable-next-line testing-library/no-node-access
      const minutesInput = minutesElement.querySelector('input');

      expect(hoursInput).toHaveValue(Number('14'));
      expect(minutesInput).toHaveValue(Number('30'));
    });
  });
  describe('help button', () => {
    it('Should render helpButton', async () => {
      const { container } = await createWrapper(q);

      // eslint-disable-next-line testing-library/no-node-access
      expect(container.querySelector('.page_refero__helpButton')).toBeInTheDocument();
    });
    it('Should render helpElement when helpbutton is clicked', async () => {
      const { container } = await createWrapper(q);

      // eslint-disable-next-line testing-library/no-node-access
      expect(container.querySelector('.page_refero__helpButton')).toBeInTheDocument();

      // eslint-disable-next-line testing-library/no-node-access
      expect(container.querySelector('.page_refero__helpComponent--open')).not.toBeInTheDocument();

      // eslint-disable-next-line testing-library/no-node-access
      const helpButton = container.querySelector('.page_refero__helpButton');
      if (helpButton) {
        await userEvent.click(helpButton);
      }

      // eslint-disable-next-line testing-library/no-node-access
      expect(container.querySelector('.page_refero__helpComponent--open')).toBeInTheDocument();
    });
  });
  describe('repeat button', () => {
    it('Should render repeat button if item repeats', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: true })),
      };

      await createWrapper(questionnaire);
      const repeatButton = await screen.findByTestId(/-repeat-button/i);
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
      const input = '14';
      await repeatNTimes(input, 3, /Klokkeslett/i);
      await waitFor(async () => expect(screen.queryAllByLabelText(/Klokkeslett/i)).toHaveLength(4));
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

      const input = '14';
      await repeatNTimes(input, 2, /Klokkeslett/i);

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

      const input = '14';
      await repeatNTimes(input, 1, /Klokkeslett/i);

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

      const input = '14';
      await repeatNTimes(input, 1, /Klokkeslett/i);

      expect(screen.getByTestId(/-delete-button/i)).toBeInTheDocument();
      await clickButtonTimes(/-delete-button/i, 1);

      // const confirmModal = screen.getByTestId(/-delete-confirm-modal/i);
      await userEvent.click(await screen.findByRole('button', { name: /Forkast endringer/i }));

      expect(screen.queryByTestId(/-delete-button/i)).not.toBeInTheDocument();
    });
  });
  describe('onChange', () => {
    it('Should update hour field with value from answer', async () => {
      await createWrapper(q);

      const hoursElement = screen.getByLabelText(/Klokkeslett/i);

      expect(hoursElement).toBeInTheDocument();
      expect(hoursElement).toHaveAttribute('type', 'number');
      expect(hoursElement).toHaveAttribute('id', `item_${q?.item?.[0].linkId}^0-datetime-hours`);
      await userEvent.type(hoursElement, '14');

      expect(hoursElement).toHaveValue(Number('14'));
    });
    it('Should update minutes field with value from answer', async () => {
      await createWrapper(q);

      const minutesElement = screen.getByTestId('time-2');
      // eslint-disable-next-line testing-library/no-node-access
      const minutesInput = minutesElement.querySelector('input');

      if (minutesInput) {
        await userEvent.type(minutesInput, '30');
      }

      expect(minutesInput).toHaveValue(Number('30'));
    });
    it('Should call onChange with correct value when date field changes', async () => {
      const onChange = vi.fn();
      await createWrapper(q, { onChange });

      const hoursElement = screen.getByLabelText(/Klokkeslett/i);
      const minutesElement = screen.getByTestId('time-2');
      // eslint-disable-next-line testing-library/no-node-access
      const minutesInput = minutesElement.querySelector('input');

      await userEvent.type(hoursElement, '14');
      if (minutesInput) {
        await userEvent.type(minutesInput, '30');
      }

      const expectedAnswer: QuestionnaireResponseItemAnswer = {
        valueTime: '14:30:00',
      };
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

        expect(screen.getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();
      });
      it('Should not show error if required and has value', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, required: true })),
        };
        await createWrapper(questionnaire);

        const hoursElement = screen.getByLabelText(/Klokkeslett/i);
        const minutesElement = screen.getByTestId('time-2');
        // eslint-disable-next-line testing-library/no-node-access
        const minutesInput = minutesElement.querySelector('input');

        await userEvent.type(hoursElement, '14');
        if (minutesInput) {
          await userEvent.type(minutesInput, '30');
        }

        expect(hoursElement).toHaveValue(Number('14'));
        expect(minutesInput).toHaveValue(Number('30'));

        await submitForm();

        expect(screen.queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
      });
      it('Should remove error on change if form is submitted', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, required: true })),
        };
        await createWrapper(questionnaire);

        await submitForm();
        expect(screen.getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();

        const hoursElement = screen.getByLabelText(/Klokkeslett/i);
        const minutesElement = screen.getByTestId('time-2');
        // eslint-disable-next-line testing-library/no-node-access
        const minutesInput = minutesElement.querySelector('input');

        await userEvent.type(hoursElement, '14');
        if (minutesInput) {
          await userEvent.type(minutesInput, '30');
          await userEvent.tab();
        }

        await waitFor(async () => expect(screen.queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument());
      });
      it('Should show error if hour value is invalid', async () => {
        await createWrapper(q);

        const hoursElement = screen.getByLabelText(/Klokkeslett/i);
        const minutesElement = screen.getByTestId('time-2');
        // eslint-disable-next-line testing-library/no-node-access
        const minutesInput = minutesElement.querySelector('input');

        await userEvent.type(hoursElement, '99');
        if (minutesInput) {
          await userEvent.type(minutesInput, '12');
        }

        await submitForm();
        await screen.findByText(resources.dateError_time_invalid);
      });
      it('Should show error if minute value is invalid', async () => {
        await createWrapper(q);

        const hoursElement = screen.getByLabelText(/Klokkeslett/i);
        const minutesElement = screen.getByTestId('time-2');
        // eslint-disable-next-line testing-library/no-node-access
        const minutesInput = minutesElement.querySelector('input');

        await userEvent.type(hoursElement, '12');
        if (minutesInput) {
          await userEvent.type(minutesInput, '99');
        }

        await submitForm();
        expect(screen.getByText(resources.dateError_time_invalid)).toBeInTheDocument();
      });
      it('Should show error message if time value is lesser than min-time', async () => {
        await createWrapper(q);

        const hoursElement = screen.getByLabelText(/Klokkeslett/i);
        const minutesElement = screen.getByTestId('time-2');
        // eslint-disable-next-line testing-library/no-node-access
        const minutesInput = minutesElement.querySelector('input');

        await userEvent.type(hoursElement, '14');
        if (minutesInput) {
          await userEvent.type(minutesInput, '20');
        }

        await submitForm();
        expect(screen.getByText(resources.dateError_time_invalid)).toBeInTheDocument();
      });
      it('Should show error message if time value is greater than max-time', async () => {
        await createWrapper(q);

        const hoursElement = screen.getByLabelText(/Klokkeslett/i);
        const minutesElement = screen.getByTestId('time-2');
        // eslint-disable-next-line testing-library/no-node-access
        const minutesInput = minutesElement.querySelector('input');

        await userEvent.type(hoursElement, '16');
        if (minutesInput) {
          await userEvent.type(minutesInput, '46');
        }

        await submitForm();
        expect(screen.getByText(resources.dateError_time_invalid)).toBeInTheDocument();
      });
      it('Should show custom error message for min-time', async () => {
        await createWrapper(qMinMaxCustomError);

        const hoursElement = screen.getByLabelText(/Klokkeslett/i);
        const minutesElement = screen.getByTestId('time-2');
        // eslint-disable-next-line testing-library/no-node-access
        const minutesInput = minutesElement.querySelector('input');

        await userEvent.type(hoursElement, '14');
        if (minutesInput) {
          await userEvent.type(minutesInput, '20');
        }

        await submitForm();
        expect(screen.getByText('Custom errormessage')).toBeInTheDocument();
      });
      it('Should show custom error message for max-time', async () => {
        await createWrapper(qMinMaxCustomError);

        const hoursElement = screen.getByLabelText(/Klokkeslett/i);
        const minutesElement = screen.getByTestId('time-2');
        // eslint-disable-next-line testing-library/no-node-access
        const minutesInput = minutesElement.querySelector('input');

        await userEvent.type(hoursElement, '16');
        if (minutesInput) {
          await userEvent.type(minutesInput, '46');
        }

        await submitForm();
        expect(screen.getByText('Custom errormessage')).toBeInTheDocument();
      });
      it('Should not show error if date value is between min-time and max-time', async () => {
        await createWrapper(q);

        const hoursElement = screen.getByLabelText(/Klokkeslett/i);
        const minutesElement = screen.getByTestId('time-2');
        // eslint-disable-next-line testing-library/no-node-access
        const minutesInput = minutesElement.querySelector('input');

        await userEvent.type(hoursElement, '15');
        if (minutesInput) {
          await userEvent.type(minutesInput, '30');
        }

        await submitForm();
        expect(screen.queryByText(resources.dateError_time_invalid)).not.toBeInTheDocument();
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
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createWrapper = async (questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) => {
  return await waitFor(async () => await renderRefero({ questionnaire, props: { ...props, resources } }));
};
