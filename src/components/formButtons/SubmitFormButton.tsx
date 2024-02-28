import React, { ReactElement } from 'react';

import Button from '@helsenorge/designsystem-react/components/Button';

import { submitButtonStyle } from '../../styles/formButtonStyles';
type Props = {
  submitButtonDisabled?: boolean;
  onSubmitButtonClicked?: (() => void) | ((e: React.FormEvent) => void);
  submitButtonText: string;
};

export const SubmitFormButton = ({ submitButtonText, submitButtonDisabled, onSubmitButtonClicked }: Props): ReactElement => {
  return (
    <div className="submitButtonStyle">
      <style>{submitButtonStyle}</style>
      <Button type="submit" disabled={submitButtonDisabled} onClick={onSubmitButtonClicked}>
        {submitButtonText}
      </Button>
    </div>
  );
};