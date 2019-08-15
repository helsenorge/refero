import * as React from 'react';
import rootReducer from '../../reducers';
import { createStore } from 'redux';
import { ReactWrapper, mount } from 'enzyme';
import { Provider, Store } from 'react-redux';
import { QuestionnaireItem, QuestionnaireResponseAnswer, Extension, QuestionnaireItemTypeList } from '../../types/fhir';
import { Path } from '../../util/skjemautfyller-core';
import { Group } from '../formcomponents/group/group';
import StringComponent from '../../components/formcomponents/string/string';
import Extensions from '../../constants/extensions';

describe('Group component renders with correct classes', () => {
  let defaultClasses = ['.page_skjemautfyller__component', '.page_skjemautfyller__component_group'];
  beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation(_ => {
      return {};
    });
  });

  it('renders with table-class when extension is table', () => {
    let extension = createItemControlExtension('table');
    let item = createItemWithExtensions('group', extension);
    let wrapper = createWrapperForGroupItem(item);
    wrapper.render();

    expectToFindClasses(wrapper, ...defaultClasses, '.page_skjemautfyller__itemControl_table');
  });

  it('renders with htable-class when extension is htable', () => {
    let extension = createItemControlExtension('htable');
    let item = createItemWithExtensions('group', extension);
    let wrapper = createWrapperForGroupItem(item);
    wrapper.render();

    expectToFindClasses(wrapper, ...defaultClasses, '.page_skjemautfyller__itemControl_htable');
  });

  it('renders with gtable-class when extension is gtable', () => {
    let extension = createItemControlExtension('gtable');
    let item = createItemWithExtensions('group', extension);
    let wrapper = createWrapperForGroupItem(item);
    wrapper.render();

    expectToFindClasses(wrapper, ...defaultClasses, '.page_skjemautfyller__itemControl_gtable');
  });

  it('renders with atable-class when extension is atable', () => {
    let extension = createItemControlExtension('atable');
    let item = createItemWithExtensions('group', extension);
    let wrapper = createWrapperForGroupItem(item);
    wrapper.render();

    expectToFindClasses(wrapper, ...defaultClasses, '.page_skjemautfyller__itemControl_atable');
  });

  it('other items with group item control types, does not get tagged with a class', () => {
    let extension = createItemControlExtension('gtable');
    let item = createItemWithExtensions('string', extension);
    let wrapper = createWrapperForStringItem(item);
    wrapper.render();

    expectToNotFindClasses(wrapper, '.page_skjemautfyller__itemControl_gtable');
  });
});

function expectToNotFindClasses(wrapper: ReactWrapper<{}, {}>, ...classes: string[]) {
  for (let c of classes) {
    expect(wrapper.find(c)).toHaveLength(0);
  }
}

function expectToFindClasses(wrapper: ReactWrapper<{}, {}>, ...classes: string[]) {
  for (let c of classes) {
    expect(wrapper.find(c)).toHaveLength(1);
  }
}

function createItemControlExtension(code: string) {
  return {
    url: Extensions.ITEMCONTROL_URL,
    valueCodeableConcept: {
      coding: [
        {
          system: { value: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control' },
          code: code,
        },
      ],
    },
  } as Extension;
}

function createWrapperForGroupItem(item: QuestionnaireItem): ReactWrapper<{}, {}> {
  let store: Store<{}> = createStore(rootReducer);
  return mount(
    <Provider store={store}>
      <Group
        dispatch={() => undefined as any}
        answer={{} as QuestionnaireResponseAnswer}
        item={item}
        path={{} as Path[]}
        renderDeleteButton={() => undefined}
        repeatButton={<React.Fragment />}
        renderHelpButton={() => <React.Fragment />}
        renderHelpElement={() => <React.Fragment />}
        renderChildrenItems={() => undefined}
      />
    </Provider>
  );
}

function createWrapperForStringItem(item: QuestionnaireItem): ReactWrapper<{}, {}> {
  let store: Store<{}> = createStore(rootReducer);
  return mount(
    <Provider store={store}>
      <StringComponent
        dispatch={() => undefined as any}
        answer={{} as QuestionnaireResponseAnswer}
        item={item}
        path={{} as Path[]}
        renderDeleteButton={() => undefined}
        repeatButton={<React.Fragment />}
        renderHelpButton={() => <React.Fragment />}
        renderHelpElement={() => <React.Fragment />}
        oneToTwoColumn={false}
      />
    </Provider>
  );
}

function createItemWithExtensions(itemType: QuestionnaireItemTypeList, ...extensions: Extension[]): QuestionnaireItem {
  return {
    linkId: '1',
    type: itemType,
    extension: extensions,
  };
}
