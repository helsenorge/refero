import '@/util/__tests__/defineFetch';

import { act, findByRole, renderRefero, userEvent } from '../../../../../test/test-utils';
import { qinline, q, qScriptInjection } from './__data__';
import { Questionnaire, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { ReferoProps } from '../../../../types/referoProps';
import { Extensions } from '../../../../constants/extensions';
import { clickButtonTimes, submitForm } from '../../../../../test/selectors';
import { getResources } from '../../../../../preview/resources/referoResources';
import { vi } from 'vitest';
vi.mock('@helsenorge/core-utils/debounce', () => ({
  debounce: (fn: Function) => fn,
}));
const resources = { ...getResources(''), formRequiredErrorMessage: 'Du må fylle ut dette feltet' };

describe('Text', () => {
  describe('render', () => {
    it('should render correct tag', async () => {
      const { findByText, queryByText } = renderRefero({ questionnaire: qinline, resources: getResources('') });
      expect(queryByText(/Her er teksten som skal åpnes av knappen over, med markDown/i)).not.toBeInTheDocument();
      await userEvent.click(await findByText(/Her er teksten som skal åpnes/i));
      expect(await findByText(/Her er teksten som skal åpnes av knappen over, med markDown/i)).toBeInTheDocument();
    });

    it('Should render as text if props.pdf', () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: false })),
      };
      const { queryByText } = createWrapper(questionnaire, { pdf: true });
      expect(queryByText(resources.ikkeBesvart)).toBeInTheDocument();
    });
    it('Should render text if item is readonly', () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, readOnly: true, repeats: false })),
      };

      const { queryByText } = createWrapper(questionnaire);

      expect(queryByText(resources.ikkeBesvart)).toBeInTheDocument();
    });
    it('Should render as input if props.pdf === false && item is not readonly', () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: false })),
      };
      const { queryByText } = createWrapper(questionnaire);
      expect(queryByText(resources.ikkeBesvart)).not.toBeInTheDocument();
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

      expect(getByLabelText(/String/i)).toHaveValue('');
    });
    it('Initial value should be set', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({
          ...x,
          repeats: false,
          initial: [
            {
              valueString: 'test',
            },
          ],
        })),
      };
      const { getByLabelText } = createWrapper(questionnaire);

      expect(getByLabelText(/String/i)).toHaveValue('test');
    });
  });
  describe('onChange', () => {
    it('Should update component with value from answer', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({
          ...x,
          repeats: false,
        })),
      };
      const { getByLabelText } = createWrapper(questionnaire);

      const inputElement = getByLabelText(/String/i);
      expect(inputElement).toBeInTheDocument();
      expect(inputElement).toHaveAttribute('id', `item_${q?.item?.[0].linkId}`);
      await userEvent.type(inputElement, '123');

      expect(getByLabelText(/String/i)).toHaveValue('123');
    });
    it('Should call onChange with correct value', async () => {
      const questionnaire: Questionnaire = {
        ...q,
      };
      const onChange = vi.fn();
      const { getByLabelText } = createWrapper(questionnaire, { onChange });
      expect(getByLabelText(/String/i)).toBeInTheDocument();
      const input = 'string';
      await userEvent.type(getByLabelText(/String/i), input);
      const expectedAnswer: QuestionnaireResponseItemAnswer = {
        valueString: input,
      };
      expect(onChange).toHaveBeenCalledTimes(input.length);
      expect(onChange).toHaveBeenCalledWith(expect.any(Object), expectedAnswer, expect.any(Object), expect.any(Object));
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
        await userEvent.click(helpButton);
      }
      expect(container.querySelector('.page_refero__helpComponent--open')).toBeInTheDocument();
    });
  });
  describe('repeat button', () => {
    it('Should render repeat button if item repeats', () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({
          ...x,
          repeats: true,
          extension: x.extension?.map(y => {
            if (y.url === Extensions.MIN_OCCURS_URL) {
              return { ...y, valueInteger: 2 };
            }
            return y;
          }),
        })),
      };

      const { getByTestId } = createWrapper(questionnaire);
      const repeatButton = getByTestId(/-repeat-button/i);
      expect(repeatButton).toBeInTheDocument();
    });

    it('Should not render repeat button if item does not repeats', () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({
          ...x,
          repeats: false,
        })),
      };
      const { queryByTestId } = createWrapper(questionnaire);
      const repeatButton = queryByTestId(/-repeat-button/i);
      expect(repeatButton).not.toBeInTheDocument();
    });
    it('Should add item when repeat is clicked and remove button when maxOccurance(4) is reached', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({
          ...x,
          repeats: true,
        })),
      };
      const { queryAllByLabelText, queryByTestId } = createWrapper(questionnaire);

      await clickButtonTimes(/-repeat-button/i, 3);

      expect(queryAllByLabelText(/String/i)).toHaveLength(4);
      expect(queryByTestId(/-repeat-button/i)).not.toBeInTheDocument();
    });
  });
  describe('delete button', () => {
    it('Should render delete button if item repeats and number of repeated items is greater than minOccurance(2)', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({
          ...x,
          repeats: true,
          extension: x.extension?.map(y => {
            if (y.url === Extensions.MIN_OCCURS_URL) {
              return { ...y, valueInteger: 2 };
            }
            return y;
          }),
        })),
      };
      const { queryAllByTestId } = createWrapper(questionnaire);

      await clickButtonTimes(/-repeat-button/i, 2);

      expect(queryAllByTestId(/-delete-button/i)).toHaveLength(2);
    });
    it('Should not render delete button if item repeats and number of repeated items is lower or equal than minOccurance(2)', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({
          ...x,
          repeats: true,
          extension: x.extension?.map(y => {
            if (y.url === Extensions.MIN_OCCURS_URL) {
              return { ...y, valueInteger: 2 };
            }
            return y;
          }),
        })),
      };
      const { queryByTestId } = createWrapper(questionnaire);

      expect(queryByTestId(/-delete-button/i)).not.toBeInTheDocument();
    });
    it('Should show confirmationbox when deletebutton is clicked', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({
          ...x,
          repeats: true,
          extension: x.extension?.map(y => {
            if (y.url === Extensions.MIN_OCCURS_URL) {
              return { ...y, valueInteger: 2 };
            }
            return y;
          }),
        })),
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
        item: q.item?.map(x => ({
          ...x,
          repeats: true,
          extension: x.extension?.map(y => {
            if (y.url === Extensions.MIN_OCCURS_URL) {
              return { ...y, valueInteger: 2 };
            }
            return y;
          }),
        })),
      };
      const { getByTestId, queryByTestId } = createWrapper(questionnaire);

      await clickButtonTimes(/-repeat-button/i, 1);

      expect(getByTestId(/-delete-button/i)).toBeInTheDocument();
      await clickButtonTimes(/-delete-button/i, 1);

      const confirmModal = getByTestId(/-delete-confirm-modal/i);
      await userEvent.click(await findByRole(confirmModal, 'button', { name: /Forkast endringer/i }));
      expect(queryByTestId(/-delete-button/i)).not.toBeInTheDocument();
    });
  });
  describe('Validation', () => {
    describe('Required', () => {
      it('Should show error if field is required and value is empty', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({
            ...x,
            required: true,
          })),
        };
        const { getByText } = createWrapper(questionnaire);
        await submitForm();
        expect(getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();
      });
      it('Should not show error if required and has value', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({
            ...x,
            required: true,
          })),
        };
        const { getByLabelText, queryByText } = createWrapper(questionnaire);
        await userEvent.type(getByLabelText(/String/i), 'abc');
        await submitForm();

        expect(queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
      });
      it('Should remove error on change if form is submitted', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({
            ...x,
            required: true,
          })),
        };
        const { getByText, queryByText, getByLabelText } = createWrapper(questionnaire);
        await submitForm();
        expect(getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();

        await userEvent.type(getByLabelText(/String/i), 'abc');
        await userEvent.tab();
        expect(queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
      });
    });
    describe('minLength validation', () => {
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

        expect(queryByText('Custom error')).not.toBeInTheDocument();
      });
      it('Should not show error if value is bellow maxLength (20) and over minLemgth(10)', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({
            ...x,
            required: false,
          })),
        };
        const { getByLabelText, queryByText } = createWrapper(questionnaire);
        await userEvent.type(getByLabelText(/String/i), 'epost@test.com');
        await submitForm();
        expect(queryByText('Custom error')).not.toBeInTheDocument();
      });
      it('Should remove error on change if form is submitted', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({
            ...x,
            required: false,
          })),
        };
        const { getByText, queryByText, getByLabelText } = createWrapper(questionnaire);
        await userEvent.type(getByLabelText(/String/i), 'e@st.co');
        await submitForm();
        expect(getByText('Custom error')).toBeInTheDocument();
        await userEvent.clear(getByLabelText(/String/i));
        await userEvent.type(getByLabelText(/String/i), 'epost@test.com');

        expect(queryByText('Custom error')).not.toBeInTheDocument();
      });
    });
    describe('maxLength validation', () => {
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

        expect(queryByText('Custom error')).not.toBeInTheDocument();
      });
      it('Should not show error if value is bellow maxLength (20) and over minLemgth(10)', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({
            ...x,
            required: false,
          })),
        };
        const { getByLabelText, queryByText } = createWrapper(questionnaire);
        await userEvent.type(getByLabelText(/String/i), 'epost@test.com');
        await submitForm();

        expect(queryByText('Custom error')).not.toBeInTheDocument();
      });
      it('Should remove error on change if form is submitted', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({
            ...x,
            required: false,
          })),
        };
        const { getByText, queryByText, getByLabelText } = createWrapper(questionnaire);
        await userEvent.type(getByLabelText(/String/i), 'eposteneraølt@asdasdst.com');
        await submitForm();
        expect(getByText('Custom error')).toBeInTheDocument();
        await userEvent.clear(getByLabelText(/String/i));
        await userEvent.type(getByLabelText(/String/i), 'epost@test.com');

        expect(queryByText('Custom error')).not.toBeInTheDocument();
      });
    });
    describe('Pattern (email) validation', () => {
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

        expect(queryByText('Custom error')).not.toBeInTheDocument();
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
        await userEvent.type(getByLabelText(/String/i), 'epost@test.com');
        await submitForm();

        expect(queryByText('Custom error')).not.toBeInTheDocument();
      });
      it('Should remove error on change if form is submitted', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({
            ...x,
            required: false,
          })),
        };
        const { getByText, queryByText, getByLabelText } = createWrapper(questionnaire);
        await userEvent.type(getByLabelText(/String/i), 'epostsdsdcom');
        await submitForm();
        expect(getByText('Custom error')).toBeInTheDocument();
        await userEvent.clear(getByLabelText(/String/i));
        await userEvent.type(getByLabelText(/String/i), 'epost@test.com');

        expect(queryByText('Custom error')).not.toBeInTheDocument();
      });
    });
    describe('validateScriptInjection ', () => {
      it('Should render with validation when input has html and validateScriptInjection = true', async () => {
        const validateScriptInjection = true;
        const value = 'input med <html>';
        const { findByText, findByLabelText } = createWrapper(qScriptInjection, { validateScriptInjection });
        await userEvent.type(await findByLabelText(/String1/i), value);
        await userEvent.type(await findByLabelText(/String2 - Obligatorisk/i), 'test');
        await submitForm();
        const actualElement = await findByText(/er ikke tillatt/i);
        expect(actualElement).toBeInTheDocument();
      });
      it('Should render with validation when input has html and validateScriptInjection = false', async () => {
        const validateScriptInjection = false;
        const value = 'input med <html>';
        const { findByDisplayValue, findByLabelText, queryByRole } = createWrapper(qScriptInjection, {
          validateScriptInjection,
        });
        await userEvent.type(await findByLabelText(/String2 - Obligatorisk/i), value);
        await submitForm();
        const actualElement = await findByDisplayValue(value);
        const actualAlert = queryByRole('alert');
        expect(actualElement).toBeInTheDocument();
        expect(actualAlert).not.toBeInTheDocument();
      });
      it('Should render without validation when input does not have html and validateScriptInjection = true', async () => {
        const validateScriptInjection = true;
        const value = 'input uten html';
        const { findByDisplayValue, findByLabelText, queryByRole } = createWrapper(qScriptInjection, { validateScriptInjection });
        await userEvent.type(await findByLabelText(/String2 - Obligatorisk/i), value);
        const actualAlert = queryByRole('alert');
        const item = await findByDisplayValue(value);

        expect(item).toBeInTheDocument();
        expect(actualAlert).not.toBeInTheDocument();
      });
    });
  });
});

const createWrapper = (questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) => {
  return renderRefero({ questionnaire, props: { ...props, resources } });
};
