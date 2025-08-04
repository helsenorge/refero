import '@/util/__tests__/defineFetch';

import { Questionnaire, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { vi } from 'vitest';

import { ReferoProps } from '../../../../types/referoProps';

import { qinline, q, qScriptInjection, qCustomErrorMessage } from './__data__';
import { getResources } from '../../../../../preview/resources/referoResources';
import { clickButtonTimes, getByLabelTextInsideElement, repeatNTimes, submitForm } from '../../../../../test/selectors';
import { Matcher, renderRefero, screen, userEvent, waitFor } from '../../../../../test/test-utils';
import { Extensions } from '../../../../constants/extensions';

vi.mock('@helsenorge/core-utils/debounce', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type, @typescript-eslint/explicit-function-return-type
  debounce: (fn: Function) => fn,
}));
const resources = { ...getResources(''), formRequiredErrorMessage: 'Du må fylle ut dette feltet' };

const getTestId = (questionnaire: Questionnaire, index: number): string => {
  const textItem = questionnaire.item?.filter(item => item.type === 'text')[index];
  const textInputTestId = `test-text-item_${textItem?.linkId}`;
  return textInputTestId;
};

const getTextInput = (questionnaire: Questionnaire, labelText: Matcher, index: number): HTMLElement => {
  const textInputTestId = getTestId(questionnaire, index);
  const textInput = getByLabelTextInsideElement(textInputTestId, labelText);
  return textInput;
};

describe('Text', () => {
  describe('render', () => {
    it('should render correct tag', async () => {
      renderRefero({ questionnaire: qinline, resources: getResources('') });
      expect(screen.queryByText(/Her er teksten som skal åpnes av knappen over, med markDown/i)).not.toBeInTheDocument();
      await userEvent.click(await screen.findByText(/Her er teksten som skal åpnes/i));
      expect(await screen.findByText(/Her er teksten som skal åpnes av knappen over, med markDown/i)).toBeInTheDocument();
    });

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

      const textInput = getTextInput(questionnaire, /String/i, 0);
      expect(textInput).toHaveValue('');
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
      await createWrapper(questionnaire);

      const textInput = getTextInput(questionnaire, /String/i, 0);
      expect(textInput).toHaveTextContent('test');
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

      const textInput = getTextInput(questionnaire, /String/i, 0);
      await userEvent.type(textInput, '123');
      await waitFor(() => {
        expect(textInput).toHaveValue('123');
      });
    });
    it('Should call onChange with correct value', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({
          ...x,
          repeats: false,
        })),
      };
      const onChange = vi.fn();
      await createWrapper(questionnaire, { onChange });

      const textInput = getTextInput(questionnaire, /String/i, 0);
      expect(textInput).toBeInTheDocument();

      const input = 'string';
      await userEvent.type(textInput, input);
      const expectedAnswer: QuestionnaireResponseItemAnswer = {
        valueString: input,
      };
      expect(onChange).toHaveBeenCalledTimes(input.length);
      expect(onChange).toHaveBeenCalledWith(expect.any(Object), expectedAnswer, expect.any(Object), expect.any(Object));
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
      const repeatButton = screen.getByTestId(/-repeat-button/i);
      expect(repeatButton).toBeInTheDocument();
    });

    it('Should not render repeat button if item does not repeats', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({
          ...x,
          repeats: false,
        })),
      };
      await createWrapper(questionnaire);
      const repeatButton = screen.queryByTestId(/-repeat-button/i);
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
      await createWrapper(questionnaire);

      const testId = getTestId(questionnaire, 0);
      const input = 'entotre';
      await repeatNTimes(input, 3, testId, /String/i);

      expect(screen.queryAllByTestId(/test-text/i)).toHaveLength(4);
      expect(screen.queryByTestId(/-repeat-button/i)).not.toBeInTheDocument();
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
      await createWrapper(questionnaire);

      const testId = getTestId(questionnaire, 0);
      const input = 'string';
      await repeatNTimes(input, 3, testId, /String/i);

      const elements = await screen.findAllByTestId(/-delete-button/i);
      expect(elements).toHaveLength(2);
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
      await createWrapper(questionnaire);

      expect(screen.queryByTestId(/-delete-button/i)).not.toBeInTheDocument();
    });
    it('Should show confirmationbox when deletebutton is clicked', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({
          ...x,
          repeats: true,
        })),
      };
      await createWrapper(questionnaire);

      const testId = getTestId(questionnaire, 0);
      const input = 'entotre';
      await repeatNTimes(input, 1, testId, /String/i);

      expect(screen.getByTestId(/-delete-button/i)).toBeInTheDocument();
      await clickButtonTimes(/-delete-button/i, 1);

      expect(screen.getByTestId(/-delete-confirm-modal/i)).toBeInTheDocument();
    });
    it('Should remove item when delete button is clicked', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({
          ...x,
          repeats: true,
        })),
      };
      await createWrapper(questionnaire);

      const testId = getTestId(questionnaire, 0);
      const input = 'entotre';
      await repeatNTimes(input, 1, testId, /String/i);

      expect(screen.getByTestId(/-delete-button/i)).toBeInTheDocument();
      await clickButtonTimes(/-delete-button/i, 1);

      // const confirmModal = screen.getByTestId(/-delete-confirm-modal/i);
      await userEvent.click(await screen.findByRole('button', { name: /Forkast endringer/i }));
      expect(screen.queryByTestId(/-delete-button/i)).not.toBeInTheDocument();
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
            repeats: false,
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
            repeats: false,
          })),
        };
        await createWrapper(questionnaire);

        const textInput = getTextInput(questionnaire, /String/i, 0);
        await userEvent.type(textInput, 'abc');

        await submitForm();
        expect(screen.queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
      });
      it('Should remove error on change if form is submitted', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({
            ...x,
            required: true,
            repeats: false,
          })),
        };
        await createWrapper(questionnaire);
        await submitForm();
        expect(screen.getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();

        const textInput = getTextInput(questionnaire, /String/i, 0);

        await userEvent.type(textInput, 'abc');
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
            repeats: false,
          })),
        };
        await createWrapper(questionnaire);

        const textInput = getTextInput(questionnaire, /String/i, 0);
        await userEvent.type(textInput, 'epost@test.com');
        await submitForm();

        expect(screen.queryByText('Custom error')).not.toBeInTheDocument();
      });
      it('Should remove error on change if form is submitted', async () => {
        const questionnaire: Questionnaire = {
          ...qCustomErrorMessage,
          item: qCustomErrorMessage.item?.map(x => ({
            ...x,
            required: false,
            repeats: false,
          })),
        };
        await createWrapper(questionnaire);

        const textInput = getTextInput(questionnaire, /String/i, 0);
        await userEvent.type(textInput, 'e@st.co');
        await submitForm();

        expect(screen.getByText('Custom error')).toBeInTheDocument();

        await userEvent.clear(textInput);
        await userEvent.type(textInput, 'epost@test.com');

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
            repeats: false,
          })),
        };
        await createWrapper(questionnaire);

        const textInput = getTextInput(questionnaire, /String/i, 0);
        await userEvent.type(textInput, 'epost@test.com');
        await submitForm();

        expect(screen.queryByText('Custom error')).not.toBeInTheDocument();
      });
      it('Should remove error on change if form is submitted', async () => {
        const questionnaire: Questionnaire = {
          ...qCustomErrorMessage,
          item: qCustomErrorMessage.item?.map(x => ({
            ...x,
            required: false,
            repeats: false,
          })),
        };
        await createWrapper(questionnaire);

        const textInput = getTextInput(questionnaire, /String/i, 0);
        await userEvent.type(textInput, 'eposteneraølt@asdasdst.com');
        await submitForm();

        expect(screen.getByText('Custom error')).toBeInTheDocument();

        await userEvent.clear(textInput);
        await userEvent.type(textInput, 'epost@test.com');

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
            repeats: false,
          })),
        };
        await createWrapper(questionnaire);

        const textInput = getTextInput(questionnaire, /String/i, 0);
        await userEvent.type(textInput, 'epost@test.com');
        await submitForm();

        expect(screen.queryByText('Custom error')).not.toBeInTheDocument();
      });
      it('Should remove error on change if form is submitted', async () => {
        const questionnaire: Questionnaire = {
          ...qCustomErrorMessage,
          item: qCustomErrorMessage.item?.map(x => ({
            ...x,
            required: false,
            repeats: false,
          })),
        };
        await createWrapper(questionnaire);

        const textInput = getTextInput(questionnaire, /String/i, 0);
        await userEvent.type(textInput, 'epostsdsdcom');
        await submitForm();

        expect(screen.getByText('Custom error')).toBeInTheDocument();

        await userEvent.clear(textInput);
        await userEvent.type(textInput, 'epost@test.com');

        expect(screen.queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
      });
    });
    describe('validateScriptInjection ', () => {
      it('Should render with validation when input has html and validateScriptInjection = true', async () => {
        const validateScriptInjection = true;
        const value = 'input med <html>';
        await createWrapper(qScriptInjection, { validateScriptInjection });

        const textInput1 = getTextInput(qScriptInjection, /String1/i, 0);
        const textInput2 = getTextInput(qScriptInjection, /String2 - Obligatorisk/i, 1);

        await userEvent.type(textInput1, value);
        await userEvent.type(textInput2, 'test');
        await submitForm();

        const actualElement = await screen.findByText(/er ikke tillatt/i);

        expect(actualElement).toBeInTheDocument();
      });
      it('Should render with validation when input has html and validateScriptInjection = false', async () => {
        const validateScriptInjection = false;
        const value = 'input med <html>';
        await createWrapper(qScriptInjection, {
          validateScriptInjection,
        });

        const textInput2 = getTextInput(qScriptInjection, /String2 - Obligatorisk/i, 1);
        await userEvent.type(textInput2, value);
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

        const textInput2 = getTextInput(qScriptInjection, /String2 - Obligatorisk/i, 1);
        await userEvent.type(textInput2, value);
        const actualAlert = screen.queryByRole('alert');
        const item = await screen.findByDisplayValue(value);

        expect(item).toBeInTheDocument();
        expect(actualAlert).not.toBeInTheDocument();
      });
    });
  });
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createWrapper = async (questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) => {
  return await waitFor(async () => await renderRefero({ questionnaire, props: { ...props, resources } }));
};
