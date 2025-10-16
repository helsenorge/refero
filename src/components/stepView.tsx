import React from 'react';

import { UseFormReturn } from 'react-hook-form';

import { ReferoProps } from '../types/referoProps';

import RenderForm from './renderForm';
import { getFormDefinition } from '../reducers/form';
import { getTopLevelElements } from '../util/getTopLevelElements';
import { Resources } from '../util/resources';
import RenderQuestionnaireItems from './createQuestionnaire/GenerateQuestionnaireComponents';

import { useExternalRenderContext } from '@/context/externalRender/useExternalRender';
import { useCheckIfEnabled } from '@/hooks/useIsEnabled';
import { useSetFocusOnFirstElement } from '@/hooks/useSetFocusOnFirstElement';
import { useAppSelector } from '@/reducers';
import { createPathForItem } from '@/util/refero-core';
import { DefaultValues } from '@/validation/defaultFormValues';

interface StepViewProps {
  isAuthorized: boolean;
  referoProps: ReferoProps;
  resources: Resources;
  onSave: () => void;
  onSubmit: () => void;
  methods: UseFormReturn<DefaultValues, unknown, DefaultValues>;
}

const StepView = ({ isAuthorized, referoProps, resources, onSubmit, methods }: StepViewProps): JSX.Element | null => {
  const formDefinition = useAppSelector(state => getFormDefinition(state));
  const [stepIndex, setStepIndex] = React.useState(0);
  const { onStepChange } = useExternalRenderContext();
  const isEnabled = useCheckIfEnabled();
  const stepContainerRef = useSetFocusOnFirstElement(stepIndex);
  const topLevelElements = getTopLevelElements(formDefinition) || [];
  const visibleElements = topLevelElements.filter(topLevelElement => {
    return isEnabled(topLevelElement, createPathForItem(undefined, topLevelElement));
  });

  const nextStep = (): void => {
    setStepIndex(prevIndex => (prevIndex < visibleElements.length - 1 ? prevIndex + 1 : prevIndex));
  };

  const previousStep = (): void => {
    setStepIndex(prevIndex => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
  };

  React.useEffect(() => {
    if (onStepChange) {
      onStepChange(stepIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex]);

  if (visibleElements.length === 0) {
    return null;
  }

  return (
    <div ref={stepContainerRef}>
      <RenderForm
        isAuthorized={isAuthorized}
        isStepView={true}
        referoProps={referoProps}
        setStepIndex={setStepIndex}
        resources={resources}
        onSubmit={onSubmit}
        displayNextButton={stepIndex !== visibleElements.length - 1}
        displayPreviousButton={stepIndex > 0}
        nextStep={nextStep}
        previousStep={previousStep}
        methods={methods}
        onFieldsNotCorrectlyFilledOut={referoProps.onFieldsNotCorrectlyFilledOut}
      >
        <RenderQuestionnaireItems items={[visibleElements[stepIndex]]} pdf={false} />
      </RenderForm>
    </div>
  );
};

export default StepView;
