import * as React from 'react';
import { createStore } from 'redux';
import { Provider, Store } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { ReactWrapper, mount } from 'enzyme';

import '../../util/defineFetch';
import rootReducer from '../../reducers';
import { QuestionnaireItem, Extension, QuestionnaireResponseItemAnswer, QuestionnaireItemAnswerOption } from '../../types/fhir';
import { Path } from '../../util/refero-core';
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
import { RenderContextType } from '../../constants/renderContextType';
import { RenderContext } from '../../util/renderContext';
import { createItemControlExtension } from '../__tests__/utils';
import ItemType from '../../constants/itemType';

describe('Component renders help items', () => {
  beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation(_ => {
      return {};
    });
  });

  it('should render help button and text for choice component of type radio-button', () => {
    const extension = createItemControlExtension('radio-button');
    runTest(ItemType.CHOICE, HelpElement.HelpButtonAndText, [extension]);
  });

  it('should render help button and text for choice component of type check-box', () => {
    const extension = createItemControlExtension('check-box');
    runTest(ItemType.CHOICE, HelpElement.HelpButtonAndText, [extension]);
  });

  it('should render help button and text for choice component of type drop-down', () => {
    const extension = createItemControlExtension('drop-down');
    runTest(ItemType.CHOICE, HelpElement.HelpButtonAndText, [extension]);
  });

  it('should render help button and text for string component', () => {
    runTest(ItemType.STRING, HelpElement.HelpButtonAndText);
  });

  it('should render help button and text for boolean component', () => {
    runTest(ItemType.BOOLEAN, HelpElement.HelpButtonAndText);
  });

  it('should render help button and text for group component', () => {
    runTest(ItemType.GROUP, HelpElement.HelpButtonAndText);
  });

  it('should render help button and text for attachment component', () => {
    runTest(ItemType.ATTATCHMENT, HelpElement.HelpButtonAndText);
  });

  it('should render help button and text for date component', () => {
    runTest(ItemType.DATE, HelpElement.HelpButtonAndText);
  });

  it('should render help button and text for dateTime component', () => {
    runTest(ItemType.DATETIME, HelpElement.HelpButtonAndText);
  });

  it('should render help button and text for time component', () => {
    runTest(ItemType.TIME, HelpElement.HelpButtonAndText);
  });

  it('should render help button and text for decimal component', () => {
    runTest(ItemType.DECIMAL, HelpElement.HelpButtonAndText);
  });

  it('should render help button and text for integer component', () => {
    runTest(ItemType.INTEGER, HelpElement.HelpButtonAndText);
  });

  it('should render help button and text for quantity component', () => {
    runTest(ItemType.QUANTITY, HelpElement.HelpButtonAndText);
  });

  it('should render help button and text for text component', () => {
    runTest(ItemType.TEXT, HelpElement.HelpButtonAndText);
  });

  it('should render help button and text for open-choice component of type radio-button', () => {
    const extension = createItemControlExtension('radio-button');
    runTest(ItemType.OPENCHOICE, HelpElement.HelpButtonAndText, [extension]);
  });

  it('should render help button and text for open-choice component of type check-box', () => {
    const extension = createItemControlExtension('check-box');
    runTest(ItemType.OPENCHOICE, HelpElement.HelpButtonAndText, [extension]);
  });

  it('should render help button and text for open-choice component of type drop-down', () => {
    const extension = createItemControlExtension('drop-down');
    runTest(ItemType.OPENCHOICE, HelpElement.HelpButtonAndText, [extension]);
  });
});

enum HelpElement {
  HelpButton = 1,
  HelpButtonAndText = 2,
}

function runTest(itemType: string, expect: HelpElement, extensions?: Extension[]) {
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

function createItemWithOption(extensions?: Extension[], ...options: QuestionnaireItemAnswerOption[]): QuestionnaireItem {
  return {
    linkId: '1',
    type: 'choice',
    answerOption: options,
    extension: extensions,
  };
}

function createValueStringOption(...options: string[]): QuestionnaireItemAnswerOption[] {
  return options.map(o => {
    return {
      valueString: o,
    } as QuestionnaireItemAnswerOption;
  });
}

function createItem(itemType: string, extensions?: Extension[]): QuestionnaireItem {
  return {
    linkId: '1',
    type: itemType,
    text: 'item av type ' + itemType,
    extension: extensions,
  };
}

function createWrapperWithComponent(component: JSX.Element): ReactWrapper<{}, {}> {
  const store: Store<{}> = createStore(rootReducer);
  return mount(<Provider store={store}>{component}</Provider>);
}

function createComponentOfType(type: string, extensions?: Extension[]): JSX.Element {
  switch (type) {
    case ItemType.CHOICE:
      return createComponentChoice(extensions);
    case ItemType.STRING:
      return createComponentString(extensions);
    case ItemType.BOOLEAN:
      return createComponentBoolean(extensions);
    case ItemType.GROUP:
      return createComponentGroup(extensions);
    case ItemType.ATTATCHMENT:
      return createComponentAttachment(extensions);
    case ItemType.DATE:
      return createComponentDate(extensions);
    case ItemType.DATETIME:
      return createComponentDateTime(extensions);
    case ItemType.TIME:
      return createComponentTime(extensions);
    case ItemType.DECIMAL:
      return createComponentDecimal(extensions);
    case ItemType.INTEGER:
      return createComponentInteger(extensions);
    case ItemType.QUANTITY:
      return createComponentQuantity(extensions);
    case ItemType.TEXT:
      return createComponentText(extensions);
    case ItemType.OPENCHOICE:
      return createComponentOpenChoice(extensions);
    default:
      return <React.Fragment />;
  }
}

function createComponentText(extensions?: Extension[]): JSX.Element {
  const item = createItem(ItemType.TEXT, extensions);

  return (
    <Text
      dispatch={() => undefined as unknown as ThunkDispatch<GlobalState, void, NewValueAction>}
      answer={{} as QuestionnaireResponseItemAnswer}
      item={item}
      path={{} as Path[]}
      renderDeleteButton={() => undefined}
      repeatButton={<React.Fragment />}
      renderHelpButton={() => <div className="helpButton">{'help button'}</div>}
      renderHelpElement={() => <div className="helpText">{'help text'}</div>}
      renderContext={new RenderContext(RenderContextType.None)}
    />
  );
}

function createComponentQuantity(extensions?: Extension[]): JSX.Element {
  const item = createItem(ItemType.QUANTITY, extensions);

  return (
    <Quantity
      dispatch={() => undefined as unknown as ThunkDispatch<GlobalState, void, NewValueAction>}
      answer={{} as QuestionnaireResponseItemAnswer}
      item={item}
      path={{} as Path[]}
      repeatButton={<React.Fragment />}
      renderHelpButton={() => <div className="helpButton">{'help button'}</div>}
      renderHelpElement={() => <div className="helpText">{'help text'}</div>}
      renderContext={new RenderContext(RenderContextType.None)}
      renderDeleteButton={jest.fn()}
    />
  );
}

function createComponentInteger(extensions?: Extension[]): JSX.Element {
  const item = createItem(ItemType.INTEGER, extensions);

  return (
    <Integer
      dispatch={() => undefined as unknown as ThunkDispatch<GlobalState, void, NewValueAction>}
      answer={{} as QuestionnaireResponseItemAnswer}
      item={item}
      path={{} as Path[]}
      renderDeleteButton={() => undefined}
      repeatButton={<React.Fragment />}
      oneToTwoColumn={false}
      renderHelpButton={() => <div className="helpButton">{'help button'}</div>}
      renderHelpElement={() => <div className="helpText">{'help text'}</div>}
      renderContext={new RenderContext(RenderContextType.None)}
    />
  );
}

function createComponentDecimal(extensions?: Extension[]): JSX.Element {
  const item = createItem(ItemType.DECIMAL, extensions);

  return (
    <Decimal
      dispatch={() => undefined as unknown as ThunkDispatch<GlobalState, void, NewValueAction>}
      answer={{} as QuestionnaireResponseItemAnswer}
      item={item}
      path={{} as Path[]}
      renderDeleteButton={() => undefined}
      repeatButton={<React.Fragment />}
      oneToTwoColumn={false}
      renderHelpButton={() => <div className="helpButton">{'help button'}</div>}
      renderHelpElement={() => <div className="helpText">{'help text'}</div>}
      renderContext={new RenderContext(RenderContextType.None)}
    />
  );
}

function createComponentTime(extensions?: Extension[]): JSX.Element {
  const item = createItem(ItemType.TIME, extensions);

  return (
    <Time
      dispatch={() => undefined as unknown as ThunkDispatch<GlobalState, void, NewValueAction>}
      answer={{} as QuestionnaireResponseItemAnswer}
      item={item}
      path={{} as Path[]}
      renderDeleteButton={() => undefined}
      repeatButton={<React.Fragment />}
      renderHelpButton={() => <div className="helpButton">{'help button'}</div>}
      renderHelpElement={() => <div className="helpText">{'help text'}</div>}
      renderContext={new RenderContext(RenderContextType.None)}
    />
  );
}

function createComponentDateTime(extensions?: Extension[]): JSX.Element {
  const item = createItem(ItemType.DATETIME, extensions);

  return (
    <DateTime
      dispatch={() => undefined as unknown as ThunkDispatch<GlobalState, void, NewValueAction>}
      answer={{} as QuestionnaireResponseItemAnswer}
      item={item}
      path={{} as Path[]}
      renderDeleteButton={() => undefined}
      repeatButton={<React.Fragment />}
      oneToTwoColumn={false}
      renderHelpButton={() => <div className="helpButton">{'help button'}</div>}
      renderHelpElement={() => <div className="helpText">{'help text'}</div>}
      renderContext={new RenderContext(RenderContextType.None)}
    />
  );
}

function createComponentDate(extensions?: Extension[]): JSX.Element {
  const item = createItem(ItemType.DATE, extensions);

  return (
    <Date
      dispatch={() => undefined as unknown as ThunkDispatch<GlobalState, void, NewValueAction>}
      answer={{} as QuestionnaireResponseItemAnswer}
      item={item}
      path={{} as Path[]}
      renderDeleteButton={() => undefined}
      repeatButton={<React.Fragment />}
      renderHelpButton={() => <div className="helpButton">{'help button'}</div>}
      renderHelpElement={() => <div className="helpText">{'help text'}</div>}
      renderContext={new RenderContext(RenderContextType.None)}
    />
  );
}

function createComponentAttachment(extensions?: Extension[]): JSX.Element {
  const item = createItem(ItemType.ATTATCHMENT, extensions);

  return (
    <Attachment
      dispatch={() => undefined as unknown as ThunkDispatch<GlobalState, void, NewValueAction>}
      answer={{} as QuestionnaireResponseItemAnswer}
      item={item}
      path={{} as Path[]}
      renderDeleteButton={() => undefined}
      repeatButton={<React.Fragment />}
      renderHelpButton={() => <div className="helpButton">{'help button'}</div>}
      renderHelpElement={() => <div className="helpText">{'help text'}</div>}
      renderContext={new RenderContext(RenderContextType.None)}
    />
  );
}

function createComponentGroup(extensions?: Extension[]): JSX.Element {
  const item = createItem(ItemType.GROUP, extensions);

  return (
    <Group
      dispatch={() => undefined as unknown as ThunkDispatch<GlobalState, void, NewValueAction>}
      answer={{} as QuestionnaireResponseItemAnswer}
      item={item}
      path={{} as Path[]}
      headerTag={1}
      renderDeleteButton={() => undefined}
      repeatButton={<React.Fragment />}
      renderChildrenItems={() => []}
      renderHelpButton={() => <div className="helpButton">{'help button'}</div>}
      renderHelpElement={() => <div className="helpText">{'help text'}</div>}
      renderContext={new RenderContext(RenderContextType.None)}
    />
  );
}

function createComponentBoolean(extensions?: Extension[]): JSX.Element {
  const item = createItem(ItemType.BOOLEAN, extensions);

  return (
    <Boolean
      dispatch={() => undefined as unknown as ThunkDispatch<GlobalState, void, NewValueAction>}
      answer={{} as QuestionnaireResponseItemAnswer}
      item={item}
      path={{} as Path[]}
      renderDeleteButton={() => undefined}
      repeatButton={<React.Fragment />}
      oneToTwoColumn={false}
      renderHelpButton={() => <div className="helpButton">{'help button'}</div>}
      renderHelpElement={() => <div className="helpText">{'help text'}</div>}
      renderContext={new RenderContext(RenderContextType.None)}
    />
  );
}

function createComponentString(extensions?: Extension[]): JSX.Element {
  const item = createItem(ItemType.STRING, extensions);

  return (
    <String
      dispatch={() => undefined as unknown as ThunkDispatch<GlobalState, void, NewValueAction>}
      answer={{} as QuestionnaireResponseItemAnswer}
      item={item}
      path={{} as Path[]}
      renderDeleteButton={() => undefined}
      repeatButton={<React.Fragment />}
      visibleDeleteButton={false}
      oneToTwoColumn={false}
      renderHelpButton={() => <div className="helpButton">{'help button'}</div>}
      renderHelpElement={() => <div className="helpText">{'help text'}</div>}
      renderContext={new RenderContext(RenderContextType.None)}
    />
  );
}

function createComponentChoice(extensions?: Extension[]): JSX.Element {
  const option = createValueStringOption('dog', 'cat');
  const item = createItemWithOption(extensions, ...option);

  return (
    <Choice
      dispatch={() => undefined as unknown as ThunkDispatch<GlobalState, void, NewValueAction>}
      answer={{} as QuestionnaireResponseItemAnswer}
      item={item}
      path={{} as Path[]}
      renderDeleteButton={() => undefined}
      repeatButton={<React.Fragment />}
      renderHelpButton={() => <div className="helpButton">{'help button'}</div>}
      renderHelpElement={() => <div className="helpText">{'help text'}</div>}
      renderContext={new RenderContext(RenderContextType.None)}
    />
  );
}

function createComponentOpenChoice(extensions?: Extension[]): JSX.Element {
  const option = createValueStringOption('dog', 'cat');
  const item = createItemWithOption(extensions, ...option);

  return (
    <OpenChoice
      dispatch={() => undefined as unknown as ThunkDispatch<GlobalState, void, NewValueAction>}
      answer={{} as QuestionnaireResponseItemAnswer}
      item={item}
      path={{} as Path[]}
      renderDeleteButton={() => undefined}
      repeatButton={<React.Fragment />}
      renderHelpButton={() => <div className="helpButton">{'help button'}</div>}
      renderHelpElement={() => <div className="helpText">{'help text'}</div>}
      renderContext={new RenderContext(RenderContextType.None)}
    />
  );
}
