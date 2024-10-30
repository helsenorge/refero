import React from 'react';

import { FieldValues, SubmitHandler, UseFormReturn } from 'react-hook-form';

import { ValidationSummaryPlacement } from '../types/formTypes/validationSummaryPlacement';
import { ReferoProps } from '@/types/referoProps';

import Loader from '@helsenorge/designsystem-react/components/Loader';

import FormButtons from './formButtons/formButtons';
import { ValidationSummary } from './validation/validation-summary';
import { Resources } from '@/util/resources';

interface RenderFormProps {
  isAuthorized: boolean;
  isStepView: boolean;
  referoProps: ReferoProps;
  resources: Resources;
  onSave?: () => void;
  onSubmit: () => void;
  displayNextButton?: boolean;
  displayPreviousButton?: boolean;
  nextStep?: () => void;
  previousStep?: () => void;
  children?: React.ReactNode;
  validationSummaryPlacement?: ValidationSummaryPlacement;
  methods: UseFormReturn<FieldValues, unknown, undefined>;
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
  children,
  methods,
  validationSummaryPlacement,
  isAuthorized,
}: RenderFormProps): JSX.Element | null => {
  const onSubmitReactHookForm: SubmitHandler<FieldValues> = (): void => {
    onSubmit();
  };
  const displayPauseButtonInNormalView = referoProps.onSave ? onSave : undefined;
  const displayPauseButtonInStepView = displayPreviousButton ? previousStep : undefined;
  const displayValidationSummaryOnTop: boolean =
    !validationSummaryPlacement || validationSummaryPlacement === ValidationSummaryPlacement.Top;

  if (referoProps.blockSubmit) {
    return <Loader size={'medium'} overlay={'parent'} />;
  }

  const handleNextStep: SubmitHandler<FieldValues> = (): void => {
    if (nextStep) {
      nextStep();
    }
  };
  return (
    <>
      <form onSubmit={methods.handleSubmit(onSubmitReactHookForm)}>
        {displayValidationSummaryOnTop && <ValidationSummary resources={resources} />}
        {children}
        {!displayValidationSummaryOnTop && <ValidationSummary resources={resources} />}
      </form>
      <FormButtons
        isStepView={isStepView}
        submitButtonText={displayNextButton && resources.nextStep ? resources.nextStep : resources.formSend}
        cancelButtonText={resources.formCancel}
        pauseButtonText={displayPreviousButton && isStepView ? resources.previousStep || 'Lagre' : resources.formSave}
        submitButtonDisabled={referoProps.submitButtonDisabled}
        pauseButtonDisabled={referoProps.saveButtonDisabled}
        onSubmitButtonClicked={displayNextButton ? methods.handleSubmit(handleNextStep) : methods.handleSubmit(onSubmitReactHookForm)}
        onCancelButtonClicked={(): void => {
          referoProps.onCancel && referoProps.onCancel();
        }}
        onPauseButtonClicked={isStepView ? displayPauseButtonInStepView : displayPauseButtonInNormalView}
        isAuthorized={isAuthorized}
        loginButton={referoProps.loginButton}
      />
    </>
  );
};

export default RenderForm;
