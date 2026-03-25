import { useEffect, type FC, type JSX } from 'react';

import { type FieldError, type FieldValues, type RegisterOptions, useFormContext } from 'react-hook-form';

import type { PluginComponentProps } from '../../src/types/componentPlugin';
import type { Coding, QuestionnaireItemAnswerOption } from 'fhir/r4';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Icon from '@helsenorge/designsystem-react/components/Icon';
import Check from '@helsenorge/designsystem-react/components/Icons/Check';

import { newCodingValueAsync, removeCodingValueAsync } from '../../src/actions/newValue';
import { ReferoLabel } from '../../src/components/referoLabel/ReferoLabel';
import { getErrorMessage, required } from '../../src/components/validation/rules';
import { shouldValidate } from '../../src/components/validation/utils';

import styles from './PillChoicePlugin.module.css';

/**
 * PillChoicePlugin - A multi-select choice component with pill/chip-style buttons
 *
 * Renders answer options as horizontal pill-shaped buttons that can be toggled.
 * Selected pills show a checkmark and have a filled background.
 *
 * Usage: Register with itemControlCode 'pill-choice' or similar
 */
export const PillChoicePlugin: FC<PluginComponentProps> = ({
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
}): JSX.Element | null => {
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
      <FormGroup error={errorMessage} errorWrapperClassName={styles.container}>
        <ReferoLabel
          item={item}
          resources={resources}
          htmlFor={id}
          labelId={`${id}-label`}
          testId={`${id}-label`}
          formFieldTagId={`${id}-formfieldtag`}
        />
        <div className={styles.container}>
          <span>{selectedLabels || 'No selection'}</span>
        </div>
      </FormGroup>
    );
  }

  if (answerOptions.length === 0) {
    return (
      <FormGroup error={errorMessage} errorWrapperClassName={styles.container}>
        <ReferoLabel
          item={item}
          resources={resources}
          htmlFor={id}
          labelId={`${id}-label`}
          testId={`${id}-label`}
          formFieldTagId={`${id}-formfieldtag`}
        />
        <div className={styles.container}>
          <p>{'No options available'}</p>
        </div>
      </FormGroup>
    );
  }

  return (
    <FormGroup error={errorMessage} errorWrapperClassName={styles.container}>
      <ReferoLabel
        item={item}
        resources={resources}
        htmlFor={id}
        labelId={`${id}-label`}
        testId={`${id}-label`}
        formFieldTagId={`${id}-formfieldtag`}
      />
      <div className={styles.container} role="group" aria-labelledby={`${id}-label`}>
        <div className={styles.pillGrid}>
          {answerOptions.map((option: QuestionnaireItemAnswerOption, index: number) => {
            const coding = option.valueCoding;
            if (!coding) return null;

            const selected = isSelected(coding);
            const optionId = `${id}-option-${index}`;
            const display = coding.display || coding.code || '';

            return (
              <button
                key={optionId}
                type="button"
                className={`${styles.pill} ${selected ? styles.selected : ''} ${readOnly ? styles.disabled : ''}`}
                onClick={() => handleToggle(coding)}
                disabled={readOnly}
                aria-pressed={selected}
                aria-label={display}
              >
                {selected && <Icon svgIcon={Check} size={20} className={styles.checkIcon} />}
                <span className={styles.label}>{display}</span>
              </button>
            );
          })}
        </div>
      </div>
      {/* Render children (delete/repeat buttons and nested items) inside FormGroup */}
      {children}
    </FormGroup>
  );
};

export default PillChoicePlugin;
