import { Questionnaire } from 'fhir/r4';
import { qString, qInteger, qDecimal, qText, qQuantity, qBoolean } from './__data__';
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
  describe.skip('Initial choice value', () => {
    describe('initial Radiobutton value', () => {});
    describe('initial checkbox value', () => {});
    describe('initial dropdown value', () => {});
    describe('initial autosuggest value', () => {});
  });
  describe.skip('Initial open choice value', () => {
    describe('initial Radiobutton value', () => {});
    describe('initial checkbox value', () => {});
    describe('initial dropdown value', () => {});
    describe('initial autosuggest value', () => {});
    describe('initial radiobutton extra-field value', () => {});
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
  describe.skip('Initial attachment value', () => {});
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
