import * as React from 'react';

import { FieldValues, UseFormReturn } from 'react-hook-form';

import { QuestionnaireResponse } from '../types/fhir';
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
  methods,
  onFieldsNotCorrectlyFilledOut,
}: RenderFormProps): JSX.Element | null => {
  const onSubmitReactHookForm = (data: QuestionnaireResponse, e: React.FormEvent): void => {
    e.preventDefault();
    console.log('onSubmitReactHookForm- data', data);
    console.log('onSubmitReactHookForm');
    onSubmit();
  };
  const handleInvalidForm = (FieldValues: FieldValues, e: React.FormEvent): void => {
    e.preventDefault();
    console.log('Invalid FieldValues', FieldValues);
    onFieldsNotCorrectlyFilledOut && onFieldsNotCorrectlyFilledOut();
  };
  const onPauseButtonClickedInNormalView = referoProps.onSave ? onSave : undefined;
  const onPauseButtonClickedInStepView = displayPreviousButton ? previousStep : undefined;

  if (referoProps.blockSubmit) {
    return <Loader size={'medium'} overlay={'parent'} />;
  }
  //             validationSummaryPlacement={referoProps.validationSummaryPlacement}
  //             validationSummary={{
  //               enable: true,
  //               header: resources.validationSummaryHeader,
  //             }}
  return (
    <form onSubmit={methods.handleSubmit(onSubmitReactHookForm, handleInvalidForm)}>
      <Validation errorSummary="test" />

      {children}
      <Validation />

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
  );
};

export default RenderForm;
