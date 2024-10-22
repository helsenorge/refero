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

  if ( referoProps.isMicrowebStep && isStepView) {
    // eslint-disable-next-line no-console
    console.warn("Refero: Stegvisning i Skjema er ikke støttet i Microweb step modus");
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

  const buttonOrderMicroWeb = {
    1: ButtonType.pauseButton, 
    2: ButtonType.submitButton,
    3: ButtonType.cancelButton,
    4: ButtonType.draftButton,
  }

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

  const getPauseButtonText = (): string | undefined => {
      if ( displayPreviousButton) {
        return resources.previousStep;
      } 
      else if ( referoProps.isMicrowebStep ) {
        return 'Tilbake';
      }
      else {
        return resources.formSave;
      }
  }


  const getOnPauseCallBackToUse = (isMicroweb: boolean | undefined): (() => void) | undefined => {
    // Important to check isMicroweb first since it should take precedence even though stepView is true 
    // since in process flow
    if ( isMicroweb ) {
      // eslint-disable-next-line no-console
      console.log("Debug: Microweb and Step back called - ");
      return referoProps.onStepProcessBack;
    }
    if (isStepView ) {
      return displayPauseButtonInStepView;
    }
    return displayPauseButtonInNormalView;
  };

  const isPauseButtonDisabled = (): boolean | undefined => {
    if ( referoProps.isMicrowebStep ) {
      return false;
    }
    return referoProps.saveButtonDisabled;
  };

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleCancel = () => {
    // eslint-disable-next-line no-console
    console.log('Refero: HandleCancel called');
    if ( referoProps.isMicrowebStep ) {
        // eslint-disable-next-line no-console
        console.log("Refero: Is microwebsstep");
        
        if ( referoProps.onStepProcessCancel ) {
            // eslint-disable-next-line no-console
            console.log("Refero: Cancel callback is set OK");
          // eslint-disable-next-line no-console
          console.log("Refero: Invoking cancel callback");
          return referoProps.onStepProcessCancel();
        } else {
          // eslint-disable-next-line no-console
          console.log("Cancel callback is not set");
        }
    }
    if (referoProps.onCancel) {
      return referoProps.onCancel;
    }
  };


  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleSubmit = (): (() => void) => {
     // eslint-disable-next-line no-console
     console.log("Handle submit called");
     if ( referoProps.isMicrowebStep ) {
        // eslint-disable-next-line no-console
        console.log("Is microweb step");
        // eslint-disable-next-line no-console
        console.log("Using step process foward");
        if ( referoProps.onStepProcessForward) {
          // eslint-disable-next-line no-console
          console.log("Returning callback onStepProcessForward");
          return referoProps.onStepProcessForward;
        }
    }
    return onSubmit;
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
            onSubmit={displayNextButton ? nextStep : handleSubmit()}
            requiredLabel={resources.formRequired}
            optionalLabel={resources.formOptional}
            cancelButtonText={resources.formCancel}
            pauseButtonText={ getPauseButtonText()}
            onPause={getOnPauseCallBackToUse(referoProps.isMicrowebStep)}
            pauseButtonClasses={`${referoProps.isMicrowebStep ? 'page_refero__pausebutton_stepView' : 'page_refero__pausebutton'}`}
            submitButtonClasses={getPauseButtonClasses()}
            pauseButtonType="display"
            submitButtonType="display"
            cancelButtonType="display"
            pauseButtonLevel="secondary"
            buttonOrder={getButtonOrder()}
            onCancel={handleCancel}
            buttonClasses="page_refero__saveblock"
            validationSummaryPlacement={referoProps.validationSummaryPlacement}
            validationSummary={{
              enable: true,
              header: resources.validationSummaryHeader,
            }}
            submitButtonDisabled={referoProps.submitButtonDisabled}
            pauseButtonDisabled={isPauseButtonDisabled()}
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
