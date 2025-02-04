import React from 'react';

import { FieldValues, SubmitHandler, UseFormReturn } from 'react-hook-form';

import { ValidationSummaryPlacement } from '../types/formTypes/validationSummaryPlacement';

import Loader from '@helsenorge/designsystem-react/components/Loader';

import FormButtons from './formButtons/formButtons';
import { ValidationSummary } from './validation/validation-summary';

import { buttonOrderMicrowebStep } from '@/types/formTypes/formButton';
import { ReferoProps } from '@/types/referoProps';
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
  const pauseButtonText = referoProps.customProps?.isMicroweb
    ? resources?.microwebstep_navigasjon_tilbake_button || 'Tilbake'
    : displayPreviousButton && isStepView
      ? resources.previousStep || 'Lagre'
      : resources.formSave;
  const onSubmitButtonClicked = referoProps.customProps?.isMicroweb
    ? methods.handleSubmit(onSubmitReactHookForm, onErrorReactHookForm)
    : displayNextButton
      ? methods.handleSubmit(handleNextStep, onErrorReactHookForm)
      : methods.handleSubmit(onSubmitReactHookForm, onErrorReactHookForm);
  const cancelButtonText = referoProps.customProps?.isMicroweb
    ? resources?.microwebstep_navigasjon_avbryt_button || 'Avbryt'
    : resources.formCancel;
  const submitButtonText = referoProps.customProps?.isMicroweb
    ? resources?.microwebstep_navigasjon_neste_button || 'Neste'
    : displayNextButton && resources.nextStep
      ? resources.nextStep
      : resources.formSend;
  const onPauseButtonClicked = referoProps.customProps?.isMicroweb
    ? backButtonClicked
    : isStepView
      ? displayPauseButtonInStepView
      : displayPauseButtonInNormalView;
  const isStepViewProp = referoProps.customProps?.isMicroweb ? false : isStepView;
  const submitButtonDisabled = referoProps.customProps?.isMicroweb ? undefined : referoProps.submitButtonDisabled;
  const pauseButtonDisabled = referoProps.customProps?.isMicroweb ? undefined : referoProps.saveButtonDisabled;
  const onCancelButtonClicked = referoProps.customProps?.isMicroweb ? cancelButtonClicked : referoProps.onCancel;
  const overrideButtonOrder = referoProps.customProps?.isMicroweb ? buttonOrderMicrowebStep : undefined;
  return (
    <React.Fragment>
      <form onSubmit={methods.handleSubmit(onSubmitReactHookForm, onErrorReactHookForm)}>
        {displayValidationSummaryOnTop && <ValidationSummary resources={resources} />}
        {children}
        {!displayValidationSummaryOnTop && <ValidationSummary resources={resources} />}
      </form>

      {referoProps.customProps?.isMicroweb && !referoProps.renderCustomActionButtons ? (
        <FormButtons
          isStepView={false}
          submitButtonText={'Neste'}
          cancelButtonText={'Avbryt'}
          pauseButtonText={'Tilbake'}
          onSubmitButtonClicked={methods.handleSubmit(onSubmitReactHookForm, onErrorReactHookForm)}
          onCancelButtonClicked={cancelButtonClicked}
          onPauseButtonClicked={backButtonClicked}
          isAuthorized={isAuthorized}
          loginButton={referoProps.loginButton}
          overrideButtonOrder={buttonOrderMicrowebStep}
          isMicrowebStep={true}
          cancelUrl={referoProps.customProps?.cancelUrl as string | undefined}
          hideBackButton={referoProps.customProps?.hideBackButton as boolean | undefined}
        />
      ) : null}

      {!referoProps.customProps?.isMicroweb &&
        (referoProps.renderCustomActionButtons ? (
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
            isStepView={isStepViewProp}
            submitButtonText={submitButtonText}
            cancelButtonText={cancelButtonText}
            pauseButtonText={pauseButtonText}
            submitButtonDisabled={submitButtonDisabled}
            pauseButtonDisabled={pauseButtonDisabled}
            onSubmitButtonClicked={onSubmitButtonClicked}
            onCancelButtonClicked={onCancelButtonClicked}
            onPauseButtonClicked={onPauseButtonClicked}
            isAuthorized={isAuthorized}
            loginButton={referoProps.loginButton}
            overrideButtonOrder={overrideButtonOrder}
            isMicrowebStep={!!referoProps.customProps?.isMicroweb}
          />
        ))}
    </React.Fragment>
  );
};

export default RenderForm;
