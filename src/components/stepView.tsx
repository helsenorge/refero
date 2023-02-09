import * as React from 'react';
import Form from '@helsenorge/form/components/form';
import { Resources } from '../util/resources';
import { getGroupsWithCodeStep } from '../util/getGroupsWithCodeStep';
import { FormDefinition } from '../reducers/form';

interface StepViewProps {
  isAuthorized: boolean;
  referoProps: any;
  resources: Resources;
  formItems: Array<JSX.Element> | undefined;
  formDefinition: FormDefinition;
  onStepChange?: (stepIndex: number) => void;
}

const StepView = ({ isAuthorized, referoProps, resources, formItems, formDefinition, onStepChange }: StepViewProps) => {
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

  const stepArrayLength = stepArray.length -1;
  const nextStep = (): void => {
    setStepIndex(stepIndex < stepArrayLength ? stepIndex + 1 : stepIndex);
  }
  const previousStep = (): void => {
    setStepIndex(stepIndex > 0 ? stepIndex - 1 : stepIndex);
  }

  React.useEffect(() => {
    onStepChange && onStepChange(stepIndex);
  }, [stepIndex]);

  return (
    <>
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
      <button onClick={previousStep}>{'Forrige'}</button>
    </>
  );
};

export default StepView;
