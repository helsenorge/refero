import * as React from 'react';
import rootReducer from '../../reducers';
import { createStore } from 'redux';
import { ReactWrapper, mount } from 'enzyme';

import { Provider, Store } from 'react-redux';

import { Choice } from '../formcomponents/choice/choice';
import { QuestionnaireItem, QuestionnaireOption, QuestionnaireResponseAnswer, integer, date, time, Extension } from '../../types/fhir';
import { Path } from '../../util/skjemautfyller-core';

describe('Choice component renders item.option[]', () => {
  beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation(_ => {
      return {};
    });
  });

  it('should render options from extension optionreference', () => {
    let extensions = createExtensionReferenceOption(
      { key: 'HV', value: 'http://some.end/point1' },
      { key: 'HSØ', value: 'http://some.end/point2' }
    );
    let item = createItemWithExtensions(...extensions);
    let wrapper = createWrapperWithItem(item);
    wrapper.render();

    expectToFind(wrapper, ['http://some.end/point1', 'http://some.end/point2'], ['HV', 'HSØ']);
  });

  it('should render valueReferences', () => {
    let option = createValueReferenceOption(
      {
        key: 'https://nde-fhir-ehelse.azurewebsites.net/fhir/Endpoint/3',
        value: 'Org01',
      },
      {
        key: 'https://nde-fhir-ehelse.azurewebsites.net/fhir/Endpoint/1',
        value: 'Org02',
      }
    );
    let item = createItemWithOption(...option);
    let wrapper = createWrapperWithItem(item);
    wrapper.render();

    expectToFind(
      wrapper,
      ['https://nde-fhir-ehelse.azurewebsites.net/fhir/Endpoint/3', 'https://nde-fhir-ehelse.azurewebsites.net/fhir/Endpoint/1'],
      ['Org01', 'Org02']
    );
  });

  it('should render valueStrings', () => {
    let option = createValueStringOption('dog', 'cat');
    let item = createItemWithOption(...option);
    let wrapper = createWrapperWithItem(item);
    wrapper.render();

    expectToFind(wrapper, ['dog', 'cat'], ['dog', 'cat']);
  });

  it('should render valueInteger', () => {
    let option = createValueIntegerOption(42, 1729);
    let item = createItemWithOption(...option);
    let wrapper = createWrapperWithItem(item);
    wrapper.render();

    expectToFind(wrapper, ['42', '1729'], ['42', '1729']);
  });

  it('should render valueDate', () => {
    let option = createValueDateOption('2018-01-01', '2018-08-22');
    let item = createItemWithOption(...option);
    let wrapper = createWrapperWithItem(item);
    wrapper.render();

    expectToFind(wrapper, ['2018-01-01', '2018-08-22'], ['2018-01-01', '2018-08-22']);
  });

  it('should render valueTime', () => {
    let option = createValueTimeOption('14:23:11', '03:30');
    let item = createItemWithOption(...option);
    let wrapper = createWrapperWithItem(item);
    wrapper.render();

    expectToFind(wrapper, ['14:23:11', '03:30'], ['14:23:11', '03:30']);
  });

  it('should render valueCoding', () => {
    let option = createValueCodingOption({ key: 'OSL', value: 'Gardermoen' }, { key: 'LAX', value: 'LA' });
    let item = createItemWithOption(...option);
    let wrapper = createWrapperWithItem(item);
    wrapper.render();

    expectToFind(wrapper, ['OSL', 'LAX'], ['Gardermoen', 'LA']);
  });

  it('should render different types', () => {
    let referenceOption = createValueReferenceOption({
      key: 'valueReference',
      value: 'ref',
    });
    let codingOption = createValueCodingOption({
      key: 'valueCoding',
      value: 'code',
    });
    let stringOption = createValueStringOption('foo');
    let integerOption = createValueIntegerOption(42);
    let dateOption = createValueDateOption('2018-12-31');
    let timeOption = createValueTimeOption('00:00');
    let item = createItemWithOption(...referenceOption, ...codingOption, ...stringOption, ...integerOption, ...dateOption, ...timeOption);
    let wrapper = createWrapperWithItem(item);
    wrapper.render();

    expectToFind(
      wrapper,
      ['valueReference', 'valueCoding', 'foo', '42', '2018-12-31', '00:00'],
      ['ref', 'code', 'foo', '42', '2018-12-31', '00:00']
    );
  });

  it('should be clickable', () => {
    let referenceOption = createValueReferenceOption({
      key: 'valueReference',
      value: 'ref',
    });
    let item = createItemWithOption(...referenceOption);
    let wrapper = createWrapperWithItem(item);

    let input = wrapper.find('input[aria-checked=false]').length;
    expect(input).toBe(1);
    wrapper.find('input').simulate('click');
    input = wrapper.find('input[aria-checked=true]').length;
    expect(input).toBe(1);
  });
});

function expectToFind(wrapper: ReactWrapper<{}, {}>, keys: string[], values: string[]) {
  let choices = wrapper.find('input');
  expect(choices.length).toBe(keys.length);
  keys.forEach((e, i) => {
    let choice = choices.at(i);
    expect(choice.props().value).toBe(e);
  });

  let labels = wrapper.find('label');
  expect(labels.length).toBe(values.length);
  values.forEach((e, i) => {
    let label = labels.at(i);
    expect(label.text()).toBe(e);
  });
}

function createExtensionReferenceOption(...options: { key: string; value: string }[]): Extension[] {
  return options.map(o => {
    return {
      url: 'http://ehelse.no/fhir/StructureDefinition/sdf-optionReference',
      valueReference: {
        reference: o.value,
        display: o.key,
      },
    } as Extension;
  });
}

function createValueReferenceOption(...options: { key: string; value: string }[]): QuestionnaireOption[] {
  return options.map(o => {
    return {
      valueReference: {
        reference: o.key,
        display: o.value,
      },
    } as QuestionnaireOption;
  });
}

function createValueCodingOption(...options: { key: string; value: string }[]): QuestionnaireOption[] {
  return options.map(o => {
    return {
      valueCoding: {
        code: o.key,
        display: o.value,
      },
    } as QuestionnaireOption;
  });
}

function createValueStringOption(...options: string[]): QuestionnaireOption[] {
  return options.map(o => {
    return {
      valueString: o,
    } as QuestionnaireOption;
  });
}

function createValueIntegerOption(...options: number[]): QuestionnaireOption[] {
  return options.map(o => {
    return {
      valueInteger: (o as {}) as integer,
    } as QuestionnaireOption;
  });
}

function createValueDateOption(...options: string[]): QuestionnaireOption[] {
  return options.map(o => {
    return {
      valueDate: (o as {}) as date,
    } as QuestionnaireOption;
  });
}

function createValueTimeOption(...options: string[]): QuestionnaireOption[] {
  return options.map(o => {
    return {
      valueTime: (o as {}) as time,
    } as QuestionnaireOption;
  });
}

function createWrapperWithItem(item: QuestionnaireItem): ReactWrapper<{}, {}> {
  let store: Store<{}> = createStore(rootReducer);
  return mount(
    <Provider store={store}>
      <Choice
        dispatch={() => undefined as any}
        answer={{} as QuestionnaireResponseAnswer}
        item={item}
        path={{} as Path[]}
        renderDeleteButton={() => undefined}
        repeatButton={<React.Fragment />}
      />
    </Provider>
  );
}

function createItemWithOption(...options: QuestionnaireOption[]): QuestionnaireItem {
  return {
    linkId: '1',
    type: 'choice',
    option: options,
  };
}

function createItemWithExtensions(...extensions: Extension[]): QuestionnaireItem {
  return {
    linkId: '1',
    type: 'choice',
    extension: extensions,
  };
}
