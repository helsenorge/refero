import { render, screen } from './test-utils/test-utils';
import * as React from 'react';

import { QuestionnaireItem, Extension, QuestionnaireItemAnswerOption } from 'fhir/r4';
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
import { RenderContextType } from '../../constants/renderContextType';
import { RenderContext } from '../../util/renderContext';
import { createItemControlExtension } from './utils';
import ItemType, { IItemType } from '../../constants/itemType';
import '@testing-library/jest-dom/extend-expect';
import HelpButton from '../help-button/HelpButton';

describe('Component renders help items', () => {
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

function runTest(itemType: IItemType, expect: HelpElement, extensions?: Extension[]) {
  const component = createComponentOfType(itemType, extensions);
  renderWrapperWithComponent(component);
  expectToFind(expect);
}

function expectToFind(helpElement: HelpElement) {
  if (helpElement == HelpElement.HelpButton || helpElement == HelpElement.HelpButtonAndText) {
    expect(screen.getByText('help button')).toBeInTheDocument();
  } else {
    expect(screen.queryByText('help button')).not.toBeInTheDocument();
  }

  if (helpElement == HelpElement.HelpButtonAndText) {
    expect(screen.getByText('help text')).toBeInTheDocument();
  } else {
    expect(screen.queryByText('help text')).not.toBeInTheDocument();
  }
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
    };
  });
}

function createItem(itemType: IItemType, extensions?: Extension[]): QuestionnaireItem {
  return {
    linkId: '1',
    type: itemType,
    text: 'item av type ' + itemType,
    extension: extensions,
  };
}

function renderWrapperWithComponent(component: JSX.Element) {
  const initialState = {}; // Add any required initial state here
  return render(component, { initialState });
}

function createComponentOfType(type: IItemType, extensions?: Extension[]): JSX.Element {
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
      idWithLinkIdAndItemIndex={item.linkId}
      dispatch={() => undefined}
      answer={{ valueString: 'text', id: '1', item: [item] }}
      item={item}
      path={[]}
      renderDeleteButton={() => null}
      repeatButton={<React.Fragment />}
      renderHelpButton={() => <div className="helpButton">{'help button'}</div>}
      renderHelpElement={() => <div className="helpText">{'help text'}</div>}
      renderContext={new RenderContext(RenderContextType.None)}
      renderRepeatButton={() => <React.Fragment />}
    />
  );
}

function createComponentQuantity(extensions?: Extension[]): JSX.Element {
  const item = createItem(ItemType.QUANTITY, extensions);

  return (
    <Quantity
      idWithLinkIdAndItemIndex={item.linkId}
      dispatch={() => undefined}
      answer={{}}
      item={item}
      path={[]}
      repeatButton={<React.Fragment />}
      renderHelpButton={() => <div className="helpButton">{'help button'}</div>}
      renderHelpElement={() => <div className="helpText">{'help text'}</div>}
      renderContext={new RenderContext(RenderContextType.None)}
      renderDeleteButton={jest.fn()}
      renderRepeatButton={() => <React.Fragment />}
    />
  );
}

function createComponentInteger(extensions?: Extension[]): JSX.Element {
  const item = createItem(ItemType.INTEGER, extensions);

  return (
    <Integer
      idWithLinkIdAndItemIndex={item.linkId}
      dispatch={() => undefined}
      answer={{}}
      item={item}
      path={[]}
      renderDeleteButton={() => null}
      repeatButton={<React.Fragment />}
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
      idWithLinkIdAndItemIndex={item.linkId}
      dispatch={() => undefined}
      answer={{}}
      item={item}
      path={[]}
      renderDeleteButton={() => null}
      repeatButton={<React.Fragment />}
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
      idWithLinkIdAndItemIndex={item.linkId}
      dispatch={() => undefined}
      answer={{}}
      item={item}
      path={[]}
      renderDeleteButton={() => null}
      repeatButton={<React.Fragment />}
      renderHelpButton={() => <div className="helpButton">{'help button'}</div>}
      renderHelpElement={() => <div className="helpText">{'help text'}</div>}
      renderContext={new RenderContext(RenderContextType.None)}
      renderRepeatButton={() => <React.Fragment />}
    />
  );
}

function createComponentDateTime(extensions?: Extension[]): JSX.Element {
  const item = createItem(ItemType.DATETIME, extensions);

  return (
    <DateTime
      idWithLinkIdAndItemIndex={item.linkId}
      dispatch={() => undefined}
      answer={{}}
      item={item}
      path={[]}
      renderDeleteButton={() => null}
      repeatButton={<React.Fragment />}
      renderHelpButton={() => <div className="helpButton">{'help button'}</div>}
      renderHelpElement={() => <div className="helpText">{'help text'}</div>}
      renderContext={new RenderContext(RenderContextType.None)}
      renderRepeatButton={() => <React.Fragment />}
    />
  );
}

function createComponentDate(extensions?: Extension[]): JSX.Element {
  const item = createItem(ItemType.DATE, extensions);

  return (
    <Date
      idWithLinkIdAndItemIndex={item.linkId}
      dispatch={() => undefined}
      answer={{}}
      item={item}
      path={[]}
      renderDeleteButton={() => null}
      repeatButton={<React.Fragment />}
      renderHelpButton={() => <div className="helpButton">{'help button'}</div>}
      renderHelpElement={() => <div className="helpText">{'help text'}</div>}
      renderContext={new RenderContext(RenderContextType.None)}
      renderRepeatButton={() => <React.Fragment />}
    />
  );
}

function createComponentAttachment(extensions?: Extension[]): JSX.Element {
  const item = createItem(ItemType.ATTATCHMENT, extensions);

  return (
    <Attachment
      idWithLinkIdAndItemIndex={item.linkId}
      dispatch={() => undefined}
      answer={{}}
      item={item}
      path={[]}
      renderDeleteButton={() => null}
      repeatButton={<React.Fragment />}
      renderHelpButton={() => <div className="helpButton">{'help button'}</div>}
      renderHelpElement={() => <div className="helpText">{'help text'}</div>}
      renderContext={new RenderContext(RenderContextType.None)}
      renderRepeatButton={() => <React.Fragment />}
    />
  );
}

function createComponentGroup(extensions?: Extension[]): JSX.Element {
  const item = createItem(ItemType.GROUP, extensions);

  return (
    <Group
      idWithLinkIdAndItemIndex={item.linkId}
      dispatch={() => undefined}
      answer={{}}
      item={item}
      path={[]}
      headerTag={1}
      renderDeleteButton={() => null}
      repeatButton={<React.Fragment />}
      renderChildrenItems={() => []}
      renderHelpButton={() => <div className="helpButton">{'help button'}</div>}
      renderHelpElement={() => <div className="helpText">{'help text'}</div>}
      renderContext={new RenderContext(RenderContextType.None)}
      renderRepeatButton={() => <React.Fragment />}
    />
  );
}

function createComponentBoolean(extensions?: Extension[]): JSX.Element {
  const item = createItem(ItemType.BOOLEAN, extensions);

  return (
    <Boolean
      idWithLinkIdAndItemIndex={item.linkId}
      dispatch={() => undefined}
      answer={{}}
      item={item}
      path={[]}
      renderDeleteButton={() => null}
      repeatButton={<React.Fragment />}
      oneToTwoColumn={false}
      renderHelpButton={() => <div className="helpButton">{'help button'}</div>}
      renderHelpElement={() => <div className="helpText">{'help text'}</div>}
      renderContext={new RenderContext(RenderContextType.None)}
      renderRepeatButton={() => <React.Fragment />}
    />
  );
}

function createComponentString(extensions?: Extension[]): JSX.Element {
  const item = createItem(ItemType.STRING, extensions);

  return (
    <String
      idWithLinkIdAndItemIndex={item.linkId}
      dispatch={() => undefined}
      answer={{}}
      item={item}
      path={[]}
      renderDeleteButton={() => null}
      repeatButton={<React.Fragment />}
      visibleDeleteButton={false}
      oneToTwoColumn={false}
      renderHelpButton={() => (
        <HelpButton callback={() => {}} item={item}>
          {'help button'}
        </HelpButton>
      )}
      renderHelpElement={() => <div className="helpText">{'help text'}</div>}
      renderContext={new RenderContext(RenderContextType.None)}
      renderRepeatButton={() => <React.Fragment />}
    />
  );
}

function createComponentChoice(extensions?: Extension[]): JSX.Element {
  const option = createValueStringOption('dog', 'cat');
  const item = createItemWithOption(extensions, ...option);

  return (
    <Choice
      idWithLinkIdAndItemIndex={item.linkId}
      dispatch={() => undefined}
      answer={{}}
      item={item}
      path={[]}
      renderDeleteButton={() => null}
      repeatButton={<React.Fragment />}
      renderHelpButton={() => <div className="helpButton">{'help button'}</div>}
      renderHelpElement={() => <div className="helpText">{'help text'}</div>}
      renderContext={new RenderContext(RenderContextType.None)}
      renderRepeatButton={() => <React.Fragment />}
    />
  );
}

function createComponentOpenChoice(extensions?: Extension[]): JSX.Element {
  const option = createValueStringOption('dog', 'cat');
  const item = createItemWithOption(extensions, ...option);

  return (
    <OpenChoice
      idWithLinkIdAndItemIndex={item.linkId}
      dispatch={() => undefined}
      answer={{}}
      item={item}
      path={[]}
      renderDeleteButton={() => null}
      repeatButton={<React.Fragment />}
      renderHelpButton={() => <div className="helpButton">{'help button'}</div>}
      renderHelpElement={() => <div className="helpText">{'help text'}</div>}
      renderContext={new RenderContext(RenderContextType.None)}
      renderRepeatButton={() => <React.Fragment />}
      children={<React.Fragment />}
    />
  );
}
