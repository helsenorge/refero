import React from 'react';

import type { ReferoProps } from '../types/referoProps';
import type { Resources } from '../util/resources';
import type { DefaultValues } from '@/validation/defaultFormValues';
import type { UseFormReturn } from 'react-hook-form';

import RenderForm from './renderForm';
import { getFormData, getFormDefinition } from '../reducers/form';
import { getTopLevelElements } from '../util/getTopLevelElements';
import RenderQuestionnaireItems from './createQuestionnaire/GenerateQuestionnaireComponents';

import {
  QUESTIONNAIRERESPONSE_UISTATE_STEP_INDEX_URL,
  QUESTIONNAIRERESPONSE_UISTATE_UPDATED_AT_URL,
  QUESTIONNAIRERESPONSE_UISTATE_URL,
} from '@/constants/extensions';
import { useExternalRenderContext } from '@/context/externalRender/useExternalRender';
import { useFormViewChange } from '@/hooks/useFormViewChange';
import { useCheckIfEnabled } from '@/hooks/useIsEnabled';
import { useAppDispatch, useAppSelector } from '@/reducers';
import { actions } from '@/reducers/form';
import { createPathForItem } from '@/util/refero-core';

interface StepViewProps {
  isAuthorized: boolean;
  referoProps: ReferoProps;
  resources: Resources;
  onSave: () => void;
  onSubmit: () => void;
  methods: UseFormReturn<DefaultValues, unknown, DefaultValues>;
}

const StepView = ({ isAuthorized, referoProps, resources, onSubmit, methods, onSave }: StepViewProps): React.JSX.Element | null => {
  const formDefinition = useAppSelector(state => getFormDefinition(state));
  const dispatch = useAppDispatch();
  const storedStepValue = useAppSelector(
    state =>
      getFormData(state)
        ?.Content?.meta?.extension?.find(ext => ext.url === QUESTIONNAIRERESPONSE_UISTATE_URL)
        ?.extension?.find(ext => ext.url === QUESTIONNAIRERESPONSE_UISTATE_STEP_INDEX_URL)?.valueCode
  );
  const isExternalUpdate = useAppSelector(state => state.refero.form.FormData.isExternalUpdate);
  const [stepIndex, setStepIndex] = React.useState(Number(storedStepValue) || 0);
  const { onStepChange, onFormViewChange } = useExternalRenderContext();
  const isEnabled = useCheckIfEnabled();
  const stepContainerRef = useFormViewChange(onFormViewChange, stepIndex);
  const topLevelElements = getTopLevelElements(formDefinition) || [];
  const visibleElements = topLevelElements.filter(topLevelElement => {
    return isEnabled(topLevelElement, createPathForItem(undefined, topLevelElement));
  });

  const effectiveStepIndex = visibleElements.length > 0 ? Math.max(0, Math.min(stepIndex, visibleElements.length - 1)) : 0;
  React.useEffect(() => {
    if (effectiveStepIndex !== stepIndex) {
      setStepIndex(effectiveStepIndex);
    }
  }, [effectiveStepIndex, stepIndex]);

  const nextStep = (): void => {
    setStepIndex(prevIndex => (prevIndex < visibleElements.length - 1 ? prevIndex + 1 : prevIndex));
  };

  const previousStep = (): void => {
    setStepIndex(prevIndex => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
  };

  React.useEffect(() => {
    if (isExternalUpdate && storedStepValue !== undefined) {
      const parsed = Number(storedStepValue);
      if (!isNaN(parsed)) {
        setStepIndex(parsed);
      }
    }
  }, [isExternalUpdate, storedStepValue]);

  React.useEffect(() => {
    if (onStepChange) {
      onStepChange(effectiveStepIndex);
    }
    dispatch(
      actions.updateQuestionnaireResponseMetaExtensions({
        extension: [
          {
            url: QUESTIONNAIRERESPONSE_UISTATE_URL,
            extension: [
              {
                url: QUESTIONNAIRERESPONSE_UISTATE_STEP_INDEX_URL,
                valueCode: effectiveStepIndex.toString(),
              },
              {
                url: QUESTIONNAIRERESPONSE_UISTATE_UPDATED_AT_URL,
                valueDateTime: new Date().toISOString(),
              },
            ],
          },
        ],
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveStepIndex]);

  if (visibleElements.length === 0) {
    return null;
  }

  return (
    <div ref={stepContainerRef} tabIndex={-1}>
      <RenderForm
        isAuthorized={isAuthorized}
        isStepView={true}
        referoProps={referoProps}
        setStepIndex={setStepIndex}
        resources={resources}
        onSubmit={onSubmit}
        onSave={onSave}
        displayNextButton={effectiveStepIndex !== visibleElements.length - 1}
        displayPreviousButton={effectiveStepIndex > 0}
        nextStep={nextStep}
        previousStep={previousStep}
        methods={methods}
        onFieldsNotCorrectlyFilledOut={referoProps.onFieldsNotCorrectlyFilledOut}
      >
        <RenderQuestionnaireItems items={[visibleElements[effectiveStepIndex]]} pdf={false} />
      </RenderForm>
    </div>
  );
};

export default StepView;
