import React from 'react';

import { FieldValues, SubmitHandler, UseFormReturn } from 'react-hook-form';

import { ValidationSummaryPlacement } from '../types/formTypes/validationSummaryPlacement';

import { CustomFormButtonContainer } from './formButtons/CustomFormButtonContainer';
import { ValidationSummary } from './validation/validation-summary';

import { useAppSelector } from '@/reducers';
import { formHasButtonsInDefinitionSelector } from '@/reducers/selectors';
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

const RenderForm = (props: RenderFormProps): JSX.Element | null => {
  const onSubmitReactHookForm: SubmitHandler<FieldValues> = (): void => {
    props.onSubmit();
  };
  const onErrorReactHookForm = (errors: FieldValues): void => {
    if (props.onFieldsNotCorrectlyFilledOut && errors) {
      props.onFieldsNotCorrectlyFilledOut();
    }
  };

  const displayValidationSummaryOnTop: boolean =
    !props.validationSummaryPlacement || props.validationSummaryPlacement === ValidationSummaryPlacement.Top;
  const formHasButtonsInDefinition = useAppSelector(formHasButtonsInDefinitionSelector);
  return (
    <React.Fragment>
      <form onSubmit={props.methods.handleSubmit(onSubmitReactHookForm, onErrorReactHookForm)}>
        {displayValidationSummaryOnTop && !props.referoProps.hideValidationSummary && <ValidationSummary resources={props.resources} />}
        {props.children}
        {!displayValidationSummaryOnTop && !props.referoProps.hideValidationSummary && <ValidationSummary resources={props.resources} />}
      </form>
      {!formHasButtonsInDefinition && <CustomFormButtonContainer {...props} />}
    </React.Fragment>
  );
};

export default RenderForm;
