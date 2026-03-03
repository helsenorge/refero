import type { FormEvent, KeyboardEvent, MouseEvent } from 'react';

import { ButtonType, buttonOrderNormalView, buttonOrderStepView } from '../../types/formTypes/formButton';
import type { QuestionnaireResponse } from 'fhir/r4';

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
    | ((e?: KeyboardEvent<HTMLUListElement> | MouseEvent<HTMLElement, MouseEvent> | FormEvent<unknown> | null | undefined) => void);
  onCancelButtonClicked?: () => void;
  onPauseButtonClicked?: (questionnaireResponse?: QuestionnaireResponse) => void;
  isStepView?: boolean;
  isAuthorized?: boolean;
  loginButton?: React.JSX.Element;
}

/*
 * @deprecated this will be removed in a future version. We encourage you to build your own buttons.
 * See https://github.com/helsenorge/refero/blob/master/src/types/referoProps.ts#L331 for more information.
 */
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
}: FormButtonsInterface): React.JSX.Element => {
  const buttonOrder = isStepView ? buttonOrderStepView : buttonOrderNormalView;

  return (
    <div className={`${styles.formButtonsWrapper} page_refero__buttons`}>
      {!isAuthorized && loginButton ? (
        <div className="page_refero__buttonwrapper page_refero__saveblock">{loginButton}</div>
      ) : (
        <div className={styles.formButtonInnerWrapper}>
          {Object.values(buttonOrder).map((buttonType: ButtonType): React.JSX.Element | null => {
            switch (buttonType) {
              case ButtonType.pauseButton:
                return (
                  <PauseFormButton
                    key={buttonType}
                    isStepView={isStepView}
                    pauseButtonText={pauseButtonText}
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
        </div>
      )}
    </div>
  );
};

export default FormButtons;
