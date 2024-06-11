import '@testing-library/jest-dom';

import { Questionnaire } from 'fhir/r4';

import '../../util/defineFetch';

import StepViewQuestionnaire from './__data__/stepview';
import { act, queryAllByText, renderRefero, userEvent } from './test-utils/test-utils';
import { ReferoProps } from '../../types/referoProps';
import { getResources } from '../../preview/resources/referoResources';
import { clickButtonTimes, selectCheckboxOption, submitForm } from './test-utils/selectors';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
});

const resources = {
  ...getResources(''),
  formRequiredErrorMessage: 'Du må fylle ut dette feltet',
  oppgiGyldigVerdi: 'ikke gyldig tall',
  formSend: 'Send inn',
  nextStep: 'Neste',
  previousStep: 'Forrige',
  formSave: 'Save',
};
const onSubmitMock = jest.fn();
const onStepChangeMock = jest.fn();

const createWrapper = (questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) => {
  return renderRefero({
    questionnaire,
    props: { ...props, resources, saveButtonDisabled: false, onSubmit: onSubmitMock, onStepChange: onStepChangeMock },
  });
};

describe('Step-view', () => {
  it('Should render StepView if a top-level element has the code "step"', () => {
    const { getByText, queryByText } = createWrapper(StepViewQuestionnaire);

    expect(getByText('Gruppe 1')).toBeInTheDocument();
    expect(queryByText('Gruppe 2')).not.toBeInTheDocument();
  });

  it('Should call onStepChange if the step updates in step-view', async () => {
    createWrapper(StepViewQuestionnaire);
    await submitForm();
    expect(onStepChangeMock).toHaveBeenCalled();
  });

  // This test only works with 3-step questionnaires
  it('Buttons in step-view: Should call right functions and display correct texts in step-view', async () => {
    const { getByText, queryByText, queryAllByText, getByLabelText } = createWrapper(StepViewQuestionnaire);

    // Step 1
    expect(getByText(resources.nextStep)).toBeInTheDocument();
    await submitForm();
    // Step 2
    expect(getByText(resources.previousStep)).toBeInTheDocument();
    await clickButtonTimes(/refero-pause-button/i, 1);

    // Step 1
    expect(queryByText(resources.previousStep)).not.toBeInTheDocument();
    await submitForm();

    // Step 2 - should get validation error
    await submitForm();
    expect(queryAllByText(/Du må fylle ut dette feltet/i)).toHaveLength(2);
    await selectCheckboxOption(/Mann/i);
    await act(async () => {
      userEvent.type(getByLabelText(/String/i), 'epost@test.com');
    });
    await submitForm();

    // Step 3, validation
    expect(queryByText(resources.formSend)).toBeInTheDocument();
    await submitForm();
    expect(queryByText(/Du må fylle ut dette feltet/i)).toBeInTheDocument();
    await act(async () => {
      userEvent.type(getByLabelText(/Hvor mange liter blod/i), '2.23');
    });
    await submitForm();

    // Final assertion
    expect(onSubmitMock).toHaveBeenCalled();
  });
});
