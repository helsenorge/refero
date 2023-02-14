import * as React from 'react';
import { Resources } from '../util/resources';
import { getGroupsWithCodeStep } from '../util/getGroupsWithCodeStep';
import { FormDefinition } from '../reducers/form';
import RenderForm from './renderForm';
import { ReferoProps } from '../types/referoProps';

interface StepViewProps {
  isAuthorized: boolean;
  referoProps: ReferoProps;
  resources: Resources;
  formItems: Array<JSX.Element> | undefined;
  formDefinition: FormDefinition;
  onSave: () => void;
  onSubmit: () => void;
  onStepChange?: (stepIndex: number) => void;
}

const StepView = ({ isAuthorized, referoProps, resources, formItems, formDefinition, onSave, onSubmit, onStepChange }: StepViewProps) => {
  const stepArray: Array<JSX.Element> | undefined = [];
  const [stepIndex, setStepIndex] = React.useState(0);

  const groupsWithCodeStep = getGroupsWithCodeStep(formDefinition);
  formItems?.filter(formItem =>
    groupsWithCodeStep?.find(group => {
      if (group.linkId === formItem.key) {
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
  }, [stepIndex]);

  return (
    <>
      <RenderForm
        isAuthorized={isAuthorized}
        isStepView={true}
        referoProps={referoProps}
        resources={resources}
        formItemsToBeRendered={stepArray[stepIndex]}
        onSave={onSave}
        onSubmit={onSubmit}
        displayNextButton={stepIndex !== stepArrayLength}
        displayPreviousButton={stepIndex > 0}
        nextStep={nextStep}
        previousStep={previousStep}
      />
    </>
  );
};

export default StepView;
