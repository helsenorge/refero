import * as React from 'react';
import rootReducer from '../../reducers';
import { createStore, applyMiddleware } from 'redux';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { Questionnaire } from '../../types/fhir';
import { SkjemautfyllerContainer } from '..';
import { Resources } from '../../util/resources';
import questionnaireWithRegex from './__data__/validation';
import { inputAnswer, inputTextAnswer, submit } from './utils';

describe('Validation with regex', () => {
  beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation(_ => {
      return {};
    });
  });

  it('text fields should validate using regex', async () => {
    const wrapper = createWrapper(questionnaireWithRegex);
    wrapper.render();

    await inputTextAnswer('1_1', 'foo & bar', wrapper);
    submit('SendButton', wrapper);

    let validation = wrapper.find('.mol_validation__errortext');
    expect(validation).toHaveLength(1);
    expect(validation.text()).toBe('Validation text for text-field appears!');

    await inputTextAnswer('1_1', 'foo and bar', wrapper);
    submit('SendButton', wrapper);

    validation = wrapper.find('.mol_validation__errortext');
    expect(validation).toHaveLength(0);
  });

  it('string fields should validate using regex', async () => {
    const wrapper = createWrapper(questionnaireWithRegex);
    wrapper.render();

    await inputAnswer('1_2', 'foo & bar', wrapper);
    submit('SendButton', wrapper);

    let validation = wrapper.find('.mol_validation__errortext');
    expect(validation).toHaveLength(1);
    expect(validation.text()).toBe('Validation text for string-field appears!');

    await inputAnswer('1_2', 'foo and bar', wrapper);
    submit('SendButton', wrapper);

    validation = wrapper.find('.mol_validation__errortext');
    expect(validation).toHaveLength(0);
  });
});

function createWrapper(questionnaire: Questionnaire) {
  const store: any = createStore(rootReducer, applyMiddleware(thunk));
  return mount(
    <Provider store={store}>
      <SkjemautfyllerContainer
        loginButton={<React.Fragment />}
        store={store}
        authorized={true}
        onCancel={() => {}}
        onSave={() => {}}
        onSubmit={() => {}}
        resources={{ formSend: 'SendButton' } as Resources}
        questionnaire={questionnaire}
      />
    </Provider>
  );
}
