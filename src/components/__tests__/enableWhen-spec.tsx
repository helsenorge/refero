import * as React from 'react';
import rootReducer from '../../reducers';
import { createStore, applyMiddleware } from 'redux';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { Questionnaire } from '../../types/fhir';
import { SkjemautfyllerContainer } from '..';
import { Resources } from '../../util/resources';
import questionnaireWithEnableWhen from './__data__/enableWhen';
import { selectCheckBoxOption } from './utils';

describe('enableWhen with checkboxes and multiple answers', () => {
  beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation(_ => {
      return {};
    });
  });

  it('enableWhen should trigger when correct answer is selected', async () => {
    const wrapper = createWrapper(questionnaireWithEnableWhen);
    wrapper.render();

    expect(wrapper.find('input#item_9_2')).toHaveLength(0);
    await selectCheckBoxOption('9_1', '18', wrapper);
    expect(wrapper.find('input#item_9_2')).toHaveLength(1);
  });

  it('enableWhen should trigger when correct answer is selected along with other answers', async () => {
    const wrapper = createWrapper(questionnaireWithEnableWhen);
    wrapper.render();

    expect(wrapper.find('input#item_9_2')).toHaveLength(0);
    await selectCheckBoxOption('9_1', '10', wrapper);
    expect(wrapper.find('input#item_9_2')).toHaveLength(0);

    await selectCheckBoxOption('9_1', '18', wrapper);
    expect(wrapper.find('input#item_9_2')).toHaveLength(1);

    await selectCheckBoxOption('9_1', '11', wrapper);
    expect(wrapper.find('input#item_9_2')).toHaveLength(1);
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
        resources={{} as Resources}
        questionnaire={questionnaire}
      />
    </Provider>
  );
}
