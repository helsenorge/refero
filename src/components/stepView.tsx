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
import RenderQuestionnaireItems from './QuestionnaireItems';
import { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { Path } from '@/util/refero-core';

interface StepViewProps {
  isAuthorized: boolean;
  referoProps: ReferoProps;
  resources: Resources;
  onSave: () => void;
  onSubmit: () => void;
  methods: UseFormReturn<FieldValues, unknown, undefined>;
  onAnswerChange: (newState: GlobalState, path: Path[], item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
}

const StepView = ({
  isAuthorized,
  referoProps,
  resources,
  onSave,
  onSubmit,
  methods,
  onAnswerChange,
}: StepViewProps): JSX.Element | null => {
  const formDefinition = useSelector<GlobalState, FormDefinition | null>((state: GlobalState) => getFormDefinition(state));
  const [stepIndex, setStepIndex] = React.useState(0);
  const { onStepChange } = useExternalRenderContext();

  // Get the top-level elements (excluding sidebars) from the form definition
  const topLevelElements = getTopLevelElements(formDefinition) || []; // Ensure it's always an array

  // Navigate to the next step
  const nextStep = (): void => {
    setStepIndex(prevIndex => (prevIndex < topLevelElements.length - 1 ? prevIndex + 1 : prevIndex));
  };

  // Navigate to the previous step
  const previousStep = (): void => {
    setStepIndex(prevIndex => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
  };

  // Handle step change side effects
  React.useEffect(() => {
    if (onStepChange) {
      onStepChange(stepIndex);
    }
    window.scrollTo(0, 0); // Scroll to top when step changes
  }, [stepIndex, onStepChange]);

  // If there are no top-level elements, return null
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
        onSave={onSave}
        onSubmit={onSubmit}
        displayNextButton={stepIndex !== topLevelElements.length - 1}
        displayPreviousButton={stepIndex > 0}
        nextStep={nextStep}
        previousStep={previousStep}
        methods={methods}
      >
        <RenderQuestionnaireItems {...referoProps} items={[topLevelElements[stepIndex]]} pdf={false} onAnswerChange={onAnswerChange} />
      </RenderForm>
    </>
  );
};

export default StepView;

// import React from 'react';

// import { FieldValues, UseFormReturn } from 'react-hook-form';

// import { ReferoProps } from '../types/referoProps';

// import RenderForm from './renderForm';
// import { NAVIGATOR_BLINDZONE_ID } from '../constants';
// import { FormDefinition } from '../reducers/form';
// import { getTopLevelElements } from '../util/getTopLevelElements';
// import { Resources } from '../util/resources';
// import { useExternalRenderContext } from '@/context/externalRenderContext';

// interface StepViewProps {
//   isAuthorized: boolean;
//   referoProps: ReferoProps;
//   resources: Resources;
//   formItems: JSX.Element[] | undefined;
//   formDefinition: FormDefinition;
//   onSave: () => void;
//   onSubmit: () => void;
//   methods: UseFormReturn<FieldValues, unknown, undefined>;
// }

// const StepView = ({
//   isAuthorized,
//   referoProps,
//   resources,
//   formItems,
//   formDefinition,
//   onSave,
//   onSubmit,
//   methods,
// }: StepViewProps): JSX.Element | null => {
//   const stepArray: Array<JSX.Element> | undefined = [];
//   const [stepIndex, setStepIndex] = React.useState(0);
//   const { onStepChange } = useExternalRenderContext();
//   const topLevelElements = getTopLevelElements(formDefinition);
//   formItems?.filter(formItem =>
//     topLevelElements?.find(element => {
//       if (formItem.props.id !== NAVIGATOR_BLINDZONE_ID && formItem.props.item.linkId === element.linkId) {
//         stepArray.push(formItem);
//       }
//     })
//   );

//   const stepArrayLength = stepArray.length - 1;
//   const nextStep = (): void => {
//     setStepIndex(stepIndex < stepArrayLength ? stepIndex + 1 : stepIndex);
//   };
//   const previousStep = (): void => {
//     setStepIndex(stepIndex > 0 ? stepIndex - 1 : stepIndex);
//   };

//   React.useEffect(() => {
//     onStepChange && onStepChange(stepIndex);
//     window.scrollTo(0, 0);
//   }, [stepIndex]);

//   return (
//     <>
//       <RenderForm
//         isAuthorized={isAuthorized}
//         isStepView={true}
//         referoProps={referoProps}
//         resources={resources}
//         onSave={onSave}
//         onSubmit={onSubmit}
//         displayNextButton={stepIndex !== stepArrayLength}
//         displayPreviousButton={stepIndex > 0}
//         nextStep={nextStep}
//         previousStep={previousStep}
//         methods={methods}
//       >
//         {stepArray[stepIndex]}
//       </RenderForm>
//     </>
//   );
// };

// export default StepView;
