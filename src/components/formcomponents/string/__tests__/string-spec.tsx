import '../../../../util/defineFetch';
import { findByRole, renderRefero, userEvent } from '../../../__tests__/test-utils/test-utils';
import { act } from 'react-dom/test-utils';
import { qScriptInjection, q } from './__data__/';

import { Questionnaire } from 'fhir/r4';
import { ReferoProps } from '../../../../types/referoProps';
import { getResources } from '../../../../preview/resources/referoResources';
import { Extensions } from '../../../../constants/extensions';

jest.mock('@helsenorge/core-utils/debounce', () => ({
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
      if (helpButton) userEvent.click(helpButton);

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
      const { getByTestId, queryAllByLabelText, queryByTestId } = createWrapper(questionnaire);
      act(() => {
        userEvent.click(getByTestId(/-repeat-button/i));
        userEvent.click(getByTestId(/-repeat-button/i));
        userEvent.click(getByTestId(/-repeat-button/i));
      });

      expect(queryAllByLabelText(/String/i)).toHaveLength(4);
      expect(queryByTestId(/-repeat-button/i)).not.toBeInTheDocument();
    });
  });
  describe('delete button', () => {
    it('Should render delete button if item repeats and number of repeated items is greater than minOccurance(2)', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: true })),
      };
      const { getByTestId, queryAllByTestId } = createWrapper(questionnaire);

      userEvent.click(getByTestId(/-repeat-button/i));
      userEvent.click(getByTestId(/-repeat-button/i));

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

      userEvent.click(getByTestId(/-repeat-button/i));

      const deleteButton = getByTestId(/-delete-button/i);
      expect(deleteButton).toBeInTheDocument();
      userEvent.click(deleteButton);

      expect(getByTestId(/-delete-confirm-modal/i)).toBeInTheDocument();
    });
    it('Should remove item when delete button is clicked', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: true })),
      };
      const { getByTestId, queryByTestId } = createWrapper(questionnaire);

      userEvent.click(getByTestId(/-repeat-button/i));

      const deleteButton = getByTestId(/-delete-button/i);
      expect(deleteButton).toBeInTheDocument();

      userEvent.click(deleteButton);

      const confirmModal = getByTestId(/-delete-confirm-modal/i);
      userEvent.click(await findByRole(confirmModal, 'button', { name: /Forkast endringer/i }));

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
        const { getByTestId, getByText } = createWrapper(questionnaire);
        await act(async () => {
          await userEvent.click(getByTestId('refero-submit-button'));
        });

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
        const { getByTestId, getByLabelText, queryByText } = createWrapper(questionnaire);
        await act(async () => {
          await userEvent.type(getByLabelText(/String/i), 'abc');
          await userEvent.click(getByTestId('refero-submit-button'));
        });

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
        const { getByTestId, getByText, queryByText, getByLabelText } = createWrapper(questionnaire);
        await act(async () => {
          await userEvent.click(getByTestId('refero-submit-button'));
        });
        expect(getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();

        await act(async () => {
          await userEvent.type(getByLabelText(/String/i), 'abc');
          await userEvent.tab();
        });
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
        const { getByTestId, queryByText } = createWrapper(questionnaire);
        await act(async () => {
          await userEvent.click(getByTestId('refero-submit-button'));
        });

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
        const { getByTestId, getByLabelText, queryByText } = createWrapper(questionnaire);
        await act(async () => {
          await userEvent.type(getByLabelText(/String/i), 'epost@test.com');
          await userEvent.click(getByTestId('refero-submit-button'));
        });

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
        const { getByTestId, getByText, queryByText, getByLabelText } = createWrapper(questionnaire);
        await act(async () => {
          await userEvent.type(getByLabelText(/String/i), 'e@st.co');
          await userEvent.click(getByTestId('refero-submit-button'));
        });
        expect(getByText('Custom error')).toBeInTheDocument();
        await act(async () => {
          await userEvent.clear(getByLabelText(/String/i));
          await userEvent.type(getByLabelText(/String/i), 'epost@test.com');
        });

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
        const { getByTestId, queryByText } = createWrapper(questionnaire);
        await act(async () => {
          await userEvent.click(getByTestId('refero-submit-button'));
        });

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
        const { getByTestId, getByLabelText, queryByText } = createWrapper(questionnaire);
        await act(async () => {
          await userEvent.type(getByLabelText(/String/i), 'epost@test.com');
          await userEvent.click(getByTestId('refero-submit-button'));
        });

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
        const { getByTestId, getByText, queryByText, getByLabelText } = createWrapper(questionnaire);
        await act(async () => {
          await userEvent.type(getByLabelText(/String/i), 'eposteneraølt@asdasdst.com');
          await userEvent.click(getByTestId('refero-submit-button'));
        });
        expect(getByText('Custom error')).toBeInTheDocument();
        await act(async () => {
          await userEvent.clear(getByLabelText(/String/i));
          await userEvent.type(getByLabelText(/String/i), 'epost@test.com');
        });

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
        const { getByTestId, queryByText } = createWrapper(questionnaire);
        await act(async () => {
          await userEvent.click(getByTestId('refero-submit-button'));
        });

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
        const { getByTestId, getByLabelText, queryByText } = createWrapper(questionnaire);
        await act(async () => {
          await userEvent.type(getByLabelText(/String/i), 'epost@test.com');
          await userEvent.click(getByTestId('refero-submit-button'));
        });

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
        const { getByTestId, getByText, queryByText, getByLabelText } = createWrapper(questionnaire);
        await act(async () => {
          await userEvent.type(getByLabelText(/String/i), 'epostsdsdcom');
          await userEvent.click(getByTestId('refero-submit-button'));
        });
        expect(getByText('Custom error')).toBeInTheDocument();
        await act(async () => {
          await userEvent.clear(getByLabelText(/String/i));
          await userEvent.type(getByLabelText(/String/i), 'epost@test.com');
        });

        expect(queryByText('Custom error')).not.toBeInTheDocument();
      });
    });
    describe('validateScriptInjection ', () => {
      it('Should render with validation when input has html and validateScriptInjection = true', async () => {
        const validateScriptInjection = true;
        const value = 'input med <html>';
        const { findByText, findByLabelText, findByRole, getByTestId } = createWrapper(qScriptInjection, { validateScriptInjection });
        await act(async () => {
          userEvent.type(await findByLabelText('String1'), value);
          userEvent.type(await findByLabelText('String2 - Obligatorisk'), 'test');
          await userEvent.click(getByTestId('refero-submit-button'));
        });
        const actualElement = await findByText(/er ikke tillatt/i);
        const actualAlert = await findByRole('alert');
        expect(actualElement).toBeInTheDocument();
        expect(actualAlert).toBeInTheDocument();
      });
      it('Should render with validation when input has html and validateScriptInjection = false', async () => {
        const validateScriptInjection = false;
        const value = 'input med <html>';
        const { findByDisplayValue, findByLabelText, getByTestId, queryByRole } = createWrapper(qScriptInjection, {
          validateScriptInjection,
        });
        await act(async () => {
          userEvent.type(await findByLabelText('String2 - Obligatorisk'), value);
          await userEvent.click(getByTestId('refero-submit-button'));
        });
        const actualElement = await findByDisplayValue(value);
        const actualAlert = queryByRole('alert');
        expect(actualElement).toBeInTheDocument();
        expect(actualAlert).not.toBeInTheDocument();
      });
      it('Should render without validation when input does not have html and validateScriptInjection = true', async () => {
        const validateScriptInjection = true;
        const value = 'input uten html';
        const { findByDisplayValue, findByLabelText, queryByRole } = createWrapper(qScriptInjection, { validateScriptInjection });
        userEvent.type(await findByLabelText('String2 - Obligatorisk'), value);
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
