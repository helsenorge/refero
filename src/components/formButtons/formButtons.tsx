import { FormEvent, KeyboardEvent, MouseEvent } from 'react';

import { QuestionnaireResponse } from 'fhir/r4';

import { ButtonType, buttonOrderNormalView, buttonOrderStepView } from '../../types/formTypes/formButton';

import { CancelFormButton } from './CancelFormButton';
import { PauseFormButton } from './PauseFormButton';
import { SubmitFormButton } from './SubmitFormButton';
import styles from '../../styles/formButtons.module.css';

interface FormButtonsInterface {
  submitButtonText: string;
  cancelButtonText: string;
  pauseButtonText: string;
  submitButtonDisabled?: boolean;
  pauseButtonDisabled?: boolean;
  onSubmitButtonClicked?:
    | (() => void)
    | ((e: MouseEvent<HTMLElement, MouseEvent> | FormEvent<{}> | KeyboardEvent<HTMLUListElement> | null | undefined) => void);
  onCancelButtonClicked?: () => void;
  onPauseButtonClicked?: (questionnaireResponse?: QuestionnaireResponse) => void;
  isHelsenorgeForm?: boolean;
  isStepView?: boolean;
}

const FormButtons = ({
  isStepView,
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
  const buttonOrder = isStepView ? buttonOrderStepView : buttonOrderNormalView;

  return (
    <div className={styles.formButtonsWrapper}>
      <>
        {Object.values(buttonOrder).map((buttonType: ButtonType): JSX.Element | null => {
          switch (buttonType) {
            case ButtonType.pauseButton:
              return (
                <PauseFormButton
                  key={buttonType}
                  pauseButtonText={pauseButtonText}
                  isHelsenorgeForm={isHelsenorgeForm}
                  onPauseButtonClicked={onPauseButtonClicked}
                  pauseButtonDisabled={pauseButtonDisabled}
                />
              );
            case ButtonType.cancelButton:
              return (
                <CancelFormButton key={buttonType} cancelButtonText={cancelButtonText} onCancelButtonClicked={onCancelButtonClicked} />
              );
            case ButtonType.submitButton:
              return (
                <SubmitFormButton
                  key={buttonType}
                  onSubmitButtonClicked={onSubmitButtonClicked}
                  submitButtonDisabled={submitButtonDisabled}
                  submitButtonText={submitButtonText}
                />
              );
            default:
              return <></>;
          }
        })}
      </>
    </div>
  );
};

export default FormButtons;
