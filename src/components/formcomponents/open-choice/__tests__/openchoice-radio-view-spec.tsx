import { Questionnaire, QuestionnaireItemAnswerOption } from 'fhir/r4';
import { findByRole, renderRefero, userEvent, waitFor } from '@test/test-utils.tsx';
import { radioView as q } from './__data__/index';
import { ReferoProps } from '../../../../types/referoProps';
import { Extensions } from '../../../../constants/extensions';
import { typeExtraField } from './utils';
import { clickButtonTimes, repeatCheckboxTimes, selectCheckboxOption, submitForm } from '../../../../../test/selectors';
import { addManyPropertiesToQuestionnaireItem } from '../../../../../test/questionnairHelpers';
import { getResources } from '../../../../../preview/resources/referoResources';
import { vi } from 'vitest';

const resources = { ...getResources(''), formRequiredErrorMessage: 'Du må fylle ut dette feltet', oppgiGyldigVerdi: 'ikke gyldig tall' };
const expectedAnswer = {
  valueCoding: {
    code: 'ja',
    display: 'Ja',
    system: 'urn:uuid:791a62b0-6ca0-4cb9-8924-7d4f0a286228',
  },
};
describe('Radio-view - choice', () => {
  describe('Render', () => {
    it('Should render as text if props.pdf', async () => {
      const { queryByText } = await createWrapper(q, { pdf: true });
      expect(queryByText(resources.ikkeBesvart)).toBeInTheDocument();
    });
    it('Should render text if item is readonly', async () => {
      const questionnaire = addManyPropertiesToQuestionnaireItem(q, [{ property: 'readOnly', value: true }]);

      const { queryByText } = await createWrapper(questionnaire);
      expect(queryByText(resources.ikkeBesvart)).toBeInTheDocument();
    });
    it('Should render as input if props.pdf === false && item is not readonly', async () => {
      const { queryByText } = await createWrapper(q);
      expect(queryByText(resources.ikkeBesvart)).not.toBeInTheDocument();
    });
    it('Should render open-choice field', async () => {
      const { getByLabelText } = await createWrapper(q);
      expect(getByLabelText(/Annet/i)).toBeInTheDocument();
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
      const questionnaire = addManyPropertiesToQuestionnaireItem(q, [{ property: 'repeats', value: true }]);
      const { getByTestId } = await createWrapper(questionnaire);
      const repeatButton = getByTestId(/-repeat-button/i);
      expect(repeatButton).toBeInTheDocument();
    });

    it('Should not render repeat button if item does not repeats', async () => {
      const questionnaire = addManyPropertiesToQuestionnaireItem(q, [{ property: 'repeats', value: false }]);
      const { queryByTestId } = await createWrapper(questionnaire);
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
      const { queryAllByText, queryByTestId } = await createWrapper(questionnaire);
      await repeatCheckboxTimes(/Ja/i, 3);

      expect(queryAllByText(/Radio view label/i)).toHaveLength(4);
      expect(queryByTestId(/-repeat-button/i)).not.toBeInTheDocument();
    });
  });
  describe('delete button', () => {
    it('Should render delete button if item repeats and number of repeated items is greater than minOccurance(2)', async () => {
      const questionnaire = addManyPropertiesToQuestionnaireItem(q, [{ property: 'repeats', value: true }]);
      const { queryAllByTestId } = await createWrapper(questionnaire);

      await repeatCheckboxTimes(/Ja/i, 2);

      expect(queryAllByTestId(/-delete-button/i)).toHaveLength(2);
    });
    it('Should not render delete button if item repeats and number of repeated items is lower or equal than minOccurance(2)', async () => {
      const questionnaire = addManyPropertiesToQuestionnaireItem(q, [{ property: 'repeats', value: true }]);
      const { queryByTestId } = await createWrapper(questionnaire);

      expect(queryByTestId(/-delete-button/i)).not.toBeInTheDocument();
    });
    it('Should show confirmationbox when deletebutton is clicked', async () => {
      const questionnaire = addManyPropertiesToQuestionnaireItem(q, [{ property: 'repeats', value: true }]);
      const { getByTestId } = await createWrapper(questionnaire);

      await repeatCheckboxTimes(/Ja/i, 1);

      expect(getByTestId(/-delete-button/i)).toBeInTheDocument();
      await clickButtonTimes(/-delete-button/i, 1);

      expect(getByTestId(/-delete-confirm-modal/i)).toBeInTheDocument();
    });
    it('Should remove item when delete button is clicked', async () => {
      const questionnaire = addManyPropertiesToQuestionnaireItem(q, [{ property: 'repeats', value: true }]);
      const { getByTestId, queryByTestId } = await createWrapper(questionnaire);

      await repeatCheckboxTimes(/Ja/i, 1);

      expect(getByTestId(/-delete-button/i)).toBeInTheDocument();
      await clickButtonTimes(/-delete-button/i, 1);

      const confirmModal = getByTestId(/-delete-confirm-modal/i);
      await userEvent.click(await findByRole(confirmModal, 'button', { name: /Forkast endringer/i }));

      expect(queryByTestId(/-delete-button/i)).not.toBeInTheDocument();
    });
  });
  describe('initialvalue', () => {
    it('Initial value should not be set', async () => {
      const questionnaire = addManyPropertiesToQuestionnaireItem(q, [{ property: 'repeats', value: false }]);
      const { getByLabelText } = await createWrapper(questionnaire);

      expect(getByLabelText(/Ja/i)).not.toBeChecked();
    });
    it('Initial value should be set', async () => {
      const questionnaire = addManyPropertiesToQuestionnaireItem(q, [
        { property: 'repeats', value: false },
        { property: 'initial', value: [expectedAnswer] },
      ]);

      const { getByLabelText } = await createWrapper(questionnaire);

      expect(getByLabelText(/Ja/i)).toBeChecked();
    });
  });
  describe('onChange', () => {
    it('Should render extra text field when open-choice extra value is selected', async () => {
      const questionnaire = addManyPropertiesToQuestionnaireItem(q, [{ property: 'repeats', value: false }]);
      const { getByLabelText, getByTestId } = await createWrapper(questionnaire);

      await userEvent.click(getByLabelText(/Annet/i));
      expect(getByTestId(/-extra-field/i)).toBeInTheDocument();
      expect(getByLabelText(/Annet/i)).toBeChecked();
    });
    it('Should update component with value from answer', async () => {
      const questionnaire = addManyPropertiesToQuestionnaireItem(q, [{ property: 'repeats', value: false }]);
      const { getByLabelText } = await createWrapper(questionnaire);

      await userEvent.click(getByLabelText(/Ja/i));

      expect(getByLabelText(/Ja/i)).toBeChecked();
    });
    it('Should call onChange with correct value', async () => {
      const questionnaire = addManyPropertiesToQuestionnaireItem(q, [{ property: 'repeats', value: false }]);
      const onChange = vi.fn();
      const { getByLabelText } = await createWrapper(questionnaire, { onChange });
      expect(getByLabelText(/Ja/i)).toBeInTheDocument();
      await userEvent.click(getByLabelText(/Ja/i));

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

        const { getByLabelText, getByText } = await createWrapper(questionnaire);
        expect(getByLabelText(/Ja/i)).toBeInTheDocument();
        await submitForm();
        expect(getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();
      });
      it('Should not show error if required and has value', async () => {
        const questionnaire = addManyPropertiesToQuestionnaireItem(q, [
          { property: 'repeats', value: false },
          { property: 'required', value: true },
        ]);
        const { queryByText, getByLabelText } = await createWrapper(questionnaire);
        await userEvent.click(getByLabelText(/Ja/i));
        await submitForm();
        expect(queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
      });
      it('Should remove error on change if form is submitted', async () => {
        const questionnaire = addManyPropertiesToQuestionnaireItem(q, [
          { property: 'repeats', value: false },
          { property: 'required', value: true },
        ]);
        const { getByLabelText, getByText, queryByText } = await createWrapper(questionnaire);
        await submitForm();
        expect(getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();

        await userEvent.click(getByLabelText(/Ja/i));
        await userEvent.tab();
        expect(queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
      });
      it('Should get required error on readOnly if noe value', async () => {
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
        const { getByText } = await createWrapper(questionnaire);
        await submitForm();

        expect(getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();
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
        const { getByLabelText, getByTestId } = await createWrapper(questionnaire);

        await selectCheckboxOption(/Annet/i);

        expect(getByTestId(/-extra-field/i)).toBeInTheDocument();
        expect(getByLabelText(/Annet/i)).toBeChecked();
      });
      it('Should not render extra text field when open-choice extra value is not selected', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, repeats: false })),
        };
        const { queryByTestId, getByLabelText } = await createWrapper(questionnaire);

        expect(queryByTestId(/-extra-field/i)).not.toBeInTheDocument();
        expect(getByLabelText(/Ja/i)).not.toBeChecked();
      });
      it('Should update component when extra-field is changed', async () => {
        const answer: QuestionnaireItemAnswerOption = {
          valueString: 'test',
        };
        const onChange = vi.fn();
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, repeats: false })),
        };
        const { getByTestId } = await createWrapper(questionnaire, { onChange });

        await selectCheckboxOption(/Annet/i);
        expect(getByTestId(/-extra-field/i)).toBeInTheDocument();

        await typeExtraField('test');

        expect(onChange).toHaveBeenCalledWith(expect.any(Object), answer, expect.any(Object), expect.any(Object));
        expect(onChange).toHaveBeenCalledTimes(5);
      });
    });
    describe('Validation', () => {
      describe('Required', () => {
        it('Should show error if field is required and value is empty', async () => {
          const questionnaire: Questionnaire = {
            ...q,
            item: q.item?.map(x => ({ ...x, required: true, repeats: false })),
          };
          const { getByText, getByTestId } = await createWrapper(questionnaire);

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
          const { queryByText } = await createWrapper(questionnaire);
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
          const { getByText, queryByText } = await createWrapper(questionnaire);
          await selectCheckboxOption(/Annet/i);
          await submitForm();
          expect(getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();

          await typeExtraField('epost@test.com');
          await userEvent.tab();
          expect(queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
        });
      });
    });
  });
});
const createWrapper = async (questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) => {
  return await waitFor(() => renderRefero({ questionnaire, props: { ...props, resources } }));
};
