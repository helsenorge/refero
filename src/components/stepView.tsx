import * as React from 'react';

import { FieldValues, UseFormReturn } from 'react-hook-form';
import { useSelector } from 'react-redux';

import { ReferoProps } from '../types/referoProps';
import { Resources } from '../types/resources';

import RenderForm from './renderForm';
import { NAVIGATOR_BLINDZONE_ID } from '../constants';
import { getFormDefinition } from '../store/selectors';
import { getTopLevelElements } from '../util/getTopLevelElements';

interface StepViewProps {
  isAuthorized: boolean;
  referoProps: ReferoProps;
  resources: Resources;
  children: Array<JSX.Element> | undefined;
  onSave: () => void;
  onSubmit: () => void;
  onStepChange?: (stepIndex: number) => void;
  isHelsenorgeForm?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  methods: UseFormReturn<FieldValues, any, undefined>;
}

const StepView = ({
  isAuthorized,
  referoProps,
  resources,
  children,
  onSave,
  onSubmit,
  onStepChange,
  isHelsenorgeForm,
  methods,
}: StepViewProps): JSX.Element | null => {
  const stepArray: Array<JSX.Element> | undefined = [];
  const [stepIndex, setStepIndex] = React.useState(0);
  const formDefinition = useSelector(getFormDefinition);
  if (!formDefinition) {
    return null;
  }
  const topLevelElements = getTopLevelElements(formDefinition);
  children?.filter(formItem =>
    topLevelElements?.find(element => {
      if (formItem.props.id !== NAVIGATOR_BLINDZONE_ID && formItem.props.item.linkId === element.linkId) {
        stepArray.push(formItem);
      }
    })
  );

  const stepArrayLength = stepArray.length - 1;
  const nextStep = (): void => {
    setStepIndex(stepIndex < stepArrayLength ? stepIndex + 1 : stepIndex);
  };
  const previousStep = (): void => {
    setStepIndex(stepIndex > 0 ? stepIndex - 1 : stepIndex);
  };

  React.useEffect(() => {
    onStepChange && onStepChange(stepIndex);
    window.scrollTo(0, 0);
  }, [stepIndex]);

  return (
    <RenderForm
      isAuthorized={isAuthorized}
      isStepView={true}
      referoProps={referoProps}
      resources={resources}
      onSave={onSave}
      onSubmit={onSubmit}
      displayNextButton={stepIndex !== stepArrayLength}
      displayPreviousButton={stepIndex > 0}
      nextStep={nextStep}
      previousStep={previousStep}
      isHelsenorgeForm={isHelsenorgeForm && isHelsenorgeForm}
      methods={methods}
    >
      {stepArray[stepIndex]}
    </RenderForm>
  );
};

export default StepView;
