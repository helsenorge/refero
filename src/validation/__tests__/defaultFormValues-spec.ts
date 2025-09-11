import { submitForm } from '@test/selectors';
import { renderRefero, screen, waitFor } from '@test/test-utils';
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
  qText_prefilled,
  qQuantity_prefilled,
  qDecimal_prefilled,
  qInteger_prefilled,
  qDateDay_prefilled,
  qDateYear_prefilled,
  qDateMonth_prefilled,
  qDateTime_prefilled,
  qTime_prefilled,
  qChoiceRadio_prefilled,
  qChoiceCheckbox_prefilled,
  qChoiceDropdown_prefilled,
  qChoiceSlider_prefilled,
  qOpenChoiceRadio_prefilled,
  qOpenChoiceCheckbox_prefilled,
  qString_prefilled,
  qBoolean_prefilled,
} from './__data__';
import { getResources } from '../../../preview/resources/referoResources';
import { createIntitialFormValues } from '../defaultFormValues';

import { ReferoProps } from '@/types/referoProps';

const resources = {
  ...getResources(''),
  formRequiredErrorMessage: 'Du må fylle ut dette feltet',
  year_field_required: 'Årstall er påkrevd',
  yearmonth_field_required: 'Årstall og måned er påkrevd',
};

describe('Default form values', () => {
  describe('createIntitialFormValues', () => {
    it('should return an empty object if no items are provided', () => {
      expect(createIntitialFormValues()).toEqual({});
    });
  });
  describe('Initial decimal value', () => {
    it('prefilled values should not cause a validation error on submit', async () => {
      createWrapper(qDecimal_prefilled);
      await submitForm();
      expect(screen.queryByTestId(/validation-summary/)).not.toBeInTheDocument();
    });
    it('empty fields should cause a validation error on submit', async () => {
      createWrapper(qDecimal);
      await submitForm();
      await waitFor(() => {
        expect(screen.queryByTestId(/validation-summary/)).toBeInTheDocument();
        expect(screen.getAllByText(resources.formRequiredErrorMessage)).toHaveLength(2);
      });
    });
  });
  describe('Initial integer value', () => {
    it('prefilled values should not cause a validation error on submit', async () => {
      createWrapper(qInteger_prefilled);
      await submitForm();
      expect(screen.queryByTestId(/validation-summary/)).not.toBeInTheDocument();
    });
    it('empty fields should cause a validation error on submit', async () => {
      createWrapper(qInteger);
      await submitForm();
      expect(screen.queryByTestId(/validation-summary/)).toBeInTheDocument();
      expect(screen.getAllByText(resources.formRequiredErrorMessage)).toHaveLength(2);
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
        createWrapper(qDateDay_prefilled);
        await submitForm();
        expect(screen.queryByTestId(/validation-summary/)).not.toBeInTheDocument();
      });
      it('empty fields should cause a validation error on submit', async () => {
        createWrapper(qDateDay);
        await submitForm();
        expect(screen.queryByTestId(/validation-summary/)).toBeInTheDocument();
        expect(screen.getAllByText(resources.formRequiredErrorMessage)).toHaveLength(2);
      });
    });
    describe('Initial dateYear value', () => {
      it('prefilled values should not cause a validation error on submit', async () => {
        createWrapper(qDateYear_prefilled);
        await submitForm();
        expect(screen.queryByTestId(/validation-summary/)).not.toBeInTheDocument();
      });
      it('empty fields should cause a validation error on submit', async () => {
        createWrapper(qDateYear);
        await submitForm();
        expect(screen.queryByTestId(/validation-summary/)).toBeInTheDocument();
        expect(screen.getAllByText(resources.year_field_required)).toHaveLength(2);
      });
    });
    describe('Initial dateMonth value', () => {
      it('prefilled values should not cause a validation error on submit', async () => {
        createWrapper(qDateMonth_prefilled);
        await submitForm();
        expect(screen.queryByTestId(/validation-summary/)).not.toBeInTheDocument();
      });
      it('empty fields should cause a validation error on submit', async () => {
        createWrapper(qDateMonth);
        await submitForm();
        expect(screen.queryByTestId(/validation-summary/)).toBeInTheDocument();
        expect(screen.getAllByText(resources.yearmonth_field_required)).toHaveLength(3);
      });
    });
    describe('Initial dateTime value', () => {
      it('prefilled values should not cause a validation error on submit', async () => {
        createWrapper(qDateTime_prefilled);
        await submitForm();
        expect(screen.queryByTestId(/validation-summary/)).not.toBeInTheDocument();
      });
      it('empty fields should cause a validation error on submit', async () => {
        createWrapper(qDateTime);
        await submitForm();
        expect(screen.queryByTestId(/validation-summary/)).toBeInTheDocument();
        expect(screen.getAllByText(resources.formRequiredErrorMessage)).toHaveLength(4);
      });
    });
    describe('Initial time value', () => {
      it('prefilled values should not cause a validation error on submit', async () => {
        createWrapper(qTime_prefilled);
        await submitForm();
        expect(screen.queryByTestId(/validation-summary/)).not.toBeInTheDocument();
      });
      it('empty fields should cause a validation error on submit', async () => {
        createWrapper(qTime);
        await submitForm();
        expect(screen.queryByTestId(/validation-summary/)).toBeInTheDocument();
        expect(screen.getAllByText(resources.formRequiredErrorMessage)).toHaveLength(3);
      });
    });
  });
  describe('Initial choice value', () => {
    describe('initial Radiobutton value', () => {
      it('prefilled values should not cause a validation error on submit', async () => {
        createWrapper(qChoiceRadio_prefilled);
        await submitForm();
        expect(screen.queryByTestId(/validation-summary/)).not.toBeInTheDocument();
      });
      it('empty fields should cause a validation error on submit', async () => {
        createWrapper(qChoiceRadio);
        await submitForm();
        expect(screen.queryByTestId(/validation-summary/)).toBeInTheDocument();
        expect(screen.getAllByText(resources.formRequiredErrorMessage)).toHaveLength(2);
      });
    });
    describe('initial checkbox value', () => {
      it('prefilled values should not cause a validation error on submit', async () => {
        createWrapper(qChoiceCheckbox_prefilled);
        await submitForm();
        expect(screen.queryByTestId(/validation-summary/)).not.toBeInTheDocument();
      });
      it('empty fields should cause a validation error on submit', async () => {
        createWrapper(qChoiceCheckbox);
        await submitForm();
        expect(screen.queryByTestId(/validation-summary/)).toBeInTheDocument();
        expect(screen.getAllByText(resources.formRequiredErrorMessage)).toHaveLength(2);
      });
    });
    describe('initial dropdown value', () => {
      it('prefilled values should not cause a validation error on submit', async () => {
        createWrapper(qChoiceDropdown_prefilled);
        await submitForm();
        expect(screen.queryByTestId(/validation-summary/)).not.toBeInTheDocument();
      });
      it('empty fields should cause a validation error on submit', async () => {
        createWrapper(qChoiceDropdown);
        await submitForm();
        expect(screen.queryByTestId(/validation-summary/)).toBeInTheDocument();
        expect(screen.getAllByText(resources.formRequiredErrorMessage)).toHaveLength(2);
      });
    });
    describe('initial slider value', () => {
      it('prefilled values should not cause a validation error on submit', async () => {
        createWrapper(qChoiceSlider_prefilled);
        await submitForm();
        expect(screen.queryByTestId(/validation-summary/)).not.toBeInTheDocument();
      });
      it('empty fields should cause a validation error on submit', async () => {
        createWrapper(qChoiceSlider);
        await submitForm();
        expect(screen.queryByTestId(/validation-summary/)).toBeInTheDocument();
        expect(screen.getAllByText(resources.formRequiredErrorMessage)).toHaveLength(2);
      });
    });
  });
  describe('Initial open choice value', () => {
    describe('initial Radiobutton value', () => {
      it('prefilled values should not cause a validation error on submit', async () => {
        createWrapper(qOpenChoiceRadio_prefilled);
        await submitForm();
        expect(screen.queryByTestId(/validation-summary/)).not.toBeInTheDocument();
      });
      it('empty fields should cause a validation error on submit', async () => {
        createWrapper(qOpenChoiceRadio);
        await submitForm();
        expect(screen.queryByTestId(/validation-summary/)).toBeInTheDocument();
        expect(screen.getAllByText(resources.formRequiredErrorMessage)).toHaveLength(2);
      });
    });
    describe('initial checkbox value', () => {
      it('prefilled values should not cause a validation error on submit', async () => {
        createWrapper(qOpenChoiceCheckbox_prefilled);
        await submitForm();
        expect(screen.queryByTestId(/validation-summary/)).not.toBeInTheDocument();
      });
      it('empty fields should cause a validation error on submit', async () => {
        createWrapper(qOpenChoiceCheckbox);
        await submitForm();
        expect(screen.queryByTestId(/validation-summary/)).toBeInTheDocument();
        expect(screen.getAllByText(resources.formRequiredErrorMessage)).toHaveLength(2);
      });
    });
    describe('initial dropdown value', () => {
      it('prefilled values should not cause a validation error on submit', async () => {
        createWrapper(qChoiceDropdown_prefilled);
        await submitForm();
        expect(screen.queryByTestId(/validation-summary/)).not.toBeInTheDocument();
      });
      it('empty fields should cause a validation error on submit', async () => {
        createWrapper(qChoiceDropdown);
        await submitForm();
        expect(screen.queryByTestId(/validation-summary/)).toBeInTheDocument();
        expect(screen.getAllByText(resources.formRequiredErrorMessage)).toHaveLength(2);
      });
    });
  });
  describe('Initial string value', () => {
    it('prefilled values should not cause a validation error on submit', async () => {
      createWrapper(qString_prefilled);
      await submitForm();
      expect(screen.queryByTestId(/validation-summary/)).not.toBeInTheDocument();
    });
    it('empty fields should cause a validation error on submit', async () => {
      createWrapper(qString);
      await submitForm();
      expect(screen.queryByTestId(/validation-summary/)).toBeInTheDocument();
      expect(screen.getAllByText(resources.formRequiredErrorMessage)).toHaveLength(2);
    });
  });
  describe('Initial boolean value', () => {
    it('prefilled values should not cause a validation error on submit', async () => {
      createWrapper(qBoolean_prefilled);
      await submitForm();
      expect(screen.queryByTestId(/validation-summary/)).not.toBeInTheDocument();
    });
    it('empty fields should cause a validation error on submit', async () => {
      createWrapper(qBoolean);
      await submitForm();
      expect(screen.queryByTestId(/validation-summary/)).toBeInTheDocument();
      expect(screen.getAllByText(resources.formRequiredErrorMessage)).toHaveLength(2);
    });
  });
  describe('Initial attachment value', () => {
    it('empty fields should cause a validation error on submit', async () => {
      createWrapper(qAttachment);
      await submitForm();
      expect(screen.queryByTestId(/validation-summary/)).toBeInTheDocument();
      expect(screen.getAllByText(resources.formRequiredErrorMessage)).toHaveLength(2);
    });
  });
  describe('Initial quantity value', () => {
    it('prefilled values should not cause a validation error on submit', async () => {
      createWrapper(qQuantity_prefilled);
      await submitForm();
      expect(screen.queryByTestId(/validation-summary/)).not.toBeInTheDocument();
    });
    it('empty fields should cause a validation error on submit', async () => {
      createWrapper(qQuantity);
      await submitForm();
      expect(screen.queryByTestId(/validation-summary/)).toBeInTheDocument();
      expect(screen.getAllByText(resources.formRequiredErrorMessage)).toHaveLength(2);
    });
  });
  describe('Initial text value', () => {
    it('prefilled values should not cause a validation error on submit', async () => {
      createWrapper(qText_prefilled);
      await submitForm();
      expect(screen.queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
    });
    it('empty fields should cause a validation error on submit', async () => {
      createWrapper(qText);
      await submitForm();
      expect(screen.queryByTestId(/validation-summary/)).toBeInTheDocument();
      expect(screen.getAllByText(resources.formRequiredErrorMessage)).toHaveLength(2);
    });
  });
});
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createWrapper = (questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) => {
  return renderRefero({ questionnaire, props: { ...props, resources } });
};
