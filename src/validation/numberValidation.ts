import { QuestionnaireItem } from 'fhir/r4';
import { ZodNumber, z } from 'zod';

import { Resources } from '../types/resources';

import { isRequired } from '../util';
import { getMaxValueExtensionValue, getMinValueExtensionValue, getValidationTextExtension } from '../util/extension';

export const numberValidation = (item: QuestionnaireItem, resources?: Resources, allowDecimals?: boolean): ZodNumber => {
  const customErrorMessage = getValidationTextExtension(item);

  let schema = z.number({
    required_error: customErrorMessage ?? resources?.validationNotAllowed,
  });

  if (!allowDecimals) {
    schema = schema.int();
  }

  const min = getMinValueExtensionValue(item);
  if (min !== undefined) {
    schema = schema.min(min, { message: getValidationTextExtension(item) });
  }
  const max = getMaxValueExtensionValue(item);
  if (max !== undefined) {
    schema = schema.max(max, { message: customErrorMessage });
  }
  const required = isRequired(item);
  if (!required) {
    //getRequiredErrorMessage(item)
    schema.optional();
  }

  return schema;
};
