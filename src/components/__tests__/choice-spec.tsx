import * as React from 'react';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk, { ThunkDispatch } from 'redux-thunk';
import { ReactWrapper, mount } from 'enzyme';

import '../../util/defineFetch';
import rootReducer from '../../reducers';
import { Choice } from '../formcomponents/choice/choice';
import {
  QuestionnaireItem,
  QuestionnaireItemAnswerOption,
  QuestionnaireResponseItemAnswer,
  Extension,
  QuestionnaireResponseItem,
} from '../../types/fhir';
import { Path } from '../../util/refero-core';
import { GlobalState } from '../../reducers/index';
import { NewValueAction } from '../../actions/newValue';
import { createIDataReceiverExpressionExtension } from '../__tests__/utils';
import itemType from '../../constants/itemType';
import TextView from '../formcomponents/textview';

const initAnswer: QuestionnaireResponseItemAnswer[] = [{}];

describe('Choice component renders item.option[]', () => {
  beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation(_ => {
      return {};
    });
  });

  it('should render options from extension optionreference', () => {
    const extensions = createExtensionReferenceOption(
      { key: 'HV', value: 'http://some.end/point1' },
      { key: 'HSØ', value: 'http://some.end/point2' }
    );
    const item = createItemWithExtensions(...extensions);
    const wrapper = createWrapperWithItem(item);
    wrapper.render();

    expectToFind(wrapper, ['http://some.end/point1', 'http://some.end/point2'], ['HV', 'HSØ']);
  });

  it('should render valueReferences', () => {
    const option = createValueReferenceOption(
      {
        key: 'https://nde-fhir-ehelse.azurewebsites.net/fhir/Endpoint/3',
        value: 'Org01',
      },
      {
        key: 'https://nde-fhir-ehelse.azurewebsites.net/fhir/Endpoint/1',
        value: 'Org02',
      }
    );
    const item = createItemWithOption(...option);
    const wrapper = createWrapperWithItem(item);
    wrapper.render();

    expectToFind(
      wrapper,
      ['https://nde-fhir-ehelse.azurewebsites.net/fhir/Endpoint/3', 'https://nde-fhir-ehelse.azurewebsites.net/fhir/Endpoint/1'],
      ['Org01', 'Org02']
    );
  });

  it('should render valueStrings', () => {
    const option = createValueStringOption('dog', 'cat');
    const item = createItemWithOption(...option);
    const wrapper = createWrapperWithItem(item);
    wrapper.render();

    expectToFind(wrapper, ['dog', 'cat'], ['dog', 'cat']);
  });

  it('should render valueInteger', () => {
    const option = createValueIntegerOption(42, 1729);
    const item = createItemWithOption(...option);
    const wrapper = createWrapperWithItem(item);
    wrapper.render();

    expectToFind(wrapper, ['42', '1729'], ['42', '1729']);
  });

  it('should render valueDate', () => {
    const option = createValueDateOption('2018-01-01', '2018-08-22');
    const item = createItemWithOption(...option);
    const wrapper = createWrapperWithItem(item);
    wrapper.render();

    expectToFind(wrapper, ['2018-01-01', '2018-08-22'], ['2018-01-01', '2018-08-22']);
  });

  it('should render valueTime', () => {
    const option = createValueTimeOption('14:23:11', '03:30');
    const item = createItemWithOption(...option);
    const wrapper = createWrapperWithItem(item);
    wrapper.render();

    expectToFind(wrapper, ['14:23:11', '03:30'], ['14:23:11', '03:30']);
  });

  it('should render valueCoding', () => {
    const option = createValueCodingOption({ key: 'OSL', value: 'Gardermoen' }, { key: 'LAX', value: 'LA' });
    const item = createItemWithOption(...option);
    const wrapper = createWrapperWithItem(item);
    wrapper.render();

    expectToFind(wrapper, ['OSL', 'LAX'], ['Gardermoen', 'LA']);
  });

  it('should render different types', () => {
    const referenceOption = createValueReferenceOption({
      key: 'valueReference',
      value: 'ref',
    });
    const codingOption = createValueCodingOption({
      key: 'valueCoding',
      value: 'code',
    });
    const stringOption = createValueStringOption('foo');
    const integerOption = createValueIntegerOption(42);
    const dateOption = createValueDateOption('2018-12-31');
    const timeOption = createValueTimeOption('00:00');
    const item = createItemWithOption(...referenceOption, ...codingOption, ...stringOption, ...integerOption, ...dateOption, ...timeOption);
    const wrapper = createWrapperWithItem(item);
    wrapper.render();

    expectToFind(
      wrapper,
      ['valueReference', 'valueCoding', 'foo', '42', '2018-12-31', '00:00'],
      ['ref', 'code', 'foo', '42', '2018-12-31', '00:00']
    );
  });

  it('should render data-receiver item as readonly text', () => {
    const extensions = [createIDataReceiverExpressionExtension('Test')];
    const item = createItemWithExtensions(...extensions);
    item.readOnly = true;
    const answer = [
      { valueCoding: { code:"3", display:"Usikker", system:"urn:oid:2.16.578.1.12.4.1.9523" }}
    ] as QuestionnaireResponseItemAnswer[];
    const wrapper = createWrapperWithItem(item, answer);
    wrapper.render();

    const textView = wrapper.find(TextView);
    expect(textView.props().value).toBe('Usikker');
  });
});

function expectToFind(wrapper: ReactWrapper<{}, {}>, keys: string[], values: string[]) {
  const choices = wrapper.find('input');
  expect(choices.length).toBe(keys.length);
  keys.forEach((e, i) => {
    const choice = choices.at(i);
    expect(choice.props().value).toBe(e);
  });

  const labels = wrapper.find('label');
  expect(labels.length).toBe(values.length);
  values.forEach((e, i) => {
    const label = labels.at(i);
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

function createValueReferenceOption(...options: { key: string; value: string }[]): QuestionnaireItemAnswerOption[] {
  return options.map(o => {
    return {
      valueReference: {
        reference: o.key,
        display: o.value,
      },
    } as QuestionnaireItemAnswerOption;
  });
}

function createValueCodingOption(...options: { key: string; value: string }[]): QuestionnaireItemAnswerOption[] {
  return options.map(o => {
    return {
      valueCoding: {
        code: o.key,
        display: o.value,
      },
    } as QuestionnaireItemAnswerOption;
  });
}

function createValueStringOption(...options: string[]): QuestionnaireItemAnswerOption[] {
  return options.map(o => {
    return {
      valueString: o,
    } as QuestionnaireItemAnswerOption;
  });
}

function createValueIntegerOption(...options: number[]): QuestionnaireItemAnswerOption[] {
  return options.map(o => {
    return {
      valueInteger: o as {} as number,
    } as QuestionnaireItemAnswerOption;
  });
}

function createValueDateOption(...options: string[]): QuestionnaireItemAnswerOption[] {
  return options.map(o => {
    return {
      valueDate: o as {} as string,
    } as QuestionnaireItemAnswerOption;
  });
}

function createValueTimeOption(...options: string[]): QuestionnaireItemAnswerOption[] {
  return options.map(o => {
    return {
      valueTime: o as {} as string,
    } as QuestionnaireItemAnswerOption;
  });
}

function createWrapperWithItem(item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer[] = initAnswer): ReactWrapper<{}, {}> {
  const store: any = createStore(rootReducer, applyMiddleware(thunk));
  return mount(
    <Provider store={store}>
      <Choice
        id={item.linkId}
        dispatch={() => undefined as unknown as ThunkDispatch<GlobalState, void, NewValueAction>}
        answer={answer}
        item={item}
        path={{} as Path[]}
        renderDeleteButton={() => undefined}
        repeatButton={<React.Fragment />}
        renderHelpButton={() => <React.Fragment />}
        renderHelpElement={() => <React.Fragment />}
        onAnswerChange={() => {}}
        responseItem={{} as QuestionnaireResponseItem}
      />
    </Provider>
  );
}

function createItemWithOption(...options: QuestionnaireItemAnswerOption[]): QuestionnaireItem {
  return {
    linkId: '1',
    type: itemType.CHOICE,
    answerOption: options,
  };
}

function createItemWithExtensions(...extensions: Extension[]): QuestionnaireItem {
  return {
    linkId: '1',
    type: itemType.CHOICE,
    extension: extensions,
  };
}
