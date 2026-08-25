/**
 * Behaviour switches for the FHIRPath calculators.
 *
 * Refero has a handful of calculation quirks that are wrong by the letter of
 * the specification, but that questionnaires in production have been built
 * around. Every option therefore defaults to the behaviour refero has always
 * had, and the corrected behaviour is opt in, so both can run side by side
 * while forms are migrated one at a time.
 *
 * Options can be set in three places, each overriding the previous one:
 *   1. setFhirPathCalculationOptions() - application wide default
 *   2. runFhirPathQrUpdater({ fhirPathOptions }) - per form update
 *   3. new FhirPathExtensions(questionnaire, options) - per engine instance
 */
export interface FhirPathCalculationOptions {
  /**
   * Legacy (false): a decimal expression that evaluates to the number 0
   * produces an answer without a value, so a legitimate zero cannot be told
   * apart from "not calculated". Only the number is dropped - the string '0'
   * has always produced 0.
   *
   * true: 0 is kept as a calculated value.
   *
   * Integer answers are unaffected; they have always kept 0.
   */
  keepZeroValues?: boolean;

  /**
   * Legacy (false): an integer expression whose result cannot be converted to a
   * finite number produces the answer 0, and a decimal one produces NaN, so a
   * mistyped expression looks like a real answer.
   *
   * true: no answer is produced at all, which makes the failure visible in the
   * form instead of hiding it behind a plausible zero.
   *
   * Values that do convert to a finite number are untouched in both modes, so a
   * boolean still becomes 0 or 1 the way it always has.
   */
  omitNonNumericResults?: boolean;

  /**
   * Which expression wins when an item carries both cqf-expression (copy) and
   * sdf-calculatedExpression.
   *
   * 'legacy': the two code paths disagree - calculateFhirScore prefers the
   * calculated expression while evaluateAllExpressions prefers the copy - so
   * the result depends on which path produced it.
   *
   * 'copy-first' / 'calculated-first': the same rule in both paths.
   * 'copy-first' matches how the initial QuestionnaireResponse is generated.
   */
  expressionPriority?: 'legacy' | 'copy-first' | 'calculated-first';

  /**
   * Legacy (false): expressions are evaluated in a single pass, so a chain
   * where one calculated item reads another calculated item needs one form
   * update per level before it settles.
   *
   * true: expressions are re-evaluated until the QuestionnaireResponse stops
   * changing, bounded by maxChainIterations.
   */
  resolveExpressionChains?: boolean;

  /**
   * Upper bound on the number of passes made when resolveExpressionChains is
   * on. Reaching it means the expressions never settled - usually two items
   * depending on each other - and is reported through the FHIRPath error
   * handler. Defaults to 10.
   */
  maxChainIterations?: number;
}

export type ResolvedFhirPathCalculationOptions = Required<FhirPathCalculationOptions>;

/**
 * How refero behaved before the options existed. This is the default, so an
 * application that sets nothing keeps its current answers to the letter.
 */
export const LEGACY_FHIRPATH_CALCULATION_OPTIONS: ResolvedFhirPathCalculationOptions = {
  keepZeroValues: false,
  omitNonNumericResults: false,
  expressionPriority: 'legacy',
  resolveExpressionChains: false,
  maxChainIterations: 10,
};

let applicationOptions: FhirPathCalculationOptions = {};

/**
 * Sets the application wide defaults. Pass undefined to go back to the legacy
 * behaviour.
 *
 * The fhirpath web worker runs in its own module scope, so this value is
 * resolved on the main thread and sent along with the work rather than read
 * inside the worker.
 */
export function setFhirPathCalculationOptions(options?: FhirPathCalculationOptions): void {
  applicationOptions = options ? { ...options } : {};
}

export function getFhirPathCalculationOptions(): FhirPathCalculationOptions {
  return { ...applicationOptions };
}

function definedOnly(options: FhirPathCalculationOptions): FhirPathCalculationOptions {
  return Object.fromEntries(Object.entries(options).filter(([, value]) => value !== undefined)) as FhirPathCalculationOptions;
}

/**
 * Merges the legacy defaults, the application wide options and the options
 * given for this piece of work into a complete set of values. Keys that are
 * explicitly undefined do not override, so a partially filled object only
 * changes what it names.
 */
export function resolveFhirPathCalculationOptions(options?: FhirPathCalculationOptions): ResolvedFhirPathCalculationOptions {
  return {
    ...LEGACY_FHIRPATH_CALCULATION_OPTIONS,
    ...definedOnly(applicationOptions),
    ...definedOnly(options ?? {}),
  };
}
