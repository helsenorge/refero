import * as React from 'react';

import { QuestionnaireResponse } from 'fhir/r4';
import { FieldValues, SubmitHandler, UseFormReturn, useFormContext } from 'react-hook-form';

import { ValidationSummaryPlacement } from '../types/formTypes/validationSummaryPlacement';
import { ReferoProps } from '../types/referoProps';

import Loader from '@helsenorge/designsystem-react/components/Loader';

import FormButtons from './formButtons/formButtons';
import { ValidationSummary } from './validation-summary';
import { Resources } from '../util/resources';

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
  isHelsenorgeForm,
  children,
  methods,
  validationSummaryPlacement,
}: // methods,
RenderFormProps): JSX.Element | null => {
  const {
    formState: { errors, defaultValues, dirtyFields },
    getValues,
  } = useFormContext();

  const onSubmitReactHookForm: SubmitHandler<FieldValues> = (data: QuestionnaireResponse, e: React.FormEvent): void => {
    console.log('data', JSON.stringify(data, null, 2));
    console.log('e', e);
    onSubmit();
  };

  const displayPauseButtonInNormalView = referoProps.onSave ? onSave : undefined;
  const displayPauseButtonInStepView = displayPreviousButton ? previousStep : undefined;
  const displayValidationSummaryOnTop: boolean =
    !validationSummaryPlacement || validationSummaryPlacement === ValidationSummaryPlacement.Top;

  if (referoProps.blockSubmit) {
    return <Loader size={'medium'} overlay={'parent'} />;
  }
  // const value = getValues();
  // console.log(value, 'values');
  // console.log(defaultValues, 'defaultValues');
  // console.log(dirtyFields, 'dirtyFields');

  return (
    <form onSubmit={methods.handleSubmit(onSubmitReactHookForm)}>
      {/* <Validation errorSummary="test" /> */}
      {displayValidationSummaryOnTop && <ValidationSummary resources={resources} errors={errors} />}
      {children}
      <FormButtons
        isStepView={isStepView}
        submitButtonText={displayNextButton && resources.nextStep ? resources.nextStep : resources.formSend}
        cancelButtonText={resources.formCancel}
        pauseButtonText={displayPreviousButton && resources.previousStep ? resources.previousStep : resources.formSave}
        submitButtonDisabled={referoProps.blockSubmit}
        pauseButtonDisabled={referoProps.saveButtonDisabled}
        onSubmitButtonClicked={displayNextButton ? nextStep : methods.handleSubmit(onSubmitReactHookForm)}
        onCancelButtonClicked={(): void => {
          referoProps.onCancel && referoProps.onCancel();
        }}
        onPauseButtonClicked={isStepView ? displayPauseButtonInStepView : displayPauseButtonInNormalView}
        isHelsenorgeForm={!!isHelsenorgeForm}
      />
      {!displayValidationSummaryOnTop && <ValidationSummary resources={resources} errors={errors} />}
    </form>
  );
};

export default RenderForm;
