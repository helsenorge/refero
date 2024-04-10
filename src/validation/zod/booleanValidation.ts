import { QuestionnaireItem } from 'fhir/r4';
import { z } from 'zod';

import { isRequired } from '../../util';

// import { Resources } from '../types/resources';

//, resources?: Resources
export const booleanValidation = (item: QuestionnaireItem): z.ZodType<boolean> => {
  const schema = z.boolean().transform(value => {
    if (typeof value === 'string') {
      const lowerCaseValue = (value as string | undefined)?.toLowerCase();
      if (lowerCaseValue === 'true') return true;
      if (lowerCaseValue === 'false') return false;
    }
    return value;
  });

  if (!!isRequired(item)) {
    return schema.refine(value => value === true, {
      message: 'Dette feltet må være huket av.',
    }) as z.ZodType<boolean>;
  }

  return schema as z.ZodType<boolean>;
};
