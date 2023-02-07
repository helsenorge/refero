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
  const [stepIndex, setStepIndex] = React.useState(0);
  const emptyArrat: Array<JSX.Element> | undefined = [];

  const test = getGroupsWithCodeStep(formDefinition);
  formItems?.filter(object =>
    test?.find(group => {
      if (group.linkId === object.key) {
        emptyArrat.push(object);
      }
    })
  );

  console.log("STEPVIEW KALT");

  return (
    <>
    <Progressbar value={stepIndex} max={emptyArrat.length}></Progressbar>
    {
      isAuthorized ? (
        <Form
            action="#"
            disabled={referoProps.blockSubmit}
            submitButtonText={resources.formSend}
            errorMessage={resources.formError}
            onSubmit={referoProps.onSubmit}
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
            {emptyArrat && emptyArrat[stepIndex]}
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
        {emptyArrat && emptyArrat[stepIndex]}
      </Form>
      )
    }
      <button onClick={() => setStepIndex(1)}>{'Neste'}</button>
      <button onClick={() => setStepIndex(0)}>{'Forrige'}</button>
    </>
  );
};

export default StepView;
