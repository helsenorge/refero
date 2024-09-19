import { Questionnaire, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { act, findByRole, renderRefero, userEvent, waitFor } from '@test/test-utils.tsx';
import { q, qMinMax, qMinMaxCustomError } from './__data__/date-time';
import { ReferoProps } from '../../../../types/referoProps';
import { Extensions } from '../../../../constants/extensions';
import { clickButtonTimes, submitForm } from '../../../../../test/selectors';
import { getResources } from '../../../../../preview/resources/referoResources';
import { vi } from 'vitest';
import { screen } from '@testing-library/dom';

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
      const { queryByText } = createWrapper(q, { pdf: true });
      await waitFor(async () => expect(queryByText('Ikke besvart')).toBeInTheDocument());
    });
    it('Should render text if item is readonly', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, readOnly: true })),
      };
      const { queryByText } = createWrapper(questionnaire);
      await waitFor(async () => expect(queryByText('Ikke besvart')).toBeInTheDocument());
    });
    it('Should render as input if props.pdf === false && item is not readonly', async () => {
      const { queryByText } = createWrapper(q);
      await waitFor(async () => expect(queryByText('Ikke besvart')).not.toBeInTheDocument());
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

      await waitFor(async () => expect(getByLabelText(/Dato/i)).toHaveValue(''));
    });
    it('Initial value should be set', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({
          ...x,
          repeats: false,
          initial: [
            {
              valueDateTime: '1994-05-31T00:00:00+00:00',
            },
          ],
        })),
      };
      const { getByLabelText } = createWrapper(questionnaire);
      const dateInput = getByLabelText(/Dato/i);
      await waitFor(async () => expect(dateInput).toHaveValue('31.05.1994'));
    });
  });
  describe('help button', () => {
    it('Should render helpButton', async () => {
      const { container } = createWrapper(q);
      await waitFor(async () => expect(container.querySelector('.page_refero__helpButton')).toBeInTheDocument());
    });
    it('Should render helpElement when helpbutton is clicked', async () => {
      const { container } = createWrapper(q);

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

      const { getByTestId } = createWrapper(questionnaire);
      const repeatButton = getByTestId(/-repeat-button/i);
      await waitFor(async () => expect(repeatButton).toBeInTheDocument());
    });

    it('Should not render repeat button if item does not repeats', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: false })),
      };
      const { queryByTestId } = createWrapper(questionnaire);
      const repeatButton = queryByTestId(/-repeat-button/i);
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
      const { queryAllByLabelText, queryByTestId } = createWrapper(questionnaire);
      await clickButtonTimes(/-repeat-button/i, 3);

      await waitFor(async () => expect(queryAllByLabelText(/Dato/i)).toHaveLength(4));
      await waitFor(async () => expect(queryByTestId(/-repeat-button/i)).not.toBeInTheDocument());
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

      await waitFor(async () => expect(queryAllByTestId(/-delete-button/i)).toHaveLength(2));
    });
    it('Should not render delete button if item repeats and number of repeated items is lower or equal than minOccurance(2)', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: true })),
      };
      const { queryByTestId } = createWrapper(questionnaire);
      await waitFor(async () => expect(queryByTestId(/-delete-button/i)).not.toBeInTheDocument());
    });
    it('Should show confirmationbox when deletebutton is clicked', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: true })),
      };
      const { getByTestId } = createWrapper(questionnaire);

      await clickButtonTimes(/-repeat-button/i, 1);

      await waitFor(async () => expect(getByTestId(/-delete-button/i)).toBeInTheDocument());

      await clickButtonTimes(/-delete-button/i, 1);

      await waitFor(async () => expect(getByTestId(/-delete-confirm-modal/i)).toBeInTheDocument());
    });
    it('Should remove item when delete button is clicked', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: true })),
      };
      const { getByTestId, queryByTestId } = createWrapper(questionnaire);

      await clickButtonTimes(/-repeat-button/i, 1);

      await waitFor(async () => expect(getByTestId(/-delete-button/i)).toBeInTheDocument());

      await clickButtonTimes(/-delete-button/i, 1);

      const confirmModal = getByTestId(/-delete-confirm-modal/i);

      await userEvent.click(await findByRole(confirmModal, 'button', { name: /Forkast endringer/i }));

      await waitFor(async () => expect(queryByTestId(/-delete-button/i)).not.toBeInTheDocument());
    });
  });
  describe('onChange', () => {
    it('Should update date field with value from answer', async () => {
      const { getByLabelText } = createWrapper(q);

      const inputElement = getByLabelText(/Dato/i);

      expect(inputElement).toBeInTheDocument();
      expect(inputElement).toHaveAttribute('type', 'text');
      expect(inputElement).toHaveAttribute('id', `item_${q?.item?.[0].linkId}^0-datepicker`);

      await userEvent.type(inputElement, '31.05.1994');

      await waitFor(async () => expect(inputElement).toHaveValue('31.05.1994'));
    });
    it('Should update hours field with value from answer', async () => {
      const { getByTestId } = createWrapper(q);

      const hoursElement = getByTestId(/hours-test/i);
      const hoursInput = hoursElement.querySelector('input');

      if (hoursInput) {
        await userEvent.clear(hoursInput);
        await userEvent.type(hoursInput, '14');
      }

      await waitFor(async () => expect(hoursInput).toHaveValue(Number('14')));
    });
    it('Should update minutes field with value from answer', async () => {
      const { getByTestId } = createWrapper(q);

      const minutesElement = getByTestId(/minutes-test/i);
      const minutesInput = minutesElement.querySelector('input');

      if (minutesInput) {
        await userEvent.type(minutesInput, '00');
      }
      await waitFor(async () => expect(minutesInput).toHaveValue(Number('00')));
    });
    it('Should call onChange with correct value when date field changes', async () => {
      const onChange = vi.fn();
      const { getByLabelText } = createWrapper(q, { onChange });
      expect(getByLabelText(/Dato/i)).toBeInTheDocument();

      await userEvent.type(getByLabelText(/Dato/i), '31.05.1994');

      const expectedAnswer: QuestionnaireResponseItemAnswer = {
        valueDateTime: '1994-05-31T00:00:00+02:00',
      };
      await waitFor(async () => expect(onChange).toHaveBeenCalledTimes(10));
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
      const { getByText } = createWrapper(questionnaire);

      await submitForm();

      await waitFor(async () => expect(getByText(resources.formRequiredErrorMessage)).toBeInTheDocument());
    });
    it('Should not show error if required and has value', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, required: true })),
      };
      const { getByLabelText, queryByText } = createWrapper(questionnaire);

      await userEvent.type(getByLabelText(/Dato/i), '31.05.1994');
      await submitForm();

      await waitFor(async () => expect(queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument());
    });
    it('Should show error if date is invalid', async () => {
      const { getByLabelText, getByText } = createWrapper(q);

      await userEvent.type(getByLabelText(/Dato/i), '313131');
      await submitForm();

      await waitFor(async () => expect(getByText(resources.dateError_invalid)).toBeInTheDocument());
    });
    it('Should show error message for min value', async () => {
      const { getByLabelText, getByText } = createWrapper(qMinMax);

      await userEvent.type(getByLabelText(/Dato/i), '31.05.1904');
      await submitForm();

      await waitFor(async () => expect(getByText(resources.errorBeforeMinDate + ': 31.05.1994')).toBeInTheDocument());
    });
    it('Should show error message for max value', async () => {
      const { getByLabelText, getByText } = createWrapper(qMinMax);

      await userEvent.type(getByLabelText(/Dato/i), '31.05.2095');
      await submitForm();

      await waitFor(async () => expect(getByText(resources.errorAfterMaxDate + ': 31.05.2094')).toBeInTheDocument());
    });
    it('Should show custom error message for min value', async () => {
      const { getByLabelText, getByText } = createWrapper(qMinMaxCustomError);

      await userEvent.type(getByLabelText(/Dato/i), '31.05.1904');
      await submitForm();

      await waitFor(async () => expect(getByText('Custom errormessage')).toBeInTheDocument());
    });
    it('Should show custom error message for max value', async () => {
      const { getByLabelText, getByText } = createWrapper(qMinMaxCustomError);

      await userEvent.type(getByLabelText(/Dato/i), '31.05.2095');
      await submitForm();

      await waitFor(async () => expect(getByText('Custom errormessage')).toBeInTheDocument());
    });
    it('Should not show error if date value is between min value and max value', async () => {
      const { getByLabelText, queryByText } = createWrapper(qMinMax);

      await userEvent.type(getByLabelText(/Dato/i), '31.05.2024');
      await submitForm();

      await waitFor(async () => expect(queryByText(resources.errorBeforeMinDate + ': 31.05.1994')).not.toBeInTheDocument());
      await waitFor(async () => expect(queryByText(resources.errorAfterMaxDate + ': 31.05.2094')).not.toBeInTheDocument());
    });
    it('Should show error if hour value is invalid', async () => {
      const { getByText, getByLabelText } = createWrapper(qMinMax);

      const hoursElement = screen.getByTestId(/hours-test/i);
      const minutesElement = screen.getByTestId(/minutes-test/i);
      const hoursInput = hoursElement.querySelector('input');
      const minutesInput = minutesElement.querySelector('input');

      await userEvent.type(getByLabelText(/Dato/i), '31.05.1994');
      if (hoursInput) {
        await userEvent.clear(hoursInput);
        await userEvent.type(hoursInput, '90');
      }
      if (minutesInput) {
        await userEvent.clear(minutesInput);
        await userEvent.type(minutesInput, '00');
        await submitForm();
      }

      await waitFor(async () => expect(getByText(resources.dateError_time_invalid)).toBeInTheDocument());
    });
    it('Should show error if minutes value is invalid', async () => {
      const { getByText, getByLabelText } = createWrapper(qMinMax);

      const hoursElement = screen.getByTestId(/hours-test/i);
      const minutesElement = screen.getByTestId(/minutes-test/i);
      const hoursInput = hoursElement.querySelector('input');
      const minutesInput = minutesElement.querySelector('input');

      await userEvent.type(getByLabelText(/Dato/i), '31.05.1994');
      if (hoursInput) {
        await userEvent.clear(hoursInput);
        await userEvent.type(hoursInput, '00');
      }
      if (minutesInput) {
        await userEvent.clear(minutesInput);
        await userEvent.type(minutesInput, '90');
      }
      await submitForm();

      await waitFor(async () => expect(getByText(resources.dateError_time_invalid)).toBeInTheDocument());
    });
  });
});

const createWrapper = (questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) => {
  return renderRefero({ questionnaire, props: { ...props, resources } });
};
