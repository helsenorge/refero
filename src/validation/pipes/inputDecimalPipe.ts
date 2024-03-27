import { QuestionnaireItem } from 'fhir/r4';
import { z } from 'zod';

import { getDecimalPattern, isRequired } from '../../util';

export const zodDecimalPipe = (zodPipe: z.ZodNumber, item: QuestionnaireItem) => {
  const decimal = getDecimalPattern(item);
  const schema = z.coerce
    .string()
    .refine(
      val => {
        if (decimal) {
          console.log(val, decimal);
          return new RegExp(decimal).test(val) || 'Feil antall på dismaler.';
        }
      },
      () => ({ message: 'Feil antall på dismaler.' })
    )
    .transform(val => {
      return Number(val);
    })
    .pipe(zodPipe);
  return schema;
};