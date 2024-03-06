import { Questionnaire, QuestionnaireItem } from 'fhir/r4';
import { z } from 'zod';

import { createChoiceSchema } from './choiceValidation';
import { OPEN_CHOICE_ID } from '../constants';
import { OPEN_CHOICE_SYSTEM } from '../constants/codingsystems';

export function createOpenChoiceSchema(item: QuestionnaireItem, questionnaire: Questionnaire): z.ZodTypeAny {
  const predefinedOptionsSchema = createChoiceSchema(item, questionnaire) || z.any();

  const openChoiceSchema = z.object({
    system: z.literal(OPEN_CHOICE_SYSTEM),
    code: z.literal(OPEN_CHOICE_ID),
    display: z.string(),
  });

  return z.union([predefinedOptionsSchema, openChoiceSchema]).optional();
}
