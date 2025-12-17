import React from 'react';

import type { QuestionnaireItem } from 'fhir/r4';
interface Props {
  item: QuestionnaireItem | undefined;
  padding?: boolean;
  callback: (isOpen: boolean) => void;
  ariaLabeledBy?: string;
  children: React.ReactNode;
}

const HelpButton = ({ item, padding, ariaLabeledBy, children, callback }: Props): JSX.Element | null => {
  const [isOpen, setIsOpen] = React.useState(false);
  const handleToggle = (): void => {
    setIsOpen(!isOpen);
    callback(!isOpen);
  };

  if (!item) return null;

  return (
    <span
      data-testid={`${item.linkId}-help-button`}
      className={`page_refero__helpButton ${padding && 'padding'}`}
      onClick={handleToggle}
      onKeyDown={e => e.key === 'Enter' && handleToggle()}
      role="button"
      tabIndex={0}
      aria-labelledby={ariaLabeledBy}
    >
      {children}
    </span>
  );
};

export default HelpButton;
