import * as React from 'react';
import rootReducer from '../../reducers';
import { createStore } from 'redux';
import { ReactWrapper, mount } from 'enzyme';
import { Provider, Store } from 'react-redux';

import {
  QuestionnaireItem,
  QuestionnaireItemTypeList,
  Extension,
  Coding,
  uri,
  QuestionnaireResponseAnswer,
  QuestionnaireOption,
} from '../../types/fhir';
import { Path } from '../../util/skjemautfyller-core';
import String from '../formcomponents/string/string';
import Choice from '../formcomponents/choice/choice';
import Boolean from '../formcomponents/boolean/boolean';
import Group from '../formcomponents/group/group';
import Attachment from '../formcomponents/attachment/attachment';
import Date from '../formcomponents/date/date';
import DateTime from '../formcomponents/date/date-time';
import Time from '../formcomponents/date/time';
import Decimal from '../formcomponents/decimal/decimal';
import Integer from '../formcomponents/integer/integer';
import OpenChoice from '../formcomponents/open-choice/open-choice';
import Quantity from '../formcomponents/quantity/quantity';
import Text from '../formcomponents/text/text';
import { GlobalState } from '../../reducers/index';
import { NewValueAction } from '../../actions/newValue';
import { ThunkDispatch } from 'redux-thunk';

describe('Component renders help items', () => {
  beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation(_ => {
      return {};
    });
  });

  it('should render help button and text for choice component of type radio-button', () => {
    const extension = createItemControlExtension('radio-button');
    runTest('choice', HelpElement.HelpButtonAndText, [extension]);
  });

  it('should render help button and text for choice component of type check-box', () => {
    const extension = createItemControlExtension('check-box');
    runTest('choice', HelpElement.HelpButtonAndText, [extension]);
  });

  it('should render help button and text for choice component of type drop-down', () => {
    const extension = createItemControlExtension('drop-down');
    runTest('choice', HelpElement.HelpButtonAndText, [extension]);
  });

  it('should render help button and text for string component', () => {
    runTest('string', HelpElement.HelpButtonAndText);
  });

  it('should render help button and text for boolean component', () => {
    runTest('boolean', HelpElement.HelpButtonAndText);
  });

  it('should render help button and text for group component', () => {
    runTest('group', HelpElement.HelpButtonAndText);
  });

  it('should render help button and text for attachment component', () => {
    runTest('attachment', HelpElement.HelpButtonAndText);
  });

  it('should render help button and text for date component', () => {
    runTest('date', HelpElement.HelpButtonAndText);
  });

  it('should render help button and text for dateTime component', () => {
    runTest('dateTime', HelpElement.HelpButtonAndText);
  });

  it('should render help button and text for time component', () => {
    runTest('time', HelpElement.HelpButtonAndText);
  });

  it('should render help button and text for decimal component', () => {
    runTest('decimal', HelpElement.HelpButtonAndText);
  });

  it('should render help button and text for integer component', () => {
    runTest('integer', HelpElement.HelpButtonAndText);
  });

  it('should render help button and text for quantity component', () => {
    runTest('quantity', HelpElement.HelpButtonAndText);
  });

  it('should render help button and text for text component', () => {
    runTest('text', HelpElement.HelpButtonAndText);
  });

  it('should render help button and text for open-choice component of type radio-button', () => {
    const extension = createItemControlExtension('radio-button');
    runTest('open-choice', HelpElement.HelpButtonAndText, [extension]);
  });

  it('should render help button and text for open-choice component of type check-box', () => {
    const extension = createItemControlExtension('check-box');
    runTest('open-choice', HelpElement.HelpButtonAndText, [extension]);
  });

  it('should render help button and text for open-choice component of type drop-down', () => {
    const extension = createItemControlExtension('drop-down');
    runTest('open-choice', HelpElement.HelpButtonAndText, [extension]);
  });
});

enum HelpElement {
  HelpButton = 1,
  HelpButtonAndText = 2,
}

function runTest(itemType: QuestionnaireItemTypeList, expect: HelpElement, extensions?: Extension[]) {
  const component = createComponentOfType(itemType, extensions);
  const wrapper = createWrapperWithComponent(component);
  wrapper.render();

  expectToFind(wrapper, expect);
}

function expectToFind(wrapper: ReactWrapper<{}, {}>, helpElement: HelpElement) {
  expect(wrapper.find('.helpButton')).toHaveLength(
    helpElement == HelpElement.HelpButton || helpElement == HelpElement.HelpButtonAndText ? 1 : 0
  );
  expect(wrapper.find('.helpText')).toHaveLength(helpElement == HelpElement.HelpButtonAndText ? 1 : 0);
}

function createItemWithOption(extensions?: Extension[], ...options: QuestionnaireOption[]): QuestionnaireItem {
  return {
    linkId: '1',
    type: 'choice',
    option: options,
    extension: extensions,
  };
}

function createValueStringOption(...options: string[]): QuestionnaireOption[] {
  return options.map(o => {
    return {
      valueString: o,
    } as QuestionnaireOption;
  });
}

function createItem(itemType: QuestionnaireItemTypeList, extensions?: Extension[]): QuestionnaireItem {
  return {
    linkId: '1',
    type: itemType,
    text: 'item av type ' + itemType,
    extension: extensions,
  };
}

function createItemControlExtension(code: string): Extension {
  return {
    url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
    valueCodeableConcept: {
      coding: [createItemControlCoding(code)],
    },
  } as Extension;
}

function createItemControlCoding(code: string): Coding {
  return {
    code: code,
    system: { value: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control' } as uri,
  } as Coding;
}

function createWrapperWithComponent(component: JSX.Element): ReactWrapper<{}, {}> {
  const store: Store<{}> = createStore(rootReducer);
  return mount(<Provider store={store}>{component}</Provider>);
}

function createComponentOfType(itemType: QuestionnaireItemTypeList, extensions?: Extension[]): JSX.Element {
  switch (itemType) {
    case 'choice':
      return createComponentChoice(extensions);
    case 'string':
      return createComponentString(extensions);
    case 'boolean':
      return createComponentBoolean(extensions);
    case 'group':
      return createComponentGroup(extensions);
    case 'attachment':
      return createComponentAttachment(extensions);
    case 'date':
      return createComponentDate(extensions);
    case 'dateTime':
      return createComponentDateTime(extensions);
    case 'time':
      return createComponentTime(extensions);
    case 'decimal':
      return createComponentDecimal(extensions);
    case 'integer':
      return createComponentInteger(extensions);
    case 'quantity':
      return createComponentQuantity(extensions);
    case 'text':
      return createComponentText(extensions);
    case 'open-choice':
      return createComponentOpenChoice(extensions);
    default:
      return <React.Fragment />;
  }
}

function createComponentText(extensions?: Extension[]): JSX.Element {
  const item = createItem('text', extensions);

  return (
    <Text
      dispatch={() => (undefined as unknown) as ThunkDispatch<GlobalState, void, NewValueAction>}
      answer={{} as QuestionnaireResponseAnswer}
      item={item}
      path={{} as Path[]}
      renderDeleteButton={() => undefined}
      repeatButton={<React.Fragment />}
      renderHelpButton={() => <div className="helpButton">{'help button'}</div>}
      renderHelpElement={() => <div className="helpText">{'help text'}</div>}
    />
  );
}

function createComponentQuantity(extensions?: Extension[]): JSX.Element {
  const item = createItem('quantity', extensions);

  return (
    <Quantity
      dispatch={() => (undefined as unknown) as ThunkDispatch<GlobalState, void, NewValueAction>}
      answer={{} as QuestionnaireResponseAnswer}
      item={item}
      path={{} as Path[]}
      repeatButton={<React.Fragment />}
      renderHelpButton={() => <div className="helpButton">{'help button'}</div>}
      renderHelpElement={() => <div className="helpText">{'help text'}</div>}
    />
  );
}

function createComponentInteger(extensions?: Extension[]): JSX.Element {
  const item = createItem('integer', extensions);

  return (
    <Integer
      dispatch={() => (undefined as unknown) as ThunkDispatch<GlobalState, void, NewValueAction>}
      answer={{} as QuestionnaireResponseAnswer}
      item={item}
      path={{} as Path[]}
      renderDeleteButton={() => undefined}
      repeatButton={<React.Fragment />}
      oneToTwoColumn={false}
      renderHelpButton={() => <div className="helpButton">{'help button'}</div>}
      renderHelpElement={() => <div className="helpText">{'help text'}</div>}
    />
  );
}

function createComponentDecimal(extensions?: Extension[]): JSX.Element {
  const item = createItem('decimal', extensions);

  return (
    <Decimal
      dispatch={() => (undefined as unknown) as ThunkDispatch<GlobalState, void, NewValueAction>}
      answer={{} as QuestionnaireResponseAnswer}
      item={item}
      path={{} as Path[]}
      renderDeleteButton={() => undefined}
      repeatButton={<React.Fragment />}
      oneToTwoColumn={false}
      renderHelpButton={() => <div className="helpButton">{'help button'}</div>}
      renderHelpElement={() => <div className="helpText">{'help text'}</div>}
    />
  );
}

function createComponentTime(extensions?: Extension[]): JSX.Element {
  const item = createItem('time', extensions);

  return (
    <Time
      dispatch={() => (undefined as unknown) as ThunkDispatch<GlobalState, void, NewValueAction>}
      answer={{} as QuestionnaireResponseAnswer}
      item={item}
      path={{} as Path[]}
      renderDeleteButton={() => undefined}
      repeatButton={<React.Fragment />}
      renderHelpButton={() => <div className="helpButton">{'help button'}</div>}
      renderHelpElement={() => <div className="helpText">{'help text'}</div>}
    />
  );
}

function createComponentDateTime(extensions?: Extension[]): JSX.Element {
  const item = createItem('dateTime', extensions);

  return (
    <DateTime
      dispatch={() => (undefined as unknown) as ThunkDispatch<GlobalState, void, NewValueAction>}
      answer={{} as QuestionnaireResponseAnswer}
      item={item}
      path={{} as Path[]}
      renderDeleteButton={() => undefined}
      repeatButton={<React.Fragment />}
      oneToTwoColumn={false}
      renderHelpButton={() => <div className="helpButton">{'help button'}</div>}
      renderHelpElement={() => <div className="helpText">{'help text'}</div>}
    />
  );
}

function createComponentDate(extensions?: Extension[]): JSX.Element {
  const item = createItem('date', extensions);

  return (
    <Date
      dispatch={() => (undefined as unknown) as ThunkDispatch<GlobalState, void, NewValueAction>}
      answer={{} as QuestionnaireResponseAnswer}
      item={item}
      path={{} as Path[]}
      renderDeleteButton={() => undefined}
      repeatButton={<React.Fragment />}
      renderHelpButton={() => <div className="helpButton">{'help button'}</div>}
      renderHelpElement={() => <div className="helpText">{'help text'}</div>}
    />
  );
}

function createComponentAttachment(extensions?: Extension[]): JSX.Element {
  const item = createItem('attachment', extensions);

  return (
    <Attachment
      dispatch={() => (undefined as unknown) as ThunkDispatch<GlobalState, void, NewValueAction>}
      answer={{} as QuestionnaireResponseAnswer}
      item={item}
      path={{} as Path[]}
      renderDeleteButton={() => undefined}
      repeatButton={<React.Fragment />}
      renderHelpButton={() => <div className="helpButton">{'help button'}</div>}
      renderHelpElement={() => <div className="helpText">{'help text'}</div>}
    />
  );
}

function createComponentGroup(extensions?: Extension[]): JSX.Element {
  const item = createItem('group', extensions);

  return (
    <Group
      dispatch={() => (undefined as unknown) as ThunkDispatch<GlobalState, void, NewValueAction>}
      answer={{} as QuestionnaireResponseAnswer}
      item={item}
      path={{} as Path[]}
      headerTag={1}
      renderDeleteButton={() => undefined}
      repeatButton={<React.Fragment />}
      renderChildrenItems={() => []}
      renderHelpButton={() => <div className="helpButton">{'help button'}</div>}
      renderHelpElement={() => <div className="helpText">{'help text'}</div>}
    />
  );
}

function createComponentBoolean(extensions?: Extension[]): JSX.Element {
  const item = createItem('boolean', extensions);

  return (
    <Boolean
      dispatch={() => (undefined as unknown) as ThunkDispatch<GlobalState, void, NewValueAction>}
      answer={{} as QuestionnaireResponseAnswer}
      item={item}
      path={{} as Path[]}
      renderDeleteButton={() => undefined}
      repeatButton={<React.Fragment />}
      oneToTwoColumn={false}
      renderHelpButton={() => <div className="helpButton">{'help button'}</div>}
      renderHelpElement={() => <div className="helpText">{'help text'}</div>}
    />
  );
}

function createComponentString(extensions?: Extension[]): JSX.Element {
  const item = createItem('string', extensions);

  return (
    <String
      dispatch={() => (undefined as unknown) as ThunkDispatch<GlobalState, void, NewValueAction>}
      answer={{} as QuestionnaireResponseAnswer}
      item={item}
      path={{} as Path[]}
      renderDeleteButton={() => undefined}
      repeatButton={<React.Fragment />}
      visibleDeleteButton={false}
      oneToTwoColumn={false}
      renderHelpButton={() => <div className="helpButton">{'help button'}</div>}
      renderHelpElement={() => <div className="helpText">{'help text'}</div>}
    />
  );
}

function createComponentChoice(extensions?: Extension[]): JSX.Element {
  const option = createValueStringOption('dog', 'cat');
  const item = createItemWithOption(extensions, ...option);

  return (
    <Choice
      dispatch={() => (undefined as unknown) as ThunkDispatch<GlobalState, void, NewValueAction>}
      answer={{} as QuestionnaireResponseAnswer}
      item={item}
      path={{} as Path[]}
      renderDeleteButton={() => undefined}
      repeatButton={<React.Fragment />}
      renderHelpButton={() => <div className="helpButton">{'help button'}</div>}
      renderHelpElement={() => <div className="helpText">{'help text'}</div>}
    />
  );
}

function createComponentOpenChoice(extensions?: Extension[]): JSX.Element {
  const option = createValueStringOption('dog', 'cat');
  const item = createItemWithOption(extensions, ...option);

  return (
    <OpenChoice
      dispatch={() => (undefined as unknown) as ThunkDispatch<GlobalState, void, NewValueAction>}
      answer={{} as QuestionnaireResponseAnswer}
      item={item}
      path={{} as Path[]}
      renderDeleteButton={() => undefined}
      repeatButton={<React.Fragment />}
      renderHelpButton={() => <div className="helpButton">{'help button'}</div>}
      renderHelpElement={() => <div className="helpText">{'help text'}</div>}
    />
  );
}
