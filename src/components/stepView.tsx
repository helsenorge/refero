import React from 'react';

import { FieldValues, UseFormReturn } from 'react-hook-form';

import { ReferoProps } from '../types/referoProps';

import RenderForm from './renderForm';
import { FormDefinition, getFormDefinition } from '../reducers/form';
import { getTopLevelElements } from '../util/getTopLevelElements';
import { Resources } from '../util/resources';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import { useSelector } from 'react-redux';
import { GlobalState } from '@/reducers';
import RenderQuestionnaireItems from './createQuestionnaire/GenerateQuestionnaireComponents';

interface StepViewProps {
  isAuthorized: boolean;
  referoProps: ReferoProps;
  resources: Resources;
  onSave: () => void;
  onSubmit: () => void;
  methods: UseFormReturn<FieldValues, unknown, undefined>;
}

const StepView = ({ isAuthorized, referoProps, resources, onSubmit, methods }: StepViewProps): JSX.Element | null => {
  const formDefinition = useSelector<GlobalState, FormDefinition | null>((state: GlobalState) => getFormDefinition(state));
  const [stepIndex, setStepIndex] = React.useState(0);
  const { onStepChange } = useExternalRenderContext();

  const topLevelElements = getTopLevelElements(formDefinition) || [];

  const nextStep = (): void => {
    setStepIndex(prevIndex => (prevIndex < topLevelElements.length - 1 ? prevIndex + 1 : prevIndex));
  };

  const previousStep = (): void => {
    setStepIndex(prevIndex => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
  };

  React.useEffect(() => {
    if (onStepChange) {
      onStepChange(stepIndex);
      window.scrollTo(0, 0);
    }
  }, [stepIndex]);

  if (topLevelElements.length === 0) {
    return null;
  }

  return (
    <>
      <RenderForm
        isAuthorized={isAuthorized}
        isStepView={true}
        referoProps={referoProps}
        resources={resources}
        onSubmit={onSubmit}
        displayNextButton={stepIndex !== topLevelElements.length - 1}
        displayPreviousButton={stepIndex > 0}
        nextStep={nextStep}
        previousStep={previousStep}
        methods={methods}
        onFieldsNotCorrectlyFilledOut={referoProps.onFieldsNotCorrectlyFilledOut}
      >
        <RenderQuestionnaireItems items={[topLevelElements[stepIndex]]} pdf={false} />
      </RenderForm>
    </>
  );
};

export default StepView;
