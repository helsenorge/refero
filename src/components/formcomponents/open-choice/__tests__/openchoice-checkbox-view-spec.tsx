import { renderRefero, screen, userEvent, waitFor } from '@test/test-utils.tsx';
import { Questionnaire, QuestionnaireItemAnswerOption } from 'fhir/r4';
import { vi } from 'vitest';

import { ReferoProps } from '../../../../types/referoProps';

import { checkboxView as q } from './__data__/index';
import { typeExtraField } from './utils';
import { getResources } from '../../../../../preview/resources/referoResources';
import { addManyPropertiesToQuestionnaireItem, addPropertyToQuestionnaireItem } from '../../../../../test/questionnairHelpers';
import { clickButtonTimes, repeatCheckboxTimes, selectCheckboxOption, submitForm } from '../../../../../test/selectors';

const resources = { ...getResources(''), formRequiredErrorMessage: 'Du må fylle ut dette feltet', oppgiGyldigVerdi: 'ikke gyldig tall' };
const expectedAnswer: QuestionnaireItemAnswerOption = {
  valueCoding: {
    code: 'ja',
    display: 'Ja',
    system: 'urn:uuid:b4d3b26f-e0cc-4d56-9574-aea793dc7c4c',
  },
};

describe('checkbox-view - openchoice', () => {
  describe('Render', () => {
    it('Should render as text if props.pdf', async () => {
      await createWrapper(q, { pdf: true });
      expect(screen.getByText(resources.ikkeBesvart)).toBeInTheDocument();
    });
    it('Should render text if item is readonly', async () => {
      const questionnaire = addPropertyToQuestionnaireItem(q, 'readOnly', true);
      await createWrapper(questionnaire);
      expect(screen.getByText(resources.ikkeBesvart)).toBeInTheDocument();
    });
    it('Should render as input if props.pdf === false && item is not readonly', async () => {
      await createWrapper(q);
      expect(screen.queryByText(resources.ikkeBesvart)).not.toBeInTheDocument();
    });
    it('Should render open-choice field', async () => {
      await createWrapper(q);
      expect(screen.getByLabelText(/Annet/i)).toBeInTheDocument();
    });
  });
  describe('help button', () => {
    it('Should render helpButton', async () => {
      await createWrapper(q);

      expect(screen.getByTestId(/-help-button/i)).toBeInTheDocument();
    });
    it('Should render helpElement when helpbutton is clicked', async () => {
      const { container } = await createWrapper(q);

      expect(screen.getByTestId(/-help-button/i)).toBeInTheDocument();

      expect(container.querySelector('.page_refero__helpComponent--open')).not.toBeInTheDocument();
      await clickButtonTimes(/-help-button/i, 1);

      expect(container.querySelector('.page_refero__helpComponent--open')).toBeInTheDocument();
    });
  });
  describe('repeat button', () => {
    it('Should render repeat button if item repeats', async () => {
      const questionnaire = addPropertyToQuestionnaireItem(q, 'repeats', true);
      await createWrapper(questionnaire);
      expect(screen.getByTestId(/-repeat-button/i)).toBeInTheDocument();
    });

    it('Should not render repeat button if item does not repeats', async () => {
      const questionnaire = addPropertyToQuestionnaireItem(q, 'repeats', false);
      await createWrapper(questionnaire);
      expect(screen.queryByTestId(/-repeat-button/i)).not.toBeInTheDocument();
    });
    it('Should add item when repeat is clicked and remove button when maxOccurance(4) is reached', async () => {
      const questionnaire = addPropertyToQuestionnaireItem(q, 'repeats', true);
      await createWrapper(questionnaire);
      await repeatCheckboxTimes(/Ja/i, 3);
      expect(screen.queryAllByText(/Checkbox view label/i)).toHaveLength(4);
      expect(screen.queryByTestId(/-repeat-button/i)).not.toBeInTheDocument();
    });
  });
  describe('delete button', () => {
    it('Should render delete button if item repeats and number of repeated items is greater than minOccurance(2)', async () => {
      const questionnaire = addPropertyToQuestionnaireItem(q, 'repeats', true);
      await createWrapper(questionnaire);
      await repeatCheckboxTimes(/Ja/i, 2);

      expect(screen.queryAllByTestId(/-delete-button/i)).toHaveLength(2);
    });
    it('Should not render delete button if item repeats and number of repeated items is lower or equal than minOccurance(2)', async () => {
      const questionnaire = addPropertyToQuestionnaireItem(q, 'repeats', true);
      await createWrapper(questionnaire);

      expect(screen.queryByTestId(/-delete-button/i)).not.toBeInTheDocument();
    });
    it('Should show confirmationbox when deletebutton is clicked', async () => {
      const questionnaire = addPropertyToQuestionnaireItem(q, 'repeats', true);
      await createWrapper(questionnaire);

      await repeatCheckboxTimes(/Ja/i, 1);

      const elm2 = screen.getAllByLabelText(/Ja/i);
      await userEvent.click(elm2[1]);
      await clickButtonTimes(/-delete-button/i, 1);

      expect(screen.getByTestId(/-delete-confirm-modal/i)).toBeInTheDocument();
    });
    it('Should remove item when delete button is clicked', async () => {
      const questionnaire = addPropertyToQuestionnaireItem(q, 'repeats', true);
      await createWrapper(questionnaire);

      await repeatCheckboxTimes(/Ja/i, 1);

      const elm2 = screen.getAllByLabelText(/Ja/i);
      await userEvent.click(elm2[1]);
      await clickButtonTimes(/-delete-button/i, 1);

      await userEvent.click(await screen.findByRole('button', { name: /Forkast endringer/i }));
      expect(screen.queryByTestId(/-delete-button/i)).not.toBeInTheDocument();
    });
  });
  describe('initialvalue', () => {
    it('Initial value should not be set', async () => {
      const questionnaire = addPropertyToQuestionnaireItem(q, 'repeats', false);
      await createWrapper(questionnaire);

      expect(screen.getByLabelText(/Ja/i)).not.toBeChecked();
    });
    it('Initial value should be set', async () => {
      const questionnaire = addManyPropertiesToQuestionnaireItem(q, [
        { property: 'initial', value: [expectedAnswer] },
        { property: 'repeats', value: true },
      ]);

      await waitFor(async () => {
        await createWrapper(questionnaire);
      });
      expect(screen.getByLabelText(/Ja/i)).toBeChecked();
    });
  });
  describe('Extra field', () => {
    describe('OnChange', () => {
      it('Should render extra text field when open-choice extra value is selected', async () => {
        const questionnaire = addPropertyToQuestionnaireItem(q, 'repeats', false);
        await createWrapper(questionnaire);

        await selectCheckboxOption(/Annet/i);

        expect(screen.getByTestId(/-extra-field/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Annet/i)).toBeChecked();
      });
      it('Should not render extra text field when open-choice extra value is not selected', async () => {
        const questionnaire = addPropertyToQuestionnaireItem(q, 'repeats', false);
        await createWrapper(questionnaire);

        expect(screen.queryByTestId(/-extra-field/i)).not.toBeInTheDocument();
        expect(screen.getByLabelText(/Ja/i)).not.toBeChecked();
      });
      it('Should update component when extra-field is changed', async () => {
        const answer: QuestionnaireItemAnswerOption = {
          valueString: 'test',
        };
        const onChange = vi.fn();
        const questionnaire = addPropertyToQuestionnaireItem(q, 'repeats', false);
        await createWrapper(questionnaire, { onChange });

        await selectCheckboxOption(/Annet/i);
        expect(screen.getByTestId(/-extra-field/i)).toBeInTheDocument();

        await typeExtraField('test');

        expect(onChange).toHaveBeenCalledWith(expect.any(Object), answer, expect.any(Object), expect.any(Object));
        expect(onChange).toHaveBeenCalledTimes(5);
      });
    });
    describe('Validation', () => {
      describe('Required', () => {
        it('Should show error if field is required and value is empty', async () => {
          const questionnaire = addManyPropertiesToQuestionnaireItem(q, [
            { property: 'required', value: true },
            { property: 'repeats', value: false },
          ]);
          await createWrapper(questionnaire);

          await selectCheckboxOption(/Annet/i);
          expect(screen.getByTestId(/-extra-field/i)).toBeInTheDocument();
          await submitForm();
          expect(screen.getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();
        });
        it('Should not show error if required and has value', async () => {
          const questionnaire = addManyPropertiesToQuestionnaireItem(q, [
            { property: 'required', value: true },
            { property: 'repeats', value: false },
          ]);
          await createWrapper(questionnaire);
          await selectCheckboxOption(/Annet/i);
          await typeExtraField('epost@test.com');
          await submitForm();
          expect(screen.queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
        });
        it('Should remove error on change if form is submitted', async () => {
          const questionnaire = addManyPropertiesToQuestionnaireItem(q, [
            { property: 'required', value: true },
            { property: 'repeats', value: false },
          ]);
          await createWrapper(questionnaire);
          await selectCheckboxOption(/Annet/i);
          await submitForm();
          expect(screen.getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();

          await typeExtraField('epost@test.com');
          await userEvent.tab();
          expect(screen.queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
        });
        it('Should get required error on readOnly if noe value', async () => {
          const questionnaire = addManyPropertiesToQuestionnaireItem(q, [
            { property: 'required', value: true },
            { property: 'readOnly', value: true },
            {
              property: 'code',
              value: [
                {
                  code: 'ValidateReadOnly',
                  display: 'Valider skrivebeskyttet felt',
                  system: 'http://helsenorge.no/fhir/CodeSystem/ValidationOptions',
                },
              ],
            },
          ]);

          await createWrapper(questionnaire);
          await submitForm();

          expect(screen.getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();
        });
      });
    });
  });
  describe('onChange', () => {
    it('Should update component with value from answer', async () => {
      const questionnaire = addPropertyToQuestionnaireItem(q, 'repeats', false);
      await createWrapper(questionnaire);

      await selectCheckboxOption(/Ja/i);

      expect(screen.getByLabelText(/Ja/i)).toBeChecked();
    });
    it('Should call onChange with correct value', async () => {
      const questionnaire = addPropertyToQuestionnaireItem(q, 'repeats', false);
      const onChange = vi.fn();
      await createWrapper(questionnaire, { onChange });

      expect(screen.getByLabelText(/Ja/i)).toBeInTheDocument();

      await selectCheckboxOption(/Ja/i);

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(expect.any(Object), expectedAnswer, expect.any(Object), expect.any(Object));
    });
  });
  describe('Validation', () => {
    describe('Required', () => {
      it('Should show error if field is required and value is empty', async () => {
        const questionnaire = addManyPropertiesToQuestionnaireItem(q, [
          { property: 'required', value: true },
          { property: 'repeats', value: false },
        ]);
        await createWrapper(questionnaire);
        expect(screen.getByLabelText(/Ja/i)).toBeInTheDocument();
        await submitForm();
        expect(screen.getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();
      });
      it('Should not show error if required and has value', async () => {
        const questionnaire = addManyPropertiesToQuestionnaireItem(q, [
          { property: 'required', value: true },
          { property: 'repeats', value: false },
        ]);
        await createWrapper(questionnaire);
        await selectCheckboxOption(/Ja/i);
        await submitForm();
        expect(screen.queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
      });
      it('Should remove error on change if form is submitted', async () => {
        const questionnaire = addManyPropertiesToQuestionnaireItem(q, [
          { property: 'required', value: true },
          { property: 'repeats', value: false },
        ]);
        await createWrapper(questionnaire);
        await submitForm();
        expect(screen.getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();

        await selectCheckboxOption(/Ja/i);

        await userEvent.tab();
        expect(screen.queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
      });
    });
  });
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createWrapper = async (questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) => {
  return await waitFor(async () => {
    return renderRefero({ questionnaire, props: { ...props, resources } });
  });
};
