import * as React from 'react';
import Form from '@helsenorge/form/components/form';
import { Resources } from '../util/resources';
import { getGroupsWithCodeStep } from '../util/getGroupsWithCodeStep';
import { FormDefinition } from '../reducers/form';
import Progressbar from '@helsenorge/designsystem-react/components/Progressbar';

interface StepViewProps {
  isAuthorized: boolean;
  referoProps: any;
  resources: Resources;
  formItems: Array<JSX.Element> | undefined;
  formDefinition: FormDefinition;
}

const StepView = ({ isAuthorized, referoProps, resources, formItems, formDefinition }: StepViewProps) => {
  const stepArray: Array<JSX.Element> | undefined = [];
  const [stepIndex, setStepIndex] = React.useState(0);

  const groupsWithCodeStep = getGroupsWithCodeStep(formDefinition);
  formItems?.filter(object =>
    groupsWithCodeStep?.find(group => {
      if (group.linkId === object.key) {
        stepArray.push(object);
      }
    })
  );

  const stepArrayLength = stepArray.length -1;
  const nextStep = (): void => {
    setStepIndex(stepIndex < stepArrayLength ? stepIndex + 1 : stepIndex);
  }
  const previousStep = (): void => {
    setStepIndex(stepIndex < stepArrayLength ? stepIndex + 1 : stepIndex);
  }

  return (
    <>
      <Progressbar value={stepIndex} max={stepArray.length - 1}></Progressbar>
      {isAuthorized ? (
        <Form
          action="#"
          disabled={referoProps.blockSubmit}
          submitButtonText={stepIndex !== stepArrayLength ? 'Neste' : resources.formSend}
          errorMessage={resources.formError}
          onSubmit={stepIndex !== stepArrayLength ? nextStep : referoProps.onSubmit}
          requiredLabel={resources.formRequired}
          optionalLabel={resources.formOptional}
          cancelButtonText={resources.formCancel}
          pauseButtonText={resources.formSave ? resources.formSave : 'Lagre'}
          onPause={referoProps.onSave ? referoProps.onSave : undefined}
          pauseButtonClasses={'page_refero__pausebutton'}
          pauseButtonType="display"
          submitButtonType="display"
          cancelButtonType="display"
          pauseButtonLevel="secondary"
          cancelButtonRight={true}
          onCancel={referoProps.onCancel}
          buttonClasses="page_refero__saveblock"
          validationSummaryPlacement={referoProps.validationSummaryPlacement}
          validationSummary={{
            enable: true,
            header: resources.validationSummaryHeader,
          }}
          submitButtonDisabled={referoProps.submitButtonDisabled}
          pauseButtonDisabled={referoProps.saveButtonDisabled}
          onFieldsNotCorrectlyFilledOut={referoProps.onFieldsNotCorrectlyFilledOut}
        >
          {stepArray && stepArray[stepIndex]}
        </Form>
      ) : (
        <Form
          action="#"
          disabled={referoProps.blockSubmit}
          errorMessage={resources.formError}
          requiredLabel={resources.formRequired}
          optionalLabel={resources.formOptional}
          triggerPreventDefaultOnSubmit
          validationSummaryPlacement={referoProps.validationSummaryPlacement}
          validationSummary={{
            enable: true,
            header: resources.validationSummaryHeader,
          }}
          submitButtonDisabled={referoProps.submitButtonDisabled}
          pauseButtonDisabled={referoProps.saveButtonDisabled}
          onFieldsNotCorrectlyFilledOut={referoProps.onFieldsNotCorrectlyFilledOut}
        >
          {stepArray && stepArray[stepIndex]}
        </Form>
      )}
      <button onClick={() => setStepIndex(stepIndex < stepArrayLength ? stepIndex + 1 : stepIndex)}>{'Neste'}</button>
      <button onClick={() => setStepIndex(stepIndex > 0 ? stepIndex - 1 : stepIndex)}>{'Forrige'}</button>
    </>
  );
};

export default StepView;
