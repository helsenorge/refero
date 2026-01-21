import { useEffect, type FC } from 'react';

import { type FieldError, type FieldValues, type RegisterOptions, useFormContext } from 'react-hook-form';

import type { PluginComponentProps } from '../../src/types/componentPlugin';
import type { Coding } from 'fhir/r4';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Icon, { type SvgIcon } from '@helsenorge/designsystem-react/components/Icon';
import AlertSignStroke from '@helsenorge/designsystem-react/components/Icons/AlertSignStroke';
import BrokenHeart from '@helsenorge/designsystem-react/components/Icons/BrokenHeart';
import Check from '@helsenorge/designsystem-react/components/Icons/Check';
import EmoticonHappy from '@helsenorge/designsystem-react/components/Icons/EmoticonHappy';
import Female from '@helsenorge/designsystem-react/components/Icons/Female';
import GenderIdentity from '@helsenorge/designsystem-react/components/Icons/GenderIdentity';
import Heart from '@helsenorge/designsystem-react/components/Icons/Heart';
import HeartHands from '@helsenorge/designsystem-react/components/Icons/HeartHands';
import HelpSign from '@helsenorge/designsystem-react/components/Icons/HelpSign';
import MaleDoctor from '@helsenorge/designsystem-react/components/Icons/MaleDoctor';
import Person from '@helsenorge/designsystem-react/components/Icons/Person';

import { newCodingValueAsync, removeCodingValueAsync } from '../../src/actions/newValue';
import { ReferoLabel } from '../../src/components/referoLabel/ReferoLabel';
import { getErrorMessage, required } from '../../src/components/validation/rules';
import { shouldValidate } from '../../src/components/validation/utils';

/**
 * Example image choice plugin component using Helsenorge design system icons.
 * Renders choice options as clickable icon cards instead of checkboxes.
 *
 * This plugin maps coding codes to Helsenorge design system icons.
 */

// Map coding codes to Helsenorge design system icon components
const ICON_MAP: Record<string, SvgIcon> = {
  // Gender options
  male: MaleDoctor,
  female: Female,
  other: GenderIdentity,
  unknown: HelpSign,
  // Satisfaction/mood options
  'very-satisfied': HeartHands,
  satisfied: Heart,
  neutral: Person,
  dissatisfied: BrokenHeart,
  'very-dissatisfied': AlertSignStroke,
  // Fallback
  default: EmoticonHappy,
};

const getIconForCode = (code: string | undefined): SvgIcon => {
  if (!code) return ICON_MAP.default;
  return ICON_MAP[code] || ICON_MAP.default;
};

export const ImageChoicePlugin: FC<PluginComponentProps> = ({
  item,
  answer,
  dispatch,
  onAnswerChange,
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

  // Get error state from form context
  const error = formState.errors[idWithLinkIdAndItemIndex] as FieldError | undefined;
  const errorMessage = getErrorMessage(item, error);

  // Get answer options from the item
  const answerOptions = item.answerOption || [];

  // Get currently selected codings
  const selectedCodings: Coding[] = Array.isArray(answer)
    ? answer.map(a => a.valueCoding).filter((c): c is Coding => !!c)
    : answer?.valueCoding
      ? [answer.valueCoding]
      : [];

  // Register with react-hook-form using standard validation rules
  useEffect(() => {
    if (shouldValidate(item, pdf)) {
      const validationRules: RegisterOptions<FieldValues, string> = {
        required: required({ item, resources }),
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
      setValue(idWithLinkIdAndItemIndex, answer, { shouldValidate: formState.isSubmitted });
    }
  }, [answer, idWithLinkIdAndItemIndex, item, pdf, setValue, formState.isSubmitted]);

  const isSelected = (coding: Coding): boolean => {
    return selectedCodings.some(selected => selected.code === coding.code && selected.system === coding.system);
  };

  // Handle toggle - same pattern as built-in Choice component
  const handleToggle = (coding: Coding): void => {
    if (readOnly || pdf) return;

    const alreadySelected = isSelected(coding);

    if (alreadySelected) {
      // Remove the coding
      dispatch(removeCodingValueAsync(path, coding, item))?.then(newState => onAnswerChange(newState, item, { valueCoding: coding }));
    } else {
      // Add the coding (multipleAnswers = true for repeating choice)
      dispatch(newCodingValueAsync(path, coding, item, item.repeats))?.then(newState =>
        onAnswerChange(newState, item, { valueCoding: coding })
      );
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  // Render read-only version for PDF
  if (pdf) {
    const selectedLabels = selectedCodings.map(c => c.display || c.code).join(', ');
    return (
      <FormGroup error={errorMessage} errorWrapperClassName="image-choice-plugin">
        <ReferoLabel
          item={item}
          resources={resources}
          htmlFor={id}
          labelId={`${id}-label`}
          testId={`${id}-label`}
          formFieldTagId={`${id}-formfieldtag`}
        />
        <div className="image-choice-plugin image-choice-plugin--readonly">
          <span>{selectedLabels || 'No selection'}</span>
        </div>
      </FormGroup>
    );
  }

  return (
    <FormGroup error={errorMessage} errorWrapperClassName="image-choice-plugin">
      <ReferoLabel
        item={item}
        resources={resources}
        htmlFor={id}
        labelId={`${id}-label`}
        testId={`${id}-label`}
        formFieldTagId={`${id}-formfieldtag`}
      />
      <div className="image-choice-plugin" role="group" aria-labelledby={`${id}-label`}>
        <div className="image-choice-plugin__grid">
          {answerOptions.map((option, index) => {
            const coding = option.valueCoding;
            if (!coding) return null;

            const selected = isSelected(coding);
            const IconComponent = getIconForCode(coding.code);
            const optionId = `${id}-option-${index}`;

            return (
              <button
                key={optionId}
                type="button"
                className={`image-choice-plugin__option ${selected ? 'image-choice-plugin__option--selected' : ''} ${readOnly ? 'image-choice-plugin__option--disabled' : ''}`}
                onClick={() => handleToggle(coding)}
                disabled={readOnly}
                aria-pressed={selected}
                aria-label={coding.display || coding.code}
              >
                <div className="image-choice-plugin__icon-container">
                  <Icon svgIcon={IconComponent} size={48} color={selected ? '#2563eb' : '#6b7280'} />
                  {selected && (
                    <div className="image-choice-plugin__checkmark">
                      <Icon svgIcon={Check} size={16} color="#ffffff" />
                    </div>
                  )}
                </div>
                <span className="image-choice-plugin__label">{coding.display || coding.code}</span>
              </button>
            );
          })}
        </div>
        <style>{`
        .image-choice-plugin {
          padding: 8px 0;
        }
        .image-choice-plugin__grid {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }
        .image-choice-plugin__option {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 100px;
        }
        .image-choice-plugin__option:hover:not(:disabled) {
          border-color: #2563eb;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
          transform: translateY(-2px);
        }
        .image-choice-plugin__option:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.3);
        }
        .image-choice-plugin__option--selected {
          border-color: #2563eb;
          background: #eff6ff;
        }
        .image-choice-plugin__option--disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .image-choice-plugin__icon-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          margin-bottom: 8px;
        }
        .image-choice-plugin__checkmark {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 24px;
          height: 24px;
          background: #2563eb;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .image-choice-plugin__label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          text-align: center;
        }
        .image-choice-plugin__option--selected .image-choice-plugin__label {
          color: #1d4ed8;
        }
        .image-choice-plugin__error {
          display: block;
          margin-top: 8px;
          color: #dc2626;
          font-size: 14px;
        }
        .image-choice-plugin--readonly {
          padding: 8px 0;
          color: #374151;
        }
      `}</style>
      </div>
      {/* Render children (delete/repeat buttons and nested items) inside FormGroup */}
      {children}
    </FormGroup>
  );
};

export default ImageChoicePlugin;
