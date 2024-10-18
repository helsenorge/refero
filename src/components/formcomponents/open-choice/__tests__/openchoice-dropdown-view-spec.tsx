import { Questionnaire, QuestionnaireItemAnswerOption } from 'fhir/r4';
import { findByRole, renderRefero, userEvent } from '@test/test-utils.tsx';
import { dropdownView as q } from './__data__/index';
import { ReferoProps } from '../../../../types/referoProps';
import { Extensions } from '../../../../constants/extensions';
import { typeExtraField } from './utils';
import { clickButtonTimes, selectDropdownOptionByName, submitForm } from '../../../../../test/selectors';
import { addManyPropertiesToQuestionnaireItem, addPropertyToQuestionnaireItem } from '../../../../../test/questionnairHelpers';
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
describe('Dropdown-view - choice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  describe('Render', () => {
    it('Should render as text if props.pdf', () => {
      const { queryByText } = createWrapper(q, { pdf: true });
      expect(queryByText(resources.ikkeBesvart)).toBeInTheDocument();
    });
    it('Should render text if item is readonly', () => {
      const questionnaire = addPropertyToQuestionnaireItem(q, 'readOnly', true);

      const { queryByText } = createWrapper(questionnaire);
      expect(queryByText(resources.ikkeBesvart)).toBeInTheDocument();
    });
    it('Should render as input if props.pdf === false && item is not readonly', () => {
      const { queryByText } = createWrapper(q);
      expect(queryByText(resources.ikkeBesvart)).not.toBeInTheDocument();
    });
    it('Should render open-choice field', () => {
      const { getByText } = createWrapper(q);
      expect(getByText(/Annet/i)).toBeInTheDocument();
    });
  });
  describe('help button', () => {
    it('Should render helpButton', async () => {
      const { getByTestId } = createWrapper(q);

      expect(getByTestId(/-help-button/i)).toBeInTheDocument();
    });
    it('Should render helpElement when helpbutton is clicked', async () => {
      const { container, getByTestId } = createWrapper(q);

      expect(getByTestId(/-help-button/i)).toBeInTheDocument();

      expect(container.querySelector('.page_refero__helpComponent--open')).not.toBeInTheDocument();
      await clickButtonTimes(/-help-button/i, 1);

      expect(container.querySelector('.page_refero__helpComponent--open')).toBeInTheDocument();
    });
  });
  describe('repeat button', () => {
    it('Should render repeat button if item repeats', () => {
      const questionnaire = addPropertyToQuestionnaireItem(q, 'repeats', true);

      const { getByTestId } = createWrapper(questionnaire);
      expect(getByTestId(/-repeat-button/i)).toBeInTheDocument();
    });

    it('Should not render repeat button if item does not repeats', () => {
      const questionnaire = addPropertyToQuestionnaireItem(q, 'repeats', false);
      const { queryByTestId } = createWrapper(questionnaire);
      expect(queryByTestId(/-repeat-button/i)).not.toBeInTheDocument();
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
      expect(queryAllByText(/Dropdown view label/i)).toHaveLength(4);
      expect(queryByTestId(/-repeat-button/i)).not.toBeInTheDocument();
    });
  });
  describe('delete button', () => {
    it('Should render delete button if item repeats and number of repeated items is greater than minOccurance(2)', async () => {
      const questionnaire = addPropertyToQuestionnaireItem(q, 'repeats', true);
      const { queryAllByTestId } = createWrapper(questionnaire);
      await clickButtonTimes(/-repeat-button/i, 2);

      expect(queryAllByTestId(/-delete-button/i)).toHaveLength(2);
    });
    it('Should not render delete button if item repeats and number of repeated items is lower or equal than minOccurance(2)', async () => {
      const questionnaire = addPropertyToQuestionnaireItem(q, 'repeats', true);
      const { queryByTestId } = createWrapper(questionnaire);

      expect(queryByTestId(/-delete-button/i)).not.toBeInTheDocument();
    });
    it('Should show confirmationbox when deletebutton is clicked', async () => {
      const questionnaire = addPropertyToQuestionnaireItem(q, 'repeats', true);
      const { getByTestId } = createWrapper(questionnaire);
      await clickButtonTimes(/-repeat-button/i, 1);

      await clickButtonTimes(/-delete-button/i, 1);

      expect(getByTestId(/-delete-confirm-modal/i)).toBeInTheDocument();
    });
    it('Should remove item when delete button is clicked', async () => {
      const questionnaire = addPropertyToQuestionnaireItem(q, 'repeats', true);
      const { getByTestId, queryByTestId } = createWrapper(questionnaire);
      await clickButtonTimes(/-repeat-button/i, 1);

      await clickButtonTimes(/-delete-button/i, 1);
      await userEvent.click(await findByRole(getByTestId(/-delete-confirm-modal/i), 'button', { name: /Forkast endringer/i }));
      expect(queryByTestId(/-delete-button/i)).not.toBeInTheDocument();
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
      const { getByRole } = createWrapper(questionnaire);
      expect((getByRole('option', { name: 'Velg...' }) as HTMLOptionElement).selected).toBe(true);
    });
    it('Initial value should be set', async () => {
      const questionnaire = addManyPropertiesToQuestionnaireItem(q, [
        { property: 'initial', value: [expectedAnswer] },
        { property: 'repeats', value: false },
      ]);
      const { getByRole } = createWrapper(questionnaire);
      expect((getByRole('option', { name: 'Ja' }) as HTMLOptionElement).selected).toBe(true);
    });
  });
  describe('onChange', () => {
    it('Should render extra text field when open-choice extra value is selected', async () => {
      const questionnaire = addPropertyToQuestionnaireItem(q, 'repeats', false);
      const { getByTestId, getByRole } = createWrapper(questionnaire);

      await selectDropdownOptionByName(/Dropdown view label/i, 'Annet');
      expect(getByTestId(/-extra-field/i)).toBeInTheDocument();
      expect((getByRole('option', { name: 'Annet' }) as HTMLOptionElement).selected).toBe(true);
    });
    it('Should update component with value from answer', async () => {
      const questionnaire = addPropertyToQuestionnaireItem(q, 'repeats', false);
      const { getByRole } = createWrapper(questionnaire);

      await selectDropdownOptionByName(/Dropdown view label/i, 'Ja');

      expect((getByRole('option', { name: 'Ja' }) as HTMLOptionElement as HTMLOptionElement).selected).toBe(true);
    });
    it('Should call onChange with correct value', async () => {
      const questionnaire = addPropertyToQuestionnaireItem(q, 'repeats', false);
      const onChange = vi.fn();
      const { getByRole } = createWrapper(questionnaire, { onChange });
      expect(getByRole('option', { name: 'Ja' }) as HTMLOptionElement).toBeInTheDocument();
      await selectDropdownOptionByName(/Dropdown view label/i, 'Ja');

      expect(onChange).toHaveBeenCalledTimes(2);
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
        const { getByRole, getByText } = createWrapper(questionnaire);
        expect(getByRole('option', { name: 'Ja' }) as HTMLOptionElement).toBeInTheDocument();
        await submitForm();
        expect(getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();
      });
      it('Should not show error if required and has value', async () => {
        const questionnaire = addManyPropertiesToQuestionnaireItem(q, [
          { property: 'required', value: true },
          { property: 'repeats', value: false },
        ]);
        const { queryByText } = createWrapper(questionnaire);
        await selectDropdownOptionByName(/Dropdown view label/i, 'Ja');
        await submitForm();
        expect(queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
      });
      it('Should remove error on change if form is submitted', async () => {
        const questionnaire = addManyPropertiesToQuestionnaireItem(q, [
          { property: 'required', value: true },
          { property: 'repeats', value: false },
        ]);
        const { getByText, queryByText } = createWrapper(questionnaire);
        await submitForm();
        expect(getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();
        await selectDropdownOptionByName(/Dropdown view label/i, 'Ja');

        expect(queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
      });
    });
  });
  describe('Extra field', () => {
    describe('OnChange', () => {
      it('Should render extra text field when open-choice extra value is selected', async () => {
        const questionnaire = addManyPropertiesToQuestionnaireItem(q, [{ property: 'repeats', value: false }]);
        const { getByTestId, getByRole } = createWrapper(questionnaire);

        await selectDropdownOptionByName(/Dropdown view label/i, 'Annet');

        expect(getByTestId(/-extra-field/i)).toBeInTheDocument();
        expect((getByRole('option', { name: 'Annet' }) as HTMLOptionElement).selected).toBe(true);
      });
      it('Should not render extra text field when open-choice extra value is not selected', async () => {
        const questionnaire = addManyPropertiesToQuestionnaireItem(q, [{ property: 'repeats', value: false }]);

        const { queryByTestId } = createWrapper(questionnaire);

        expect(queryByTestId(/-extra-field/i)).not.toBeInTheDocument();
      });
      it('Should update component when extra-field is changed', async () => {
        const answer: QuestionnaireItemAnswerOption = {
          valueString: 'test',
        };
        const onChange = vi.fn();
        const questionnaire = addManyPropertiesToQuestionnaireItem(q, [{ property: 'repeats', value: false }]);

        const { getByTestId } = createWrapper(questionnaire, { onChange });
        await selectDropdownOptionByName(/Dropdown view label/i, 'Annet');
        expect(getByTestId(/-extra-field/i)).toBeInTheDocument();
        await typeExtraField('test');
        expect(onChange).toHaveBeenCalledWith(expect.any(Object), answer, expect.any(Object), expect.any(Object));
        expect(onChange).toHaveBeenCalledTimes(5);
      });
    });
    describe('Validation', () => {
      describe('Required', () => {
        it('Should show error if field is required and value is empty', async () => {
          const questionnaire = addManyPropertiesToQuestionnaireItem(q, [
            { property: 'repeats', value: false },
            { property: 'required', value: true },
          ]);

          const { getByText, getByTestId } = createWrapper(questionnaire);

          await selectDropdownOptionByName(/Dropdown view label/i, 'Annet');
          expect(getByTestId(/-extra-field/i)).toBeInTheDocument();
          await submitForm();
          expect(getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();
        });
        it('Should not show error if required and has value', async () => {
          const questionnaire = addManyPropertiesToQuestionnaireItem(q, [
            { property: 'repeats', value: false },
            { property: 'required', value: true },
          ]);
          const { queryByText } = createWrapper(questionnaire);
          await selectDropdownOptionByName(/Dropdown view label/i, 'Annet');
          await typeExtraField('epost@test.com');
          await submitForm();
          expect(queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
        });
        it('Should remove error on change if form is submitted', async () => {
          const questionnaire = addManyPropertiesToQuestionnaireItem(q, [
            { property: 'repeats', value: false },
            { property: 'required', value: true },
          ]);
          const { getByText, queryByText } = createWrapper(questionnaire);
          await selectDropdownOptionByName(/Dropdown view label/i, 'Annet');
          await submitForm();
          expect(getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();

          await typeExtraField('epost@test.com');
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
          const { getByText } = createWrapper(questionnaire);
          await submitForm();

          expect(getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();
        });
      });
    });
  });
});

const createWrapper = (questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) => {
  return renderRefero({ questionnaire, props: { ...props, resources } });
};
