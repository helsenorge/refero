import * as React from 'react';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import '../../util/defineFetch';
import rootReducer from '../../reducers';
import { Questionnaire, QuestionnaireItem } from '../../types/fhir';
import { ReferoContainer } from '..';
import { Resources } from '../../util/resources';
import questionnaireWithMarkdown from './__data__/markdown';

describe('support for external markdown', () => {
  beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation(_ => {
      return {};
    });
  });

  it('enableWhen should trigger when correct answer is selected', async () => {
    let visited = {};
    let cb = (q: QuestionnaireItem, _markdown: string) => {
      visited[q.linkId] = q.type;
      return '';
    };
    const wrapper = createWrapper(questionnaireWithMarkdown, cb);
    wrapper.render();

    expect(visited['0']).toBe('group');
    expect(visited['1']).toBe('decimal');
    expect(visited['2']).toBe('integer');
    expect(visited['3']).toBe('quantity');
    expect(visited['4']).toBe('boolean');
    expect(visited['5a']).toBe('choice');
    expect(visited['5b']).toBe('choice');
    expect(visited['5c']).toBe('choice');
    expect(visited['6a']).toBe('open-choice');
    expect(visited['6b']).toBe('open-choice');
    expect(visited['6c']).toBe('open-choice');
    expect(visited['7a']).toBe('date');
    expect(visited['7b']).toBe('time');
    expect(visited['7c']).toBe('dateTime');
    expect(visited['8']).toBe('string');
    expect(visited['9']).toBe('text');
    expect(visited['10']).toBe('attachment');
    expect(visited['11']).toBe('display');
  });
});

function createWrapper(questionnaire: Questionnaire, markdownCb: (q: QuestionnaireItem, markdown: string) => string) {
  const store: any = createStore(rootReducer, applyMiddleware(thunk));
  return mount(
    <Provider store={store}>
      <ReferoContainer
        loginButton={<React.Fragment />}
        store={store}
        authorized={true}
        onCancel={() => {}}
        onSave={() => {}}
        onSubmit={() => {}}
        resources={{} as Resources}
        questionnaire={questionnaire}
        onRenderMarkdown={markdownCb}
      />
    </Provider>
  );
}
