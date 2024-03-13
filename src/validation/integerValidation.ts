import { QuestionnaireItem } from 'fhir/r4';
import { ZodNaN, ZodNumber, ZodOptional, ZodUnion, z } from 'zod';

import { Resources } from '../types/resources';

import { isRequired } from '../util';
import { getMaxValueExtensionValue, getMinValueExtensionValue, getValidationTextExtension } from '../util/extension';

export const integerValidation = (
  item: QuestionnaireItem,
  resources?: Resources
): ZodNumber | ZodOptional<ZodUnion<[ZodNumber, ZodNaN]>> => {
  const customErrorMessage = getValidationTextExtension(item);
  const required = isRequired(item);
  const max = getMaxValueExtensionValue(item);
  const min = getMinValueExtensionValue(item);

  let schema = z
    .number({
      required_error: customErrorMessage,
    })
    .int();

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
