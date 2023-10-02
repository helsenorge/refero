import * as React from 'react';
// import Form from '@helsenorge/form/components/form';
import { Resources } from '../util/resources';
import { ReferoProps } from '../types/referoProps';
import { buttonOrderStepView, buttonOrderNormalView } from '../types/formTypes/formButton';

import { useForm, SubmitHandler } from 'react-hook-form';
import FormButtons from './formButtons';

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
  isHelsenorgeForm?: boolean;
}

interface IFormInput {
  example: string;
}

const RenderForm = ({ isStepView, referoProps, resources, formItemsToBeRendered, onSave, onSubmit, displayNextButton, displayPreviousButton, nextStep, previousStep, isHelsenorgeForm}: RenderFormProps) => {
  const { handleSubmit } = useForm<IFormInput>();
  const onSubmitReactHookForm: SubmitHandler<IFormInput> = data => {
    console.log(data);
    onSubmit();
  };

  const onPauseButtonClickedInNormalView = referoProps.onSave ? onSave : undefined;
  const onPauseButtonClickedInStepView = displayPreviousButton ? previousStep : undefined;

  return (
    <>
      <form onSubmit={handleSubmit(onSubmitReactHookForm)}>
        {formItemsToBeRendered}
        <FormButtons
          buttonOrder={isStepView ? buttonOrderStepView : buttonOrderNormalView}
          submitButtonText={displayNextButton && resources.nextStep ? resources.nextStep : resources.formSend}
          cancelButtonText={resources.formCancel}
          pauseButtonText={displayPreviousButton && resources.previousStep ? resources.previousStep : resources.formSave}
          onSubmitButtonClicked={displayNextButton ? nextStep : onSubmit}
          onCancelButtonClicked={referoProps.onCancel}
          onPauseButtonClicked={isStepView ? onPauseButtonClickedInStepView : onPauseButtonClickedInNormalView}
          isHelsenorgeForm={isHelsenorgeForm && isHelsenorgeForm}
        ></FormButtons>
      </form>
    </>
  );
};

export default RenderForm;
