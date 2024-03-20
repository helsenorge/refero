import * as React from 'react';

import { QuestionnaireResponse } from 'fhir/r4';
import { FieldValues, SubmitHandler, UseFormReturn } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';

import { ReferoProps } from '../types/referoProps';
import { Resources } from '../types/resources';

import Loader from '@helsenorge/designsystem-react/components/Loader';
import Validation from '@helsenorge/designsystem-react/components/Validation';

import FormButtons from './formButtons/formButtons';

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
  onFieldsNotCorrectlyFilledOut?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  methods: UseFormReturn<FieldValues, any, undefined>;
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
}: // methods,
RenderFormProps): JSX.Element | null => {
  const { reset } = useFormContext();

  // const onSubmitReactHookForm: SubmitHandler<any> = (data: QuestionnaireResponse, e: React.FormEvent): void => {
  //   console.log('data', JSON.stringify(data, null, 2));
  //   return false;
  //   onSubmit();
  // };

  const displayPauseButtonInNormalView = referoProps.onSave ? onSave : undefined;
  const displayPauseButtonInStepView = displayPreviousButton ? previousStep : undefined;

  if (referoProps.blockSubmit) {
    return <Loader size={'medium'} overlay={'parent'} />;
  }
  // const { errors, isSubmitted } = formState;
  // console.log('errors', errors);
  // console.log('isSubmitted', isSubmitted);
  // console.log('values: ', getValues());
  //onSubmit={methods.handleSubmit(onSubmitReactHookForm)}
  return (
    <form>
      {/* <Validation errorSummary="test" /> */}
      {children}
      <FormButtons
        isStepView={isStepView}
        submitButtonText={displayNextButton && resources.nextStep ? resources.nextStep : resources.formSend}
        cancelButtonText={resources.formCancel}
        pauseButtonText={displayPreviousButton && resources.previousStep ? resources.previousStep : resources.formSave}
        submitButtonDisabled={referoProps.blockSubmit}
        pauseButtonDisabled={referoProps.saveButtonDisabled}
        onSubmitButtonClicked={displayNextButton ? nextStep : onSubmit}
        onCancelButtonClicked={(): void => {
          referoProps.onCancel && referoProps.onCancel();
          reset();
        }}
        onPauseButtonClicked={isStepView ? displayPauseButtonInStepView : displayPauseButtonInNormalView}
        isHelsenorgeForm={!!isHelsenorgeForm}
      />
    </form>
  );
};

export default RenderForm;
