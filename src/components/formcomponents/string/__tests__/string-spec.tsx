import { renderRefero, screen, userEvent, waitFor } from '@test/test-utils.tsx';
import { Questionnaire, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { vi } from 'vitest';

import { ReferoProps } from '../../../../types/referoProps';

import { q, qScriptInjection, qCustomErrorMessage } from './__data__/';
import { getResources } from '../../../../../preview/resources/referoResources';
import { clickButtonTimes, repeatNTimes, submitForm } from '../../../../../test/selectors';
import { Extensions } from '../../../../constants/extensions';

vi.mock('@helsenorge/core-utils/debounce', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type, @typescript-eslint/explicit-function-return-type
  debounce: (fn: Function) => fn,
}));

const resources = { ...getResources(''), formRequiredErrorMessage: 'Du må fylle ut dette feltet' };
describe('string', () => {
  describe('Render', () => {
    it('Should render as text if props.pdf', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: false })),
      };
      await createWrapper(questionnaire, { pdf: true });
      expect(screen.getByText(resources.ikkeBesvart)).toBeInTheDocument();
    });
    it('Should render text if item is readonly', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, readOnly: true, repeats: false })),
      };

      await createWrapper(questionnaire);
      expect(screen.getByText(resources.ikkeBesvart)).toBeInTheDocument();
    });
    it('Should render as input if props.pdf === false && item is not readonly', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: false })),
      };
      await createWrapper(questionnaire);
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
      await createWrapper(questionnaire);
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
      await waitFor(async () => {
        await createWrapper(questionnaire);
      });

      expect(screen.getByLabelText(/String/i)).toHaveValue('test');
    });
  });
  describe('help button', () => {
    it('Should render helpButton', async () => {
      const { container } = await createWrapper(q);
      await waitFor(async () => {
        expect(container.querySelector('.page_refero__helpButton')).toBeInTheDocument();
      });
    });
    it('Should render helpElement when helpbutton is clicked', async () => {
      const { container } = await createWrapper(q);

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

      await createWrapper(questionnaire);
      const repeatButton = screen.getByTestId(/-repeat-button/i);
      await waitFor(async () => {
        expect(repeatButton).toBeInTheDocument();
      });
    });

    it('Should not render repeat button if item does not repeats', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: false })),
      };
      await createWrapper(questionnaire);
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
      await createWrapper(questionnaire);
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
      await createWrapper(questionnaire);
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
      await createWrapper(questionnaire);
      await waitFor(async () => {
        expect(screen.queryByTestId(/-delete-button/i)).not.toBeInTheDocument();
      });
    });
    it('Should show confirmationbox when deletebutton is clicked', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: true })),
      };
      await createWrapper(questionnaire);
      const input = 'string';

      await repeatNTimes(input, 1, /String/i);
      await waitFor(async () => {
        expect(screen.getByTestId(/-delete-button/i)).toBeInTheDocument();
      });
      await clickButtonTimes(/-delete-button/i, 1);

      expect(screen.getByTestId(/-delete-confirm-modal/i)).toBeInTheDocument();
    });
    it('Should remove item when delete button is clicked', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: true })),
      };
      await createWrapper(questionnaire);
      const input = 'stringasdsss';

      await repeatNTimes(input, 1, /String/i);
      await waitFor(async () => {
        expect(screen.getByTestId(/-delete-button/i)).toBeInTheDocument();
      });

      await clickButtonTimes(/-delete-button/i, 1);

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
          repeats: false,
        })),
      };
      await createWrapper(questionnaire);

      const inputElement = screen.getByLabelText(/String/i);
      expect(inputElement).toBeInTheDocument();
      expect(inputElement).toHaveAttribute('type', 'text');
      expect(inputElement).toHaveAttribute('id', `item_${q?.item?.[0].linkId}`);
      await userEvent.type(inputElement, '123');
      expect(screen.getByLabelText(/String/i)).toHaveValue('123');
    });
    it('Should call onChange with correct value', async () => {
      const questionnaire: Questionnaire = {
        ...q,
      };
      const onChange = vi.fn();
      await createWrapper(questionnaire, { onChange });
      expect(screen.getByLabelText(/String/i)).toBeInTheDocument();
      const input = 'string';
      await userEvent.type(screen.getByLabelText(/String/i), input);
      const expectedAnswer: QuestionnaireResponseItemAnswer = {
        valueString: input,
      };
      // await waitFor(async () => {
      //   await expect(onChange).toHaveBeenCalledTimes(input.length);
      // });
      await waitFor(async () => {
        expect(onChange).toHaveBeenCalledWith(expect.any(Object), expectedAnswer, expect.any(Object), expect.any(Object));
      });
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
        await createWrapper(questionnaire);
        await submitForm();

        expect(screen.getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();
      });
      it('Should not show error if required and has value', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({
            ...x,
            required: true,
          })),
        };
        await createWrapper(questionnaire);
        await userEvent.type(screen.getByLabelText(/String/i), 'abc');
        await submitForm();

        expect(screen.queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
      });
      it('Should remove error on change if form is submitted', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({
            ...x,
            required: true,
          })),
        };
        await createWrapper(questionnaire);
        await submitForm();
        expect(screen.getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();

        await userEvent.type(screen.getByLabelText(/String/i), 'abc');
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
    describe('minLength validation', () => {
      it('Should not show error if value is empty', async () => {
        const questionnaire: Questionnaire = {
          ...qCustomErrorMessage,
          item: qCustomErrorMessage.item?.map(x => ({
            ...x,
            required: false,
          })),
        };
        await createWrapper(questionnaire);
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
        await createWrapper(questionnaire);
        await userEvent.type(screen.getByLabelText(/String/i), 'epost@test.com');
        await submitForm();

        expect(screen.queryByText('Custom error')).not.toBeInTheDocument();
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
        await userEvent.type(screen.getByLabelText(/String/i), 'e@st.co');
        await submitForm();
        expect(screen.getByText('Custom error')).toBeInTheDocument();
        await userEvent.clear(screen.getByLabelText(/String/i));
        await userEvent.type(screen.getByLabelText(/String/i), 'epost@test.com');

        expect(screen.queryByText('Custom error')).not.toBeInTheDocument();
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
        await createWrapper(questionnaire);
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
        await createWrapper(questionnaire);
        await userEvent.type(screen.getByLabelText(/String/i), 'epost@test.com');
        await submitForm();

        expect(screen.queryByText('Custom error')).not.toBeInTheDocument();
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
        await userEvent.type(screen.getByLabelText(/String/i), 'eposteneraølt@asdasdst.com');
        await submitForm();
        expect(screen.getByText('Custom error')).toBeInTheDocument();
        await userEvent.clear(screen.getByLabelText(/String/i));
        await userEvent.type(screen.getByLabelText(/String/i), 'epost@test.com');

        expect(screen.queryByText('Custom error')).not.toBeInTheDocument();
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
        await createWrapper(questionnaire);
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
        await createWrapper(questionnaire);
        await userEvent.type(screen.getByLabelText(/String/i), 'epost@test.com');
        await submitForm();

        expect(screen.queryByText('Custom error')).not.toBeInTheDocument();
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
        await createWrapper(qScriptInjection, { validateScriptInjection });
        await userEvent.type(await screen.findByLabelText(/String1/i), value);
        await userEvent.type(await screen.findByLabelText(/String2 - Obligatorisk/i), 'test');
        await submitForm();
        expect(screen.getByText(/er ikke tillatt/i)).toBeInTheDocument();
      });
      it('Should render with validation when input has html and validateScriptInjection = false', async () => {
        const validateScriptInjection = false;
        const value = 'input med <html>';
        await createWrapper(qScriptInjection, {
          validateScriptInjection,
        });
        await userEvent.type(await screen.findByLabelText(/String2 - Obligatorisk/i), value);
        await submitForm();
        const actualElement = await screen.findByDisplayValue(value);
        const actualAlert = screen.queryByRole('alert');
        expect(actualElement).toBeInTheDocument();
        expect(actualAlert).not.toBeInTheDocument();
      });
      it('Should render without validation when input does not have html and validateScriptInjection = true', async () => {
        const validateScriptInjection = true;
        const value = 'input uten html';
        await createWrapper(qScriptInjection, { validateScriptInjection });
        await userEvent.type(screen.getByLabelText(/String2 - Obligatorisk/i), value);
        const actualAlert = screen.queryByRole('alert');
        const item = await screen.findByDisplayValue(value);

        expect(item).toBeInTheDocument();
        expect(actualAlert).not.toBeInTheDocument();
      });
    });
  });
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function createWrapper(questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) {
  return waitFor(async () => await renderRefero({ questionnaire, props, resources }));
}
