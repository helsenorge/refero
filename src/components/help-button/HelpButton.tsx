import React from 'react';
import { useState } from 'react';
import { QuestionnaireItem } from 'fhir/r4';
import styles from './helpbutton.module.css';
interface Props {
  item: QuestionnaireItem | undefined;
  callback: (isOpen: boolean) => void;
  children: React.ReactNode;
}

const HelpButton = ({ item, children, callback }: Props): JSX.Element | null => {
  const [isOpen, setIsOpen] = useState(false);
  const handleToggle = (): void => {
    setIsOpen(!isOpen);
    callback(!isOpen);
  };

  if (!item) return null;

  return (
    <span
      data-testid={`${item.linkId}-help-button`}
      className={`page_refero__helpButton ${styles.page_refero__helpButton}`}
      onClick={handleToggle}
    >
      {children}
    </span>
  );
};

export default HelpButton;
