import * as React from 'react';
import { useState } from 'react';
import { QuestionnaireItem } from '../../types/fhir';

interface Props {
  item: QuestionnaireItem | undefined;
  callback: (isOpen: unknown) => void;
}

const HelpButton: React.SFC<Props> = ({ item, children, callback }) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleToggle = (_e: any) => {
    setIsOpen(!isOpen);
    callback(!isOpen);
  };

  if (!item) return null;

  return (
    <span className="page_skjemautfyller__helpButton" onClick={handleToggle}>
      {children}
    </span>
  );
};

export default HelpButton;
