import { Matcher, renderRefero, screen, userEvent, waitFor } from '@test/test-utils.tsx';
import { Questionnaire, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { vi } from 'vitest';

import { ReferoProps } from '../../../../types/referoProps';

import { q, qMinMax, qMinMaxCustomError } from './__data__/date-day';
import { getResources } from '../../../../../preview/resources/referoResources';
import { clickButtonTimes, getByLabelTextInsideElement, repeatNTimes, submitForm } from '../../../../../test/selectors';
import { Extensions } from '../../../../constants/extensions';

const resources = {
  ...getResources(''),
  formRequiredErrorMessage: 'Du må fylle ut dette feltet',
  oppgiGyldigVerdi: 'ikke gyldig tall',
  dateError_invalid: 'Ugyldig dato',
  errorBeforeMinDate: 'Dato kan ikke være før minimums dato',
  errorAfterMaxDate: 'Dato kan ikke være etter maksimum dato',
};

const getTestId = (questionnaire: Questionnaire): string => {
  const dateItem = questionnaire.item?.find(item => item.type === 'date');
  const dateInputTestId = `test-dateDay-item_${dateItem?.linkId}`;
  return dateInputTestId;
};

const getDateInput = (questionnaire: Questionnaire, labelText: Matcher): HTMLElement => {
  const dateInputTestId = getTestId(questionnaire);
  const dateInput = getByLabelTextInsideElement(dateInputTestId, labelText);
  return dateInput;
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
      await createWrapper(q, { pdf: true });
      expect(screen.getByText('Ikke besvart')).toBeInTheDocument();
      expect(screen.getByTestId(/pdf/i)).toBeInTheDocument();
    });
    it('Should render as text if item is readonly', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, readOnly: true })),
      };
      await createWrapper(questionnaire);
      expect(screen.getByText('Ikke besvart')).toBeInTheDocument();
      expect(screen.getByTestId(/readonly/i)).toBeInTheDocument();
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

      const dateInput = getDateInput(questionnaire, /Dato/i);

      expect(dateInput).toHaveValue('');
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
      await waitFor(async () => {
        await createWrapper(questionnaire);
      });
      const dateInput = getDateInput(questionnaire, /Dato/i);

      expect(dateInput).toHaveValue('31.05.1994');
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
      const input = '31.05.1994';
      await repeatNTimes(input, 3, testId, /Dato/i);

      expect(screen.queryAllByTestId(/test-dateDay/i)).toHaveLength(4);
      expect(screen.queryByTestId(/-repeat-button/i)).not.toBeInTheDocument();
    });
  });
  describe('delete button', () => {
    it('Should render delete button if item repeats and number of repeated items is greater than minOccurance(2)', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, required: true, repeats: true })),
      };

      await createWrapper(questionnaire);

      const testId = getTestId(questionnaire);
      const input = '31.05.1994';
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
      const input = '31.05.1994';
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
      const input = '31.05.1994';
      await repeatNTimes(input, 1, testId, /Dato/i);

      expect(screen.getByTestId(/-delete-button/i)).toBeInTheDocument();

      await clickButtonTimes(/-delete-button/i, 1);
      await userEvent.click(await screen.findByRole('button', { name: /Forkast endringer/i }));

      expect(screen.queryByTestId(/-delete-button/i)).not.toBeInTheDocument();
    });
  });
  describe('onChange', () => {
    it('Should update component with value from answer', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: false })),
      };
      await createWrapper(questionnaire);

      const dateInput = getDateInput(q, /Dato/i);

      expect(dateInput).toBeInTheDocument();
      expect(dateInput).toHaveAttribute('type', 'text');
      expect(dateInput).toHaveAttribute('id', `item_${q?.item?.[0].linkId}-datepicker`);

      await userEvent.click(dateInput);
      await userEvent.paste('31.05.1994');

      expect(dateInput).toHaveValue('31.05.1994');
    });
    it('Should call onChange with correct value', async () => {
      const onChange = vi.fn();
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: false })),
      };
      await createWrapper(questionnaire, { onChange });

      const dateInput = getDateInput(q, /Dato/i);

      expect(dateInput).toBeInTheDocument();

      await userEvent.click(dateInput);
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
          item: q.item?.map(x => ({ ...x, repeats: false })),
        };
        await createWrapper(questionnaire);
        await submitForm();

        expect(screen.getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();
      });
      it('Should not show error if required and has value', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, repeats: false })),
        };
        await createWrapper(questionnaire);

        const dateInput = getDateInput(q, /Dato/i);

        await userEvent.type(dateInput, '31.05.1994');
        await submitForm();

        expect(screen.queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
      });
      it('Should remove error on change if form is submitted', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, repeats: false })),
        };
        await createWrapper(questionnaire);
        await submitForm();
        expect(screen.getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();

        const dateInput = getDateInput(q, /Dato/i);
        await userEvent.type(dateInput, '31.05.1994');
        await userEvent.tab();

        expect(screen.queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
      });
      it('Should show error if date is invalid', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, repeats: false })),
        };
        await createWrapper(questionnaire);

        const dateInput = getDateInput(q, /Dato/i);
        await userEvent.type(dateInput, '313131');
        await submitForm();

        expect(screen.getByText(resources.dateError_invalid)).toBeInTheDocument();
      });
      it('Should show error message for min value', async () => {
        await createWrapper(qMinMax);

        const dateInput = getDateInput(q, /Dato/i);
        await userEvent.type(dateInput, '31.05.1904');
        await submitForm();

        expect(screen.getByText(resources.errorBeforeMinDate + ': 31.05.1994')).toBeInTheDocument();
      });
      it('Should show error message for max value', async () => {
        await createWrapper(qMinMax);

        const dateInput = getDateInput(q, /Dato/i);
        await userEvent.type(dateInput, '31.05.2095');
        await submitForm();

        expect(screen.getByText(resources.errorAfterMaxDate + ': 31.05.2094')).toBeInTheDocument();
      });
      it('Should show custom error message for min value', async () => {
        await createWrapper(qMinMaxCustomError);

        const dateInput = getDateInput(q, /Dato/i);
        await userEvent.type(dateInput, '31.05.1904');
        await submitForm();

        expect(screen.getByText('Custom errormessage')).toBeInTheDocument();
      });
      it('Should show custom error message for max value', async () => {
        await createWrapper(qMinMaxCustomError);

        const dateInput = getDateInput(q, /Dato/i);
        await userEvent.type(dateInput, '31.05.2095');
        await submitForm();

        expect(screen.getByText('Custom errormessage')).toBeInTheDocument();
      });
      it('Should not show error if date value is between min value and max value', async () => {
        await createWrapper(qMinMax);

        const dateInput = getDateInput(q, /Dato/i);
        await userEvent.type(dateInput, '31.05.2024');
        await submitForm();

        expect(screen.queryByText(resources.errorBeforeMinDate + ': 31.05.1994')).not.toBeInTheDocument();
        expect(screen.queryByText(resources.errorAfterMaxDate + ': 31.05.2094')).not.toBeInTheDocument();
      });
      it('Should remove error on change if form is submitted', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, repeats: false })),
        };
        await createWrapper(questionnaire);
        await submitForm();

        expect(screen.getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();

        const dateInput = getDateInput(q, /Dato/i);
        await userEvent.type(dateInput, '31.05.2024');

        expect(screen.queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
      });
      it('readOnly value should get validation error if error exist', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({
            ...x,
            readOnly: true,
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
  return await renderRefero({ questionnaire, props: { ...props, resources } });
};
