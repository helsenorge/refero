import { Questionnaire, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { findByRole, renderRefero, screen, userEvent, waitFor } from '@test/test-utils.tsx';
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
    it('Should render as text if props.pdf', async () => {
      await createWrapper(q, { pdf: true });
      expect(screen.queryByTestId(/-pdf/i)).toBeInTheDocument();
    });
    it('Should render text if item is readonly', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, readOnly: true })),
      };

      await createWrapper(questionnaire);
      expect(screen.queryByTestId(/-label-readonly/i)).toBeInTheDocument();
    });
    it('Should render as input if props.pdf === false && item is not readonly', async () => {
      await createWrapper(q);
      expect(screen.queryByText(/-label-readonly/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/-pdf/i)).not.toBeInTheDocument();
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

      expect(screen.getByLabelText(/Boolean/i)).not.toBeChecked();
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
      await createWrapper(questionnaire);

      expect(screen.getByLabelText(/Boolean/i)).toBeChecked();
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
      const elm = container.querySelector('.page_refero__helpButton');
      if (elm) {
        await userEvent.click(elm);
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
          if (y.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-minOccurs') {
            return { ...y, valueInteger: 2 };
          }
          return y;
        }),
      };
      await createWrapper(questionnaire);
      await repeatCheckboxTimes(/Boolean/i, 3);

      expect(screen.queryAllByLabelText(/Boolean/i)).toHaveLength(4);
      expect(screen.queryByTestId(/-repeat-button/i)).not.toBeInTheDocument();
    });
  });
  describe('delete button', () => {
    it('Should render delete button if item repeats and number of repeated items is greater than minOccurance(1)', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: true })),
      };
      await createWrapper(questionnaire);
      await repeatCheckboxTimes(/Boolean/i, 2);

      expect(screen.queryAllByTestId(/-delete-button/i)).toHaveLength(2);
    });
    it('Should not render delete button if item repeats and number of repeated items is lower or equal than minOccurance(1)', async () => {
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

      await repeatCheckboxTimes(/Boolean/i, 1);
      const deleteButton = screen.getByTestId(/-delete-button/i);
      expect(deleteButton).toBeInTheDocument();
      await clickButtonTimes(/-delete-button/i, 1);

      expect(screen.getByTestId(/-delete-confirm-modal/i)).toBeInTheDocument();
    });
    it('Should remove item when delete button is clicked', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: true })),
      };
      await createWrapper(questionnaire);

      await repeatCheckboxTimes(/Boolean/i, 1);
      expect(screen.getByTestId(/-delete-button/i)).toBeInTheDocument();

      await clickButtonTimes(/-delete-button/i, 1);

      const confirmModal = screen.getByTestId(/-delete-confirm-modal/i);
      await userEvent.click(await findByRole(confirmModal, 'button', { name: /Forkast endringer/i }));

      expect(screen.queryByTestId(/-delete-button/i)).not.toBeInTheDocument();
    });
  });
  describe('onChange', () => {
    it('Should update component with value from answer', async () => {
      await createWrapper(q);

      const inputElement = screen.getByLabelText(/Boolean/i);
      expect(inputElement).toBeInTheDocument();
      expect(inputElement).toHaveAttribute('type', `checkbox`);

      expect(inputElement).toHaveAttribute('id', `item_${q?.item?.[0].linkId}^0`);
      await userEvent.click(inputElement);
      expect(screen.getByLabelText(/Boolean/i)).toBeChecked();
    });
    it('Should call onChange with correct value', async () => {
      const onChange = vi.fn();
      await createWrapper(q, { onChange });
      expect(screen.getByLabelText(/Boolean/i)).toBeInTheDocument();
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
      await clickByLabelText(/Boolean/i);
      await submitForm();
      expect(screen.queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
    });
    it('Should not show error if form dirty and value is changed to a valid state', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, required: true })),
      };
      await createWrapper(questionnaire);
      await submitForm();
      expect(screen.queryByText(resources.formRequiredErrorMessage)).toBeInTheDocument();
      await clickByLabelText(/Boolean/i);

      expect(screen.queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
    });
  });
});

const createWrapper = async (questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) => {
  return await waitFor(async () => {
    return renderRefero({ questionnaire, props: { ...props, resources } });
  });
};
