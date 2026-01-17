import type { AppDispatch, GlobalState } from '@/reducers';
import type { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';

import {
  newBooleanValueAsync,
  newCodingValueAsync,
  newDateTimeValueAsync,
  newDateValueAsync,
  newDecimalValueAsync,
  newIntegerValueAsync,
  newQuantityValueAsync,
  newStringValueAsync,
  newTimeValueAsync,
  toggleCodingValueAsync,
} from '@/actions/newValue';
import { type Path, getCodingCodes } from '@/util/refero-core';

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
 * Dispatches the appropriate async action based on the answer value type.
 * Uses the same async action pattern as existing components (Integer, Choice, etc.)
 * Returns a Promise<GlobalState> that can be chained with onAnswerChange.
 *
 * @param dispatch - Redux dispatch function
 * @param path - Path to the item in the questionnaire response
 * @param item - The questionnaire item definition
 * @param answer - The new answer value
 * @param multipleAnswers - Whether this item supports multiple answers (for coding values)
 * @returns Promise<GlobalState> or undefined if no action was dispatched
 */
export function dispatchAnswerValueAsync(
  dispatch: AppDispatch,
  path: Path[],
  item: QuestionnaireItem,
  answer: QuestionnaireResponseItemAnswer,
  multipleAnswers?: boolean
): Promise<GlobalState> | undefined {
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
      // Unsupported types are silently ignored
      return undefined;
  }
}

/**
 * Creates a value change handler function that can be passed to plugin components.
 * Uses the same async action pattern as existing components (Integer, Choice, etc.)
 * and chains with onAnswerChange to trigger calculators and enable-when logic.
 *
 * @param dispatch - Redux dispatch function
 * @param path - Path to the item in the questionnaire response
 * @param item - The questionnaire item definition
 * @param onAnswerChange - Callback from useOnAnswerChange hook
 * @param promptLoginMessage - Optional callback to prompt for login
 * @param currentAnswer - Current answer(s) for determining toggle behavior
 * @returns A function that plugins can call with a new answer value
 */
export function createPluginValueChangeHandler(
  dispatch: AppDispatch,
  path: Path[],
  item: QuestionnaireItem,
  onAnswerChange: (state: GlobalState, item: QuestionnaireItem, answer?: QuestionnaireResponseItemAnswer) => void,
  promptLoginMessage?: () => void,
  currentAnswer?: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]
): (answer: QuestionnaireResponseItemAnswer) => void {
  return (answer: QuestionnaireResponseItemAnswer): void => {
    // For choice items, check if the item supports multiple answers (repeats: true)
    const multipleAnswers = item.repeats === true;

    // For coding values with multiple answers, implement toggle behavior
    // Same pattern as handleCheckboxChange in choice.tsx
    if (answer.valueCoding && multipleAnswers && currentAnswer) {
      const coding = answer.valueCoding;
      const currentCodes = getCodingCodes(currentAnswer);
      const isSelected = coding.code ? currentCodes.includes(coding.code) : false;

      // Use toggleCodingValueAsync - same as choice.tsx
      dispatch(toggleCodingValueAsync(path, coding, item, isSelected))?.then(newState => {
        onAnswerChange(newState, item, answer);
      });
    } else {
      // Standard behavior for non-toggle cases
      dispatchAnswerValueAsync(dispatch, path, item, answer, multipleAnswers)?.then(newState => {
        onAnswerChange(newState, item, answer);
      });
    }

    promptLoginMessage?.();
  };
}
