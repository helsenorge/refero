import React from 'react';

import Button from '@helsenorge/designsystem-react/components/Button';

type Props = {
  disabled?: boolean;
  onBackButtonClick?: () => void;
  text: string;
  children?: React.ReactNode;
};

export const BackButton = ({ onBackButtonClick, disabled, text, children }: Props): React.JSX.Element => {
  return (
    <>
      <Button variant="outline" disabled={disabled} onClick={onBackButtonClick} testId="refero-pause-button">
        {text}
      </Button>
      {children}
    </>
  );
};
export default BackButton;
// Compare this snippet from src/components/formButtons/buttons/SubmitButton.tsx:
