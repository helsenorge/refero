import React from 'react';

import { FieldValues, SubmitHandler, useFormContext, UseFormReturn } from 'react-hook-form';

import { ValidationSummaryPlacement } from '../types/formTypes/validationSummaryPlacement';

import Loader from '@helsenorge/designsystem-react/components/Loader';
import ValidationSummary from '@helsenorge/designsystem-react/components/Validation';
import { ValidationErrors } from '@helsenorge/designsystem-react/components/Validation/types';

import FormButtons from './formButtons/formButtons';

import { useAppSelector } from '@/reducers';
import { getFormDefinition } from '@/reducers/form';
import { ReferoProps } from '@/types/referoProps';
import { getPresentationButtonsExtension } from '@/util/extension';
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
  setStepIndex?: (index: number) => void;
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
  setStepIndex,
}: RenderFormProps): JSX.Element | null => {
  const formDefinition = useAppSelector(state => getFormDefinition(state));
  const { formState } = useFormContext();
  if (referoProps.blockSubmit) {
    return <Loader size={'medium'} overlay={'parent'} color="black" />;
  }

  const presentationButtonsType = getPresentationButtonsExtension(formDefinition?.Content);
  const displayValidationSummaryOnTop: boolean =
    !validationSummaryPlacement || validationSummaryPlacement === ValidationSummaryPlacement.Top;
  const pauseButtonText = displayPreviousButton && isStepView ? resources.previousStep || 'Lagre' : resources.formSave;
  const submitButtonText = displayNextButton && resources.nextStep ? resources.nextStep : resources.formSend;
  const displayPauseButtonInNormalView = referoProps.onSave ? onSave : undefined;
  const displayPauseButtonInStepView = displayPreviousButton ? previousStep : undefined;

  const { errors } = formState;
  const errorsExist = Object.keys(errors).length > 0;
  const setNewStepIndex = (index: number): void => {
    if (setStepIndex) {
      setStepIndex(index);
    }
  };
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
        {displayValidationSummaryOnTop && !referoProps.hideValidationSummary && errorsExist && (
          <ValidationSummary
            testId={'validation-summary'}
            errorTitle={resources.validationSummaryHeader}
            errors={errors as ValidationErrors}
          />
        )}
        {children}
        {!displayValidationSummaryOnTop && !referoProps.hideValidationSummary && errorsExist && (
          <ValidationSummary
            testId={'validation-summary'}
            errorTitle={resources.validationSummaryHeader}
            errors={errors as ValidationErrors}
          />
        )}
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
          setNewStepIndex,
          presentationButtonsType,
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
