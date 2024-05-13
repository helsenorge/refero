import React, { ReactElement } from 'react';

import Button from '@helsenorge/designsystem-react/components/Button';

import '../../styles/formButtons.scss';

type Props = {
  submitButtonDisabled?: boolean;
  onSubmitButtonClicked?: (() => void) | ((e: React.FormEvent) => void);
  submitButtonText: string;
};

export const SubmitFormButton = ({ submitButtonText, submitButtonDisabled, onSubmitButtonClicked }: Props): ReactElement => {
  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    onSubmitButtonClicked && onSubmitButtonClicked(e);
  };
  return (
    <div className="submitButtonStyle">
      <Button type="submit" disabled={submitButtonDisabled} onClick={handleSubmit}>
        {submitButtonText}
      </Button>
    </div>
  );
};
