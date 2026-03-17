import { useCallback, useEffect, useRef } from 'react';

import { type FieldError, type FieldValues, type RegisterOptions, useFormContext } from 'react-hook-form';

import type { Resources } from '@/util/resources';
import type { QuestionnaireItem } from 'fhir/r4';

import { getErrorMessage, required, minValue, maxValue } from '@/components/validation/rules';
import { shouldValidate } from '@/components/validation/utils';

export interface UsePluginValidationOptions {
  /** The questionnaire item definition */
  item: QuestionnaireItem;
  /** Unique form field identifier (from PluginComponentProps.idWithLinkIdAndItemIndex) */
  idWithLinkIdAndItemIndex: string;
  /** Whether rendering for PDF output */
  pdf?: boolean;
  /** Localization resources */
  resources?: Resources;
  /** The current answer value to sync into form state for validation */
  value: unknown;
  /**
   * Additional validation rules to merge with the auto-derived ones.
   * These take precedence over the auto-derived rules.
   */
  rules?: RegisterOptions<FieldValues, string>;
}

export interface UsePluginValidationResult {
  /** The current field error, if any */
  error: FieldError | undefined;
  /** The resolved error message string (respects validationText extensions) */
  errorMessage: string | undefined;
  /**
   * Ref callback to attach to the focusable element.
   * Required for validation summary click-to-focus to work.
   *
   * @example
   * ```tsx
   * const { refCallback, errorMessage } = usePluginValidation({ ... });
   * return <input ref={refCallback} />;
   * ```
   */
  refCallback: (element: HTMLElement | null) => void;
}

/**
 * Hook that handles react-hook-form registration and validation for plugin components.
 *
 * Automatically:
 * - Registers the field with react-hook-form (with `required`, `min`, `max` derived from item extensions)
 * - Unregisters on unmount
 * - Syncs the current value into form state for re-validation after submit
 * - Returns the current error and resolved error message
 *
 * @example
 * ```tsx
 * const MyPlugin: FC<PluginComponentProps> = ({ item, answer, idWithLinkIdAndItemIndex, pdf, resources, ...rest }) => {
 *   const currentValue = getFirstAnswer(answer)?.valueInteger;
 *
 *   const { error, errorMessage } = usePluginValidation({
 *     item,
 *     idWithLinkIdAndItemIndex,
 *     pdf,
 *     resources,
 *     value: currentValue,
 *   });
 *
 *   return (
 *     <FormGroup error={errorMessage}>
 *       ...
 *     </FormGroup>
 *   );
 * };
 * ```
 *
 * @example With custom validation rules:
 * ```tsx
 * const { error, errorMessage } = usePluginValidation({
 *   item,
 *   idWithLinkIdAndItemIndex,
 *   pdf,
 *   resources,
 *   value: currentValue,
 *   rules: {
 *     validate: {
 *       isEven: (v) => v % 2 === 0 || 'Must be an even number',
 *     },
 *   },
 * });
 * ```
 */
export const usePluginValidation = ({
  item,
  idWithLinkIdAndItemIndex,
  pdf,
  resources,
  value,
  rules,
}: UsePluginValidationOptions): UsePluginValidationResult => {
  const { register, unregister, setValue, formState, getFieldState } = useFormContext<FieldValues>();
  const fieldState = getFieldState(idWithLinkIdAndItemIndex, formState);
  const { error } = fieldState;

  // Store the ref callback returned by register() so we can forward it to the plugin's element
  const registerRef = useRef<((el: HTMLElement | null) => void) | null>(null);

  // Register field with react-hook-form
  useEffect(() => {
    if (!shouldValidate(item, pdf)) return;

    const baseRules: RegisterOptions<FieldValues, string> = {
      required: required({ item, resources }),
      min: minValue({ item, resources }),
      max: maxValue({ item, resources }),
      shouldUnregister: true,
      ...rules,
    };

    const { ref } = register(idWithLinkIdAndItemIndex, baseRules);
    registerRef.current = ref;

    return (): void => {
      unregister(idWithLinkIdAndItemIndex);
    };
  }, [idWithLinkIdAndItemIndex, item, pdf, register, unregister, resources, rules]);

  // Sync value into form state to trigger re-validation after submission
  useEffect(() => {
    if (shouldValidate(item, pdf)) {
      setValue(idWithLinkIdAndItemIndex, value, { shouldValidate: formState.isSubmitted });
    }
  }, [value, idWithLinkIdAndItemIndex, item, pdf, setValue, formState.isSubmitted]);

  // Ref callback — forwards the plugin's DOM element to react-hook-form's ref
  // so the validation summary can focus it when clicked
  const refCallback = useCallback((element: HTMLElement | null) => {
    registerRef.current?.(element);
  }, []);

  return {
    error,
    errorMessage: getErrorMessage(item, error),
    refCallback,
  };
};
