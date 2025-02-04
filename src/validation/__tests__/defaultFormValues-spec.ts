import { submitForm } from '@test/selectors';
import { renderRefero, screen } from '@test/test-utils';
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
  qDateTime,
  qDateDay,
  qTime,
  qDateMonth,
  qDateYear,
} from './__data__';
import { getResources } from '../../../preview/resources/referoResources';
import { createIntitialFormValues } from '../defaultFormValues';

import { ReferoProps } from '@/types/referoProps';

const resources = getResources('');
describe('Default form values', () => {
  describe('createIntitialFormValues', () => {
    it('should return an empty object if no items are provided', () => {
      expect(createIntitialFormValues()).toEqual({});
    });
  });
  describe('Initial decimal value', () => {
    it('prefilled values should not cause a validation error on submit', async () => {
      createWrapper(qDecimal);
      await submitForm();
      expect(screen.queryByTestId(/summary-element-Preutfylt decimal/i)).not.toBeInTheDocument();
    });
    it('empty fields should cause a validation error on submit', async () => {
      createWrapper(qDecimal);
      await submitForm();
      expect(screen.getByTestId(/summary-element-Tom decimal/i)).toBeInTheDocument();
    });
  });
  describe('Initial integer value', () => {
    it('prefilled values should not cause a validation error on submit', async () => {
      createWrapper(qInteger);
      await submitForm();
      expect(screen.queryByTestId(/summary-element-Preutfylt integer/i)).not.toBeInTheDocument();
    });
    it('empty fields should cause a validation error on submit', async () => {
      createWrapper(qInteger);
      await submitForm();
      expect(screen.getByTestId(/summary-element-Tom integer/i)).toBeInTheDocument();
    });
  });
  describe('Initial date and time values', () => {
    beforeEach(() => {
      process.env.TZ = 'Europe/Oslo';
    });
    afterEach(() => {
      delete process.env.TZ;
    });
    describe('Initial dateDay value', () => {
      it('prefilled values should not cause a validation error on submit', async () => {
        createWrapper(qDateDay);
        await submitForm();
        expect(screen.queryByTestId(/summary-element-Preutfylt dateDay/i)).not.toBeInTheDocument();
      });
      it('empty fields should cause a validation error on submit', async () => {
        createWrapper(qDateDay);
        await submitForm();
        expect(screen.getByTestId(/summary-element-Tom dateDay/i)).toBeInTheDocument();
      });
    });
    describe('Initial dateYear value', () => {
      it('prefilled values should not cause a validation error on submit', async () => {
        createWrapper(qDateYear);
        await submitForm();
        expect(screen.queryByTestId(/summary-element-Preutfylt dateYear/i)).not.toBeInTheDocument();
      });
      it('empty fields should cause a validation error on submit', async () => {
        createWrapper(qDateYear);
        await submitForm();
        expect(screen.getByTestId(/summary-element-Tom dateYear/i)).toBeInTheDocument();
      });
    });
    describe('Initial dateMonth value', () => {
      it('prefilled values should not cause a validation error on submit', async () => {
        createWrapper(qDateMonth);
        await submitForm();
        expect(screen.queryByTestId(/summary-element-Preutfylt dateMonth/i)).not.toBeInTheDocument();
      });
      it('empty fields should cause a validation error on submit', async () => {
        createWrapper(qDateMonth);
        await submitForm();
        const summaryElements = screen.queryAllByTestId(/summary-element-Tom dateMonth/i);
        expect(summaryElements[0]).toBeInTheDocument();
        expect(summaryElements[1]).toBeInTheDocument();
      });
    });
    describe('Initial dateTime value', () => {
      it('prefilled values should not cause a validation error on submit', async () => {
        createWrapper(qDateTime);
        await submitForm();
        expect(screen.queryByTestId(/summary-element-Preutfylt datetime/i)).not.toBeInTheDocument();
      });
      it('empty fields should cause a validation error on submit', async () => {
        createWrapper(qDateTime);
        await submitForm();
        const summaryElements = screen.queryAllByTestId(/summary-element-Tom datetime/i);
        expect(summaryElements[0]).toBeInTheDocument();
        expect(summaryElements[1]).toBeInTheDocument();
        expect(summaryElements[2]).toBeInTheDocument();
      });
    });
    describe('Initial time value', () => {
      it('prefilled values should not cause a validation error on submit', async () => {
        createWrapper(qTime);
        await submitForm();
        expect(screen.queryByTestId(/summary-element-Preutfylt time/i)).not.toBeInTheDocument();
      });
      it('empty fields should cause a validation error on submit', async () => {
        createWrapper(qTime);
        await submitForm();
        const summaryElements = screen.queryAllByTestId(/summary-element-Tom time/i);
        expect(summaryElements[0]).toBeInTheDocument();
        expect(summaryElements[1]).toBeInTheDocument();
      });
    });
  });
  describe('Initial choice value', () => {
    describe('initial Radiobutton value', () => {
      it('prefilled values should not cause a validation error on submit', async () => {
        createWrapper(qChoiceRadio);
        await submitForm();
        expect(screen.queryByTestId(/summary-element-Preutfylt radioknapper/i)).not.toBeInTheDocument();
      });
      it('empty fields should cause a validation error on submit', async () => {
        createWrapper(qChoiceRadio);
        await submitForm();
        expect(screen.getByTestId(/summary-element-Tom radioknapper/i)).toBeInTheDocument();
      });
    });
    describe('initial checkbox value', () => {
      it('prefilled values should not cause a validation error on submit', async () => {
        createWrapper(qChoiceCheckbox);
        await submitForm();
        expect(screen.queryByTestId(/summary-element-Preutfylt checkbox/i)).not.toBeInTheDocument();
      });
      it('empty fields should cause a validation error on submit', async () => {
        createWrapper(qChoiceCheckbox);
        await submitForm();
        expect(screen.getByTestId(/summary-element-Tom checkbox/i)).toBeInTheDocument();
      });
    });
    describe('initial dropdown value', () => {
      it('prefilled values should not cause a validation error on submit', async () => {
        createWrapper(qChoiceDropdown);
        await submitForm();
        expect(screen.queryByTestId(/summary-element-Preutfylt dropdown/i)).not.toBeInTheDocument();
      });
      it('empty fields should cause a validation error on submit', async () => {
        createWrapper(qChoiceDropdown);
        await submitForm();
        expect(screen.getByTestId(/summary-element-Tom dropdown/i)).toBeInTheDocument();
      });
    });
    describe('initial slider value', () => {
      it('prefilled values should not cause a validation error on submit', async () => {
        createWrapper(qChoiceSlider);
        await submitForm();
        expect(screen.queryByTestId(/summary-element-Preutfylt slider/i)).not.toBeInTheDocument();
      });
      it('empty fields should cause a validation error on submit', async () => {
        createWrapper(qChoiceSlider);
        await submitForm();
        expect(screen.getByTestId(/summary-element-Tom slider/i)).toBeInTheDocument();
      });
    });
  });
  describe('Initial open choice value', () => {
    describe('initial Radiobutton value', () => {
      it('prefilled values should not cause a validation error on submit', async () => {
        createWrapper(qOpenChoiceRadio);
        await submitForm();
        expect(screen.queryByTestId(/summary-element-Preutfylt radioknapper/i)).not.toBeInTheDocument();
      });
      it('empty fields should cause a validation error on submit', async () => {
        createWrapper(qOpenChoiceRadio);
        await submitForm();
        expect(screen.getByTestId(/summary-element-Tom radioknapper/i)).toBeInTheDocument();
      });
    });
    describe('initial checkbox value', () => {
      it('prefilled values should not cause a validation error on submit', async () => {
        createWrapper(qOpenChoiceCheckbox);
        await submitForm();
        expect(screen.queryByTestId(/summary-element-Preutfylt checkbox/i)).not.toBeInTheDocument();
      });
      it('empty fields should cause a validation error on submit', async () => {
        createWrapper(qOpenChoiceCheckbox);
        await submitForm();
        expect(screen.getByTestId(/summary-element-Tom checkbox/i)).toBeInTheDocument();
      });
    });
    describe('initial dropdown value', () => {
      it('prefilled values should not cause a validation error on submit', async () => {
        createWrapper(qChoiceDropdown);
        await submitForm();
        expect(screen.queryByTestId(/summary-element-Preutfylt dropdown/i)).not.toBeInTheDocument();
      });
      it('empty fields should cause a validation error on submit', async () => {
        createWrapper(qChoiceDropdown);
        await submitForm();
        expect(screen.getByTestId(/summary-element-Tom dropdown/i)).toBeInTheDocument();
      });
    });
  });
  describe('Initial string value', () => {
    it('prefilled values should not cause a validation error on submit', async () => {
      createWrapper(qString);
      await submitForm();
      expect(screen.queryByTestId(/summary-element-Preutfylt string/i)).not.toBeInTheDocument();
    });
    it('empty fields should cause a validation error on submit', async () => {
      createWrapper(qString);
      await submitForm();
      expect(screen.getByTestId(/summary-element-Tom string/i)).toBeInTheDocument();
    });
  });
  describe('Initial boolean value', () => {
    it('prefilled values should not cause a validation error on submit', async () => {
      createWrapper(qBoolean);
      await submitForm();
      expect(screen.queryByTestId(/summary-element-Preutfylt boolean/i)).not.toBeInTheDocument();
    });
    it('empty fields should cause a validation error on submit', async () => {
      createWrapper(qBoolean);
      await submitForm();
      expect(screen.getByTestId(/summary-element-Tom boolean/i)).toBeInTheDocument();
    });
  });
  describe('Initial attachment value', () => {
    it('empty fields should cause a validation error on submit', async () => {
      createWrapper(qAttachment);
      await submitForm();
      expect(screen.getByTestId(/summary-element-Tom attachment/i)).toBeInTheDocument();
    });
  });
  describe('Initial quantity value', () => {
    it('prefilled values should not cause a validation error on submit', async () => {
      createWrapper(qQuantity);
      await submitForm();
      expect(screen.queryByTestId(/summary-element-Preutfylt quantity/i)).not.toBeInTheDocument();
    });
    it('empty fields should cause a validation error on submit', async () => {
      createWrapper(qQuantity);
      await submitForm();
      expect(screen.getByTestId(/summary-element-Tom quantity/i)).toBeInTheDocument();
    });
  });
  describe('Initial text value', () => {
    it('prefilled values should not cause a validation error on submit', async () => {
      createWrapper(qText);
      await submitForm();
      expect(screen.queryByTestId(/summary-element-Preutfylt text/i)).not.toBeInTheDocument();
    });
    it('empty fields should cause a validation error on submit', async () => {
      createWrapper(qText);
      await submitForm();
      expect(screen.getByTestId(/summary-element-Tom text/i)).toBeInTheDocument();
    });
  });
});
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createWrapper = (questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) => {
  return renderRefero({ questionnaire, props: { ...props, resources } });
};
