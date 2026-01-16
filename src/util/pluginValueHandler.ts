import type { AppDispatch, GlobalState } from '@/reducers';
import type { Path } from '@/util/refero-core';
import type { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';

import {
  newAnswerValueAction,
  newBooleanValueAsync,
  newCodingValueAsync,
  newDateTimeValueAsync,
  newDateValueAsync,
  newDecimalValueAsync,
  newIntegerValueAsync,
  newQuantityValueAsync,
  newStringValueAsync,
  newTimeValueAsync,
  removeCodingValueAsync,
} from '@/actions/newValue';

/**
 * Determines the answer value type from a QuestionnaireResponseItemAnswer.
 * Returns the key of the value property (e.g., 'valueString', 'valueInteger', etc.)
 */
export function getAnswerValueType(answer: QuestionnaireResponseItemAnswer): keyof QuestionnaireResponseItemAnswer | undefined {
  const valueKeys: (keyof QuestionnaireResponseItemAnswer)[] = [
    'valueBoolean',
    'valueDecimal',
    'valueInteger',
    'valueDate',
    'valueDateTime',
    'valueTime',
    'valueString',
    'valueCoding',
    'valueQuantity',
    'valueAttachment',
    'valueReference',
    'valueUri',
  ];

  for (const key of valueKeys) {
    if (answer[key] !== undefined) {
      return key;
    }
  }
  return undefined;
}

/**
 * Dispatches the appropriate action based on the answer value type.
 * This provides a unified interface for plugins to update values without
 * needing to know which specific action to call.
 *
 * @param dispatch - Redux dispatch function
 * @param path - Path to the item in the questionnaire response
 * @param item - The questionnaire item definition
 * @param answer - The new answer value
 * @param multipleAnswers - Whether this item supports multiple answers (for coding values)
 * @returns Promise resolving to the updated global state
 */
export async function dispatchAnswerValue(
  dispatch: AppDispatch,
  path: Path[],
  item: QuestionnaireItem,
  answer: QuestionnaireResponseItemAnswer,
  multipleAnswers?: boolean
): Promise<GlobalState> {
  const valueType = getAnswerValueType(answer);

  switch (valueType) {
    case 'valueBoolean':
      return dispatch(newBooleanValueAsync(path, answer.valueBoolean!, item));

    case 'valueInteger':
      return dispatch(newIntegerValueAsync(path, answer.valueInteger!, item));

    case 'valueDecimal':
      return dispatch(newDecimalValueAsync(path, answer.valueDecimal!, item));

    case 'valueString':
      return dispatch(newStringValueAsync(path, answer.valueString!, item));

    case 'valueDate':
      return dispatch(newDateValueAsync(path, answer.valueDate!, item));

    case 'valueDateTime':
      return dispatch(newDateTimeValueAsync(path, answer.valueDateTime!, item));

    case 'valueTime':
      return dispatch(newTimeValueAsync(path, answer.valueTime!, item));

    case 'valueCoding':
      return dispatch(newCodingValueAsync(path, answer.valueCoding!, item, multipleAnswers));

    case 'valueQuantity':
      return dispatch(newQuantityValueAsync(path, answer.valueQuantity!, item));

    default:
      // For complex or unsupported types, use the generic answer action
      return dispatch(async (dispatchFn: AppDispatch, getState: () => GlobalState): Promise<GlobalState> => {
        dispatchFn(newAnswerValueAction({ itemPath: path, item, newAnswer: [answer] }));
        return getState();
      });
  }
}

/**
 * Creates a value change handler function that can be passed to plugin components.
 * This abstracts away the Redux dispatch and path details from the plugin.
 *
 * @param dispatch - Redux dispatch function
 * @param path - Path to the item in the questionnaire response
 * @param item - The questionnaire item definition
 * @param onAnswerChange - Optional callback to notify about answer changes
 * @param promptLoginMessage - Optional callback to prompt for login
 * @param currentAnswer - Current answer(s) for determining toggle behavior
 * @returns A function that plugins can call with a new answer value
 */
export function createPluginValueChangeHandler(
  dispatch: AppDispatch,
  path: Path[],
  item: QuestionnaireItem,
  onAnswerChange?: (newState: GlobalState, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void,
  promptLoginMessage?: () => void,
  currentAnswer?: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]
): (answer: QuestionnaireResponseItemAnswer) => void {
  return (answer: QuestionnaireResponseItemAnswer): void => {
    // For choice items, check if the item supports multiple answers (repeats: true)
    const multipleAnswers = item.repeats === true;

    // For coding values with multiple answers, implement toggle behavior
    if (answer.valueCoding && multipleAnswers && currentAnswer) {
      const coding = answer.valueCoding;
      // Extract codes from current answers (same pattern as choice.tsx getAnswerValue)
      const currentCodes = extractCodesFromAnswer(currentAnswer);
      const isSelected = coding.code ? currentCodes.includes(coding.code) : false;

      if (isSelected) {
        // Remove the coding if already selected
        dispatch(removeCodingValueAsync(path, coding, item)).then(newState => {
          onAnswerChange?.(newState, item, answer);
        });
      } else {
        // Add the coding if not selected
        dispatch(newCodingValueAsync(path, coding, item, true)).then(newState => {
          onAnswerChange?.(newState, item, answer);
        });
      }
    } else {
      // Standard behavior for non-toggle cases
      dispatchAnswerValue(dispatch, path, item, answer, multipleAnswers).then(newState => {
        onAnswerChange?.(newState, item, answer);
      });
    }

    promptLoginMessage?.();
  };
}

/**
 * Extracts coding codes from an answer or array of answers.
 * Follows the same pattern as getAnswerValue in choice.tsx.
 */
function extractCodesFromAnswer(answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]): string[] {
  const answers = Array.isArray(answer) ? answer : [answer];
  return answers.map(a => a.valueCoding?.code).filter((code): code is string => !!code);
}
