import { Matcher, renderRefero, screen, userEvent, waitFor } from '@test/test-utils.tsx';
import { Questionnaire } from 'fhir/r4';
import { vi } from 'vitest';

import { ReferoProps } from '../../../../types/referoProps';

import { dropdownView as q } from './__data__/index';
import { getResources } from '../../../../../preview/resources/referoResources';
import { clickButtonTimes, getByLabelTextInsideElement, repeatDropDownTimes, submitForm } from '../../../../../test/selectors';
import { Extensions } from '../../../../constants/extensions';

const resources = { ...getResources(''), formRequiredErrorMessage: 'Du må fylle ut dette feltet', oppgiGyldigVerdi: 'ikke gyldig tall' };
const expectedAnswer = {
  valueCoding: {
    code: 'ja',
    display: 'Ja',
    system: 'urn:uuid:791a62b0-6ca0-4cb9-8924-7d4f0a286228',
  },
};

const getTestId = (questionnaire: Questionnaire): string => {
  const dropdownItem = questionnaire.item?.find(item => item.type === 'choice');
  const dropdownInputTestId = `test-choice-dropdown-item_${dropdownItem?.linkId}`;
  return dropdownInputTestId;
};

const getDopdownInput = (questionnaire: Questionnaire, labelText: Matcher): HTMLElement => {
  const dropdownInputTestId = getTestId(questionnaire);
  const dropdownInput = getByLabelTextInsideElement(dropdownInputTestId, labelText);
  return dropdownInput;
};

describe('Dropdown-view - choice', () => {
  describe('Render', () => {
    it('Should render as text if props.pdf', async () => {
      await createWrapper(q, { pdf: true });
      expect(screen.getByText(resources.ikkeBesvart)).toBeInTheDocument();
    });
    it('Should render text if item is readonly', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, readOnly: true })),
      };

      await createWrapper(questionnaire);
      expect(screen.getByText(resources.ikkeBesvart)).toBeInTheDocument();
    });
    it('Should render as input if props.pdf === false && item is not readonly', async () => {
      await createWrapper(q);
      expect(screen.queryByText(resources.ikkeBesvart)).not.toBeInTheDocument();
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
      await waitFor(async () => {
        expect(await screen.findByText('Help text')).toBeInTheDocument();
      });
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
          if (y.url === Extensions.MIN_OCCURS_URL) {
            return { ...y, valueInteger: 2 };
          }
          return y;
        }),
      };
      await createWrapper(questionnaire);

      const testId = getTestId(questionnaire);
      await repeatDropDownTimes(3, testId, /Dropdown view label/i, 'Ja');

      expect(screen.queryAllByText(/Dropdown view label/i)).toHaveLength(4);
      expect(screen.queryByTestId(/-repeat-button/i)).not.toBeInTheDocument();
    });
  });
  describe('delete button', () => {
    it('Should render delete button if item repeats and number of repeated items is greater than minOccurance(2)', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: true })),
      };
      await createWrapper(questionnaire);

      const testId = getTestId(questionnaire);
      await repeatDropDownTimes(2, testId, /Dropdown view label/i, 'Ja');

      expect(screen.queryAllByTestId(/-delete-button/i)).toHaveLength(2);
    });
    it('Should not render delete button if item repeats and number of repeated items is lower or equal than minOccurance(2)', async () => {
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

      const testId = getTestId(questionnaire);
      await repeatDropDownTimes(1, testId, /Dropdown view label/i, 'Ja');

      expect(screen.getByTestId(/-delete-button/i)).toBeInTheDocument();

      await clickButtonTimes(/-delete-button/i, 1);

      expect(screen.getByTestId(/-delete-confirm-modal/i)).toBeInTheDocument();
    });
    it('Should remove item when delete button is clicked', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: true })),
      };
      await createWrapper(questionnaire);

      const testId = getTestId(questionnaire);
      await repeatDropDownTimes(1, testId, /Dropdown view label/i, 'Ja');

      expect(screen.getByTestId(/-delete-button/i)).toBeInTheDocument();

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
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({
          ...x,
          repeats: false,
          initial: [expectedAnswer],
        })),
      };
      await waitFor(async () => {
        await createWrapper(questionnaire);
      });
      expect((screen.getByRole('option', { name: 'Ja' }) as HTMLOptionElement).selected).toBe(true);
    });
  });
  describe('onChange', () => {
    it('Should update component with value from answer', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: false })),
      };
      await createWrapper(questionnaire);

      const dropdownInput = getDopdownInput(questionnaire, /Dropdown view label/i);
      await userEvent.selectOptions(dropdownInput, screen.getByRole('option', { name: 'Ja' }) as HTMLOptionElement);

      expect((screen.getByRole('option', { name: 'Ja' }) as HTMLOptionElement as HTMLOptionElement).selected).toBe(true);
    });
    it('Should call onChange with correct value', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: false })),
      };
      const onChange = vi.fn();
      await createWrapper(questionnaire, { onChange });

      expect(screen.getByRole('option', { name: 'Ja' }) as HTMLOptionElement).toBeInTheDocument();

      const dropdownInput = getDopdownInput(questionnaire, /Dropdown view label/i);
      await userEvent.selectOptions(dropdownInput, screen.getByRole('option', { name: 'Ja' }) as HTMLOptionElement);

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(expect.any(Object), expectedAnswer, expect.any(Object), expect.any(Object));
    });
  });
  describe('Validation', () => {
    describe('Required', () => {
      it('Should show error if field is required and value is empty', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, required: true, repeats: false })),
        };
        await createWrapper(questionnaire);

        expect(screen.getByRole('option', { name: 'Ja' }) as HTMLOptionElement).toBeInTheDocument();

        await submitForm();

        expect(screen.getAllByText(resources.formRequiredErrorMessage)).toHaveLength(2);
      });
      it('Should not show error if required and has value', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, required: true, repeats: false })),
        };
        await createWrapper(questionnaire);

        const dropdownInput = getDopdownInput(questionnaire, /Dropdown view label/i);
        await userEvent.selectOptions(dropdownInput, screen.getByRole('option', { name: 'Ja' }) as HTMLOptionElement);
        await submitForm();

        expect(screen.queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
      });
      it('Should remove error on change if form is submitted', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, required: true, repeats: false })),
        };
        await createWrapper(questionnaire);
        await submitForm();

        expect(screen.getAllByText(resources.formRequiredErrorMessage)).toHaveLength(2);

        const dropdownInput = getDopdownInput(questionnaire, /Dropdown view label/i);
        await userEvent.selectOptions(dropdownInput, screen.getByRole('option', { name: 'Ja' }) as HTMLOptionElement);

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

        expect(screen.getAllByText(resources.formRequiredErrorMessage)).toHaveLength(2);
      });
    });
  });
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createWrapper = async (questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) => {
  return await renderRefero({ questionnaire, props: { ...props, resources } });
};
