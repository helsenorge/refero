import { Questionnaire } from 'fhir/r4';
import '../../util/__tests__/defineFetch';
import { vi } from 'vitest';

import { ReferoProps } from '../../types/referoProps';

import StepViewQuestionnaire from './__data__/stepview';
import { getResources } from '../../../preview/resources/referoResources';
import { clickButtonTimes, getByLabelTextInsideElement, selectCheckboxOption, submitForm, typeByLabelText } from '../../../test/selectors';
import { Matcher, renderRefero, screen, userEvent } from '../../../test/test-utils';

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

const createWrapper = (questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) => {
  return renderRefero({
    questionnaire,
    props: { ...props, resources, saveButtonDisabled: false, onSubmit: onSubmitMock, onStepChange: onStepChangeMock },
  });
};

const getTestId = (questionnaire: Questionnaire, groupIndex: number) => {
  const groupItems = questionnaire.item?.filter(item => item.type === 'group');
  const groupToSearchIn = groupItems && groupItems[groupIndex];
  const stringItem = groupToSearchIn?.item?.find(item => item.type === 'string');
  const stringInputTestId = `test-string-item_${stringItem?.linkId}`;
  return stringInputTestId;
};

const getStringInput = (questionnaire: Questionnaire, labelText: Matcher, groupIndex: number) => {
  const stringInputTestId = getTestId(questionnaire, groupIndex);
  const stringInput = getByLabelTextInsideElement(stringInputTestId, labelText);
  return stringInput;
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

    const stringInput = getStringInput(StepViewQuestionnaire, /String/i, 1);
    await userEvent.type(stringInput, 'epost@test.com');
    await submitForm();

    // Step 3
    await typeByLabelText(/Hvor mange liter blod/i, '2.23');
    await submitForm();

    // Final assertion
    expect(onSubmitMock).toHaveBeenCalled();
  });
});
