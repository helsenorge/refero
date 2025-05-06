import React from 'react';

import { FieldValues, SubmitHandler, UseFormReturn } from 'react-hook-form';

import { ValidationSummaryPlacement } from '../types/formTypes/validationSummaryPlacement';

import Loader from '@helsenorge/designsystem-react/components/Loader';

import FormButtons from './formButtons/formButtons';
import { ValidationSummary } from './validation/validation-summary';

import { ReferoProps } from '@/types/referoProps';
import { Resources } from '@/util/resources';
import { DefaultValues } from '@/validation/defaultFormValues';

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
  methods: UseFormReturn<DefaultValues, unknown, DefaultValues>;
  onFieldsNotCorrectlyFilledOut: ReferoProps['onFieldsNotCorrectlyFilledOut'];
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
  onFieldsNotCorrectlyFilledOut,
}: RenderFormProps): JSX.Element | null => {
  
  if (referoProps.blockSubmit) {
    return <Loader size={'medium'} overlay={'parent'} color="black" />;
  }

  const displayValidationSummaryOnTop: boolean =
    !validationSummaryPlacement || validationSummaryPlacement === ValidationSummaryPlacement.Top;
  const pauseButtonText = displayPreviousButton && isStepView ? resources.previousStep || 'Lagre' : resources.formSave;
  const submitButtonText = displayNextButton && resources.nextStep ? resources.nextStep : resources.formSend;
  const displayPauseButtonInNormalView = referoProps.onSave ? onSave : undefined;
  const displayPauseButtonInStepView = displayPreviousButton ? previousStep : undefined;

  const onErrorReactHookForm = (errors: FieldValues): void => {
    if (onFieldsNotCorrectlyFilledOut && errors) {
      onFieldsNotCorrectlyFilledOut();
    }
  };
  const onSubmitReactHookForm: SubmitHandler<FieldValues> = (): void => {
    onSubmit();
  };
  const handleNextStep: SubmitHandler<FieldValues> = (): void => {
    if (nextStep) {
      nextStep();
    }
  };
  const onSubmitButtonClicked = displayNextButton
    ? methods.handleSubmit(handleNextStep, onErrorReactHookForm)
    : methods.handleSubmit(onSubmitReactHookForm, onErrorReactHookForm);
  const onPauseButtonClicked = isStepView ? displayPauseButtonInStepView : displayPauseButtonInNormalView;
  
  return (
    <React.Fragment>
      <form onSubmit={methods.handleSubmit(onSubmitReactHookForm, onErrorReactHookForm)}>
        {displayValidationSummaryOnTop && !referoProps.hideValidationSummary && <ValidationSummary resources={resources} />}
        {children}
        {!displayValidationSummaryOnTop && !referoProps.hideValidationSummary && <ValidationSummary resources={resources} />}
      </form>

      {referoProps.renderCustomActionButtons ? (
        referoProps.renderCustomActionButtons({
          isStepView,
          referoProps,
          displayNextButton,
          displayPreviousButton,
          nextStep,
          previousStep,
          reactHookFormMethods: methods,
        })
      ) : (
        <FormButtons
          isStepView={isStepView}
          submitButtonText={submitButtonText}
          cancelButtonText={resources.formCancel}
          pauseButtonText={pauseButtonText}
          submitButtonDisabled={referoProps.submitButtonDisabled}
          pauseButtonDisabled={referoProps.saveButtonDisabled}
          onSubmitButtonClicked={onSubmitButtonClicked}
          onCancelButtonClicked={referoProps.onCancel}
          onPauseButtonClicked={onPauseButtonClicked}
          isAuthorized={isAuthorized}
          loginButton={referoProps.loginButton}
        />
      )}
    </React.Fragment>
  );
};

export default RenderForm;
