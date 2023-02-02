import * as React from 'react';
import Form from '@helsenorge/form/components/form';
import { ReferoProps } from '../components/index';
import { Resources } from '../util/resources';

interface StepViewProps {
  referoProps: ReferoProps;
  resources: Resources;
  renderFormItems: () => Array<JSX.Element> | Array<Array<JSX.Element>> | undefined;
}

const StepView = ({ referoProps, resources, renderFormItems }: StepViewProps) => {

  const stepIndex = 0;
  const formItems = renderFormItems();

  return (
    <>
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
        {formItems && formItems[0][stepIndex]}
      </Form>
    </>
  );
};

export default StepView;
