import { QuestionnaireItem } from 'fhir/r4';
import { ZodNumber, z } from 'zod';

import { Resources } from '../types/resources';

import { isRequired } from '../util';
import { getMaxValueExtensionValue, getMinValueExtensionValue, getValidationTextExtension } from '../util/extension';

export const ZodFhirQuantity = z.object({
  value: z.number(),
  unit: z.string().optional(),
  system: z.string().url().optional(),
  code: z.string().optional(),
});

export const quantityValidation = (item: QuestionnaireItem, resources?: Resources): ZodNumber => {
  let valueSchema = ZodFhirQuantity.shape.value;

  const min = getMinValueExtensionValue(item);
  if (min !== undefined) {
    valueSchema = valueSchema.min(min, { message: resources?.stringOverMaxLengthError });
  }
  const max = getMaxValueExtensionValue(item);
  if (max !== undefined) {
    valueSchema = valueSchema.max(max, { message: resources?.maxLengthText });
  }
  const required = isRequired(item);
  if (!required) {
    //getRequiredErrorMessage(item)
    valueSchema.optional();
  }
  // const regex = getDecimalPattern(item);
  // const customErrorMessage = getValidationTextExtension(item);
  // if (regex) {
  //   valueSchema = valueSchema.regex(new RegExp(regex), { message: customErrorMessage ?? resources?.validationNotAllowed });
  // }

  return valueSchema;
};
