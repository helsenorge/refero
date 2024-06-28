import { Questionnaire } from 'fhir/r4';
import { string as qString } from './__data__';
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
  describe('Initial decimal value', () => {});
  describe('Initial integer value', () => {});
  describe('Initial date value', () => {});
  describe('Initial dateTime value', () => {});
  describe('Initial time value', () => {});
  describe('Initial choice value', () => {
    describe('initial Radiobutton value', () => {});
    describe('initial checkbox value', () => {});
    describe('initial dropdown value', () => {});
  });
  describe('Initial open choice value', () => {
    describe('initial Radiobutton value', () => {});
    describe('initial checkbox value', () => {});
    describe('initial dropdown value', () => {});
  });
  describe.only('Initial string value', () => {
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
  describe('Initial boolean value', () => {});
  describe('Initial attachment value', () => {});
  describe('Initial quantity value', () => {});
  describe('Initial text value', () => {});
});
const createWrapper = (questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) => {
  return renderRefero({ questionnaire, props: { ...props, resources } });
};
