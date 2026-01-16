import type React from 'react';

import type { PluginComponentProps } from '../../src/types/componentPlugin';
import type { Coding, QuestionnaireItemAnswerOption } from 'fhir/r4';

import Icon from '@helsenorge/designsystem-react/components/Icon';
import Check from '@helsenorge/designsystem-react/components/Icons/Check';

import styles from './PillChoicePlugin.module.css';

/**
 * PillChoicePlugin - A multi-select choice component with pill/chip-style buttons
 *
 * Renders answer options as horizontal pill-shaped buttons that can be toggled.
 * Selected pills show a checkmark and have a filled background.
 *
 * Usage: Register with itemControlCode 'pill-choice' or similar
 */
export const PillChoicePlugin: React.FC<PluginComponentProps> = ({
  item,
  answer,
  onValueChange,
  readOnly,
  pdf,
  id,
}): JSX.Element | null => {
  // Get answer options from the item
  const answerOptions = item.answerOption || [];

  // Get currently selected codings
  const selectedCodings: Coding[] = Array.isArray(answer)
    ? answer.map(a => a.valueCoding).filter((c): c is Coding => !!c)
    : answer?.valueCoding
      ? [answer.valueCoding]
      : [];

  const isSelected = (coding: Coding): boolean => {
    return selectedCodings.some(selected => selected.code === coding.code && selected.system === coding.system);
  };

  const handleToggle = (coding: Coding): void => {
    if (readOnly || pdf) return;

    // The value handler will automatically toggle based on current selection
    onValueChange({ valueCoding: coding });
  };

  // Render read-only version for PDF
  if (pdf) {
    const selectedLabels = selectedCodings.map(c => c.display || c.code).join(', ');
    return (
      <div className={styles.container}>
        <span>{selectedLabels || 'No selection'}</span>
      </div>
    );
  }

  if (answerOptions.length === 0) {
    return (
      <div className={styles.container}>
        <p>{'No options available'}</p>
      </div>
    );
  }

  return (
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
  );
};

export default PillChoicePlugin;
