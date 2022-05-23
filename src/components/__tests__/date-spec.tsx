import * as React from 'react';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import '../../util/defineFetch';
import rootReducer from '../../reducers';
import { Questionnaire } from '../../types/fhir';
import { ReferoContainer } from '..';
import { Resources } from '../../util/resources';
import questionnaireWithAllItemTypes from './__data__/onChange/allItemTypes';
import { inputAnswer, findItem } from './utils';

describe('date fields gets set and cleared properly', () => {
  beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation(_ => {
      return {};
    });
  });

  it('dates gets set and cleared', async () => {
    const wrapper = createWrapper(questionnaireWithAllItemTypes);

    await inputAnswer('7a-datepicker_input', '2020-12-23', wrapper);
    let item = findItem('7a-datepicker_input', wrapper);
    expect(item.props().value).toBe('23.12.2020');

    await inputAnswer('7a-datepicker_input', '', wrapper);
    item = findItem('7a-datepicker_input', wrapper);
    expect(item.props().value).toBe('');
  });
});

function createWrapper(questionnaire: Questionnaire) {
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
      />
    </Provider>
  );
}
