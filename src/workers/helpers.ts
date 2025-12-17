import type { ClearAction } from '@/actions/newValue';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

import { runEnableWhenNew } from '@/calculators/runEnableWhen_new';
import { FhirPathExtensions, type AnswerPad } from '@/util/FhirPathExtensions';

export function runCalculators(args: { questionnaireResponse: QuestionnaireResponse; questionnaire: Questionnaire }): AnswerPad {
  const engine = new FhirPathExtensions(args.questionnaire);
  const updated = engine.evaluateAllExpressions(args.questionnaireResponse);
  return engine.calculateFhirScore(updated);
}
export function runEnableWhen({
  questionnaireResponse,
  questionnaire,
}: {
  questionnaireResponse: QuestionnaireResponse | null | undefined;
  questionnaire: Questionnaire | null | undefined;
}): ClearAction[] {
  return runEnableWhenNew({ questionnaire, questionnaireResponse });
}
