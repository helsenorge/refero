import { QuestionnaireItem } from 'fhir/r4';
import { ZodString, z } from 'zod';

import { Resources } from '../types/resources';

import { getMaxLength, isRequired } from '../util';
import { getMinLengthExtensionValue, getRegexExtension, getValidationTextExtension } from '../util/extension';

export const stringValidation = (item: QuestionnaireItem, resources?: Resources): ZodString => {
  const customErrorMessage = getValidationTextExtension(item);
  let schema = z.string({
    required_error: resources?.formRequiredErrorMessage,
  });

  const min = getMinLengthExtensionValue(item);
  if (min !== undefined) {
    schema = schema.min(min, { message: `Du må minst skrive ${min} tegn.` });
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
  if (regex) {
    schema = schema.regex(new RegExp(regex), { message: customErrorMessage ?? resources?.validationNotAllowed });
  }

  return schema;
};
