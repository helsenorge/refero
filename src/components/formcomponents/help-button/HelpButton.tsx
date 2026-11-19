import React from 'react';

import type { QuestionnaireItem } from 'fhir/r4';
import styles from './renderHelpElement.module.scss';

interface Props {
  item: QuestionnaireItem | undefined;
  padding?: boolean;
  callback: (isOpen: boolean) => void;
  ariaLabeledBy?: string;
  hasCustomChildren?: boolean;
  children: React.ReactNode;
}

const HelpButton = ({ item, padding, ariaLabeledBy, hasCustomChildren, children, callback }: Props): React.JSX.Element | null => {
  const [isOpen, setIsOpen] = React.useState(false);
  const handleToggle = (): void => {
    setIsOpen(!isOpen);
    callback(!isOpen);
  };

  if (!item) return null;

  const testId = `${item.linkId}-help-button`;

  if (hasCustomChildren) {
    return (
      <span role="presentation" data-testid={testId} className={`page_refero__helpButton ${padding && 'padding'}`} onClick={handleToggle}>
        {children}
      </span>
    );
  }

  return (
    <button
      type="button"
      data-testid={testId}
      className={`page_refero__helpButton ${styles.helpButton_default} ${padding && 'padding'}`}
      onClick={handleToggle}
      aria-labelledby={ariaLabeledBy}
      aria-expanded={isOpen}
    >
      {children}
    </button>
  );
};

export default HelpButton;
