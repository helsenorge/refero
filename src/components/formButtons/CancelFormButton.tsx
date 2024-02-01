import React, { ReactElement } from 'react';

import { ButtonType } from '../../types/formTypes/formButton';

import Button from '@helsenorge/designsystem-react/components/Button';

import { cancelButtonStyle } from '../../styles/formButtonStyles';

type Props = {
  onCancelButtonClicked?: () => void;
  cancelButtonText: string;
};

export const CancelFormButton = ({ cancelButtonText, onCancelButtonClicked }: Props): ReactElement => {
  return (
    <div key={ButtonType.cancelButton} className="cancelButtonStyle">
      <style>{cancelButtonStyle}</style>
      <Button variant="borderless" onClick={onCancelButtonClicked}>
        {cancelButtonText}
      </Button>
    </div>
  );
};
