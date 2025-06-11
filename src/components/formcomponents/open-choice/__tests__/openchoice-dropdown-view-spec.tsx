import { renderRefero, screen, userEvent, waitFor } from '@test/test-utils.tsx';
import { Questionnaire, QuestionnaireItemAnswerOption } from 'fhir/r4';
import { vi } from 'vitest';

import { ReferoProps } from '../../../../types/referoProps';

import { dropdownView as q } from './__data__/index';
import { typeExtraField } from './utils';
import { getResources } from '../../../../../preview/resources/referoResources';
import { addManyPropertiesToQuestionnaireItem, addPropertyToQuestionnaireItem } from '../../../../../test/questionnairHelpers';
import { clickButtonTimes, repeatDropDownTimes, selectDropdownOptionByName, submitForm } from '../../../../../test/selectors';
import { Extensions } from '../../../../constants/extensions';

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
      expect(screen.getByText(/Annet/i)).toBeInTheDocument();
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
      await createWrapper(questionnaire);
      await repeatDropDownTimes(/Dropdown view label/i, 3, 'Ja');
      expect(screen.queryAllByText(/Dropdown view label/i)).toHaveLength(4);
      expect(screen.queryByTestId(/-repeat-button/i)).not.toBeInTheDocument();
    });
  });
  describe('delete button', () => {
    it('Should render delete button if item repeats and number of repeated items is greater than minOccurance(2)', async () => {
      const questionnaire = addPropertyToQuestionnaireItem(q, 'repeats', true);
      await createWrapper(questionnaire);
      await repeatDropDownTimes(/Dropdown view label/i, 2, 'Ja');

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
      await repeatDropDownTimes(/Dropdown view label/i, 1, 'Ja');

      await clickButtonTimes(/-delete-button/i, 1);

      expect(screen.getByTestId(/-delete-confirm-modal/i)).toBeInTheDocument();
    });
    it('Should remove item when delete button is clicked', async () => {
      const questionnaire = addPropertyToQuestionnaireItem(q, 'repeats', true);
      await createWrapper(questionnaire);
      await repeatDropDownTimes(/Dropdown view label/i, 1, 'Ja');
      await clickButtonTimes(/-delete-button/i, 1);
      await userEvent.click(await screen.findByRole('button', { name: /Forkast endringer/i }));
      expect(screen.queryByTestId(/-delete-button/i)).not.toBeInTheDocument();
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
      const selectElement = screen.getByRole('combobox') as HTMLSelectElement;
      expect(selectElement.value).toBe('');
    });
    it('Initial value should be set', async () => {
      const questionnaire = addManyPropertiesToQuestionnaireItem(q, [
        { property: 'initial', value: [expectedAnswer] },
        { property: 'repeats', value: false },
      ]);
      await waitFor(async () => {
        await createWrapper(questionnaire);
      });
      expect((screen.getByRole('option', { name: 'Ja' }) as HTMLOptionElement).selected).toBe(true);
    });
  });
  describe('onChange', () => {
    it('Should render extra text field when open-choice extra value is selected', async () => {
      const questionnaire = addPropertyToQuestionnaireItem(q, 'repeats', false);
      await createWrapper(questionnaire);

      await selectDropdownOptionByName(/Dropdown view label/i, 'Annet');
      expect(screen.getByTestId(/-extra-field/i)).toBeInTheDocument();
      expect((screen.getByRole('option', { name: 'Annet' }) as HTMLOptionElement).selected).toBe(true);
    });
    it('Should update component with value from answer', async () => {
      const questionnaire = addPropertyToQuestionnaireItem(q, 'repeats', false);
      await createWrapper(questionnaire);

      await selectDropdownOptionByName(/Dropdown view label/i, 'Ja');

      expect((screen.getByRole('option', { name: 'Ja' }) as HTMLOptionElement as HTMLOptionElement).selected).toBe(true);
    });
    it('Should call onChange with correct value', async () => {
      const questionnaire = addPropertyToQuestionnaireItem(q, 'repeats', false);
      const onChange = vi.fn();
      await createWrapper(questionnaire, { onChange });
      expect(screen.getByRole('option', { name: 'Ja' }) as HTMLOptionElement).toBeInTheDocument();
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
        await createWrapper(questionnaire);
        expect(screen.getByRole('option', { name: 'Ja' }) as HTMLOptionElement).toBeInTheDocument();
        await submitForm();
        expect(screen.getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();
      });
      it('Should not show error if required and has value', async () => {
        const questionnaire = addManyPropertiesToQuestionnaireItem(q, [
          { property: 'required', value: true },
          { property: 'repeats', value: false },
        ]);
        await createWrapper(questionnaire);
        await selectDropdownOptionByName(/Dropdown view label/i, 'Ja');
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
        await selectDropdownOptionByName(/Dropdown view label/i, 'Ja');

        expect(screen.queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
      });
    });
  });
  describe('Extra field', () => {
    describe('OnChange', () => {
      it('Should render extra text field when open-choice extra value is selected', async () => {
        const questionnaire = addManyPropertiesToQuestionnaireItem(q, [{ property: 'repeats', value: false }]);
        await createWrapper(questionnaire);

        await selectDropdownOptionByName(/Dropdown view label/i, 'Annet');

        expect(screen.getByTestId(/-extra-field/i)).toBeInTheDocument();
        expect((screen.getByRole('option', { name: 'Annet' }) as HTMLOptionElement).selected).toBe(true);
      });
      it('Should not render extra text field when open-choice extra value is not selected', async () => {
        const questionnaire = addManyPropertiesToQuestionnaireItem(q, [{ property: 'repeats', value: false }]);

        await createWrapper(questionnaire);

        expect(screen.queryByTestId(/-extra-field/i)).not.toBeInTheDocument();
      });
      it('Should update component when extra-field is changed', async () => {
        const answer: QuestionnaireItemAnswerOption = {
          valueString: 'test',
        };
        const onChange = vi.fn();
        const questionnaire = addManyPropertiesToQuestionnaireItem(q, [{ property: 'repeats', value: false }]);

        await createWrapper(questionnaire, { onChange });
        await selectDropdownOptionByName(/Dropdown view label/i, 'Annet');
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
            { property: 'repeats', value: false },
            { property: 'required', value: true },
          ]);

          await createWrapper(questionnaire);

          await selectDropdownOptionByName(/Dropdown view label/i, 'Annet');
          expect(screen.getByTestId(/-extra-field/i)).toBeInTheDocument();
          await submitForm();
          expect(screen.getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();
        });
        it('Should not show error if required and has value', async () => {
          const questionnaire = addManyPropertiesToQuestionnaireItem(q, [
            { property: 'repeats', value: false },
            { property: 'required', value: true },
          ]);
          await createWrapper(questionnaire);
          await selectDropdownOptionByName(/Dropdown view label/i, 'Annet');
          await typeExtraField('epost@test.com');
          await submitForm();
          expect(screen.queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
        });
        it('Should remove error on change if form is submitted', async () => {
          const questionnaire = addManyPropertiesToQuestionnaireItem(q, [
            { property: 'repeats', value: false },
            { property: 'required', value: true },
          ]);
          await createWrapper(questionnaire);
          await selectDropdownOptionByName(/Dropdown view label/i, 'Annet');
          await submitForm();
          expect(screen.getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();

          await typeExtraField('epost@test.com');
          await userEvent.tab();
          expect(screen.queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
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
          await createWrapper(questionnaire);
          await submitForm();

          expect(screen.getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();
        });
      });
    });
  });
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createWrapper = async (questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) => {
  return await waitFor(async () => await renderRefero({ questionnaire, props: { ...props, resources } }));
};
