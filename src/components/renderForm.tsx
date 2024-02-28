import * as React from 'react';

import { QuestionnaireResponse } from 'fhir/r4';
import { FieldValues, UseFormReturn } from 'react-hook-form';

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
  const displayPauseButtonInNormalView = referoProps.onSave ? onSave : undefined;
  const displayPauseButtonInStepView = displayPreviousButton ? previousStep : undefined;

  const handleInvalidForm = (FieldValues: FieldValues, e: React.FormEvent): void => {
    e.preventDefault();
    console.log('Invalid FieldValues', FieldValues);
    onFieldsNotCorrectlyFilledOut && onFieldsNotCorrectlyFilledOut();
  };

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
      {React.Children.map(children as JSX.Element[], child => {
        return child && child.props && child?.props?.name
          ? React.createElement(child.type, { ...child.props, register: methods.register, key: child.props?.name })
          : child;
      })}
      <FormButtons
        isStepView={isStepView}
        submitButtonText={displayNextButton && resources.nextStep ? resources.nextStep : resources.formSend}
        cancelButtonText={resources.formCancel}
        pauseButtonText={displayPreviousButton && resources.previousStep ? resources.previousStep : resources.formSave}
        submitButtonDisabled={referoProps.blockSubmit}
        pauseButtonDisabled={referoProps.saveButtonDisabled}
        onSubmitButtonClicked={displayNextButton ? nextStep : methods.handleSubmit(onSubmitReactHookForm)}
        onCancelButtonClicked={referoProps.onCancel}
        onPauseButtonClicked={isStepView ? displayPauseButtonInStepView : displayPauseButtonInNormalView}
        isHelsenorgeForm={isHelsenorgeForm && isHelsenorgeForm}
      ></FormButtons>
    </form>
  );
};

export default RenderForm;
