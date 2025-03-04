import { FormEvent, KeyboardEvent, MouseEvent } from 'react';

import { QuestionnaireResponse } from 'fhir/r4';

import { ButtonOrder, ButtonType, buttonOrderNormalView, buttonOrderStepView } from '../../types/formTypes/formButton';

import { CancelFormButton } from './CancelFormButton';
import { PauseFormButton } from './PauseFormButton';
import { SubmitFormButton } from './SubmitFormButton';

import styles from './formButtons.module.css';

interface FormButtonsInterface {
  submitButtonText: string;
  cancelButtonText: string;
  pauseButtonText: string;
  submitButtonDisabled?: boolean;
  pauseButtonDisabled?: boolean;
  onSubmitButtonClicked?:
    | (() => void)
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    | ((e: MouseEvent<HTMLElement, MouseEvent> | FormEvent<{}> | KeyboardEvent<HTMLUListElement> | null | undefined) => void);
  onCancelButtonClicked?: () => void;
  onPauseButtonClicked?: (questionnaireResponse?: QuestionnaireResponse) => void;
  isStepView?: boolean;
  isAuthorized?: boolean;
  loginButton?: JSX.Element;
  overrideButtonOrder?: ButtonOrder;
  isMicrowebStep?: boolean;
  cancelUrl?: string;
  hideBackButton?: boolean;
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
  isAuthorized,
  loginButton,
  overrideButtonOrder,
  isMicrowebStep,
  cancelUrl,
  hideBackButton,
}: FormButtonsInterface): JSX.Element => {
  let buttonOrder = isStepView ? buttonOrderStepView : buttonOrderNormalView;
  if (overrideButtonOrder) {
    buttonOrder = overrideButtonOrder;
  }

  return (
    <div className={`${styles.formButtonsWrapper} page_refero__buttons`}>
      {!isAuthorized && loginButton ? (
        <div className="page_refero__buttonwrapper page_refero__saveblock">{loginButton}</div>
      ) : (
        <div className={styles.formButtonInnerWrapper}>
          {Object.values(buttonOrder).map((buttonType: ButtonType): JSX.Element | null => {
            switch (buttonType) {
              case ButtonType.pauseButton:
                if (isMicrowebStep && hideBackButton) {
                  return <></>;
                }

                return (
                  <PauseFormButton
                    key={buttonType}
                    isStepView={isStepView || isMicrowebStep}
                    pauseButtonText={pauseButtonText}
                    onPauseButtonClicked={onPauseButtonClicked}
                    pauseButtonDisabled={pauseButtonDisabled}
                  />
                );
              case ButtonType.cancelButton:
                return (
                  <CancelFormButton
                    key={buttonType}
                    cancelButtonText={cancelButtonText}
                    onCancelButtonClicked={onCancelButtonClicked}
                    isMicroweb={isMicrowebStep}
                    cancelUrl={cancelUrl}
                  />
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
        </div>
      )}
    </div>
  );
};

export default FormButtons;
