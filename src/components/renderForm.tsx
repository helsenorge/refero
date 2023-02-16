import * as React from 'react';
import Form from '@helsenorge/form/components/form';
import { Resources } from '../util/resources';
import { ReferoProps } from '../types/referoProps';

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
}: RenderFormProps) => {

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
            onPause={isStepView ? (displayPreviousButton ? previousStep : undefined) : onSave}
            pauseButtonClasses={'page_refero__pausebutton'}
            pauseButtonType="display"
            submitButtonType="display"
            cancelButtonType="display"
            pauseButtonLevel="secondary"
            cancelButtonRight={true}
            pauseButtonLeft={true}
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
          <div className="page_refero__buttonwrapper page_refero__saveblock">{referoProps.loginButton}</div>
        </>
      )}
    </>
  );
};

export default RenderForm;
