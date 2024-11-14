import { Questionnaire, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { findByRole, renderRefero, userEvent, waitFor } from '@test/test-utils.tsx';
import { q, qMinMax, qMinMaxCustomError } from './__data__/date-day';
import { ReferoProps } from '../../../../types/referoProps';
import { Extensions } from '../../../../constants/extensions';
import { clickButtonTimes, repeatNTimes, submitForm } from '../../../../../test/selectors';
import { getResources } from '../../../../../preview/resources/referoResources';
import { vi } from 'vitest';

const resources = {
  ...getResources(''),
  formRequiredErrorMessage: 'Du må fylle ut dette feltet',
  oppgiGyldigVerdi: 'ikke gyldig tall',
  dateError_invalid: 'Ugyldig dato',
  errorBeforeMinDate: 'Dato kan ikke være før minimums dato',
  errorAfterMaxDate: 'Dato kan ikke være etter maksimum dato',
};

describe('Date day', () => {
  beforeEach(() => {
    process.env.TZ = 'Europe/Oslo';
  });
  afterEach(() => {
    delete process.env.TZ;
  });
  describe('Render', () => {
    it('Should render as text if props.pdf', async () => {
      const { queryByText, queryByTestId } = await createWrapper(q, { pdf: true });
      expect(queryByText('Ikke besvart')).toBeInTheDocument();
      expect(queryByTestId(/pdf/i)).toBeInTheDocument();
    });
    it('Should render as text if item is readonly', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, readOnly: true })),
      };
      const { queryByText, queryByTestId } = await createWrapper(questionnaire);
      expect(queryByText('Ikke besvart')).toBeInTheDocument();
      expect(queryByTestId(/readonly/i)).toBeInTheDocument();
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

      expect(getByLabelText(/Dato/i)).toHaveValue('');
    });

    it('Initial value should be set', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({
          ...x,
          repeats: false,
          initial: [
            {
              valueDate: '1994-05-31',
            },
          ],
        })),
      };
      const { getByLabelText } = await createWrapper(questionnaire);

      expect(getByLabelText(/Dato/i)).toHaveValue('31.05.1994');
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

      const { getByTestId } = await createWrapper(questionnaire);
      const repeatButton = getByTestId(/-repeat-button/i);
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
      const { queryAllByLabelText, queryByTestId } = await createWrapper(questionnaire);
      const input = '31.05.1994';
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
      const { queryAllByTestId } = await createWrapper(questionnaire);

      const input = '31.05.1994';
      await repeatNTimes(input, 2, /Dato/i);

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

      const input = '31.05.1994';
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
      const { getByTestId, queryByTestId } = await createWrapper(questionnaire);

      const input = '31.05.1994';
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
      const { getByLabelText } = await createWrapper(q);

      const inputElement = getByLabelText(/Dato/i);
      expect(inputElement).toBeInTheDocument();
      expect(inputElement).toHaveAttribute('type', 'text');
      expect(inputElement).toHaveAttribute('id', `item_${q?.item?.[0].linkId}^0-datepicker`);

      await userEvent.click(inputElement);
      await userEvent.paste('31.05.1994');
      expect(getByLabelText(/Dato/i)).toHaveValue('31.05.1994');
    });
    it('Should call onChange with correct value', async () => {
      const onChange = vi.fn();
      const { getByLabelText } = await createWrapper(q, { onChange });
      expect(getByLabelText(/Dato/i)).toBeInTheDocument();
      await userEvent.click(getByLabelText(/Dato/i));
      await userEvent.paste('31.05.1994');
      const expectedAnswer: QuestionnaireResponseItemAnswer = {
        valueDate: '1994-05-31',
      };
      expect(onChange).toHaveBeenCalledTimes(1);
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
        const { getByLabelText, queryByText } = await createWrapper(questionnaire);
        await userEvent.type(getByLabelText(/Dato/i), '31.05.1994');
        await submitForm();

        expect(queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
      });
      it('Should remove error on change if form is submitted', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, required: true })),
        };
        const { getByText, queryByText, getByLabelText } = await createWrapper(questionnaire);
        await submitForm();
        expect(getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();

        await userEvent.type(getByLabelText(/Dato/i), '31.05.1994');
        await userEvent.tab();
        expect(queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
      });
      it('Should show error if date is invalid', async () => {
        const { getByLabelText, getByText } = await createWrapper(q);

        await userEvent.type(getByLabelText(/Dato/i), '313131');

        await submitForm();
        expect(getByText(resources.dateError_invalid)).toBeInTheDocument();
      });
      it('Should show error message for min value', async () => {
        const { getByLabelText, getByText } = await createWrapper(qMinMax);

        await userEvent.type(getByLabelText(/Dato/i), '31.05.1904');
        await submitForm();
        expect(getByText(resources.errorBeforeMinDate + ': 31.05.1994')).toBeInTheDocument();
      });
      it('Should show error message for max value', async () => {
        const { getByLabelText, getByText } = await createWrapper(qMinMax);

        await userEvent.type(getByLabelText(/Dato/i), '31.05.2095');

        await submitForm();
        expect(getByText(resources.errorAfterMaxDate + ': 31.05.2094')).toBeInTheDocument();
      });
      it('Should show custom error message for min value', async () => {
        const { getByLabelText, getByText } = await createWrapper(qMinMaxCustomError);

        await userEvent.type(getByLabelText(/Dato/i), '31.05.1904');

        await submitForm();
        expect(getByText('Custom errormessage')).toBeInTheDocument();
      });
      it('Should show custom error message for max value', async () => {
        const { getByLabelText, getByText } = await createWrapper(qMinMaxCustomError);

        await userEvent.type(getByLabelText(/Dato/i), '31.05.2095');

        await submitForm();
        expect(getByText('Custom errormessage')).toBeInTheDocument();
      });
      it('Should not show error if date value is between min value and max value', async () => {
        const { getByLabelText, queryByText } = await createWrapper(qMinMax);

        await userEvent.type(getByLabelText(/Dato/i), '31.05.2024');

        await submitForm();
        expect(queryByText(resources.errorBeforeMinDate + ': 31.05.1994')).not.toBeInTheDocument();
        expect(queryByText(resources.errorAfterMaxDate + ': 31.05.2094')).not.toBeInTheDocument();
      });
      it('Should remove error on change if form is submitted', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, required: true })),
        };
        const { getByLabelText, getByText, queryByText } = await createWrapper(questionnaire);
        await submitForm();

        expect(getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();

        await userEvent.type(getByLabelText(/Dato/i), '31.05.2024');

        expect(queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
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
