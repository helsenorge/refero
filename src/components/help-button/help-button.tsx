import * as React from 'react';
import { useState } from 'react';

import { QuestionnaireItem } from '../../types/fhir';

interface Props {
  item: QuestionnaireItem | undefined;
  callback: (isOpen: boolean) => void;
}

const HelpButton: React.SFC<Props> = ({ item, children, callback }) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleToggle = (): void => {
    setIsOpen(!isOpen);
    callback(!isOpen);
  };

  if (!item) return null;

  return (
    <span className="page_refero__helpButton" onClick={handleToggle}>
      {children}
    </span>
  );
};

export default HelpButton;
