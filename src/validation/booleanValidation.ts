import { QuestionnaireItem } from 'fhir/r4';
import { ZodBoolean, z } from 'zod';

import { isRequired } from '../util';
import { getValidationTextExtension } from '../util/extension';
import { Resources } from '../util/resources';

export const booleanValidation = (item: QuestionnaireItem, resources?: Resources): ZodBoolean => {
  const customErrorMessage = getValidationTextExtension(item);
  const schema = z.boolean({
    required_error: customErrorMessage ?? resources?.validationNotAllowed,
  });

  const required = isRequired(item);
  if (!required) {
    schema.optional();
  }

  return schema;
};
