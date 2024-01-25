import * as React from 'react';

import { ButtonOrder, ButtonType } from '../types/formTypes/formButton';

import Button from '@helsenorge/designsystem-react/components/Button';

import {
  cancelButtonStyle,
  displayPauseButtonOnSmallScreen,
  hidePauseButtonOnSmallScreen,
  formButtonsWrapper,
  pauseButtonStyle,
  submitButtonStyle,
} from '../styles/formButtonStyles';

interface FormButtonsInterface {
  buttonOrder: ButtonOrder;
  submitButtonText: string;
  cancelButtonText: string;
  pauseButtonText: string;
  submitButtonDisabled?: boolean;
  pauseButtonDisabled?: boolean;
  onSubmitButtonClicked?: (() => void) | ((e: React.FormEvent) => void);
  onCancelButtonClicked?: () => void;
  onPauseButtonClicked?: () => void;
  isHelsenorgeForm?: boolean;
}

const FormButtons = ({
  buttonOrder,
  submitButtonText,
  cancelButtonText,
  pauseButtonText,
  submitButtonDisabled,
  pauseButtonDisabled,
  onSubmitButtonClicked,
  onCancelButtonClicked,
  onPauseButtonClicked,
  isHelsenorgeForm,
}: FormButtonsInterface): JSX.Element | null => {
  const submitButton = (
    //onsubmit og onformsubmit
    <div key="submitButton" className="submitButtonStyle">
      <style>{submitButtonStyle}</style>
      <Button type="submit" disabled={submitButtonDisabled} onClick={onSubmitButtonClicked}>
        {submitButtonText}
      </Button>
    </div>
  );
  const pauseButton = (
    <div key="pauseButton" className="pauseButtonStyle">
      <style>{pauseButtonStyle}</style>
      <style>{isHelsenorgeForm ? hidePauseButtonOnSmallScreen : displayPauseButtonOnSmallScreen}</style>
      <Button variant="outline" disabled={pauseButtonDisabled} onClick={onPauseButtonClicked}>
        {pauseButtonText}
      </Button>
    </div>
  );
  const cancelButton = (
    <div key="cancelButton" className="cancelButtonStyle">
      <style>{cancelButtonStyle}</style>
      <Button variant="borderless" onClick={onCancelButtonClicked}>
        {cancelButtonText}
      </Button>
    </div>
  );

  if (!submitButton && !pauseButton && !cancelButton) {
    return null;
  }
  const buttonSelector = (buttonType: ButtonType): JSX.Element => {
    switch (buttonType) {
      case ButtonType.pauseButton:
        return pauseButton;
      case ButtonType.cancelButton:
        return cancelButton;
      default:
        return submitButton;
    }
  };

  return (
    <>
      <div className="formButtonsWrapper">
        <style>{formButtonsWrapper}</style>
        {Object.values(buttonOrder).map(button => buttonSelector(button))}
      </div>
    </>
  );
};

export default FormButtons;
