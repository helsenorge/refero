import { Questionnaire, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { findByRole, renderRefero, userEvent } from '@test/test-utils.tsx';
import { q } from './__data__';
import { ReferoProps } from '../../../../types/referoProps';
import { clickButtonTimes, clickByLabelText, repeatCheckboxTimes, submitForm } from '../../../../../test/selectors';
import { getResources } from '../../../../../preview/resources/referoResources';
import { vi } from 'vitest';
const resources = { ...getResources(''), formRequiredErrorMessage: 'Du må fylle ut dette feltet' };

describe('Boolean', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  describe('Render', () => {
    it('Should render as text if props.pdf', () => {
      const { queryByTestId } = createWrapper(q, { pdf: true });
      expect(queryByTestId(/-pdf/i)).toBeInTheDocument();
    });
    it('Should render text if item is readonly', () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, readOnly: true })),
      };

      const { queryByTestId } = createWrapper(questionnaire);
      expect(queryByTestId(/-label-readonly/i)).toBeInTheDocument();
    });
    it('Should render as input if props.pdf === false && item is not readonly', () => {
      const { queryByText } = createWrapper(q);
      expect(queryByText(/-label-readonly/i)).not.toBeInTheDocument();
      expect(queryByText(/-pdf/i)).not.toBeInTheDocument();
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

      expect(getByLabelText(/Boolean/i)).not.toBeChecked();
    });
    it('Initial value should be set', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({
          ...x,
          repeats: false,
          initial: [
            {
              valueBoolean: true,
            },
          ],
        })),
      };
      const { getByLabelText } = createWrapper(questionnaire);

      expect(getByLabelText(/Boolean/i)).toBeChecked();
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
      const elm = container.querySelector('.page_refero__helpButton');
      if (elm) {
        await userEvent.click(elm);
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
          if (y.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-minOccurs') {
            return { ...y, valueInteger: 2 };
          }
          return y;
        }),
      };
      const { queryAllByLabelText, queryByTestId } = createWrapper(questionnaire);
      await repeatCheckboxTimes(/Boolean/i, 3);

      expect(queryAllByLabelText(/Boolean/i)).toHaveLength(4);
      expect(queryByTestId(/-repeat-button/i)).not.toBeInTheDocument();
    });
  });
  describe('delete button', () => {
    it('Should render delete button if item repeats and number of repeated items is greater than minOccurance(1)', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: true })),
      };
      const { queryAllByTestId } = createWrapper(questionnaire);
      await repeatCheckboxTimes(/Boolean/i, 2);

      expect(queryAllByTestId(/-delete-button/i)).toHaveLength(2);
    });
    it('Should not render delete button if item repeats and number of repeated items is lower or equal than minOccurance(1)', async () => {
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

      await repeatCheckboxTimes(/Boolean/i, 1);
      const deleteButton = getByTestId(/-delete-button/i);
      expect(deleteButton).toBeInTheDocument();
      await clickButtonTimes(/-delete-button/i, 1);

      expect(getByTestId(/-delete-confirm-modal/i)).toBeInTheDocument();
    });
    it('Should remove item when delete button is clicked', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: true })),
      };
      const { getByTestId, queryByTestId } = createWrapper(questionnaire);

      await repeatCheckboxTimes(/Boolean/i, 1);
      expect(getByTestId(/-delete-button/i)).toBeInTheDocument();

      await clickButtonTimes(/-delete-button/i, 1);

      const confirmModal = getByTestId(/-delete-confirm-modal/i);
      await userEvent.click(await findByRole(confirmModal, 'button', { name: /Forkast endringer/i }));

      expect(queryByTestId(/-delete-button/i)).not.toBeInTheDocument();
    });
  });
  describe('onChange', () => {
    it('Should update component with value from answer', async () => {
      const { getByLabelText } = createWrapper(q);

      const inputElement = getByLabelText(/Boolean/i);
      expect(inputElement).toBeInTheDocument();
      expect(inputElement).toHaveAttribute('type', `checkbox`);

      expect(inputElement).toHaveAttribute('id', `item_${q?.item?.[0].linkId}^0#id`);
      await userEvent.click(inputElement);
      expect(getByLabelText(/Boolean/i)).toBeChecked();
    });
    it('Should call onChange with correct value', async () => {
      const onChange = vi.fn();
      const { getByLabelText } = createWrapper(q, { onChange });
      expect(getByLabelText(/Boolean/i)).toBeInTheDocument();
      await clickByLabelText(/Boolean/i);
      const expectedAnswer: QuestionnaireResponseItemAnswer = {
        valueBoolean: true,
      };
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(expect.any(Object), expectedAnswer, expect.any(Object), expect.any(Object));
    });
  });

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
      const { queryByText } = createWrapper(questionnaire);
      await clickByLabelText(/Boolean/i);
      await submitForm();
      expect(queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
    });
    it('Should not show error if form dirty and value is changed to a valid state', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, required: true })),
      };
      const { queryByText } = createWrapper(questionnaire);
      await submitForm();
      expect(queryByText(resources.formRequiredErrorMessage)).toBeInTheDocument();
      await clickByLabelText(/Boolean/i);

      expect(queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
    });
  });
});

const createWrapper = (questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) => {
  return renderRefero({ questionnaire, props: { ...props, resources } });
};
