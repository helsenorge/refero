import * as React from 'react';

import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import { Questionnaire, QuestionnaireItem } from '../../types/fhir';

import '../../util/defineFetch';
import rootReducer from '../../reducers';
import { Resources } from '../../util/resources';
import { ReferoContainer } from '../index';
import StepViewQuestionnaire from './__data__/stepview';
import StepView from '../stepView';
import Form from '@helsenorge/form/components/form';
import { act } from 'react-dom/test-utils';

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

const onSubmitMock = jest.fn();
const onStepChangeMock = jest.fn();
function createWrapper(
  questionnaire: Questionnaire,
  helpButtonCb?: (item: QuestionnaireItem, helpItem: QuestionnaireItem, helpType: string, help: string, opening: boolean) => JSX.Element,
  helpElementCb?: (item: QuestionnaireItem, helpItem: QuestionnaireItem, helpType: string, help: string, opening: boolean) => JSX.Element
) {
  const store: any = createStore(rootReducer, applyMiddleware(thunk));
  return mount(
    <Provider store={store}>
      <ReferoContainer
        loginButton={<React.Fragment />}
        store={store}
        authorized={true}
        onCancel={() => {}}
        onSave={() => {}}
        onSubmit={onSubmitMock}
        resources={{formSend: 'Send inn', nextStep: "Neste", previousStep: "Forrige"} as Resources}
        questionnaire={questionnaire}
        onRequestHelpButton={helpButtonCb}
        onRequestHelpElement={helpElementCb}
        saveButtonDisabled={false}
        onStepChange={onStepChangeMock}
      />
    </Provider>
  );
}

describe('Step-view', () => {
  it('Should render StepView if a top-level element has the code "step"', () => {
    const wrapper = createWrapper(StepViewQuestionnaire);
    wrapper.render();
    expect(wrapper.find(StepView).length).toBe(1);
  });

  it('Should call onStepChange if the step updates in step-view', () => {
    const wrapper = createWrapper(StepViewQuestionnaire);
    wrapper.render();
    act(() => {
      (wrapper.find(Form).prop('onSubmit') as () => void)();
    });
    wrapper.update();
    expect(onStepChangeMock).toHaveBeenCalled();
  });

  // This test only works with 3-step questionnaires
  it('Buttons in step-view: Should call right functions and display correct texts in step-view', () => {
    const wrapper = createWrapper(StepViewQuestionnaire);
    wrapper.render();

    // Step 1
    expect(wrapper.find(Form).props().submitButtonText).toBe("Neste");
    expect(wrapper.find(Form).props().pauseButtonText).toBe(undefined);
    act(() => {
      (wrapper.find(Form).prop('onSubmit') as () => void)();
    });
    wrapper.update();
    // Step 2
    expect(wrapper.find(Form).props().pauseButtonText).toBe("Forrige");
    act(() => {
      (wrapper.find(Form).prop('onPause') as () => void)();
    });
    wrapper.update();
    // Step 1
    expect(wrapper.find(Form).props().pauseButtonText).toBe(undefined);
    act(() => {
      (wrapper.find(Form).prop('onSubmit') as () => void)();
    });
    wrapper.update();
    // Step 2
    act(() => {
      (wrapper.find(Form).prop('onSubmit') as () => void)();
    });
    wrapper.update();
    // Step 3
    expect(wrapper.find(Form).props().submitButtonText).toBe("Send inn");
    act(() => {
      (wrapper.find(Form).prop('onSubmit') as () => void)();
    });
    wrapper.update();
    expect(onSubmitMock).toHaveBeenCalled();
  });
});
