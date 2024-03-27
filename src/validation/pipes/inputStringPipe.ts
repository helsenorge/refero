import { z } from 'zod';

export const zodInputStringPipe = (
  zodPipe: z.ZodNumber
): z.ZodPipeline<
  z.ZodEffects<
    z.ZodEffects<z.ZodNullable<z.ZodEffects<z.ZodString, string | null, string>>, string | null, string | null>,
    number,
    string | null
  >,
  z.ZodNumber
> =>
  z
    .string()
    .transform(value => (value === '' ? null : value))
    .nullable()
    .refine(value => value === null || !isNaN(Number(value)), {
      message: 'Invalid number format. Please use a valid number.',
    })
    .transform(value => (value === null ? 0 : Number(value)))
    .pipe(zodPipe);
