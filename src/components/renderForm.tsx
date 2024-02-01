import * as React from 'react';

import { useForm, SubmitHandler, FormProvider, FieldValues } from 'react-hook-form';

import { buttonOrderStepView, buttonOrderNormalView } from '../types/formTypes/formButton';
import { Inputs } from '../types/formTypes/formInputs';
import { ReferoProps } from '../types/referoProps';

import Loader from '@helsenorge/designsystem-react/components/Loader';

import FormButtons from './formButtons/formButtons';
import { Resources } from '../util/resources';
import { QuestionnaireResponse } from '../types/fhir';

interface RenderFormProps {
  isAuthorized: boolean;
  isStepView: boolean;
  referoProps: ReferoProps;
  resources: Resources;
  onSave: () => void;
  onSubmit: () => void;
  displayNextButton?: boolean;
  displayPreviousButton?: boolean;
  nextStep?: () => void;
  previousStep?: () => void;
  isHelsenorgeForm?: boolean;
  children?: React.ReactNode;
}

const RenderForm = ({
  isStepView,
  referoProps,
  resources,
  onSave,
  onSubmit,
  displayNextButton,
  displayPreviousButton,
  nextStep,
  previousStep,
  isHelsenorgeForm,
  children,
}: RenderFormProps): JSX.Element | null => {
  const methods = useForm();
  const onSubmitReactHookForm = (data: QuestionnaireResponse): void => {
    console.log('data', data);
    console.log('onSubmitReactHookForm');
    onSubmit();
  };
  const handleInvalidForm = (FieldValues: FieldValues): void => {
    console.log(FieldValues);
  };
  const onPauseButtonClickedInNormalView = referoProps.onSave ? onSave : undefined;
  const onPauseButtonClickedInStepView = displayPreviousButton ? previousStep : undefined;

  if (referoProps.blockSubmit) {
    return <Loader size={'medium'} overlay={'parent'} />;
  }

  return (
    <FormProvider {...methods}>
      <form action="#" onSubmit={methods.handleSubmit(onSubmitReactHookForm, handleInvalidForm)}>
        {children}
        <FormButtons
          isStepView={isStepView}
          submitButtonText={displayNextButton && resources.nextStep ? resources.nextStep : resources.formSend}
          cancelButtonText={resources.formCancel}
          pauseButtonText={displayPreviousButton && resources.previousStep ? resources.previousStep : resources.formSave}
          submitButtonDisabled={referoProps.blockSubmit}
          pauseButtonDisabled={referoProps.saveButtonDisabled}
          onSubmitButtonClicked={displayNextButton ? nextStep : methods.handleSubmit(onSubmitReactHookForm)}
          onCancelButtonClicked={referoProps.onCancel}
          onPauseButtonClicked={isStepView ? onPauseButtonClickedInStepView : onPauseButtonClickedInNormalView}
          isHelsenorgeForm={isHelsenorgeForm && isHelsenorgeForm}
        ></FormButtons>
      </form>
    </FormProvider>
  );
};

export default RenderForm;
