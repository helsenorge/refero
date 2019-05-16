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

describe('Component renders help items', () => {
  beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation(_ => {
      return {};
    });
  });

  it('should render help button and text for choice component of type radio-button', () => {
    var extension = createItemControlExtension('radio-button');
    runTest('choice', true, HelpElement.HelpButtonAndText, [extension]);
  });

  it('should render help button for choice component of type radio-button', () => {
    var extension = createItemControlExtension('radio-button');
    runTest('choice', false, HelpElement.HelpButton, [extension]);
  });

  it('should render help button and text for choice component of type check-box', () => {
    var extension = createItemControlExtension('check-box');
    runTest('choice', true, HelpElement.HelpButtonAndText, [extension]);
  });

  it('should render help button for choice component of type check-box', () => {
    var extension = createItemControlExtension('check-box');
    runTest('choice', false, HelpElement.HelpButton, [extension]);
  });

  it('should render help button and text for choice component of type drop-down', () => {
    var extension = createItemControlExtension('drop-down');
    runTest('choice', true, HelpElement.HelpButtonAndText, [extension]);
  });

  it('should render help button for choice component of type drop-down', () => {
    var extension = createItemControlExtension('drop-down');
    runTest('choice', false, HelpElement.HelpButton, [extension]);
  });

  it('should render help button and text for string component', () => {
    runTest('string', true, HelpElement.HelpButtonAndText);
  });

  it('should render help button for string component', () => {
    runTest('string', false, HelpElement.HelpButton);
  });

  it('should render help button and text for boolean component', () => {
    runTest('boolean', true, HelpElement.HelpButtonAndText);
  });

  it('should render help button for boolean component', () => {
    runTest('boolean', false, HelpElement.HelpButton);
  });

  it('should render help button and text for group component', () => {
    runTest('group', true, HelpElement.HelpButtonAndText);
  });

  it('should render help button for group component', () => {
    runTest('group', false, HelpElement.HelpButton);
  });

  it('should render help button and text for attachment component', () => {
    runTest('attachment', true, HelpElement.HelpButtonAndText);
  });

  it('should render help button for attachment component', () => {
    runTest('attachment', false, HelpElement.HelpButton);
  });

  it('should render help button and text for date component', () => {
    runTest('date', true, HelpElement.HelpButtonAndText);
  });

  it('should render help button for date component', () => {
    runTest('date', false, HelpElement.HelpButton);
  });

  it('should render help button and text for dateTime component', () => {
    runTest('dateTime', true, HelpElement.HelpButtonAndText);
  });

  it('should render help button for dateTime component', () => {
    runTest('dateTime', false, HelpElement.HelpButton);
  });

  it('should render help button and text for time component', () => {
    runTest('time', true, HelpElement.HelpButtonAndText);
  });

  it('should render help button for time component', () => {
    runTest('time', false, HelpElement.HelpButton);
  });

  it('should render help button and text for decimal component', () => {
    runTest('decimal', true, HelpElement.HelpButtonAndText);
  });

  it('should render help button for decimal component', () => {
    runTest('decimal', false, HelpElement.HelpButton);
  });

  it('should render help button and text for integer component', () => {
    runTest('integer', true, HelpElement.HelpButtonAndText);
  });

  it('should render help button for integer component', () => {
    runTest('integer', false, HelpElement.HelpButton);
  });

  it('should render help button and text for quantity component', () => {
    runTest('quantity', true, HelpElement.HelpButtonAndText);
  });

  it('should render help button for quantity component', () => {
    runTest('quantity', false, HelpElement.HelpButton);
  });

  it('should render help button and text for text component', () => {
    runTest('text', true, HelpElement.HelpButtonAndText);
  });

  it('should render help button for text component', () => {
    runTest('text', false, HelpElement.HelpButton);
  });

  it('should render help button and text for open-choice component of type radio-button', () => {
    var extension = createItemControlExtension('radio-button');
    runTest('open-choice', true, HelpElement.HelpButtonAndText, [extension]);
  });

  it('should render help button for open-choice component of type radio-button', () => {
    var extension = createItemControlExtension('radio-button');
    runTest('open-choice', false, HelpElement.HelpButton, [extension]);
  });

  it('should render help button and text for open-choice component of type check-box', () => {
    var extension = createItemControlExtension('check-box');
    runTest('open-choice', true, HelpElement.HelpButtonAndText, [extension]);
  });

  it('should render help button for open-choice component of type check-box', () => {
    var extension = createItemControlExtension('check-box');
    runTest('open-choice', false, HelpElement.HelpButton, [extension]);
  });

  it('should render help button and text for open-choice component of type drop-down', () => {
    var extension = createItemControlExtension('drop-down');
    runTest('open-choice', true, HelpElement.HelpButtonAndText, [extension]);
  });

  it('should render help button for open-choice component of type drop-down', () => {
    var extension = createItemControlExtension('drop-down');
    runTest('open-choice', false, HelpElement.HelpButton, [extension]);
  });
});

enum HelpElement {
  HelpButton = 1,
  HelpButtonAndText = 2,
}

function runTest(itemType: QuestionnaireItemTypeList, withVisibleHelp: boolean, expect: HelpElement, extensions?: Extension[]) {
  let component = createComponentOfType(itemType, withVisibleHelp, extensions);
  let wrapper = createWrapperWithComponent(component);
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
  let store: Store<{}> = createStore(rootReducer);
  return mount(<Provider store={store}>{component}</Provider>);
}

function createComponentOfType(itemType: QuestionnaireItemTypeList, withVisibleHelp: boolean, extensions?: Extension[]): JSX.Element {
  switch (itemType) {
    case 'choice':
      return createComponentChoice(withVisibleHelp, extensions);
    case 'string':
      return createComponentString(withVisibleHelp, extensions);
    case 'boolean':
      return createComponentBoolean(withVisibleHelp, extensions);
    case 'group':
      return createComponentGroup(withVisibleHelp, extensions);
    case 'attachment':
      return createComponentAttachment(withVisibleHelp, extensions);
    case 'date':
      return createComponentDate(withVisibleHelp, extensions);
    case 'dateTime':
      return createComponentDateTime(withVisibleHelp, extensions);
    case 'time':
      return createComponentTime(withVisibleHelp, extensions);
    case 'decimal':
      return createComponentDecimal(withVisibleHelp, extensions);
    case 'integer':
      return createComponentInteger(withVisibleHelp, extensions);
    case 'quantity':
      return createComponentQuantity(withVisibleHelp, extensions);
    case 'text':
      return createComponentText(withVisibleHelp, extensions);
    case 'open-choice':
      return createComponentOpenChoice(withVisibleHelp, extensions);
    default:
      return <React.Fragment />;
  }
}

function createComponentText(withVisibleHelp: boolean, extensions?: Extension[]): JSX.Element {
  let item = createItem('text', extensions);

  return (
    <Text
      dispatch={() => undefined as any}
      answer={{} as QuestionnaireResponseAnswer}
      item={item}
      path={{} as Path[]}
      renderDeleteButton={() => undefined}
      repeatButton={<React.Fragment />}
      helpElementIsVisible={withVisibleHelp}
      renderHelpButton={() => <div className="helpButton">help button</div>}
      renderHelpElement={() => <div className="helpText">help text</div>}
    />
  );
}

function createComponentQuantity(withVisibleHelp: boolean, extensions?: Extension[]): JSX.Element {
  let item = createItem('quantity', extensions);

  return (
    <Quantity
      dispatch={() => undefined as any}
      answer={{} as QuestionnaireResponseAnswer}
      item={item}
      path={{} as Path[]}
      repeatButton={<React.Fragment />}
      helpElementIsVisible={withVisibleHelp}
      renderHelpButton={() => <div className="helpButton">help button</div>}
      renderHelpElement={() => <div className="helpText">help text</div>}
    />
  );
}

function createComponentInteger(withVisibleHelp: boolean, extensions?: Extension[]): JSX.Element {
  let item = createItem('integer', extensions);

  return (
    <Integer
      dispatch={() => undefined as any}
      answer={{} as QuestionnaireResponseAnswer}
      item={item}
      path={{} as Path[]}
      renderDeleteButton={() => undefined}
      repeatButton={<React.Fragment />}
      oneToTwoColumn={false}
      helpElementIsVisible={withVisibleHelp}
      renderHelpButton={() => <div className="helpButton">help button</div>}
      renderHelpElement={() => <div className="helpText">help text</div>}
    />
  );
}

function createComponentDecimal(withVisibleHelp: boolean, extensions?: Extension[]): JSX.Element {
  let item = createItem('decimal', extensions);

  return (
    <Decimal
      dispatch={() => undefined as any}
      answer={{} as QuestionnaireResponseAnswer}
      item={item}
      path={{} as Path[]}
      renderDeleteButton={() => undefined}
      repeatButton={<React.Fragment />}
      oneToTwoColumn={false}
      helpElementIsVisible={withVisibleHelp}
      renderHelpButton={() => <div className="helpButton">help button</div>}
      renderHelpElement={() => <div className="helpText">help text</div>}
    />
  );
}

function createComponentTime(withVisibleHelp: boolean, extensions?: Extension[]): JSX.Element {
  let item = createItem('time', extensions);

  return (
    <Time
      dispatch={() => undefined as any}
      answer={{} as QuestionnaireResponseAnswer}
      item={item}
      path={{} as Path[]}
      renderDeleteButton={() => undefined}
      repeatButton={<React.Fragment />}
      helpElementIsVisible={withVisibleHelp}
      renderHelpButton={() => <div className="helpButton">help button</div>}
      renderHelpElement={() => <div className="helpText">help text</div>}
    />
  );
}

function createComponentDateTime(withVisibleHelp: boolean, extensions?: Extension[]): JSX.Element {
  let item = createItem('dateTime', extensions);

  return (
    <DateTime
      dispatch={() => undefined as any}
      answer={{} as QuestionnaireResponseAnswer}
      item={item}
      path={{} as Path[]}
      renderDeleteButton={() => undefined}
      repeatButton={<React.Fragment />}
      oneToTwoColumn={false}
      helpElementIsVisible={withVisibleHelp}
      renderHelpButton={() => <div className="helpButton">help button</div>}
      renderHelpElement={() => <div className="helpText">help text</div>}
    />
  );
}

function createComponentDate(withVisibleHelp: boolean, extensions?: Extension[]): JSX.Element {
  let item = createItem('date', extensions);

  return (
    <Date
      dispatch={() => undefined as any}
      answer={{} as QuestionnaireResponseAnswer}
      item={item}
      path={{} as Path[]}
      renderDeleteButton={() => undefined}
      repeatButton={<React.Fragment />}
      helpElementIsVisible={withVisibleHelp}
      renderHelpButton={() => <div className="helpButton">help button</div>}
      renderHelpElement={() => <div className="helpText">help text</div>}
    />
  );
}

function createComponentAttachment(withVisibleHelp: boolean, extensions?: Extension[]): JSX.Element {
  let item = createItem('attachment', extensions);

  return (
    <Attachment
      dispatch={() => undefined as any}
      answer={{} as QuestionnaireResponseAnswer}
      item={item}
      path={{} as Path[]}
      renderDeleteButton={() => undefined}
      repeatButton={<React.Fragment />}
      helpElementIsVisible={withVisibleHelp}
      renderHelpButton={() => <div className="helpButton">help button</div>}
      renderHelpElement={() => <div className="helpText">help text</div>}
    />
  );
}

function createComponentGroup(withVisibleHelp: boolean, extensions?: Extension[]): JSX.Element {
  let item = createItem('group', extensions);

  return (
    <Group
      dispatch={() => undefined as any}
      answer={{} as QuestionnaireResponseAnswer}
      item={item}
      path={{} as Path[]}
      headerTag={1}
      renderDeleteButton={() => undefined}
      repeatButton={<React.Fragment />}
      renderChildrenItems={() => []}
      helpElementIsVisible={withVisibleHelp}
      renderHelpButton={() => <div className="helpButton">help button</div>}
      renderHelpElement={() => <div className="helpText">help text</div>}
    />
  );
}

function createComponentBoolean(withVisibleHelp: boolean, extensions?: Extension[]): JSX.Element {
  let item = createItem('boolean', extensions);

  return (
    <Boolean
      dispatch={() => undefined as any}
      answer={{} as QuestionnaireResponseAnswer}
      item={item}
      path={{} as Path[]}
      renderDeleteButton={() => undefined}
      repeatButton={<React.Fragment />}
      oneToTwoColumn={false}
      helpElementIsVisible={withVisibleHelp}
      renderHelpButton={() => <div className="helpButton">help button</div>}
      renderHelpElement={() => <div className="helpText">help text</div>}
    />
  );
}

function createComponentString(withVisibleHelp: boolean, extensions?: Extension[]): JSX.Element {
  let item = createItem('string', extensions);

  return (
    <String
      dispatch={() => undefined as any}
      answer={{} as QuestionnaireResponseAnswer}
      item={item}
      path={{} as Path[]}
      renderDeleteButton={() => undefined}
      repeatButton={<React.Fragment />}
      visibleDeleteButton={false}
      oneToTwoColumn={false}
      helpElementIsVisible={withVisibleHelp}
      renderHelpButton={() => <div className="helpButton">help button</div>}
      renderHelpElement={() => <div className="helpText">help text</div>}
    />
  );
}

function createComponentChoice(withVisibleHelp: boolean, extensions?: Extension[]): JSX.Element {
  let option = createValueStringOption('dog', 'cat');
  let item = createItemWithOption(extensions, ...option);

  return (
    <Choice
      dispatch={() => undefined as any}
      answer={{} as QuestionnaireResponseAnswer}
      item={item}
      path={{} as Path[]}
      renderDeleteButton={() => undefined}
      repeatButton={<React.Fragment />}
      helpElementIsVisible={withVisibleHelp}
      renderHelpButton={() => <div className="helpButton">help button</div>}
      renderHelpElement={() => <div className="helpText">help text</div>}
    />
  );
}

function createComponentOpenChoice(withVisibleHelp: boolean, extensions?: Extension[]): JSX.Element {
  let option = createValueStringOption('dog', 'cat');
  let item = createItemWithOption(extensions, ...option);

  return (
    <OpenChoice
      dispatch={() => undefined as any}
      answer={{} as QuestionnaireResponseAnswer}
      item={item}
      path={{} as Path[]}
      renderDeleteButton={() => undefined}
      repeatButton={<React.Fragment />}
      helpElementIsVisible={withVisibleHelp}
      renderHelpButton={() => <div className="helpButton">help button</div>}
      renderHelpElement={() => <div className="helpText">help text</div>}
    />
  );
}
