import { Questionnaire } from 'fhir/r4';
import { act, findByRole, renderRefero, userEvent } from '../../../__tests__/test-utils/test-utils';
import { q } from './__data__';
import { ReferoProps } from '../../../../types/referoProps';
import { getResources } from '../../../../preview/resources/referoResources';
import { Extensions } from '../../../../constants/extensions';

const resources = { ...getResources(''), formRequiredErrorMessage: 'Du må fylle ut dette feltet' };

describe('Integer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
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

      expect(queryAllByLabelText(/Integer/i)).toHaveLength(4);
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
  describe('onChange', () => {
    it('Should update component with value from answer', async () => {
      const { getByLabelText } = createWrapper(q);

      const inputElement = getByLabelText(/Integer/i);
      expect(inputElement).toBeInTheDocument();
      expect(inputElement).toHaveAttribute('type', 'number');
      expect(inputElement).toHaveAttribute('id', `item_${q?.item?.[0].linkId}`);

      userEvent.type(inputElement, '123');

      expect(getByLabelText(/Integer/i)).toHaveValue(123);
    });
    it('Should call onChange with correct value', async () => {
      const onChange = jest.fn();
      const { getByLabelText } = createWrapper(q, { onChange });
      expect(getByLabelText(/Integer/i)).toBeInTheDocument();
      await act(async () => {
        userEvent.type(getByLabelText(/Integer/i), '1');
      });
      expect(onChange).toHaveBeenCalledTimes(1);
    });
  });
  describe('Validation', () => {
    describe('Required', () => {
      it('Should show error if field is required and value is empty', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, required: true })),
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
          item: q.item?.map(x => ({ ...x, required: true })),
        };
        const { getByTestId, getByLabelText, queryByText } = createWrapper(questionnaire);
        await act(async () => {
          await userEvent.type(getByLabelText(/Integer/i), '123');
          await userEvent.click(getByTestId('refero-submit-button'));
        });

        expect(queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
      });
      it('Should remove error on change if form is submitted', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, required: true })),
        };
        const { getByTestId, getByText, queryByText, getByLabelText } = createWrapper(questionnaire);
        await act(async () => {
          await userEvent.click(getByTestId('refero-submit-button'));
        });
        expect(getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();

        await act(async () => {
          await userEvent.type(getByLabelText(/Integer/i), '123');
          await userEvent.tab();
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
        const { getByTestId, queryByText } = createWrapper(questionnaire);
        await act(async () => {
          await userEvent.click(getByTestId('refero-submit-button'));
        });

        expect(queryByText('Custom error')).not.toBeInTheDocument();
      });
      it('Should not show error if value is bellow max value (10) and over min(5)', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, required: false })),
        };
        const { getByTestId, getByLabelText, queryByText } = createWrapper(questionnaire);
        await act(async () => {
          await userEvent.type(getByLabelText(/Integer/i), '8');
          await userEvent.click(getByTestId('refero-submit-button'));
        });

        expect(queryByText('Custom error')).not.toBeInTheDocument();
      });
      it('Should remove error on change if form is submitted', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, required: false })),
        };
        const { getByTestId, getByText, queryByText, getByLabelText } = createWrapper(questionnaire);
        await act(async () => {
          await userEvent.type(getByLabelText(/Integer/i), '12');
          await userEvent.click(getByTestId('refero-submit-button'));
        });
        expect(getByText('Custom error')).toBeInTheDocument();
        await act(async () => {
          await userEvent.clear(getByLabelText(/Integer/i));
          await userEvent.type(getByLabelText(/Integer/i), '8');
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
        const { getByTestId, queryByText } = createWrapper(questionnaire);
        await act(async () => {
          await userEvent.click(getByTestId('refero-submit-button'));
        });

        expect(queryByText('Custom error')).not.toBeInTheDocument();
      });
      it('Should not show error if value is bellow max value (10) and over min(5)', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, required: false })),
        };
        const { getByTestId, getByLabelText, queryByText } = createWrapper(questionnaire);
        await act(async () => {
          await userEvent.type(getByLabelText(/Integer/i), '8');
          await userEvent.click(getByTestId('refero-submit-button'));
        });

        expect(queryByText('Custom error')).not.toBeInTheDocument();
      });
      it('Should remove error on change if form is submitted', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, required: false })),
        };
        const { getByTestId, getByText, queryByText, getByLabelText } = createWrapper(questionnaire);
        await act(async () => {
          await userEvent.type(getByLabelText(/Integer/i), '3');
          await userEvent.click(getByTestId('refero-submit-button'));
        });
        expect(getByText('Custom error')).toBeInTheDocument();
        await act(async () => {
          await userEvent.clear(getByLabelText(/Integer/i));
          await userEvent.type(getByLabelText(/Integer/i), '8');
        });

        expect(queryByText('Custom error')).not.toBeInTheDocument();
      });
    });
  });
});

const createWrapper = (questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) => {
  return renderRefero({ questionnaire, props: { ...props, resources } });
};
