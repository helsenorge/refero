import { Questionnaire } from 'fhir/r4';
import {
  qString,
  qInteger,
  qOpenChoiceCheckbox,
  qDecimal,
  qText,
  qQuantity,
  qBoolean,
  qChoiceRadio,
  qOpenChoiceRadio,
  qChoiceCheckbox,
  qChoiceDropdown,
  qChoiceSlider,
  qAttachment,
} from './__data__';
import { ReferoProps } from '@/types/referoProps';
import { renderRefero } from '@test/test-utils';
import { getResources } from '../../../preview/resources/referoResources';
import { createIntitialFormValues } from '../defaultFormValues';
import { submitForm } from '@test/selectors';
const resources = getResources('');
describe('Default form values', () => {
  describe('createIntitialFormValues', () => {
    it('should return an empty object if no items are provided', () => {
      expect(createIntitialFormValues()).toEqual({});
    });
  });
  describe('Initial decimal value', () => {
    it('prefilled values should not cause a validation error on submit', async () => {
      const wrapper = createWrapper(qDecimal);
      await submitForm();
      expect(wrapper.queryByTestId(/summary-element-Preutfylt decimal/i)).not.toBeInTheDocument();
    });
    it('empty fields should not cause a validation error on submit', async () => {
      const wrapper = createWrapper(qDecimal);
      await submitForm();
      expect(wrapper.queryByTestId(/summary-element-Tom decimal/i)).toBeInTheDocument();
    });
  });
  describe('Initial integer value', () => {
    it('prefilled values should not cause a validation error on submit', async () => {
      const wrapper = createWrapper(qInteger);
      await submitForm();
      expect(wrapper.queryByTestId(/summary-element-Preutfylt integer/i)).not.toBeInTheDocument();
    });
    it('empty fields should not cause a validation error on submit', async () => {
      const wrapper = createWrapper(qInteger);
      await submitForm();
      expect(wrapper.queryByTestId(/summary-element-Tom integer/i)).toBeInTheDocument();
    });
  });
  describe.skip('Initial date value', () => {});
  describe.skip('Initial dateTime value', () => {});
  describe.skip('Initial time value', () => {});
  describe('Initial choice value', () => {
    describe('initial Radiobutton value', () => {
      it('prefilled values should not cause a validation error on submit', async () => {
        const wrapper = createWrapper(qChoiceRadio);
        await submitForm();
        expect(wrapper.queryByTestId(/summary-element-Preutfylt radioknapper/i)).not.toBeInTheDocument();
      });
      it('empty fields should not cause a validation error on submit', async () => {
        const wrapper = createWrapper(qChoiceRadio);
        await submitForm();
        expect(wrapper.queryByTestId(/summary-element-Tom radioknapper/i)).toBeInTheDocument();
      });
    });
    describe('initial checkbox value', () => {
      it('prefilled values should not cause a validation error on submit', async () => {
        const wrapper = createWrapper(qChoiceCheckbox);
        await submitForm();
        expect(wrapper.queryByTestId(/summary-element-Preutfylt checkbox/i)).not.toBeInTheDocument();
      });
      it('empty fields should not cause a validation error on submit', async () => {
        const wrapper = createWrapper(qChoiceCheckbox);
        await submitForm();
        expect(wrapper.queryByTestId(/summary-element-Tom checkbox/i)).toBeInTheDocument();
      });
    });
    describe('initial dropdown value', () => {
      it('prefilled values should not cause a validation error on submit', async () => {
        const wrapper = createWrapper(qChoiceDropdown);
        await submitForm();
        expect(wrapper.queryByTestId(/summary-element-Preutfylt dropdown/i)).not.toBeInTheDocument();
      });
      it('empty fields should not cause a validation error on submit', async () => {
        const wrapper = createWrapper(qChoiceDropdown);
        await submitForm();
        expect(wrapper.queryByTestId(/summary-element-Tom dropdown/i)).toBeInTheDocument();
      });
    });
    describe.skip('initial autosuggest value', () => {});
    describe('initial slider value', () => {
      it('prefilled values should not cause a validation error on submit', async () => {
        const wrapper = createWrapper(qChoiceSlider);
        await submitForm();
        expect(wrapper.queryByTestId(/summary-element-Preutfylt slider/i)).not.toBeInTheDocument();
      });
      it('empty fields should not cause a validation error on submit', async () => {
        const wrapper = createWrapper(qChoiceSlider);
        await submitForm();
        expect(wrapper.queryByTestId(/summary-element-Tom slider/i)).toBeInTheDocument();
      });
    });
  });
  describe('Initial open choice value', () => {
    describe('initial Radiobutton value', () => {
      it('prefilled values should not cause a validation error on submit', async () => {
        const wrapper = createWrapper(qOpenChoiceRadio);
        await submitForm();
        expect(wrapper.queryByTestId(/summary-element-Preutfylt radioknapper/i)).not.toBeInTheDocument();
      });
      it('empty fields should not cause a validation error on submit', async () => {
        const wrapper = createWrapper(qOpenChoiceRadio);
        await submitForm();
        expect(wrapper.queryByTestId(/summary-element-Tom radioknapper/i)).toBeInTheDocument();
      });
    });
    describe('initial checkbox value', () => {
      it('prefilled values should not cause a validation error on submit', async () => {
        const wrapper = createWrapper(qOpenChoiceCheckbox);
        await submitForm();
        wrapper.debug(undefined, 1000000);
        expect(wrapper.queryByTestId(/summary-element-Preutfylt checkbox/i)).not.toBeInTheDocument();
      });
      it('empty fields should not cause a validation error on submit', async () => {
        const wrapper = createWrapper(qOpenChoiceCheckbox);
        await submitForm();
        expect(wrapper.queryByTestId(/summary-element-Tom checkbox/i)).toBeInTheDocument();
      });
    });
    describe('initial dropdown value', () => {
      it('prefilled values should not cause a validation error on submit', async () => {
        const wrapper = createWrapper(qChoiceDropdown);
        await submitForm();
        expect(wrapper.queryByTestId(/summary-element-Preutfylt dropdown/i)).not.toBeInTheDocument();
      });
      it('empty fields should not cause a validation error on submit', async () => {
        const wrapper = createWrapper(qChoiceDropdown);
        await submitForm();
        expect(wrapper.queryByTestId(/summary-element-Tom dropdown/i)).toBeInTheDocument();
      });
    });
    describe.skip('initial autosuggest value', () => {});
  });
  describe('Initial string value', () => {
    it('prefilled values should not cause a validation error on submit', async () => {
      const wrapper = createWrapper(qString);
      await submitForm();
      expect(wrapper.queryByTestId(/summary-element-Preutfylt string/i)).not.toBeInTheDocument();
    });
    it('empty fields should not cause a validation error on submit', async () => {
      const wrapper = createWrapper(qString);
      await submitForm();
      expect(wrapper.queryByTestId(/summary-element-Tom string/i)).toBeInTheDocument();
    });
  });
  describe('Initial boolean value', () => {
    it('prefilled values should not cause a validation error on submit', async () => {
      const wrapper = createWrapper(qBoolean);
      await submitForm();
      expect(wrapper.queryByTestId(/summary-element-Preutfylt boolean/i)).not.toBeInTheDocument();
    });
    it('empty fields should not cause a validation error on submit', async () => {
      const wrapper = createWrapper(qBoolean);
      await submitForm();
      expect(wrapper.queryByTestId(/summary-element-Tom boolean/i)).toBeInTheDocument();
    });
  });
  describe('Initial attachment value', () => {
    it('empty fields should not cause a validation error on submit', async () => {
      const wrapper = createWrapper(qAttachment);
      await submitForm();
      expect(wrapper.queryByTestId(/summary-element-Tom attachment/i)).toBeInTheDocument();
    });
  });
  describe('Initial quantity value', () => {
    it('prefilled values should not cause a validation error on submit', async () => {
      const wrapper = createWrapper(qQuantity);
      await submitForm();
      expect(wrapper.queryByTestId(/summary-element-Preutfylt quantity/i)).not.toBeInTheDocument();
    });
    it('empty fields should not cause a validation error on submit', async () => {
      const wrapper = createWrapper(qQuantity);
      await submitForm();
      expect(wrapper.queryByTestId(/summary-element-Tom quantity/i)).toBeInTheDocument();
    });
  });
  describe('Initial text value', () => {
    it('prefilled values should not cause a validation error on submit', async () => {
      const wrapper = createWrapper(qText);
      await submitForm();
      expect(wrapper.queryByTestId(/summary-element-Preutfylt text/i)).not.toBeInTheDocument();
    });
    it('empty fields should not cause a validation error on submit', async () => {
      const wrapper = createWrapper(qText);
      await submitForm();
      expect(wrapper.queryByTestId(/summary-element-Tom text/i)).toBeInTheDocument();
    });
  });
});
const createWrapper = (questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) => {
  return renderRefero({ questionnaire, props: { ...props, resources } });
};