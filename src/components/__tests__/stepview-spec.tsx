import { Questionnaire } from 'fhir/r4';
import '../../util/__tests__/defineFetch';
import { vi } from 'vitest';

import { ReferoProps } from '../../types/referoProps';

import StepViewQuestionnaire from './__data__/stepview';
import { getResources } from '../../../preview/resources/referoResources';
import { clickButtonTimes, selectCheckboxOption, submitForm, typeByLabelText } from '../../../test/selectors';
import { renderRefero, screen } from '../../../test/test-utils';

const resources = {
  ...getResources(''),
  formRequiredErrorMessage: 'Du må fylle ut dette feltet',
  oppgiGyldigVerdi: 'ikke gyldig tall',
  formSend: 'Send inn',
  nextStep: 'Neste',
  previousStep: 'Forrige',
  formSave: 'Save',
};
const onSubmitMock = vi.fn();
const onStepChangeMock = vi.fn();

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createWrapper = (questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) => {
  return renderRefero({
    questionnaire,
    props: { ...props, resources, saveButtonDisabled: false, onSubmit: onSubmitMock, onStepChange: onStepChangeMock },
  });
};

describe('Step-view', () => {
  it('Should render StepView if a top-level element has the code "step"', () => {
    createWrapper(StepViewQuestionnaire);

    expect(screen.getByText('Gruppe 1')).toBeInTheDocument();
    expect(screen.queryByText('Gruppe 2')).not.toBeInTheDocument();
  });

  it('Should call onStepChange if the step updates in step-view', async () => {
    createWrapper(StepViewQuestionnaire);
    await submitForm();
    expect(onStepChangeMock).toHaveBeenCalled();
  });

  // This test only works with 3-step questionnaires
  it('Buttons in step-view: Should call right functions and display correct texts in step-view', async () => {
    createWrapper(StepViewQuestionnaire);

    // Step 1
    expect(screen.getByText(resources.nextStep)).toBeInTheDocument();
    await submitForm();
    // Step 2
    expect(screen.getByText(resources.previousStep)).toBeInTheDocument();
    await clickButtonTimes(/refero-pause-button/i, 1);

    // Step 1
    expect(screen.queryByText(resources.previousStep)).not.toBeInTheDocument();
    await submitForm();

    // Step 2 - should get validation error
    await submitForm();
    expect(screen.queryAllByText(/Du må fylle ut dette feltet/i)).toHaveLength(2);
    await selectCheckboxOption(/Mann/i);

    await typeByLabelText(/String/i, 'epost@test.com');
    await submitForm();
    // Step 3
    await typeByLabelText(/Hvor mange liter blod/i, '2.23');
    await submitForm();

    // Final assertion
    expect(onSubmitMock).toHaveBeenCalled();
  });
});
