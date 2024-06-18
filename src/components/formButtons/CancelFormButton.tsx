import React from 'react';

import Button from '@helsenorge/designsystem-react/components/Button';

import '../../styles/formButtons.css';

type Props = {
  onCancelButtonClicked?: () => void;
  cancelButtonText: string;
};

export const CancelFormButton = ({ cancelButtonText, onCancelButtonClicked }: Props): JSX.Element | null => {
  return (
    <div className="cancelButtonStyle">
      <Button variant="borderless" onClick={onCancelButtonClicked} testId="refero-cancel-button">
        {cancelButtonText}
      </Button>
    </div>
  );
};
