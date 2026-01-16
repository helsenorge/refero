import type React from 'react';

import type { PluginComponentProps } from '../../src/types/componentPlugin';

import { getMinOccursExtensionValue, getMaxOccursExtensionValue } from '../../src/util/extension';

/**
 * Example custom slider plugin component.
 * This demonstrates how to create a plugin for integer fields with itemControl "slider".
 *
 * The plugin receives standardized props from PluginComponentWrapper and only needs to
 * focus on rendering the actual input control.
 */
export const CustomSliderPlugin: React.FC<PluginComponentProps> = ({ item, answer, onValueChange, error, readOnly, pdf, id }) => {
  // Get the current value from the answer
  const currentValue = Array.isArray(answer) ? answer[0]?.valueInteger : answer?.valueInteger;
  const displayValue = currentValue ?? 0;

  // Get min/max from extensions or use defaults
  const minValue = getMinOccursExtensionValue(item) ?? 0;
  const maxValue = getMaxOccursExtensionValue(item) ?? 100;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = parseInt(event.target.value, 10);
    onValueChange({ valueInteger: newValue });
  };

  // Render read-only version for PDF or read-only mode
  if (pdf || readOnly) {
    return (
      <div className="custom-slider-plugin custom-slider-plugin--readonly">
        <span className="custom-slider-plugin__value">{displayValue}</span>
      </div>
    );
  }

  return (
    <div className="custom-slider-plugin">
      <div className="custom-slider-plugin__container">
        <input
          type="range"
          id={id}
          name={id}
          min={minValue}
          max={maxValue}
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
  );
};

export default CustomSliderPlugin;
