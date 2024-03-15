import { QuestionnaireItem } from 'fhir/r4';
import { ZodNaN, ZodNumber, ZodOptional, ZodUnion, z } from 'zod';

// import { Resources } from '../types/resources';
// resources?: Resources

import { getDecimalPattern, isRequired } from '../util';
import { getMaxValueExtensionValue, getMinValueExtensionValue, getValidationTextExtension } from '../util/extension';

export const decimalValidation = (item: QuestionnaireItem): ZodNumber | ZodOptional<ZodUnion<[ZodNumber, ZodNaN]>> => {
  const customErrorMessage = getValidationTextExtension(item);
  const required = isRequired(item);
  const decimal = getDecimalPattern(item);
  const max = getMaxValueExtensionValue(item);
  const min = getMinValueExtensionValue(item);

  let schema = z.number({
    required_error: customErrorMessage,
  });
  //TODO: Needs fixing
  if (decimal !== undefined) {
    schema.refine(value => {
      return new RegExp(decimal).test(String(value)) || 'SOMETING IS WRONG';
    });
  }

  if (min !== undefined) {
    schema = schema.min(min, { message: customErrorMessage });
  }

  if (max !== undefined) {
    schema = schema.max(max, { message: customErrorMessage });
  }

  if (!required) {
    return z.union([schema, z.nan()]).optional();
  }

  return schema;
};
