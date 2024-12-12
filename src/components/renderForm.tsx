import React from 'react';

import { FieldValues, SubmitHandler, UseFormReturn } from 'react-hook-form';

import { ValidationSummaryPlacement } from '../types/formTypes/validationSummaryPlacement';
import { ReferoProps } from '@/types/referoProps';

import Loader from '@helsenorge/designsystem-react/components/Loader';

import FormButtons from './formButtons/formButtons';
import { ValidationSummary } from './validation/validation-summary';
import { Resources } from '@/util/resources';
import { buttonOrderMicrowebStep } from '@/types/formTypes/formButton';

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
  const onSubmitReactHookForm: SubmitHandler<FieldValues> = (): void => {
    onSubmit();
  };
  const onErrorReactHookForm = (errors: FieldValues): void => {
    if (onFieldsNotCorrectlyFilledOut && errors) {
      onFieldsNotCorrectlyFilledOut();
    }
  };
  const displayPauseButtonInNormalView = referoProps.onSave ? onSave : undefined;
  const displayPauseButtonInStepView = displayPreviousButton ? previousStep : undefined;
  const displayValidationSummaryOnTop: boolean =
    !validationSummaryPlacement || validationSummaryPlacement === ValidationSummaryPlacement.Top;

  if (referoProps.blockSubmit) {
    return <Loader size={'medium'} overlay={'parent'} color="black" />;
  }

  const handleNextStep: SubmitHandler<FieldValues> = (): void => {
    if (nextStep) {
      nextStep();
    }
  };

  const cancelButtonClicked = (): void => {
    if (referoProps.customNavigationCallBack) {
      referoProps.customNavigationCallBack('cancel', undefined);
    }
  };

  const backButtonClicked = (): void => {
    if (referoProps.customNavigationCallBack) {
      referoProps.customNavigationCallBack('back', undefined);
    }
  };

  return (
    <>
      <form onSubmit={methods.handleSubmit(onSubmitReactHookForm, onErrorReactHookForm)}>
        {displayValidationSummaryOnTop && <ValidationSummary resources={resources} />}
        {children}
        {!displayValidationSummaryOnTop && <ValidationSummary resources={resources} />}
      </form>

      {referoProps.customProps?.isMicroweb && (
        <FormButtons
          isStepView={false}
          submitButtonText={resources?.microwebstep_navigasjon_neste_button || 'Neste'}
          cancelButtonText={resources?.microwebstep_navigasjon_avbryt_button || 'Avbryt'}
          pauseButtonText={resources?.microwebstep_navigasjon_tilbake_button || 'Tilbake'}
          onSubmitButtonClicked={methods.handleSubmit(onSubmitReactHookForm, onErrorReactHookForm)}
          onCancelButtonClicked={cancelButtonClicked}
          onPauseButtonClicked={backButtonClicked}
          isAuthorized={isAuthorized}
          loginButton={referoProps.loginButton}
          overrideButtonOrder={buttonOrderMicrowebStep}
          isMicrowebStep={true}
        />
      )}

      {referoProps.customProps?.isMicroweb === undefined && (
        <FormButtons
          isStepView={isStepView}
          submitButtonText={displayNextButton && resources.nextStep ? resources.nextStep : resources.formSend}
          cancelButtonText={resources.formCancel}
          pauseButtonText={displayPreviousButton && isStepView ? resources.previousStep || 'Lagre' : resources.formSave}
          submitButtonDisabled={referoProps.submitButtonDisabled}
          pauseButtonDisabled={referoProps.saveButtonDisabled}
          onSubmitButtonClicked={
            displayNextButton
              ? methods.handleSubmit(handleNextStep, onErrorReactHookForm)
              : methods.handleSubmit(onSubmitReactHookForm, onErrorReactHookForm)
          }
          onCancelButtonClicked={(): void => {
            referoProps.onCancel && referoProps.onCancel();
          }}
          onPauseButtonClicked={isStepView ? displayPauseButtonInStepView : displayPauseButtonInNormalView}
          isAuthorized={isAuthorized}
          loginButton={referoProps.loginButton}
        />
      )}
    </>
  );
};

export default RenderForm;
