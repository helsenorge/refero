import { useEffect, type FC } from 'react';

import { type FieldValues, type RegisterOptions, useFormContext } from 'react-hook-form';

import type { PluginComponentProps } from '../../src/types/componentPlugin';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';

import { newIntegerValueAsync } from '../../src/actions/newValue';
import { getErrorMessage, maxValue, minValue, required } from '../../src/components/validation/rules';
import { shouldValidate } from '../../src/components/validation/utils';
import { ReferoLabel } from '../../src/index';
import { getMinValueExtensionValue, getMaxValueExtensionValue } from '../../src/util/extension';

/**
 * Example custom slider plugin component.
 * This demonstrates how to create a plugin for integer fields with itemControl "slider".
 *
 * The plugin handles its own:
 * - Label rendering (using ReferoLabel from refero)
 * - Validation registration with react-hook-form
 * - Value changes using dispatch and onAnswerChange
 * - Error display
 */
export const CustomSliderPlugin: FC<PluginComponentProps> = ({
  item,
  answer,
  dispatch,
  onAnswerChange,
  error,
  readOnly,
  pdf,
  id,
  idWithLinkIdAndItemIndex,
  path,
  resources,
  promptLoginMessage,
  children,
}) => {
  // Get form context for validation registration
  const { register, unregister, setValue, formState } = useFormContext<FieldValues>();

  // Get the current value from the answer
  const currentValue = Array.isArray(answer) ? answer[0]?.valueInteger : answer?.valueInteger;
  const displayValue = currentValue ?? 0;

  // Get min/max from extensions or use defaults
  const minVal = getMinValueExtensionValue(item) ?? 0;
  const maxVal = getMaxValueExtensionValue(item) ?? 100;

  // Register with react-hook-form using standard validation rules
  useEffect(() => {
    if (shouldValidate(item, pdf)) {
      const validationRules: RegisterOptions<FieldValues, string> = {
        required: required({ item, resources }),
        min: minValue({ item, resources }),
        max: maxValue({ item, resources }),
        shouldUnregister: true,
      };
      register(idWithLinkIdAndItemIndex, validationRules);
    }
    return (): void => {
      unregister(idWithLinkIdAndItemIndex);
    };
  }, [idWithLinkIdAndItemIndex, item, pdf, register, unregister, resources]);

  // Update form value when answer changes to trigger re-validation
  useEffect(() => {
    if (shouldValidate(item, pdf)) {
      setValue(idWithLinkIdAndItemIndex, currentValue, { shouldValidate: formState.isSubmitted });
    }
  }, [currentValue, idWithLinkIdAndItemIndex, item, pdf, setValue, formState.isSubmitted]);

  // Handle value change - same pattern as built-in Integer component
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = parseInt(event.target.value, 10);

    // Dispatch the action and call onAnswerChange with the result
    dispatch(newIntegerValueAsync(path, newValue, item))?.then(newState => onAnswerChange(newState, item, { valueInteger: newValue }));

    // Prompt login if needed
    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  // Get error message for display
  const errorMessage = getErrorMessage(item, error);

  // Render read-only version for PDF or read-only mode
  if (pdf || readOnly) {
    return (
      <div className="custom-slider-plugin custom-slider-plugin--readonly">
        <span className="custom-slider-plugin__value">{displayValue}</span>
      </div>
    );
  }

  return (
    <FormGroup error={errorMessage} onColor="ongrey">
      {/* Use ReferoLabel for standard label styling, or create your own */}
      <ReferoLabel
        item={item}
        resources={resources}
        htmlFor={id}
        labelId={`${id}-label`}
        testId={`${id}-label`}
        formFieldTagId={`${id}-formfieldtag`}
      />

      <div className="custom-slider-plugin">
        <div className="custom-slider-plugin__container">
          <input
            type="range"
            id={id}
            name={id}
            min={minVal}
            max={maxVal}
            value={displayValue}
            onChange={handleChange}
            className="custom-slider-plugin__input"
            aria-describedby={error ? `${id}-error` : undefined}
            aria-invalid={!!error}
          />
          <span className="custom-slider-plugin__value-display">{displayValue}</span>
        </div>
        {error && (
          <span id={`${id}-error`} className="custom-slider-plugin__error">
            {error.message}
          </span>
        )}
        <style>{`
        .custom-slider-plugin {
          padding: 8px 0;
        }
        .custom-slider-plugin__container {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .custom-slider-plugin__input {
          flex: 1;
          height: 8px;
          -webkit-appearance: none;
          appearance: none;
          background: linear-gradient(to right, #3b82f6, #8b5cf6);
          border-radius: 4px;
          outline: none;
        }
        .custom-slider-plugin__input::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: #ffffff;
          border: 2px solid #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .custom-slider-plugin__input::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #ffffff;
          border: 2px solid #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .custom-slider-plugin__input:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }
        .custom-slider-plugin__value-display {
          min-width: 48px;
          padding: 4px 12px;
          background: #f3f4f6;
          border-radius: 4px;
          font-weight: 600;
          text-align: center;
        }
        .custom-slider-plugin__error {
          display: block;
          margin-top: 4px;
          color: #dc2626;
          font-size: 14px;
        }
        .custom-slider-plugin--readonly {
          padding: 8px 0;
        }
      `}</style>
      </div>
      {/* Render children (delete/repeat buttons and nested items) inside FormGroup */}
      {children}
    </FormGroup>
  );
};

export default CustomSliderPlugin;
