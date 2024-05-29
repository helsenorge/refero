import * as React from 'react';
import { render, screen } from './test-utils/test-utils';
import '@testing-library/jest-dom/extend-expect';
import { OpenChoice } from '../formcomponents/open-choice/open-choice';
import { QuestionnaireItem, QuestionnaireItemAnswerOption, QuestionnaireResponseItemAnswer, Extension } from 'fhir/r4';
import itemType from '../../constants/itemType';
import '../../util/defineFetch';
import { createIDataReceiverExpressionExtension } from '../__tests__/utils';
import { OPEN_CHOICE_ID, OPEN_CHOICE_SYSTEM, OPEN_CHOICE_LABEL } from '../../constants';

const initAnswer: QuestionnaireResponseItemAnswer[] = [{}];

describe('Open-Choice component render', () => {
  beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation(() => ({
      matches: false,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  it('should render data-receiver with coding answer as text', () => {
    const extensions = [createIDataReceiverExpressionExtension('Test')];
    const item = createItemWithExtensions(...extensions);
    item.readOnly = true;
    const answer = [{ valueCoding: { code: '3', display: 'Usikker', system: 'urn:oid:2.16.578.1.12.4.1.9523' } }];
    renderWrapperWithItem(item, answer);

    const textView = screen.getByText('Usikker');
    expect(textView).toBeInTheDocument();
  });

  it('should render data-receiver with coding and text value as text', () => {
    const extensions = [createIDataReceiverExpressionExtension('Test')];
    const item = createItemWithExtensions(...extensions);
    item.readOnly = true;
    const answer = [
      { valueCoding: { code: '3', display: 'Usikker', system: 'urn:oid:2.16.578.1.12.4.1.9523' } },
      { valueCoding: { code: OPEN_CHOICE_ID, display: OPEN_CHOICE_LABEL, system: OPEN_CHOICE_SYSTEM } },
      { valueString: 'Free text' },
    ];
    renderWrapperWithItem(item, answer);

    const textView = screen.getByText('Usikker, Free text');
    expect(textView).toBeInTheDocument();
  });

  it('should render valueStrings as input value', () => {
    const option = createValueStringOption('Home', 'Car');
    const item = createItemWithOption(...option);
    const answer = [
      { valueCoding: { code: OPEN_CHOICE_ID, display: OPEN_CHOICE_LABEL, system: OPEN_CHOICE_SYSTEM } },
      { valueString: 'Free text' },
    ] as QuestionnaireResponseItemAnswer[];
    renderWrapperWithItem(item, answer);

    const input = screen.getAllByRole('textbox');
    expect(input.length).toBeGreaterThan(0);
    input.forEach(input => {
      expect(input).toHaveAttribute('type', 'text');
      expect(input).not.toHaveAttribute('disabled');
      expect(input).toHaveValue('Free text');
    });
  });

  it('should render empty valueString as empty input value', () => {
    const option = createValueStringOption('Home', 'Car');
    const item = createItemWithOption(...option);
    const answer = [
      { valueCoding: { code: OPEN_CHOICE_ID, display: OPEN_CHOICE_LABEL, system: OPEN_CHOICE_SYSTEM } },
    ] as QuestionnaireResponseItemAnswer[];
    renderWrapperWithItem(item, answer);

    const input = screen.getAllByRole('textbox');
    expect(input.length).toBeGreaterThan(0);
    input.forEach(input => {
      expect(input).toHaveAttribute('type', 'text');
      expect(input).not.toHaveAttribute('disabled');
      expect(input).toHaveValue('');
    });
  });
});

function renderWrapperWithItem(item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer[] = initAnswer) {
  const initialState = {}; // Add any required initial state here
  return render(
    <OpenChoice
      id={item.linkId}
      idWithLinkIdAndItemIndex={item.linkId}
      answer={answer}
      item={item}
      path={[]}
      renderDeleteButton={() => <></>}
      repeatButton={<React.Fragment />}
      renderHelpButton={() => <React.Fragment />}
      renderHelpElement={() => <React.Fragment />}
      onAnswerChange={() => {}}
      responseItem={{
        linkId: item.linkId,
      }}
    />,
    { initialState }
  );
}

function createValueStringOption(...options: string[]): QuestionnaireItemAnswerOption[] {
  return options.map(o => {
    return {
      valueCoding: { code: o, display: o },
    };
  });
}

function createItemWithOption(...options: QuestionnaireItemAnswerOption[]): QuestionnaireItem {
  return {
    linkId: '1',
    type: itemType.OPENCHOICE,
    answerOption: options,
  };
}

function createItemWithExtensions(...extensions: Extension[]): QuestionnaireItem {
  return {
    linkId: '1',
    type: itemType.OPENCHOICE,
    extension: extensions,
  };
}
