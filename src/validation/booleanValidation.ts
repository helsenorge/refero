import { QuestionnaireItem } from 'fhir/r4';
import { ZodBoolean, ZodDefault, z } from 'zod';

import { Resources } from '../types/resources';

export const booleanValidation = (item: QuestionnaireItem, resources?: Resources): z.ZodEffects<ZodBoolean, boolean, boolean> => {
  const schema = z.boolean().refine(value => value === true || value === false, {
    message: 'Må være satt til true eller false', // Custom error message if the value is neither true nor false
  });

  return schema;
};
