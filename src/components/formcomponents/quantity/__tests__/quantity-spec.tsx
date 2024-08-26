import { Questionnaire, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { act, findByRole, renderRefero, userEvent } from '@test/test-utils.tsx';
import { q } from './__data__';
import { ReferoProps } from '../../../../types/referoProps';
import { Extensions } from '../../../../constants/extensions';
import { clickButtonTimes, submitForm } from '../../../../../test/selectors';
import { getResources } from '../../../../../preview/resources/referoResources';
import { vi } from 'vitest';

const resources = { ...getResources(''), formRequiredErrorMessage: 'Du må fylle ut dette feltet', oppgiGyldigVerdi: 'ikke gyldig tall' };

describe('Quantity', () => {
  describe('Render', () => {
    it('Should render as text if props.pdf', () => {
      const { queryByText } = createWrapper(q, { pdf: true });
      expect(queryByText(resources.ikkeBesvart)).toBeInTheDocument();
    });
    it('Should render text if item is readonly', () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, readOnly: true })),
      };

      const { queryByText } = createWrapper(questionnaire);
      expect(queryByText(resources.ikkeBesvart)).toBeInTheDocument();
    });
    it('Should render as input if props.pdf === false && item is not readonly', () => {
      const { queryByText } = createWrapper(q);
      expect(queryByText(resources.ikkeBesvart)).not.toBeInTheDocument();
    });
    it('Should render with correct unit', () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({
          ...x,
          repeats: true,
        })),
      };
      const { queryByText } = createWrapper(questionnaire);
      expect(queryByText('centimeter')).toBeInTheDocument();
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

      expect(getByLabelText(/Quantity/i)).toHaveValue(null);
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
      const { getByLabelText } = createWrapper(questionnaire);

      expect(getByLabelText(/Quantity/i)).toHaveValue(12.3);
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
        await act(async () => {
          userEvent.click(helpButton);
        });
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
      await clickButtonTimes(/-repeat-button/i, 3);

      expect(queryAllByLabelText(/Quantity/i)).toHaveLength(4);
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

      await clickButtonTimes(/-repeat-button/i, 2);

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

      await clickButtonTimes(/-repeat-button/i, 1);

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

      await clickButtonTimes(/-repeat-button/i, 1);

      expect(getByTestId(/-delete-button/i)).toBeInTheDocument();
      await clickButtonTimes(/-delete-button/i, 1);

      const confirmModal = getByTestId(/-delete-confirm-modal/i);
      await act(async () => {
        userEvent.click(await findByRole(confirmModal, 'button', { name: /Forkast endringer/i }));
      });
      expect(queryByTestId(/-delete-button/i)).not.toBeInTheDocument();
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
      const { getByLabelText } = createWrapper(questionnaire);

      expect(getByLabelText(/Quantity/i)).toBeInTheDocument();
      expect(getByLabelText(/Quantity/i)).toHaveAttribute('type', 'number');
      expect(getByLabelText(/Quantity/i)).toHaveAttribute('id', `item_${q?.item?.[0].linkId}^0`);
      await act(async () => {
        userEvent.type(getByLabelText(/Quantity/i), '123');
      });
      expect(getByLabelText(/Quantity/i)).toHaveValue(123);
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
      const { getByLabelText } = createWrapper(questionnaire);

      expect(getByLabelText(/Quantity/i)).toBeInTheDocument();
      expect(getByLabelText(/Quantity/i)).toHaveAttribute('type', 'number');
      expect(getByLabelText(/Quantity/i)).toHaveAttribute('id', `item_${q?.item?.[0].linkId}^0`);
      await act(async () => {
        userEvent.type(getByLabelText(/Quantity/i), '123');
      });
      expect(getByLabelText(/Quantity/i)).toHaveValue(123);
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
      const { getByLabelText } = createWrapper(questionnaire, { onChange });
      expect(getByLabelText(/Quantity/i)).toBeInTheDocument();
      await act(async () => {
        userEvent.type(getByLabelText(/Quantity/i), '1');
      });
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
        const { getByText } = createWrapper(questionnaire);
        await submitForm();

        expect(getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();
      });
      it('Should not show error if required and has value', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, required: true })),
        };
        const { getByLabelText, queryByText } = createWrapper(questionnaire);
        await act(async () => {
          userEvent.type(getByLabelText(/Quantity/i), '123');
        });
        await submitForm();

        expect(queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
      });
      it('Should remove error on change if form is submitted', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, required: true })),
        };
        const { getByText, queryByText, getByLabelText } = createWrapper(questionnaire);
        await submitForm();

        expect(getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();

        await act(async () => {
          userEvent.type(getByLabelText(/Quantity/i), '123');
          userEvent.tab();
        });
        expect(queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
      });
    });
    describe('maxValue', () => {
      it('Should not show error if value is empty', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, required: false })),
        };
        const { queryByText } = createWrapper(questionnaire);
        await submitForm();

        expect(queryByText('Custom error')).not.toBeInTheDocument();
      });
      it('Should not show error if value is bellow max value (10) and over min(5)', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, required: false })),
        };
        const { getByLabelText, queryByText } = createWrapper(questionnaire);
        await act(async () => {
          userEvent.type(getByLabelText(/Quantity/i), '8');
        });
        await submitForm();

        expect(queryByText('Custom error')).not.toBeInTheDocument();
      });
      it('Should remove error on change if form is submitted', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, required: false })),
        };
        const { getByText, queryByText, getByLabelText } = createWrapper(questionnaire);
        await act(async () => {
          userEvent.type(getByLabelText(/Quantity/i), '12');
        });
        await submitForm();

        expect(getByText('Custom error')).toBeInTheDocument();
        await act(async () => {
          userEvent.clear(getByLabelText(/Quantity/i));
          userEvent.type(getByLabelText(/Quantity/i), '8');
        });

        expect(queryByText('Custom error')).not.toBeInTheDocument();
      });
    });
    describe('minValue', () => {
      it('Should not show error if value is empty', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, required: false })),
        };
        const { queryByText } = createWrapper(questionnaire);
        await submitForm();

        expect(queryByText('Custom error')).not.toBeInTheDocument();
      });
      it('Should not show error if value is bellow max value (10) and over min(5)', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, required: false })),
        };
        const { getByLabelText, queryByText } = createWrapper(questionnaire);
        await act(async () => {
          userEvent.type(getByLabelText(/Quantity/i), '8');
        });
        await submitForm();

        expect(queryByText('Custom error')).not.toBeInTheDocument();
      });
      it('Should remove error on change if form is submitted', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, required: false })),
        };
        const { queryByText, getByLabelText } = createWrapper(questionnaire);
        await act(async () => {
          userEvent.type(getByLabelText(/Quantity/i), '3');
        });
        await submitForm();

        expect(queryByText('Custom error')).toBeInTheDocument();
        await act(async () => {
          userEvent.clear(getByLabelText(/Quantity/i));
          userEvent.type(getByLabelText(/Quantity/i), '8');
        });

        expect(queryByText('Custom error')).not.toBeInTheDocument();
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
        const { queryByText } = createWrapper(questionnaire);
        await submitForm();

        expect(queryByText(resources.oppgiGyldigVerdi)).not.toBeInTheDocument();
      });
      it('Should not show error if value is valid pattern', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({
            ...x,
            required: false,
          })),
        };
        const { getByLabelText, queryByText } = createWrapper(questionnaire);
        await act(async () => {
          userEvent.type(getByLabelText(/Quantity/i), '6.12');
        });
        await submitForm();

        expect(queryByText(resources.oppgiGyldigVerdi)).not.toBeInTheDocument();
      });
      it('Should remove error on change if form is submitted', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({
            ...x,
            required: false,
          })),
        };
        const { queryByText, getByLabelText } = createWrapper(questionnaire);
        await act(async () => {
          userEvent.type(getByLabelText(/Quantity/i), '6.121212');
        });
        await submitForm();

        expect(queryByText(resources.oppgiGyldigVerdi)).toBeInTheDocument();
        await act(async () => {
          userEvent.clear(getByLabelText(/Quantity/i));
          userEvent.type(getByLabelText(/Quantity/i), '6.2');
        });

        expect(queryByText(resources.oppgiGyldigVerdi)).not.toBeInTheDocument();
      });
    });
  });
});

const createWrapper = (questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) => {
  return renderRefero({ questionnaire, props: { ...props, resources } });
};