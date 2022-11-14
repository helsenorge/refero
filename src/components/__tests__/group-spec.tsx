import * as React from 'react';
import { createStore } from 'redux';
import { Provider, Store } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { ReactWrapper, mount } from 'enzyme';

import '../../util/defineFetch';
import rootReducer from '../../reducers';
import { QuestionnaireItem, QuestionnaireResponseItemAnswer, Extension, QuestionnaireResponseItem } from '../../types/fhir';
import { Path } from '../../util/refero-core';
import { Group } from '../formcomponents/group/group';
import StringComponent from '../../components/formcomponents/string/string';
import { GlobalState } from '../../reducers/index';
import { NewValueAction } from '../../actions/newValue';
import { RenderContextType } from '../../constants/renderContextType';
import { RenderContext } from '../../util/renderContext';
import { createItemControlExtension } from '../__tests__/utils';

describe('Group component renders with correct classes', () => {
  const defaultClasses = ['.page_refero__component', '.page_refero__component_group'];
  beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation(_ => {
      return {};
    });
  });

  it('renders with table-class when extension is table', () => {
    const extension = createItemControlExtension('table');
    const item = createItemWithExtensions('group', extension);
    const wrapper = createWrapperForGroupItem(item);
    wrapper.render();

    expectToFindClasses(wrapper, ...defaultClasses, '.page_refero__itemControl_table');
  });

  it('renders with htable-class when extension is htable', () => {
    const extension = createItemControlExtension('htable');
    const item = createItemWithExtensions('group', extension);
    const wrapper = createWrapperForGroupItem(item);
    wrapper.render();

    expectToFindClasses(wrapper, ...defaultClasses, '.page_refero__itemControl_htable');
  });

  it('renders with gtable-class when extension is gtable', () => {
    const extension = createItemControlExtension('gtable');
    const item = createItemWithExtensions('group', extension);
    const wrapper = createWrapperForGroupItem(item);
    wrapper.render();

    expectToFindClasses(wrapper, ...defaultClasses, '.page_refero__itemControl_gtable');
  });

  it('renders with atable-class when extension is atable', () => {
    const extension = createItemControlExtension('atable');
    const item = createItemWithExtensions('group', extension);
    const wrapper = createWrapperForGroupItem(item);
    wrapper.render();

    expectToFindClasses(wrapper, ...defaultClasses, '.page_refero__itemControl_atable');
  });

  it('other items with group item control types, does not get tagged with a class', () => {
    const extension = createItemControlExtension('gtable');
    const item = createItemWithExtensions('string', extension);
    const wrapper = createWrapperForStringItem(item);
    wrapper.render();

    expectToNotFindClasses(wrapper, '.page_refero__itemControl_gtable');
  });
});

function expectToNotFindClasses(wrapper: ReactWrapper<{}, {}>, ...classes: string[]) {
  for (const c of classes) {
    expect(wrapper.find(c)).toHaveLength(0);
  }
}

function expectToFindClasses(wrapper: ReactWrapper<{}, {}>, ...classes: string[]) {
  for (const c of classes) {
    expect(wrapper.find(c)).toHaveLength(1);
  }
}

function createWrapperForGroupItem(item: QuestionnaireItem): ReactWrapper<{}, {}> {
  const store: Store<{}> = createStore(rootReducer);
  return mount(
    <Provider store={store}>
      <Group
        dispatch={() => undefined as unknown as ThunkDispatch<GlobalState, void, NewValueAction>}
        answer={{} as QuestionnaireResponseItemAnswer}
        item={item}
        path={{} as Path[]}
        renderDeleteButton={() => undefined}
        repeatButton={<React.Fragment />}
        renderHelpButton={() => <React.Fragment />}
        renderHelpElement={() => <React.Fragment />}
        renderChildrenItems={() => undefined}
        renderContext={new RenderContext(RenderContextType.None)}
        responseItem={{} as QuestionnaireResponseItem}
      />
    </Provider>
  );
}

function createWrapperForStringItem(item: QuestionnaireItem): ReactWrapper<{}, {}> {
  const store: Store<{}> = createStore(rootReducer);
  return mount(
    <Provider store={store}>
      <StringComponent
        dispatch={() => undefined as unknown as ThunkDispatch<GlobalState, void, NewValueAction>}
        answer={{} as QuestionnaireResponseItemAnswer}
        item={item}
        path={{} as Path[]}
        renderDeleteButton={() => undefined}
        repeatButton={<React.Fragment />}
        renderHelpButton={() => <React.Fragment />}
        renderHelpElement={() => <React.Fragment />}
        oneToTwoColumn={false}
        renderContext={new RenderContext(RenderContextType.None)}
      />
    </Provider>
  );
}

function createItemWithExtensions(itemType: string, ...extensions: Extension[]): QuestionnaireItem {
  return {
    linkId: '1',
    type: itemType,
    extension: extensions,
  };
}
