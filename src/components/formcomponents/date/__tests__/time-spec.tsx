import { Questionnaire, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { findByRole, renderRefero, userEvent } from '@test/test-utils.tsx';
import { q, qMinMaxCustomError } from './__data__/time';
import { ReferoProps } from '../../../../types/referoProps';
import { Extensions } from '../../../../constants/extensions';
import { clickButtonTimes, repeatNTimes, submitForm } from '../../../../../test/selectors';
import { getResources } from '../../../../../preview/resources/referoResources';
import { vi } from 'vitest';
import { screen, waitFor } from '@testing-library/dom';

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
      const { queryByText } = await createWrapper(q, { pdf: true });
      expect(queryByText('Ikke besvart')).toBeInTheDocument();
    });
    it('Should render text if item is readonly', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, readOnly: true })),
      };
      const { queryByText } = await createWrapper(questionnaire);
      expect(queryByText('Ikke besvart')).toBeInTheDocument();
    });
    it('Should render as input if props.pdf === false && item is not readonly', async () => {
      const { queryByText } = await createWrapper(q);
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
      const { getByLabelText } = await createWrapper(questionnaire);

      expect(getByLabelText(/Klokkeslett/i)).toHaveValue(null);
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
      const { getByLabelText } = await createWrapper(questionnaire);

      const minutesElement = await screen.findByTestId('time-2');

      const hoursInput = getByLabelText(/Klokkeslett/i);
      const minutesInput = minutesElement.querySelector('input');

      expect(hoursInput).toHaveValue(Number('14'));
      expect(minutesInput).toHaveValue(Number('30'));
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
      const { queryByTestId } = await createWrapper(questionnaire);
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
      const { queryAllByTestId } = await createWrapper(questionnaire);

      const input = '14';
      await repeatNTimes(input, 2, /Klokkeslett/i);

      expect(queryAllByTestId(/-delete-button/i)).toHaveLength(2);
    });
    it('Should not render delete button if item repeats and number of repeated items is lower or equal than minOccurance(2)', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: true })),
      };
      const { queryByTestId } = await createWrapper(questionnaire);

      expect(queryByTestId(/-delete-button/i)).not.toBeInTheDocument();
    });
    it('Should show confirmationbox when deletebutton is clicked', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: true })),
      };
      const { getByTestId } = await createWrapper(questionnaire);

      const input = '14';
      await repeatNTimes(input, 1, /Klokkeslett/i);

      expect(getByTestId(/-delete-button/i)).toBeInTheDocument();
      await clickButtonTimes(/-delete-button/i, 1);

      expect(getByTestId(/-delete-confirm-modal/i)).toBeInTheDocument();
    });
    it('Should remove item when delete button is clicked', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: true })),
      };
      const { getByTestId, queryByTestId } = await createWrapper(questionnaire);

      const input = '14';
      await repeatNTimes(input, 1, /Klokkeslett/i);

      expect(getByTestId(/-delete-button/i)).toBeInTheDocument();
      await clickButtonTimes(/-delete-button/i, 1);

      const confirmModal = getByTestId(/-delete-confirm-modal/i);
      await userEvent.click(await findByRole(confirmModal, 'button', { name: /Forkast endringer/i }));

      expect(queryByTestId(/-delete-button/i)).not.toBeInTheDocument();
    });
  });
  describe('onChange', () => {
    it('Should update hour field with value from answer', async () => {
      const { getByLabelText } = await createWrapper(q);

      const hoursElement = getByLabelText(/Klokkeslett/i);

      expect(hoursElement).toBeInTheDocument();
      expect(hoursElement).toHaveAttribute('type', 'number');
      expect(hoursElement).toHaveAttribute('id', `item_${q?.item?.[0].linkId}^0-datetime-hours`);
      await userEvent.type(hoursElement, '14');

      expect(hoursElement).toHaveValue(Number('14'));
    });
    it('Should update minutes field with value from answer', async () => {
      const { getByTestId } = await createWrapper(q);

      const minutesElement = getByTestId('time-2');
      const minutesInput = minutesElement.querySelector('input');

      if (minutesInput) {
        await userEvent.type(minutesInput, '30');
      }

      expect(minutesInput).toHaveValue(Number('30'));
    });
    it('Should call onChange with correct value when date field changes', async () => {
      const onChange = vi.fn();
      const { getByLabelText, getByTestId } = await createWrapper(q, { onChange });

      const hoursElement = getByLabelText(/Klokkeslett/i);
      const minutesElement = getByTestId('time-2');
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
        const { getByText } = await createWrapper(questionnaire);
        await submitForm();

        expect(getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();
      });
      it('Should not show error if required and has value', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, required: true })),
        };
        const { getByLabelText, queryByText, getByTestId } = await createWrapper(questionnaire);

        const hoursElement = getByLabelText(/Klokkeslett/i);
        const minutesElement = getByTestId('time-2');
        const minutesInput = minutesElement.querySelector('input');

        await userEvent.type(hoursElement, '14');
        if (minutesInput) {
          await userEvent.type(minutesInput, '30');
        }

        expect(hoursElement).toHaveValue(Number('14'));
        expect(minutesInput).toHaveValue(Number('30'));

        await submitForm();

        expect(queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
      });
      it('Should remove error on change if form is submitted', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, required: true })),
        };
        const { getByText, queryByText, getByLabelText, getByTestId } = await createWrapper(questionnaire);

        await submitForm();
        expect(getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();

        const hoursElement = getByLabelText(/Klokkeslett/i);
        const minutesElement = getByTestId('time-2');
        const minutesInput = minutesElement.querySelector('input');

        await userEvent.type(hoursElement, '14');
        if (minutesInput) {
          userEvent.type(minutesInput, '30');
          userEvent.tab();
        }

        await waitFor(async () => expect(queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument());
      });
      it('Should show error if hour value is invalid', async () => {
        const { getByLabelText, getByText, getByTestId } = await createWrapper(q);

        const hoursElement = getByLabelText(/Klokkeslett/i);
        const minutesElement = getByTestId('time-2');
        const minutesInput = minutesElement.querySelector('input');

        await userEvent.type(hoursElement, '99');
        if (minutesInput) {
          await userEvent.type(minutesInput, '12');
        }

        await submitForm();
        await waitFor(async () => expect(getByText(resources.dateError_time_invalid)).toBeInTheDocument());
      });
      it('Should show error if minute value is invalid', async () => {
        const { getByLabelText, getByText, getByTestId } = await createWrapper(q);

        const hoursElement = getByLabelText(/Klokkeslett/i);
        const minutesElement = getByTestId('time-2');
        const minutesInput = minutesElement.querySelector('input');

        await userEvent.type(hoursElement, '12');
        if (minutesInput) {
          await userEvent.type(minutesInput, '99');
        }

        await submitForm();
        expect(getByText(resources.dateError_time_invalid)).toBeInTheDocument();
      });
      it('Should show error message if time value is lesser than min-time', async () => {
        const { getByTestId, getByLabelText, getByText } = await createWrapper(q);

        const hoursElement = getByLabelText(/Klokkeslett/i);
        const minutesElement = getByTestId('time-2');
        const minutesInput = minutesElement.querySelector('input');

        await userEvent.type(hoursElement, '14');
        if (minutesInput) {
          await userEvent.type(minutesInput, '20');
        }

        await submitForm();
        expect(getByText(resources.dateError_time_invalid)).toBeInTheDocument();
      });
      it('Should show error message if time value is greater than max-time', async () => {
        const { getByTestId, getByLabelText, getByText } = await createWrapper(q);

        const hoursElement = getByLabelText(/Klokkeslett/i);
        const minutesElement = getByTestId('time-2');
        const minutesInput = minutesElement.querySelector('input');

        await userEvent.type(hoursElement, '16');
        if (minutesInput) {
          await userEvent.type(minutesInput, '46');
        }

        await submitForm();
        expect(getByText(resources.dateError_time_invalid)).toBeInTheDocument();
      });
      it('Should show custom error message for min-time', async () => {
        const { getByLabelText, getByTestId, getByText } = await createWrapper(qMinMaxCustomError);

        const hoursElement = getByLabelText(/Klokkeslett/i);
        const minutesElement = getByTestId('time-2');
        const minutesInput = minutesElement.querySelector('input');

        await userEvent.type(hoursElement, '14');
        if (minutesInput) {
          await userEvent.type(minutesInput, '20');
        }

        await submitForm();
        expect(getByText('Custom errormessage')).toBeInTheDocument();
      });
      it('Should show custom error message for max-time', async () => {
        const { getByLabelText, getByTestId, getByText } = await createWrapper(qMinMaxCustomError);

        const hoursElement = getByLabelText(/Klokkeslett/i);
        const minutesElement = getByTestId('time-2');
        const minutesInput = minutesElement.querySelector('input');

        await userEvent.type(hoursElement, '16');
        if (minutesInput) {
          await userEvent.type(minutesInput, '46');
        }

        await submitForm();
        expect(getByText('Custom errormessage')).toBeInTheDocument();
      });
      it('Should not show error if date value is between min-time and max-time', async () => {
        const { getByLabelText, getByTestId, queryByText } = await createWrapper(q);

        const hoursElement = getByLabelText(/Klokkeslett/i);
        const minutesElement = getByTestId('time-2');
        const minutesInput = minutesElement.querySelector('input');

        await userEvent.type(hoursElement, '15');
        if (minutesInput) {
          await userEvent.type(minutesInput, '30');
        }

        await submitForm();
        expect(queryByText(resources.dateError_time_invalid)).not.toBeInTheDocument();
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
        const { getByText } = await createWrapper(questionnaire);
        await submitForm();

        expect(getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();
      });
    });
  });
});

const createWrapper = async (questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) => {
  return await waitFor(() => renderRefero({ questionnaire, props: { ...props, resources } }));
};
