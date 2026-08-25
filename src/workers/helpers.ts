import type { ClearAction } from '@/actions/newValue';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

import { runEnableWhenNew } from '@/calculators/runEnableWhen_new';
import { reportFhirPathError } from '@/util/fhirpathErrors';
import { FhirPathExtensions, type AnswerPad } from '@/util/FhirPathExtensions';
import { resolveFhirPathCalculationOptions, type FhirPathCalculationOptions } from '@/util/fhirPathOptions';

/**
 * Re-evaluates the expressions until the response stops changing, so a chain
 * where one calculated item reads another settles within a single update
 * instead of needing one update per level.
 *
 * Reaching maxIterations means the expressions never settled - two items
 * depending on each other, most likely - and is reported rather than silently
 * handing back a half resolved response.
 */
function evaluateUntilStable(
  engine: FhirPathExtensions,
  questionnaireResponse: QuestionnaireResponse,
  maxIterations: number
): QuestionnaireResponse {
  let current = questionnaireResponse;
  let serialized = JSON.stringify(current);

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    const next = engine.evaluateAllExpressions(current);
    const nextSerialized = JSON.stringify(next);
    if (nextSerialized === serialized) {
      return current;
    }
    current = next;
    serialized = nextSerialized;
  }

  reportFhirPathError({
    source: 'runCalculators',
    error: new Error(
      `FHIRPath expressions did not settle within ${maxIterations} passes. This usually means two calculated items depend on each other.`
    ),
  });
  return current;
}

export function runCalculators(args: {
  questionnaireResponse: QuestionnaireResponse;
  questionnaire: Questionnaire;
  options?: FhirPathCalculationOptions;
}): AnswerPad {
  const options = resolveFhirPathCalculationOptions(args.options);
  const engine = new FhirPathExtensions(args.questionnaire, options);
  const updated = options.resolveExpressionChains
    ? evaluateUntilStable(engine, args.questionnaireResponse, options.maxChainIterations)
    : engine.evaluateAllExpressions(args.questionnaireResponse);
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
