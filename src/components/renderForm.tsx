import * as React from 'react';
import Form from '@helsenorge/form/components/form';
import { Resources } from '../util/resources';
import { ReferoProps } from '.';

interface RenderFormProps {
  isAuthorized: boolean;
  referoProps: ReferoProps;
  resources: Resources;
  formItemsToBeRendered: Array<JSX.Element> | JSX.Element | undefined;
  onSave: () => void;
  onSubmit: () => void;
  displayNextButton?: boolean;
  nextStep?: () => void;
  previousStep?: () => void;
}

const RenderForm = ({
  isAuthorized,
  referoProps,
  resources,
  formItemsToBeRendered,
  onSave,
  onSubmit,
  displayNextButton,
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
            submitButtonText={displayNextButton ? 'Neste' : resources.formSend}
            errorMessage={resources.formError}
            onSubmit={displayNextButton ? nextStep : onSubmit}
            requiredLabel={resources.formRequired}
            optionalLabel={resources.formOptional}
            cancelButtonText={resources.formCancel}
            pauseButtonText={resources.formSave ? resources.formSave : 'Lagre'}
            onPause={referoProps.onSave ? onSave : undefined}
            pauseButtonClasses={'page_refero__pausebutton'}
            pauseButtonType="display"
            submitButtonType="display"
            cancelButtonType="display"
            pauseButtonLevel="secondary"
            cancelButtonRight={true}
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
          <button onClick={previousStep}>{'Forrige'}</button>
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
