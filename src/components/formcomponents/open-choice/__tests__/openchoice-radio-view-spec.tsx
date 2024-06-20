import { Questionnaire, QuestionnaireItemAnswerOption } from 'fhir/r4';
import { act, findByRole, renderRefero, userEvent } from '../../../__tests__/test-utils/test-utils';
import { radioView as q } from './__data__/index';
import { ReferoProps } from '../../../../types/referoProps';
import { Extensions } from '../../../../constants/extensions';
import { typeExtraField } from './utils';
import { clickButtonTimes, selectCheckboxOption, submitForm } from '../../../__tests__/test-utils/selectors';
import { addManyPropertiesToQuestionnaireItem } from '../../../__tests__/test-utils/questionnairHelpers';
import { getResources } from '../../../../../preview/resources/referoResources';

const resources = { ...getResources(''), formRequiredErrorMessage: 'Du må fylle ut dette feltet', oppgiGyldigVerdi: 'ikke gyldig tall' };
const expectedAnswer = {
  valueCoding: {
    code: 'ja',
    display: 'Ja',
    system: 'urn:uuid:791a62b0-6ca0-4cb9-8924-7d4f0a286228',
  },
};
describe('Radio-view - choice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('Render', () => {
    it('Should render as text if props.pdf', () => {
      const { queryByText } = createWrapper(q, { pdf: true });
      expect(queryByText(resources.ikkeBesvart)).toBeInTheDocument();
    });
    it('Should render text if item is readonly', () => {
      const questionnaire = addManyPropertiesToQuestionnaireItem(q, [{ property: 'readOnly', value: true }]);

      const { queryByText } = createWrapper(questionnaire);
      expect(queryByText(resources.ikkeBesvart)).toBeInTheDocument();
    });
    it('Should render as input if props.pdf === false && item is not readonly', () => {
      const { queryByText } = createWrapper(q);
      expect(queryByText(resources.ikkeBesvart)).not.toBeInTheDocument();
    });
    it('Should render open-choice field', () => {
      const { getByLabelText } = createWrapper(q);
      expect(getByLabelText(/Annet/i)).toBeInTheDocument();
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
      const questionnaire = addManyPropertiesToQuestionnaireItem(q, [{ property: 'repeats', value: true }]);
      const { getByTestId } = createWrapper(questionnaire);
      const repeatButton = getByTestId(/-repeat-button/i);
      expect(repeatButton).toBeInTheDocument();
    });

    it('Should not render repeat button if item does not repeats', () => {
      const questionnaire = addManyPropertiesToQuestionnaireItem(q, [{ property: 'repeats', value: false }]);
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
      const { queryAllByText, queryByTestId } = createWrapper(questionnaire);
      await clickButtonTimes(/-repeat-button/i, 3);

      expect(queryAllByText(/Radio view label/i)).toHaveLength(4);
      expect(queryByTestId(/-repeat-button/i)).not.toBeInTheDocument();
    });
  });
  describe('delete button', () => {
    it('Should render delete button if item repeats and number of repeated items is greater than minOccurance(2)', async () => {
      const questionnaire = addManyPropertiesToQuestionnaireItem(q, [{ property: 'repeats', value: true }]);
      const { getByTestId, queryAllByTestId } = createWrapper(questionnaire);

      await clickButtonTimes(/-repeat-button/i, 2);

      expect(queryAllByTestId(/-delete-button/i)).toHaveLength(2);
    });
    it('Should not render delete button if item repeats and number of repeated items is lower or equal than minOccurance(2)', async () => {
      const questionnaire = addManyPropertiesToQuestionnaireItem(q, [{ property: 'repeats', value: true }]);
      const { queryByTestId } = createWrapper(questionnaire);

      expect(queryByTestId(/-delete-button/i)).not.toBeInTheDocument();
    });
    it('Should show confirmationbox when deletebutton is clicked', async () => {
      const questionnaire = addManyPropertiesToQuestionnaireItem(q, [{ property: 'repeats', value: true }]);
      const { getByTestId } = createWrapper(questionnaire);

      await clickButtonTimes(/-repeat-button/i, 1);

      expect(getByTestId(/-delete-button/i)).toBeInTheDocument();
      await clickButtonTimes(/-delete-button/i, 1);

      expect(getByTestId(/-delete-confirm-modal/i)).toBeInTheDocument();
    });
    it('Should remove item when delete button is clicked', async () => {
      const questionnaire = addManyPropertiesToQuestionnaireItem(q, [{ property: 'repeats', value: true }]);
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
  describe('initialvalue', () => {
    it('Initial value should not be set', async () => {
      const questionnaire = addManyPropertiesToQuestionnaireItem(q, [{ property: 'repeats', value: false }]);
      const { getByLabelText } = createWrapper(questionnaire);

      expect(getByLabelText(/Ja/i)).not.toBeChecked();
    });
    it('Initial value should be set', async () => {
      const questionnaire = addManyPropertiesToQuestionnaireItem(q, [
        { property: 'repeats', value: false },
        { property: 'initial', value: [expectedAnswer] },
      ]);

      const { getByLabelText } = createWrapper(questionnaire);

      expect(getByLabelText(/Ja/i)).toBeChecked();
    });
  });
  describe('onChange', () => {
    it('Should render extra text field when open-choice extra value is selected', async () => {
      const questionnaire = addManyPropertiesToQuestionnaireItem(q, [{ property: 'repeats', value: false }]);
      const { getByLabelText, getByTestId } = createWrapper(questionnaire);

      await act(async () => {
        userEvent.click(getByLabelText(/Annet/i));
      });
      expect(getByTestId(/-extra-field/i)).toBeInTheDocument();
      expect(getByLabelText(/Annet/i)).toBeChecked();
    });
    it('Should update component with value from answer', async () => {
      const questionnaire = addManyPropertiesToQuestionnaireItem(q, [{ property: 'repeats', value: false }]);
      const { getByLabelText } = createWrapper(questionnaire);

      await act(async () => {
        userEvent.click(getByLabelText(/Ja/i));
      });

      expect(getByLabelText(/Ja/i)).toBeChecked();
    });
    it('Should call onChange with correct value', async () => {
      const questionnaire = addManyPropertiesToQuestionnaireItem(q, [{ property: 'repeats', value: false }]);
      const onChange = jest.fn();
      const { getByLabelText } = createWrapper(questionnaire, { onChange });
      expect(getByLabelText(/Ja/i)).toBeInTheDocument();
      await act(async () => {
        userEvent.click(getByLabelText(/Ja/i));
      });

      expect(onChange).toHaveBeenCalledTimes(2);
      expect(onChange).toHaveBeenCalledWith(expect.any(Object), expectedAnswer, expect.any(Object), expect.any(Object));
    });
  });
  describe('Validation', () => {
    describe('Required', () => {
      it('Should show error if field is required and value is empty', async () => {
        const questionnaire = addManyPropertiesToQuestionnaireItem(q, [
          { property: 'repeats', value: false },
          { property: 'required', value: true },
        ]);

        const { getByLabelText, getByText } = createWrapper(questionnaire);
        expect(getByLabelText(/Ja/i)).toBeInTheDocument();
        await submitForm();
        expect(getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();
      });
      it('Should not show error if required and has value', async () => {
        const questionnaire = addManyPropertiesToQuestionnaireItem(q, [
          { property: 'repeats', value: false },
          { property: 'required', value: true },
        ]);
        const { queryByText, getByLabelText } = createWrapper(questionnaire);
        await act(async () => {
          userEvent.click(getByLabelText(/Ja/i));
        });
        await submitForm();
        expect(queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
      });
      it('Should remove error on change if form is submitted', async () => {
        const questionnaire = addManyPropertiesToQuestionnaireItem(q, [
          { property: 'repeats', value: false },
          { property: 'required', value: true },
        ]);
        const { getByLabelText, getByText, queryByText } = createWrapper(questionnaire);
        await submitForm();
        expect(getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();

        await act(async () => {
          userEvent.click(getByLabelText(/Ja/i));
          userEvent.tab();
        });
        expect(queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
      });
    });
  });
  describe('Extra field', () => {
    describe('OnChange', () => {
      it('Should render extra text field when open-choice extra value is selected', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, repeats: false })),
        };
        const { getByLabelText, getByTestId } = createWrapper(questionnaire);

        await selectCheckboxOption(/Annet/i);

        expect(getByTestId(/-extra-field/i)).toBeInTheDocument();
        expect(getByLabelText(/Annet/i)).toBeChecked();
      });
      it('Should not render extra text field when open-choice extra value is not selected', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, repeats: false })),
        };
        const { queryByTestId, getByLabelText } = createWrapper(questionnaire);

        expect(queryByTestId(/-extra-field/i)).not.toBeInTheDocument();
        expect(getByLabelText(/Ja/i)).not.toBeChecked();
      });
      it('Should update component when extra-field is changed', async () => {
        const answer: QuestionnaireItemAnswerOption = {
          valueString: 'test',
        };
        const onChange = jest.fn();
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, repeats: false })),
        };
        const { getByTestId } = createWrapper(questionnaire, { onChange });

        await selectCheckboxOption(/Annet/i);
        expect(getByTestId(/-extra-field/i)).toBeInTheDocument();

        await typeExtraField('test');

        expect(onChange).toHaveBeenCalledWith(expect.any(Object), answer, expect.any(Object), expect.any(Object));
        expect(onChange).toHaveBeenCalledTimes(2);
      });
    });
    describe('Validation', () => {
      describe('Required', () => {
        it('Should show error if field is required and value is empty', async () => {
          const questionnaire: Questionnaire = {
            ...q,
            item: q.item?.map(x => ({ ...x, required: true, repeats: false })),
          };
          const { getByText, getByTestId } = createWrapper(questionnaire);

          await selectCheckboxOption(/Annet/i);
          expect(getByTestId(/-extra-field/i)).toBeInTheDocument();
          await submitForm();
          expect(getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();
        });
        it('Should not show error if required and has value', async () => {
          const questionnaire: Questionnaire = {
            ...q,
            item: q.item?.map(x => ({ ...x, required: true, repeats: false })),
          };
          const { queryByText } = createWrapper(questionnaire);
          await selectCheckboxOption(/Annet/i);
          await typeExtraField('epost@test.com');
          await submitForm();
          expect(queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
        });
        it('Should remove error on change if form is submitted', async () => {
          const questionnaire: Questionnaire = {
            ...q,
            item: q.item?.map(x => ({ ...x, required: true, repeats: false })),
          };
          const { getByText, queryByText } = createWrapper(questionnaire);
          await selectCheckboxOption(/Annet/i);
          await submitForm();
          expect(getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();

          await typeExtraField('epost@test.com');
          await act(async () => {
            userEvent.tab();
          });
          expect(queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
        });
      });
    });
  });
});

const createWrapper = (questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) => {
  return renderRefero({ questionnaire, props: { ...props, resources } });
};
