import * as React from 'react';

import { useForm, SubmitHandler } from 'react-hook-form';

import { buttonOrderStepView, buttonOrderNormalView } from '../types/formTypes/formButton';
import { Inputs } from '../types/formTypes/formInputs';
import { ReferoProps } from '../types/referoProps';

import Loader from '@helsenorge/designsystem-react/components/Loader';

import FormButtons from './formButtons';
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
  isHelsenorgeForm?: boolean;
}

const RenderForm = ({
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
  isHelsenorgeForm,
}: RenderFormProps): JSX.Element | null => {
  const { handleSubmit } = useForm();
  const onSubmitReactHookForm: SubmitHandler<Inputs> = data => {
    console.log(data);
    onSubmit();
  };

  const onPauseButtonClickedInNormalView = referoProps.onSave ? onSave : undefined;
  const onPauseButtonClickedInStepView = displayPreviousButton ? previousStep : undefined;

  if (referoProps.blockSubmit) {
    return <Loader size={'medium'} overlay={'parent'} />;
  }

  return (
    <>
      <form action="#" onSubmit={handleSubmit(onSubmitReactHookForm)}>
        {formItemsToBeRendered}
        <FormButtons
          buttonOrder={isStepView ? buttonOrderStepView : buttonOrderNormalView}
          submitButtonText={displayNextButton && resources.nextStep ? resources.nextStep : resources.formSend}
          cancelButtonText={resources.formCancel}
          pauseButtonText={displayPreviousButton && resources.previousStep ? resources.previousStep : resources.formSave}
          submitButtonDisabled={referoProps.blockSubmit}
          pauseButtonDisabled={referoProps.saveButtonDisabled}
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
