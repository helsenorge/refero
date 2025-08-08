import { Matcher, renderRefero, screen, userEvent, waitFor } from '@test/test-utils.tsx';
import { Questionnaire, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { vi } from 'vitest';

import { ReferoProps } from '../../../../types/referoProps';

import { q, qCustomErrorMessage } from './__data__';
import { getResources } from '../../../../../preview/resources/referoResources';
import { addManyPropertiesToQuestionnaireItem } from '../../../../../test/questionnairHelpers';
import { clickButtonTimes, getByLabelTextInsideElement, repeatNTimes, submitForm } from '../../../../../test/selectors';
import { Extensions } from '../../../../constants/extensions';

const resources = { ...getResources(''), formRequiredErrorMessage: 'Du må fylle ut dette feltet' };

const getTestId = (questionnaire: Questionnaire): string => {
  const integerItem = questionnaire.item?.find(item => item.type === 'integer');
  const integerInputTestId = `test-integer-item_${integerItem?.linkId}`;
  return integerInputTestId;
};

const getIntegerInput = (questionnaire: Questionnaire, labelText: Matcher): HTMLElement => {
  const integerInputTestId = getTestId(questionnaire);
  const integerInput = getByLabelTextInsideElement(integerInputTestId, labelText);
  return integerInput;
};

describe('Integer', () => {
  describe('Render', () => {
    it('Should render as text if props.pdf', async () => {
      await createWrapper(q, { pdf: true });
      expect(screen.getByText(resources.ikkeBesvart)).toBeInTheDocument();
    });
    it('Should render text if item is readonly', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, readOnly: true })),
      };

      await createWrapper(questionnaire);
      expect(screen.getByText(resources.ikkeBesvart)).toBeInTheDocument();
    });
    it('Should render as input if props.pdf === false && item is not readonly', async () => {
      await createWrapper(q);
      expect(screen.queryByText(resources.ikkeBesvart)).not.toBeInTheDocument();
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

      const integerInput = getIntegerInput(questionnaire, /Integer/i);

      expect(integerInput).toHaveValue(null);
    });
    it('Initial value should be set', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({
          ...x,
          repeats: false,
          initial: [
            {
              valueInteger: 123,
            },
          ],
        })),
      };
      await waitFor(async () => {
        await createWrapper(questionnaire);
      });

      const integerInput = getIntegerInput(questionnaire, /Integer/i);

      expect(integerInput).toHaveValue(123);
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
      const input = '2';
      await repeatNTimes(input, 3, testId, /Integer/i);

      expect(screen.queryAllByTestId(/test-integer/i)).toHaveLength(4);
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
      const input = '2';
      await repeatNTimes(input, 2, testId, /Integer/i);

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
      const questionnaire = addManyPropertiesToQuestionnaireItem(q, [{ property: 'repeats', value: true }]);
      await createWrapper(questionnaire);

      const testId = getTestId(questionnaire);
      const input = '2';
      await repeatNTimes(input, 1, testId, /Integer/i);

      expect(screen.getByTestId(/-delete-button/i)).toBeInTheDocument();

      await clickButtonTimes(/-delete-button/i, 1);

      expect(screen.getByTestId(/-delete-confirm-modal/i)).toBeInTheDocument();
    });
    it('Should remove item when delete button is clicked', async () => {
      const questionnaire = addManyPropertiesToQuestionnaireItem(q, [{ property: 'repeats', value: true }]);
      await createWrapper(questionnaire);

      const testId = getTestId(questionnaire);
      const input = '2';
      await repeatNTimes(input, 1, testId, /Integer/i);

      expect(screen.getByTestId(/-delete-button/i)).toBeInTheDocument();
      await clickButtonTimes(/-delete-button/i, 1);

      // const confirmModal = screen.getByTestId(/-delete-confirm-modal/i);
      await userEvent.click(await screen.findByRole('button', { name: /Forkast endringer/i }));
      expect(screen.queryByTestId(/-delete-button/i)).not.toBeInTheDocument();
    });
  });
  describe('onChange', () => {
    it('Should update component with value from answer', async () => {
      const questionnaire = addManyPropertiesToQuestionnaireItem(q, [{ property: 'repeats', value: false }]);
      await createWrapper(questionnaire);

      const integerInput = getIntegerInput(questionnaire, /Integer/i);

      expect(integerInput).toBeInTheDocument();
      expect(integerInput).toHaveAttribute('type', 'number');
      expect(integerInput).toHaveAttribute('id', `item_${q?.item?.[0].linkId}`);
      await userEvent.type(integerInput, '123');

      expect(integerInput).toHaveValue(123);
    });
    it('Should call onChange with correct value', async () => {
      const questionnaire = addManyPropertiesToQuestionnaireItem(q, [{ property: 'repeats', value: false }]);
      const onChange = vi.fn();
      await createWrapper(questionnaire, { onChange });

      const integerInput = getIntegerInput(questionnaire, /Integer/i);

      expect(integerInput).toBeInTheDocument();
      await userEvent.type(integerInput, '123');
      const expectedAnswer: QuestionnaireResponseItemAnswer = {
        valueInteger: 123,
      };
      expect(onChange).toHaveBeenCalledTimes(3);
      expect(onChange).toHaveBeenCalledWith(expect.any(Object), expectedAnswer, expect.any(Object), expect.any(Object));
    });
  });
  describe('Validation', () => {
    describe('Required', () => {
      it('Should show error if field is required and value is empty', async () => {
        const questionnaire = addManyPropertiesToQuestionnaireItem(q, [{ property: 'required', value: true }]);
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

        const integerInput = getIntegerInput(questionnaire, /Integer/i);

        await userEvent.type(integerInput, '123');
        await submitForm();

        expect(screen.queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
      });
      it('Should remove error on change if form is submitted', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, required: true })),
        };
        await createWrapper(questionnaire);

        const integerInput = getIntegerInput(questionnaire, /Integer/i);

        await submitForm();

        expect(screen.getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();

        await userEvent.type(integerInput, '123');
        await userEvent.tab();

        expect(screen.queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
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
    describe('maxValue', () => {
      it('Should not show error if value is empty', async () => {
        const questionnaire: Questionnaire = {
          ...qCustomErrorMessage,
          item: qCustomErrorMessage.item?.map(x => ({ ...x, required: false })),
        };
        await createWrapper(questionnaire);
        await submitForm();

        expect(screen.queryByText('Custom error')).not.toBeInTheDocument();
      });
      it('Should not show error if value is bellow max value (10) and over min(5)', async () => {
        const questionnaire: Questionnaire = {
          ...qCustomErrorMessage,
          item: qCustomErrorMessage.item?.map(x => ({ ...x, required: false })),
        };
        await createWrapper(questionnaire);

        const integerInput = getIntegerInput(questionnaire, /Integer/i);

        await userEvent.type(integerInput, '8');
        await submitForm();

        expect(screen.queryByText('Custom error')).not.toBeInTheDocument();
      });
      it('Should remove error on change if form is submitted', async () => {
        const questionnaire: Questionnaire = {
          ...qCustomErrorMessage,
          item: qCustomErrorMessage.item?.map(x => ({ ...x, required: false })),
        };
        await createWrapper(questionnaire);

        const integerInput = getIntegerInput(questionnaire, /Integer/i);

        await userEvent.type(integerInput, '12');
        await submitForm();

        expect(screen.getByText('Custom error')).toBeInTheDocument();

        await userEvent.clear(integerInput);
        await userEvent.type(integerInput, '8');

        expect(screen.queryByText('Custom error')).not.toBeInTheDocument();
      });
    });
    describe('minValue', () => {
      it('Should not show error if value is empty', async () => {
        const questionnaire: Questionnaire = {
          ...qCustomErrorMessage,
          item: qCustomErrorMessage.item?.map(x => ({ ...x, required: false })),
        };
        await createWrapper(questionnaire);
        await submitForm();

        expect(screen.queryByText('Custom error')).not.toBeInTheDocument();
      });
      it('Should not show error if value is bellow max value (10) and over min(5)', async () => {
        const questionnaire = addManyPropertiesToQuestionnaireItem(qCustomErrorMessage, [{ property: 'required', value: false }]);

        await createWrapper(questionnaire);

        const integerInput = getIntegerInput(questionnaire, /Integer/i);

        await userEvent.type(integerInput, '8');
        await submitForm();

        expect(screen.queryByText('Custom error')).not.toBeInTheDocument();
      });
      it('Should remove error on change if form is submitted', async () => {
        const questionnaire: Questionnaire = {
          ...qCustomErrorMessage,
          item: qCustomErrorMessage.item?.map(x => ({ ...x, required: false, repeats: false })),
        };
        await createWrapper(questionnaire);

        const integerInput = getIntegerInput(questionnaire, /Integer/i);

        await userEvent.type(integerInput, '3');
        await submitForm();

        expect(screen.getByText('Custom error')).toBeInTheDocument();

        await userEvent.clear(integerInput);
        await userEvent.type(integerInput, '8');

        expect(screen.queryByText('Custom error')).not.toBeInTheDocument();
      });
    });
  });
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createWrapper = async (questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) => {
  return await waitFor(async () => {
    return renderRefero({ questionnaire, props: { ...props, resources } });
  });
};
