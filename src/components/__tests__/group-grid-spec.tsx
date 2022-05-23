import * as React from 'react';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { mount, ReactWrapper } from 'enzyme';

import '../../util/defineFetch';
import rootReducer from '../../reducers';
import { Questionnaire } from '../../types/fhir';
import Decimal from '../formcomponents/decimal/decimal';
import { ReferoContainer } from '..';
import { Resources } from '../../util/resources';
import GroupGridModel from './__data__/group-grid';

describe('Group-grid component renders correctly', () => {
  beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation(_ => {
      return {};
    });
  });

  it('renders table with reordered items', () => {
    const wrapper = createWrapper(GroupGridModel);
    wrapper.render();

    expect(wrapper.find('table')).toHaveLength(1);
    expect(wrapper.find('th')).toHaveLength(5);
    expect(wrapper.find('th').map(it => it.text())).toEqual(['X', 'SpmA', 'SpmB', 'SpmC', 'SpmD']);

    const rows = wrapper.find('.page_refero__grid--row');
    expect(rows).toHaveLength(4);

    let expectedItemsPerRow = [['1.1.1', '1.1.2', '1.1.3'], ['1.2.2', '1.2.3', '1.2.1'], ['1.3.1'], ['1.4.1']];

    for (let i = 0; i < rows.length; i++) {
      validateRow(rows.at(i), 5, expectedItemsPerRow[i]);
    }
  });
});

function validateRow(wrapper: ReactWrapper<{}, {}>, expectedNumCells: number, expectedItemLinkIds: string[]) {
  expect(wrapper.find('td')).toHaveLength(expectedNumCells);

  const cells = wrapper.find(Decimal);
  expect(cells).toHaveLength(expectedItemLinkIds.length);

  expect(cells.map(it => it.prop('item')!.linkId)).toEqual(expectedItemLinkIds);
}

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
