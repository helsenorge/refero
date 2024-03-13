import { QuestionnaireItem } from 'fhir/r4';
import { ZodString, z } from 'zod';

import { Resources } from '../types/resources';

import { getMaxLength, isRequired } from '../util';
import { getMinLengthExtensionValue, getRegexExtension, getValidationTextExtension } from '../util/extension';

export const textValidation = (item: QuestionnaireItem, resources?: Resources): ZodString => {
  let schema = z.string();

  const min = getMinLengthExtensionValue(item);
  if (min !== undefined) {
    schema = schema.min(min, { message: resources?.validationNotAllowed });
  } else {
    schema = schema.min(1, { message: resources?.formRequiredErrorMessage });
  }
  const max = getMaxLength(item);
  if (max !== undefined) {
    schema = schema.max(max, { message: resources?.stringOverMaxLengthError });
  }
  const required = isRequired(item);
  if (!required) {
    schema.optional();
  }

  const regex = getRegexExtension(item);
  const customErrorMessage = getValidationTextExtension(item);
  if (regex) {
    schema = schema.regex(new RegExp(regex), { message: customErrorMessage ?? resources?.validationNotAllowed });
  }

  return schema;
};
