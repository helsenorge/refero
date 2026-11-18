import type { ClearAction } from '@/actions/newValue';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

import { runEnableWhenNew } from '@/calculators/runEnableWhen_new';
import { reportFhirPathError } from '@/util/fhirpathErrors';
import { FhirPathExtensions, type AnswerPad, type ItemCopy } from '@/util/FhirPathExtensions';
import {
  resolveFhirPathCalculationOptions,
  type FhirPathCalculationOptions,
  type ResolvedFhirPathCalculationOptions,
} from '@/util/fhirPathOptions';

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
  const passes = Math.max(1, maxIterations);

  // One pass beyond the limit, so a chain exactly `passes` levels deep is seen to settle.
  for (let iteration = 0; iteration <= passes; iteration++) {
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
      `FHIRPath expressions did not settle within ${passes} passes. This usually means two calculated items depend on each other.`
    ),
  });
  return current;
}

/**
 * answerPad holds one answer list per linkId, written to every occurrence of it. itemCopies holds the
 * occurrences produced by item copies, which differ per occurrence and replace the existing ones.
 */
export interface CalculatorResult {
  answerPad: AnswerPad;
  itemCopies: ItemCopy[];
}

/** One calculation with the given engine. */
export function calculateWithEngine(
  engine: FhirPathExtensions,
  questionnaireResponse: QuestionnaireResponse,
  options: ResolvedFhirPathCalculationOptions
): CalculatorResult {
  const updated = options.resolveExpressionChains
    ? evaluateUntilStable(engine, questionnaireResponse, options.maxChainIterations)
    : engine.evaluateAllExpressions(questionnaireResponse);
  return { answerPad: engine.calculateFhirScore(updated), itemCopies: engine.collectItemCopies(updated) };
}

/**
 * Engines are kept between calculations: building one walks the questionnaire, and an engine remembers results
 * it can reuse on the next change. A few are kept so that forms shown side by side do not keep evicting each
 * other.
 */
const MAX_CACHED_ENGINES = 4;
const cachedEngines: Array<{ questionnaireKey: unknown; optionsKey: string; engine: FhirPathExtensions }> = [];

const questionnaireKeys = new WeakMap<Questionnaire, number>();
let nextQuestionnaireKey = 1;

/**
 * A stable key for a questionnaire object. The worker receives a new copy of the questionnaire with every
 * message, so the main thread sends this key along to let the worker keep the engine.
 */
export function getQuestionnaireKey(questionnaire: Questionnaire): number {
  let key = questionnaireKeys.get(questionnaire);
  if (key === undefined) {
    key = nextQuestionnaireKey++;
    questionnaireKeys.set(questionnaire, key);
  }
  return key;
}

function getEngine(
  questionnaire: Questionnaire,
  options: ResolvedFhirPathCalculationOptions,
  questionnaireKey?: number
): FhirPathExtensions {
  // Without a key the questionnaire object itself is the key, which is stable on the main thread.
  const key: unknown = questionnaireKey ?? questionnaire;
  const optionsKey = JSON.stringify(options);
  const index = cachedEngines.findIndex(cached => cached.questionnaireKey === key && cached.optionsKey === optionsKey);
  if (index >= 0) {
    const [cached] = cachedEngines.splice(index, 1);
    cachedEngines.unshift(cached);
    return cached.engine;
  }
  const engine = new FhirPathExtensions(questionnaire, options);
  cachedEngines.unshift({ questionnaireKey: key, optionsKey, engine });
  cachedEngines.length = Math.min(cachedEngines.length, MAX_CACHED_ENGINES);
  return engine;
}

export function runCalculators(args: {
  questionnaireResponse: QuestionnaireResponse;
  questionnaire: Questionnaire;
  options?: FhirPathCalculationOptions;
  /** From getQuestionnaireKey on the main thread; lets the worker keep the engine between messages. */
  questionnaireKey?: number;
}): CalculatorResult {
  const options = resolveFhirPathCalculationOptions(args.options);
  return calculateWithEngine(getEngine(args.questionnaire, options, args.questionnaireKey), args.questionnaireResponse, options);
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
