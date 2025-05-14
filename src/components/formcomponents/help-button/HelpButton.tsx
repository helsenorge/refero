import React, { useState } from 'react';


import { QuestionnaireItem } from 'fhir/r4';
interface Props {
  item: QuestionnaireItem | undefined;
  padding?: boolean;
  callback: (isOpen: boolean) => void;
  children: React.ReactNode;
}

const HelpButton = ({ item, padding, children, callback }: Props): JSX.Element | null => {
  const [isOpen, setIsOpen] = useState(false);
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
    >
      {children}
    </span>
  );
};

export default HelpButton;
