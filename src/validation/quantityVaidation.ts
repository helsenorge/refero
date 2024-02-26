import { QuestionnaireItem } from 'fhir/r4';
import { z } from 'zod';

import { isRequired } from '../util';
import { getMaxValueExtensionValue, getMinValueExtensionValue, getValidationTextExtension } from '../util/extension';
import { Resources } from '../util/resources';

export const ZodFhirQuantity = z.object({
  value: z.number(),
  unit: z.string().optional(),
  system: z.string().url().optional(),
  code: z.string().optional(),
});

export const quantityValidation = (item: QuestionnaireItem, resources?: Resources): typeof ZodFhirQuantity => {
  let valueSchema = ZodFhirQuantity.shape.value;

  const min = getMinValueExtensionValue(item);
  if (min !== undefined) {
    valueSchema = valueSchema.min(min, { message: resources?.validationNotAllowed });
  }
  const max = getMaxValueExtensionValue(item);
  if (max !== undefined) {
    valueSchema = valueSchema.max(max, { message: getValidationTextExtension(item) });
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

  return ZodFhirQuantity.extend({
    value: valueSchema,
  });
};
