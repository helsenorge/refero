import * as React from 'react';

import { FieldValues, SubmitHandler, useFormContext } from 'react-hook-form';

import { ReferoProps } from '../types/referoProps';

import Loader from '@helsenorge/designsystem-react/components/Loader';

import FormButtons from './formButtons/formButtons';
import { Resources } from '../util/resources';
import { FormProps } from '../validation/ReactHookFormHoc';
import { ValidationSummaryPlacement } from '../types/formTypes/validationSummaryPlacement';
import { ValidationSummary } from './validation-summary';

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
  methods: FormProps;
  validationSummaryPlacement?: ValidationSummaryPlacement;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // methods: UseFormReturn<FieldValues, any, undefined>;
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
  validationSummaryPlacement
}: // methods,
RenderFormProps): JSX.Element | null => {
  const { formState } = useFormContext();
  const errors = formState.errors;

  //data: QuestionnaireResponse, e: React.FormEvent
  const onSubmitReactHookForm: SubmitHandler<FieldValues> = (): void => {
    // console.log('data', JSON.stringify(data, null, 2));
    // console.log('e', e);
    // return false;
    // onSubmit();
  };
  
  const displayPauseButtonInNormalView = referoProps.onSave ? onSave : undefined;
  const displayPauseButtonInStepView = displayPreviousButton ? previousStep : undefined;
  const displayValidationSummaryOnTop: boolean =
  !validationSummaryPlacement || validationSummaryPlacement === ValidationSummaryPlacement.Top;
  const validationSummary = <ValidationSummary resources={resources} errors={errors} />;

  if (referoProps.blockSubmit) {
    return <Loader size={'medium'} overlay={'parent'} />;
  }
  return (
    <form onSubmit={methods.handleSubmit(onSubmitReactHookForm)}>
      {/* <Validation errorSummary="test" /> */}
      {displayValidationSummaryOnTop && validationSummary}
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
        }}
        onPauseButtonClicked={isStepView ? displayPauseButtonInStepView : displayPauseButtonInNormalView}
        isHelsenorgeForm={!!isHelsenorgeForm}
      />
      {!displayValidationSummaryOnTop && validationSummary}
    </form>
  );
};

export default RenderForm;