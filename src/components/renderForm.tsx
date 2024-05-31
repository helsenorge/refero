import * as React from 'react';

import { ReferoProps } from '../types/referoProps';

import Form, { ButtonType } from '@helsenorge/form/components/form';

import { Resources } from '../util/resources';

interface RenderFormProps {
  isAuthorized: boolean;
  isStepView: boolean;
  referoProps: ReferoProps;
  resources: Resources;
  formItemsToBeRendered: Array<JSX.Element> | JSX.Element | undefined;
  onSave: () => void;
  onSubmit: () => void;
  displayNextButton?: boolean;
  displayPreviousButton?: boolean;
  nextStep?: () => void;
  previousStep?: () => void;
}

const RenderForm = ({
  isAuthorized,
  isStepView,
  referoProps,
  resources,
  formItemsToBeRendered,
  onSave,
  onSubmit,
  displayNextButton,
  displayPreviousButton,
  nextStep,
  previousStep,
}: RenderFormProps): JSX.Element => {
  const displayPauseButtonInNormalView = referoProps.onSave ? onSave : undefined;
  const displayPauseButtonInStepView = displayPreviousButton ? previousStep : undefined;

  const buttonOrderMicroWeb = {
    1: ButtonType.pauseButton, 
    2: ButtonType.submitButton,
    3: ButtonType.cancelButton,
    4: ButtonType.draftButton,
  }

  const buttonOrderStepView = {
    1: ButtonType.pauseButton,
    2: ButtonType.submitButton,
    3: ButtonType.cancelButton,
    4: ButtonType.draftButton,
  };
  const buttonOrderNormalView = {
    1: ButtonType.submitButton,
    2: ButtonType.pauseButton,
    3: ButtonType.cancelButton,
    4: ButtonType.draftButton,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getButtonOrder = (): any => {
    if (isStepView && referoProps.isMicrowebStep === false) {
      return buttonOrderStepView;
    }
    if (referoProps.isMicrowebStep) {
      return buttonOrderMicroWeb;
    }
    return buttonOrderNormalView;
  }

  const getPauseButtonClasses = (): string | undefined => {
    if ( referoProps.isMicrowebStep ) { 
        return 'page_refero__pausebutton_microweb';
    }
    if ( isStepView ) {
        return 'page_refero__pausebutton_stepView';
    }
    return 'page_refero__pausebutton';
  }

  return (
    <>
      {isAuthorized && (
        <>
          <Form
            action="#"
            disabled={referoProps.blockSubmit}
            submitButtonText={displayNextButton ? resources.nextStep : resources.formSend}
            errorMessage={resources.formError}
            onSubmit={displayNextButton ? nextStep : onSubmit}
            requiredLabel={resources.formRequired}
            optionalLabel={resources.formOptional}
            cancelButtonText={resources.formCancel}
            pauseButtonText={displayPreviousButton ? resources.previousStep : resources.formSave}
            onPause={isStepView ? displayPauseButtonInStepView : displayPauseButtonInNormalView}
            pauseButtonClasses={getPauseButtonClasses()}
            submitButtonClasses={getPauseButtonClasses()}
            pauseButtonType="display"
            submitButtonType="display"
            cancelButtonType="display"
            pauseButtonLevel="secondary"
            buttonOrder={getButtonOrder()}
            onCancel={referoProps.onCancel}
            buttonClasses="page_refero__saveblock"
            validationSummaryPlacement={referoProps.validationSummaryPlacement}
            validationSummary={{
              enable: true,
              header: resources.validationSummaryHeader,
            }}
            submitButtonDisabled={referoProps.submitButtonDisabled}
            pauseButtonDisabled={referoProps.saveButtonDisabled}
            onFieldsNotCorrectlyFilledOut={referoProps.onFieldsNotCorrectlyFilledOut}
          >
            {formItemsToBeRendered}
          </Form>
        </>
      )}
      {!isAuthorized && (
        <>
          <Form
            action="#"
            disabled={referoProps.blockSubmit}
            errorMessage={resources.formError}
            requiredLabel={resources.formRequired}
            optionalLabel={resources.formOptional}
            buttonOrder={isStepView ? buttonOrderStepView : buttonOrderNormalView}
            triggerPreventDefaultOnSubmit
            validationSummaryPlacement={referoProps.validationSummaryPlacement}
            validationSummary={{
              enable: true,
              header: resources.validationSummaryHeader,
            }}
            submitButtonDisabled={referoProps.submitButtonDisabled}
            pauseButtonDisabled={referoProps.saveButtonDisabled}
            onFieldsNotCorrectlyFilledOut={referoProps.onFieldsNotCorrectlyFilledOut}
          ></Form>
          {formItemsToBeRendered}
          <div className="page_refero__buttonwrapper page_refero__saveblock">{referoProps.loginButton}</div>
        </>
      )}
    </>
  );


};

export default RenderForm;
