import { QuestionnaireItem } from 'fhir/r4';
import { ZodNumber, z } from 'zod';

import { getDecimalPattern, isRequired } from '../../util';
import { getMaxValueExtensionValue, getMinValueExtensionValue } from '../../util/extension';
import { Resources } from '../../util/resources';

export const ZodFhirQuantity = z.object({
  value: z.number(),
  unit: z.string().optional(),
  system: z.string().url().optional(),
  code: z.string().optional(),
});

export const quantityValidation = (item: QuestionnaireItem, resources?: Resources): ZodNumber => {
  let schema = ZodFhirQuantity.shape.value;
  const decimal = getDecimalPattern(item);

  //TODO: Needs fixing
  if (decimal !== undefined) {
    schema.refine(value => {
      return new RegExp(decimal).test(String(value)) || 'SOMETING IS WRONG';
    });
  }
  const min = getMinValueExtensionValue(item);
  if (min !== undefined) {
    schema = schema.min(min, { message: resources?.stringOverMaxLengthError });
  }
  const max = getMaxValueExtensionValue(item);
  if (max !== undefined) {
    schema = schema.max(max, { message: resources?.maxLengthText });
  }
  const required = isRequired(item);
  if (!required) {
    schema.optional();
  }

  return schema;
};
