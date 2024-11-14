import { findByRole, renderRefero, screen, userEvent, waitFor } from '@test/test-utils.tsx';
import { q, qScriptInjection, qCustomErrorMessage } from './__data__/';

import { Questionnaire, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { ReferoProps } from '../../../../types/referoProps';
import { Extensions } from '../../../../constants/extensions';
import { clickButtonTimes, repeatNTimes, submitForm } from '../../../../../test/selectors';
import { getResources } from '../../../../../preview/resources/referoResources';
import { vi } from 'vitest';

vi.mock('@helsenorge/core-utils/debounce', () => ({
  debounce: (fn: Function) => fn,
}));

const resources = { ...getResources(''), formRequiredErrorMessage: 'Du må fylle ut dette feltet' };
describe('string', () => {
  describe('Render', () => {
    it('Should render as text if props.pdf', () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: false })),
      };
      createWrapper(questionnaire, { pdf: true });
      expect(screen.queryByText(resources.ikkeBesvart)).toBeInTheDocument();
    });
    it('Should render text if item is readonly', () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, readOnly: true, repeats: false })),
      };

      createWrapper(questionnaire);
      expect(screen.queryByText(resources.ikkeBesvart)).toBeInTheDocument();
    });
    it('Should render as input if props.pdf === false && item is not readonly', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: false })),
      };
      createWrapper(questionnaire);
      await waitFor(async () => {
        expect(screen.queryByText(resources.ikkeBesvart)).not.toBeInTheDocument();
      });
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
      createWrapper(questionnaire);
      await waitFor(async () => {
        expect(screen.getByLabelText(/String/i)).toHaveValue('');
      });
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
      createWrapper(questionnaire);
      await waitFor(async () => {
        expect(screen.getByLabelText(/String/i)).toHaveValue('test');
      });
    });
  });
  describe('help button', () => {
    it('Should render helpButton', async () => {
      const { container } = createWrapper(q);
      await waitFor(async () => {
        expect(container.querySelector('.page_refero__helpButton')).toBeInTheDocument();
      });
    });
    it('Should render helpElement when helpbutton is clicked', async () => {
      const { container } = createWrapper(q);

      expect(container.querySelector('.page_refero__helpButton')).toBeInTheDocument();

      expect(container.querySelector('.page_refero__helpComponent--open')).not.toBeInTheDocument();

      const helpButton = container.querySelector('.page_refero__helpButton');
      if (helpButton) {
        await userEvent.click(helpButton);
      }
      await waitFor(async () => {
        expect(container.querySelector('.page_refero__helpComponent--open')).toBeInTheDocument();
      });
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
      await waitFor(async () => {
        expect(repeatButton).toBeInTheDocument();
      });
    });

    it('Should not render repeat button if item does not repeats', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: false })),
      };
      createWrapper(questionnaire);
      const repeatButton = screen.queryByTestId(/-repeat-button/i);
      await waitFor(async () => {
        expect(repeatButton).not.toBeInTheDocument();
      });
    });
    it('Should add item when repeat is clicked and remove button when maxOccurance(4) is reached', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({
          ...x,
          repeats: true,
          readOnly: false,
          extension: x.extension?.map(y => {
            if (y.url === Extensions.MIN_OCCURS_URL) {
              return { ...y, valueInteger: 2 };
            }
            return y;
          }),
        })),
      };
      createWrapper(questionnaire);
      const input = 'string';
      await repeatNTimes(input, 3, /String/i);
      await waitFor(async () => {
        expect(screen.queryAllByLabelText(/String/i)).toHaveLength(4);
      });
      expect(screen.queryByTestId(/-repeat-button/i)).not.toBeInTheDocument();
    });
  });
  describe('delete button', () => {
    //TODO: Add test to see if the correct item is deleted
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
      createWrapper(questionnaire);
      const input = 'string';
      await repeatNTimes(input, 3, /String/i);
      await waitFor(async () => {
        expect(screen.queryAllByTestId(/-delete-button/i)).toHaveLength(2);
      });
    });
    it('Should not render delete button if item repeats and number of repeated items is lower or equal than minOccurance(2)', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: true })),
      };
      createWrapper(questionnaire);
      await waitFor(async () => {
        expect(screen.queryByTestId(/-delete-button/i)).not.toBeInTheDocument();
      });
    });
    it('Should show confirmationbox when deletebutton is clicked', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: true })),
      };
      const { getByTestId } = createWrapper(questionnaire);
      const input = 'string';

      await repeatNTimes(input, 1, /String/i);
      await waitFor(async () => {
        expect(getByTestId(/-delete-button/i)).toBeInTheDocument();
      });
      await clickButtonTimes(/-delete-button/i, 1);

      expect(getByTestId(/-delete-confirm-modal/i)).toBeInTheDocument();
    });
    it('Should remove item when delete button is clicked', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: true })),
      };
      const { getByTestId, queryByTestId } = createWrapper(questionnaire);
      const input = 'string';

      await repeatNTimes(input, 1, /String/i);
      await waitFor(async () => {
        expect(getByTestId(/-delete-button/i)).toBeInTheDocument();
      });
      await clickButtonTimes(/-delete-button/i, 1);

      const confirmModal = getByTestId(/-delete-confirm-modal/i);
      await userEvent.click(await findByRole(confirmModal, 'button', { name: /Forkast endringer/i }));
      expect(queryByTestId(/-delete-button/i)).not.toBeInTheDocument();
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
      expect(inputElement).toHaveAttribute('type', 'text');
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
        createWrapper(questionnaire);
        await submitForm();

        expect(screen.queryByText(resources.formRequiredErrorMessage)).toBeInTheDocument();
      });
    });
    describe('minLength validation', () => {
      it('Should not show error if value is empty', async () => {
        const questionnaire: Questionnaire = {
          ...qCustomErrorMessage,
          item: qCustomErrorMessage.item?.map(x => ({
            ...x,
            required: false,
          })),
        };
        createWrapper(questionnaire);
        await submitForm();

        expect(screen.queryByText('Custom error')).not.toBeInTheDocument();
      });
      it('Should not show error if value is bellow maxLength (20) and over minLemgth(10)', async () => {
        const questionnaire: Questionnaire = {
          ...qCustomErrorMessage,
          item: qCustomErrorMessage.item?.map(x => ({
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
          ...qCustomErrorMessage,
          item: qCustomErrorMessage.item?.map(x => ({
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
          ...qCustomErrorMessage,
          item: qCustomErrorMessage.item?.map(x => ({
            ...x,
            required: false,
          })),
        };
        createWrapper(questionnaire);
        await submitForm();

        expect(screen.queryByText('Custom error')).not.toBeInTheDocument();
      });
      it('Should not show error if value is bellow maxLength (20) and over minLemgth(10)', async () => {
        const questionnaire: Questionnaire = {
          ...qCustomErrorMessage,
          item: qCustomErrorMessage.item?.map(x => ({
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
          ...qCustomErrorMessage,
          item: qCustomErrorMessage.item?.map(x => ({
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
          ...qCustomErrorMessage,
          item: qCustomErrorMessage.item?.map(x => ({
            ...x,
            required: false,
          })),
        };
        createWrapper(questionnaire);
        await submitForm();

        expect(screen.queryByText('Custom error')).not.toBeInTheDocument();
      });
      it('Should not show error if value is valid pattern', async () => {
        const questionnaire: Questionnaire = {
          ...qCustomErrorMessage,
          item: qCustomErrorMessage.item?.map(x => ({
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
          ...qCustomErrorMessage,
          item: qCustomErrorMessage.item?.map(x => ({
            ...x,
            required: false,
          })),
        };
        createWrapper(questionnaire);
        await userEvent.type(screen.getByLabelText(/String/i), 'epostsdsdcom');
        await submitForm();
        expect(screen.getByText('Custom error')).toBeInTheDocument();
        await userEvent.clear(screen.getByLabelText(/String/i));
        await userEvent.type(screen.getByLabelText(/String/i), 'epost@test.com');

        expect(screen.queryByText('Custom error')).not.toBeInTheDocument();
      });
    });
    describe('validateScriptInjection ', () => {
      it('Should render with validation when input has html and validateScriptInjection = true', async () => {
        const validateScriptInjection = true;
        const value = 'input med <html>';
        const { queryByText, findByLabelText } = createWrapper(qScriptInjection, { validateScriptInjection });
        await userEvent.type(await findByLabelText(/String1/i), value);
        await userEvent.type(await findByLabelText(/String2 - Obligatorisk/i), 'test');
        await submitForm();
        expect(queryByText(/er ikke tillatt/i)).toBeInTheDocument();
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
        const { findByDisplayValue, getByLabelText, queryByRole } = createWrapper(qScriptInjection, { validateScriptInjection });
        await userEvent.type(getByLabelText(/String2 - Obligatorisk/i), value);
        const actualAlert = queryByRole('alert');
        const item = await findByDisplayValue(value);

        expect(item).toBeInTheDocument();
        expect(actualAlert).not.toBeInTheDocument();
      });
    });
  });
});

function createWrapper(questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) {
  return renderRefero({ questionnaire, props, resources });
}
