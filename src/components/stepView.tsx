import * as React from 'react';
import { Resources } from '../util/resources';
import { getTopLevelElements } from '../util/getTopLevelElements';
import { FormDefinition } from '../reducers/form';
import RenderForm from './renderForm';
import { ReferoProps } from '../types/referoProps';
import { NAVIGATOR_BLINDZONE_ID } from '../constants';

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

  const topLevelElements = getTopLevelElements(formDefinition);
  formItems?.filter(formItem =>
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
    window.scrollTo(0,0);
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
