import { QuestionnaireItem } from 'fhir/r4';
import { ZodBoolean, ZodLiteral, z } from 'zod';

import { Resources } from '../types/resources';

import { isRequired } from '../util';
import { getValidationTextExtension } from '../util/extension';

const getRequiredErrorMessage = (item: QuestionnaireItem, resources?: Resources): string | undefined => {
  return isRequired(item) ? resources?.formRequiredErrorMessage : undefined;
};
export const booleanValidation = (item: QuestionnaireItem, resources?: Resources): ZodLiteral<boolean> => {
  const customErrorMessage = getValidationTextExtension(item);
  const schema = z.literal(true, {
    required_error: customErrorMessage ?? getRequiredErrorMessage(item, resources),
  });

  const required = isRequired(item);
  if (!required) {
    schema.optional();
  }
  return schema;
};
