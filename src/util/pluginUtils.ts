import type { QuestionnaireResponseItemAnswer } from 'fhir/r4';

/**
 * Normalizes the answer value from a QuestionnaireResponseItem into a consistent array format.
 *
 * The answer prop in PluginComponentProps can be:
 * - `undefined` — no answer yet
 * - A single `QuestionnaireResponseItemAnswer` — single-valued item
 * - An array of `QuestionnaireResponseItemAnswer[]` — multi-valued item (e.g., repeating choice)
 *
 * This utility always returns an array (empty if no answer), making it easier for plugins
 * to handle all cases uniformly.
 *
 * @example
 * ```tsx
 * const answers = normalizeAnswer(answer);
 * const firstValue = answers[0]?.valueInteger;
 * const allCodings = answers.map(a => a.valueCoding).filter(Boolean);
 * ```
 */
export function normalizeAnswer(
  answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[] | undefined
): QuestionnaireResponseItemAnswer[] {
  if (!answer) return [];
  if (Array.isArray(answer)) return answer;
  return [answer];
}

/**
 * Gets the first answer from a possibly-array answer value.
 * Returns undefined if no answer exists.
 *
 * @example
 * ```tsx
 * const first = getFirstAnswer(answer);
 * const value = first?.valueInteger ?? 0;
 * ```
 */
export function getFirstAnswer(
  answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[] | undefined
): QuestionnaireResponseItemAnswer | undefined {
  if (!answer) return undefined;
  if (Array.isArray(answer)) return answer[0];
  return answer;
}
