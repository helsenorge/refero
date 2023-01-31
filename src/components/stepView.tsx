import * as React from 'react';
import Form from '@helsenorge/form/components/form';
import { ReferoProps } from '../components/index';
import { Resources } from '../util/resources';
import { FormDefinition } from '../reducers/form';

interface StepViewProps {
  referoProps: ReferoProps;
  resources: Resources;
  renderFormItems: () => Array<JSX.Element> | undefined;
}

const StepView = ({ referoProps, resources, renderFormItems }: StepViewProps) => {

  const getGroupsWithCodeStep = (formDefinition: FormDefinition) => {
    const groupArray = formDefinition.Content?.item?.filter(qItem =>
      qItem.extension?.find(extension => extension.valueCodeableConcept?.coding?.find(coding => coding.code === 'step'))
    );
    return groupArray;
  }

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
        {renderFormItems()}
      </Form>
    </>
  );
};

export default StepView;
