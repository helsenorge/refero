import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

import { FhirPathExtensions, type AnswerPad } from '@/util/FhirPathExtensions';

export function runCalculators(args: { questionnaireResponse: QuestionnaireResponse; questionnaire: Questionnaire }): AnswerPad {
  const engine = new FhirPathExtensions(args.questionnaire);
  const updated = engine.evaluateAllExpressions(args.questionnaireResponse);
  return engine.calculateFhirScore(updated);
}
