import { renderRefero, screen, userEvent, waitFor } from '@test/test-utils.tsx';
import { Questionnaire, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { vi } from 'vitest';

import { ReferoProps } from '../../../../types/referoProps';

import { q, qCustomErrorMessage } from './__data__';
import { getResources } from '../../../../../preview/resources/referoResources';
import { clickButtonTimes, repeatNTimes, submitForm } from '../../../../../test/selectors';
import { Extensions } from '../../../../constants/extensions';

const resources = { ...getResources(''), formRequiredErrorMessage: 'Du må fylle ut dette feltet', oppgiGyldigVerdi: 'ikke gyldig tall' };

describe('Quantity', () => {
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
    it('Should render with correct unit', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({
          ...x,
          repeats: true,
        })),
      };
      await createWrapper(questionnaire);
      expect(screen.getByText('centimeter')).toBeInTheDocument();
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

      expect(screen.getByLabelText(/Quantity/i)).toHaveValue(null);
    });
    it('Initial value should be set', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({
          ...x,
          repeats: false,
          initial: [
            {
              valueQuantity: {
                code: 'cm',
                system: 'http://unitsofmeasure.org',
                unit: 'centimeter',
                value: 12.3,
              },
            },
          ],
        })),
      };
      await waitFor(async () => {
        await createWrapper(questionnaire);
      });
      expect(screen.getByLabelText(/Quantity/i)).toHaveValue(12.3);
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
        item: q.item?.map(x => ({ ...x, repeats: true, readOnly: false })),
        extension: q.extension?.map(y => {
          if (y.url === Extensions.MIN_OCCURS_URL) {
            return { ...y, valueInteger: 2 };
          }
          return y;
        }),
      };
      await createWrapper(questionnaire);

      const input = '2.2';
      await repeatNTimes(input, 3, /Quantity/i);

      expect(screen.queryAllByLabelText(/Quantity/i)).toHaveLength(4);
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

      const input = '2.2';
      await repeatNTimes(input, 2, /Quantity/i);

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
      const input = '2.2';
      await repeatNTimes(input, 1, /Quantity/i);

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
      const input = '2.2';
      await repeatNTimes(input, 1, /Quantity/i);

      expect(screen.getByTestId(/-delete-button/i)).toBeInTheDocument();
      await clickButtonTimes(/-delete-button/i, 1);

      // const confirmModal = screen.getByTestId(/-delete-confirm-modal/i);
      await userEvent.click(await screen.findByRole('button', { name: /Forkast endringer/i }));
      expect(screen.queryByTestId(/-delete-button/i)).not.toBeInTheDocument();
    });
  });
  describe('onChange', () => {
    it('Should update component with value from answer', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({
          ...x,
          repeats: true,
          extension: [
            ...(q.extension ?? []), // Spread the existing extensions or use an empty array if undefined
            {
              url: Extensions.QUESTIONNAIRE_UNIT_URL,
              valueCoding: {
                code: 'cm',
                display: 'centimeter',
                system: 'http://unitsofmeasure.org',
              },
            },
          ],
        })),
      };
      await createWrapper(questionnaire);

      expect(screen.getByLabelText(/Quantity/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Quantity/i)).toHaveAttribute('type', 'number');
      expect(screen.getByLabelText(/Quantity/i)).toHaveAttribute('id', `item_${q?.item?.[0].linkId}^0`);
      await userEvent.type(screen.getByLabelText(/Quantity/i), '123');
      expect(screen.getByLabelText(/Quantity/i)).toHaveValue(123);
    });
    it('Should update component with value from answer - without unit', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({
          ...x,
          repeats: true,
          extension: [...(q.extension ?? [])],
        })),
      };
      await createWrapper(questionnaire);

      expect(screen.getByLabelText(/Quantity/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Quantity/i)).toHaveAttribute('type', 'number');
      expect(screen.getByLabelText(/Quantity/i)).toHaveAttribute('id', `item_${q?.item?.[0].linkId}^0`);
      await userEvent.type(screen.getByLabelText(/Quantity/i), '123');
      expect(screen.getByLabelText(/Quantity/i)).toHaveValue(123);
    });
    it('Should call onChange with correct value', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({
          ...x,
          repeats: true,
          extension: [
            ...(q.extension ?? []), // Spread the existing extensions or use an empty array if undefined
            {
              url: Extensions.QUESTIONNAIRE_UNIT_URL,
              valueCoding: {
                code: 'cm',
                display: 'centimeter',
                system: 'http://unitsofmeasure.org',
              },
            },
          ],
        })),
      };
      const onChange = vi.fn();
      await createWrapper(questionnaire, { onChange });
      expect(screen.getByLabelText(/Quantity/i)).toBeInTheDocument();
      await userEvent.type(screen.getByLabelText(/Quantity/i), '1');
      const expectedAnswer: QuestionnaireResponseItemAnswer = {
        valueQuantity: {
          code: 'cm',
          system: 'http://unitsofmeasure.org',
          unit: 'centimeter',
          value: 1,
        },
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
        await userEvent.type(screen.getByLabelText(/Quantity/i), '123');
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

        await userEvent.type(screen.getByLabelText(/Quantity/i), '123');
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
        await userEvent.type(screen.getByLabelText(/Quantity/i), '8');
        await submitForm();

        expect(screen.queryByText('Custom error')).not.toBeInTheDocument();
      });
      it('Should remove error on change if form is submitted', async () => {
        const questionnaire: Questionnaire = {
          ...qCustomErrorMessage,
          item: qCustomErrorMessage.item?.map(x => ({ ...x, required: false })),
        };
        await createWrapper(questionnaire);
        await userEvent.type(screen.getByLabelText(/Quantity/i), '12');
        await submitForm();

        expect(screen.getByText('Custom error')).toBeInTheDocument();
        await userEvent.clear(screen.getByLabelText(/Quantity/i));
        await userEvent.type(screen.getByLabelText(/Quantity/i), '8');

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
        const questionnaire: Questionnaire = {
          ...qCustomErrorMessage,
          item: qCustomErrorMessage.item?.map(x => ({ ...x, required: false })),
        };
        await createWrapper(questionnaire);
        await userEvent.type(screen.getByLabelText(/Quantity/i), '8');
        await submitForm();

        expect(screen.queryByText('Custom error')).not.toBeInTheDocument();
      });
      it('Should remove error on change if form is submitted', async () => {
        const questionnaire: Questionnaire = {
          ...qCustomErrorMessage,
          item: qCustomErrorMessage.item?.map(x => ({ ...x, required: false })),
        };
        await createWrapper(questionnaire);
        await userEvent.type(screen.getByLabelText(/Quantity/i), '3');
        await submitForm();

        expect(screen.getByText('Custom error')).toBeInTheDocument();
        await userEvent.clear(screen.getByLabelText(/Quantity/i));
        await userEvent.type(screen.getByLabelText(/Quantity/i), '8');

        expect(screen.queryByText('Custom error')).not.toBeInTheDocument();
      });
    });
    describe('decimalPattern validation', () => {
      it('Should not show error if value is empty', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({
            ...x,
            required: false,
          })),
        };
        await createWrapper(questionnaire);
        await submitForm();

        expect(screen.queryByText(resources.oppgiGyldigVerdi)).not.toBeInTheDocument();
      });
      it('Should not show error if value is valid pattern', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({
            ...x,
            required: false,
          })),
        };
        await createWrapper(questionnaire);
        await userEvent.type(screen.getByLabelText(/Quantity/i), '6.12');
        await submitForm();

        expect(screen.queryByText(resources.oppgiGyldigVerdi)).not.toBeInTheDocument();
      });
      it('Should remove error on change if form is submitted', async () => {
        const questionnaire: Questionnaire = {
          ...qCustomErrorMessage,
          item: qCustomErrorMessage.item?.map(x => ({
            ...x,
            required: false,
          })),
        };
        await createWrapper(questionnaire);
        await userEvent.type(screen.getByLabelText(/Quantity/i), '6.121212');
        await submitForm();

        expect(screen.getByText('Custom error')).toBeInTheDocument();
        await userEvent.clear(screen.getByLabelText(/Quantity/i));
        await userEvent.type(screen.getByLabelText(/Quantity/i), '6.2');

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
