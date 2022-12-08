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
import ItemType from '../../constants/itemType';

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

    expect(visited['0']).toBe(ItemType.GROUP);
    expect(visited['1']).toBe(ItemType.DECIMAL);
    expect(visited['2']).toBe(ItemType.INTEGER);
    expect(visited['3']).toBe(ItemType.QUANTITY);
    expect(visited['4']).toBe(ItemType.BOOLEAN);
    expect(visited['5a']).toBe(ItemType.CHOICE);
    expect(visited['5b']).toBe(ItemType.CHOICE);
    expect(visited['5c']).toBe(ItemType.CHOICE);
    expect(visited['6a']).toBe(ItemType.OPENCHOICE);
    expect(visited['6b']).toBe(ItemType.OPENCHOICE);
    expect(visited['6c']).toBe(ItemType.OPENCHOICE);
    expect(visited['7a']).toBe(ItemType.DATE);
    expect(visited['7b']).toBe(ItemType.TIME);
    expect(visited['7c']).toBe(ItemType.DATETIME);
    expect(visited['8']).toBe(ItemType.STRING);
    expect(visited['9']).toBe(ItemType.TEXT);
    expect(visited['10']).toBe(ItemType.ATTATCHMENT);
    expect(visited['11']).toBe(ItemType.DISPLAY);
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
