import * as React from 'react';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import '@testing-library/jest-dom';
import { act } from 'react-dom/test-utils';

import { Questionnaire, QuestionnaireItem } from 'fhir/r4';

import '../../util/defineFetch';
import rootReducer from '../../reducers';
import { Resources } from '../../util/resources';
import { ReferoContainer } from '../index';
import StepViewQuestionnaire from './__data__/stepview';
import { render, userEvent } from './test-utils/test-utils';

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
const onSubmitMock = jest.fn();
const onStepChangeMock = jest.fn();

function createWrapper(
  questionnaire: Questionnaire,
  helpButtonCb?: (item: QuestionnaireItem, helpItem: QuestionnaireItem, helpType: string, help: string, opening: boolean) => JSX.Element,
  helpElementCb?: (item: QuestionnaireItem, helpItem: QuestionnaireItem, helpType: string, help: string, opening: boolean) => JSX.Element
) {
  const store = createStore(rootReducer, applyMiddleware(thunk));
  return render(
    <ReferoContainer
      loginButton={<React.Fragment />}
      authorized={true}
      onCancel={() => {}}
      onSave={() => {}}
      onSubmit={onSubmitMock}
      resources={{ formSend: 'Send inn', nextStep: 'Neste', previousStep: 'Forrige', formSave: 'Save' } as Resources}
      questionnaire={questionnaire}
      onRequestHelpButton={helpButtonCb}
      onRequestHelpElement={helpElementCb}
      saveButtonDisabled={false}
      onStepChange={onStepChangeMock}
    />,
    {
      store,
    }
  );
}

describe('Step-view', () => {
  it('Should render StepView if a top-level element has the code "step"', () => {
    const { getByText, queryByText } = createWrapper(StepViewQuestionnaire);

    expect(getByText('Gruppe 1')).toBeInTheDocument();
    expect(queryByText('Gruppe 2')).not.toBeInTheDocument();
  });

  it('Should call onStepChange if the step updates in step-view', async () => {
    const { getByRole } = createWrapper(StepViewQuestionnaire);
    userEvent.click(getByRole('button', { name: 'Neste' }));
    expect(onStepChangeMock).toHaveBeenCalled();
  });

  // This test only works with 3-step questionnaires
  it('Buttons in step-view: Should call right functions and display correct texts in step-view', async () => {
    const { getByText, queryByText, findByRole } = createWrapper(StepViewQuestionnaire);

    // Step 1
    expect(getByText('Neste')).toBeInTheDocument();
    await act(async () => {
      userEvent.click(await findByRole('button', { name: 'Neste' }));
    });

    // Step 2
    expect(getByText('Forrige')).toBeInTheDocument();
    await act(async () => {
      userEvent.click(await findByRole('button', { name: 'Forrige' }));
    });

    // Step 1
    expect(queryByText('Forrige')).not.toBeInTheDocument();
    await act(async () => {
      userEvent.click(await findByRole('button', { name: 'Neste' }));
    });

    // Step 2

    await act(async () => {
      userEvent.click(await findByRole('button', { name: 'Neste' }));
    });
    // Step 3
    expect(queryByText('Send inn')).toBeInTheDocument();
    await act(async () => {
      userEvent.click(await findByRole('button', { name: 'Send inn' }));
    });

    // Final assertion
    expect(onSubmitMock).toHaveBeenCalled();
  });
});
