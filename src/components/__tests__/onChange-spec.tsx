import { screen, userEvent, act, renderRefero } from './test-utils/test-utils';
import moment from 'moment';
import '@testing-library/jest-dom/extend-expect';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer, Quantity, Coding, Questionnaire } from 'fhir/r4';

import '../../util/defineFetch';
import Constants, { OPEN_CHOICE_ID } from '../../constants/index';
import { IActionRequester } from '../../util/actionRequester';
import { IQuestionnaireInspector, QuestionnaireItemPair } from '../../util/questionnaireInspector';
import questionnaireWithAllItemTypes from './__data__/onChange/allItemTypes';
import questionnaireWithNestedItems from './__data__/onChange/nestedItems';
import questionnaireWithRepeats from './__data__/onChange/repeats';
import { inputAnswer, selectRadioButtonOption, changeCheckBoxOption, findItem, findItemByDispayValue, selectBoolean } from './utils';

function toCoding(code: string, system?: string): Coding {
  return {
    code: code,
    system: system,
  };
}

function toQuantity(value: number, code: string, unit: string, system?: string): Quantity {
  return {
    value: value,
    code: code,
    unit: unit,
    system: system,
  };
}

function createOnChangeFuncForActionRequester(actions: (actionRequester: IActionRequester) => void) {
  return (
    _item: QuestionnaireItem,
    _answer: QuestionnaireResponseItemAnswer,
    actionRequester: IActionRequester,
    _questionnaireInspector: IQuestionnaireInspector
  ) => {
    actions(actionRequester);
  };
}

function createOnChangeFuncForQuestionnaireInspector(actions: (questionnaireInspector: IQuestionnaireInspector) => void) {
  return (
    _item: QuestionnaireItem,
    _answer: QuestionnaireResponseItemAnswer,
    _actionRequester: IActionRequester,
    questionnaireInspector: IQuestionnaireInspector
  ) => {
    actions(questionnaireInspector);
  };
}

async function addValueToInputByTypeAndTab(componentLabel: string, value: string) {
  const element = screen.getByLabelText(componentLabel);
  await act(async () => {
    userEvent.type(element, value);
    userEvent.tab();
  });

  const answer = screen.getByRole('spinbutton', { name: componentLabel });
  return { answer, element };
}

describe('onAnswerChange callback gets called and can request additional changes', () => {
  beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation(_ => {
      return {};
    });
  });

  it('integers gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addIntegerAnswer('2', 42);
    });

    const { findByDisplayValue } = wrapper(onChange, questionnaireWithAllItemTypes);

    const { answer } = await addValueToInputByTypeAndTab('Decimal', '0.1');

    const elm = await findByDisplayValue(42);
    expect(elm).toBeInTheDocument();
    expect(answer).toHaveValue(0.1);
  });

  it('integers gets cleared', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addIntegerAnswer('2', 42);
      actionRequester.clearIntegerAnswer('2');
    });
    const { getByLabelText } = wrapper(onChange, questionnaireWithAllItemTypes);

    const { answer } = await addValueToInputByTypeAndTab('Decimal', '0.1');

    const integerAnswer = getByLabelText('Integer');

    expect(answer).toHaveValue(0.1);
    expect(integerAnswer).toHaveValue(null);
  });

  it('decimals gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addDecimalAnswer('1', 42);
    });

    const { container } = wrapper(onChange, questionnaireWithAllItemTypes);
    await act(async () => {
      inputAnswer('1', 0.1, container);
    });

    const updatedInput = await screen.findByDisplayValue('42');
    expect(updatedInput).toBeInTheDocument();
  });

  it('decimals gets cleared', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addDecimalAnswer('1', 42);
      actionRequester.clearDecimalAnswer('1');
    });

    const { container } = wrapper(onChange, questionnaireWithAllItemTypes);
    await act(async () => {
      inputAnswer('1', 0.1, container);
    });
    const item = findItem('2', container);

    expect(item).toHaveValue(null);
  });

  it('quantity gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addQuantityAnswer('3', toQuantity(42, 'kg', 'kilogram', 'http://unitsofmeasure.org'));
    });

    const { container } = wrapper(onChange, questionnaireWithAllItemTypes);

    await act(async () => {
      inputAnswer('1', 0.1, container);
    });
    const item = await findItemByDispayValue('42');
    expect(item).toHaveValue(42);
  });

  it('quantity gets cleared', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addQuantityAnswer('3', toQuantity(42, 'kg', 'kilogram', 'http://unitsofmeasure.org'));
      actionRequester.clearQuantityAnswer('3');
    });

    const { container } = wrapper(onChange, questionnaireWithAllItemTypes);
    await act(async () => {
      inputAnswer('1', 0.1, container);
    });
    const item = findItem('3', container);
    expect(item).toHaveValue(null);
  });

  it.skip('boolean gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addBooleanAnswer('4', true);
    });

    const { container } = wrapper(onChange, questionnaireWithAllItemTypes);
    selectBoolean('1', container);
    const updatedInput = await screen.findByDisplayValue('true');
    expect(updatedInput).toBeChecked();
  });

  it.skip('boolean gets cleared', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addBooleanAnswer('4', true);
      actionRequester.clearBooleanAnswer('4');
    });

    const { container } = wrapper(onChange, questionnaireWithAllItemTypes);

    inputAnswer('1', 0.1, container);
    const item = findItem('4', container);
    expect(item).not.toBeChecked();
  });

  it.skip('choice (radiobuttons) gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addChoiceAnswer('5a', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
    });

    const { container } = wrapper(onChange, questionnaireWithAllItemTypes);
    await act(async () => {
      selectRadioButtonOption('1', 0.1, container);
    });
    const item = findItem('5a-hn-1', container);

    expect(item).toBeChecked();
  });

  it.skip('choice (radiobuttons) does not get cleared', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addChoiceAnswer('5a', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
      actionRequester.removeChoiceAnswer('5a', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
    });

    const { container } = wrapper(onChange, questionnaireWithAllItemTypes);

    await selectRadioButtonOption('1', 0.1, container);
    const item = findItem('5a-hn-1', container);

    expect(item).toBeChecked();
  });

  it.skip('choice (checkboxes) gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addChoiceAnswer('5b', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
    });

    const { container } = wrapper(onChange, questionnaireWithAllItemTypes);

    await changeCheckBoxOption('1', '2', container);
    const item = findItem('5b-2', container);

    expect(item).toBeChecked();
  });

  it.skip('choice (checkboxes) gets cleared', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addChoiceAnswer('5b', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
      actionRequester.removeChoiceAnswer('5b', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
    });

    const { container } = wrapper(onChange, questionnaireWithAllItemTypes);

    await changeCheckBoxOption('1', '2', container);
    const item = findItem('5b-2', container);
    expect(item).not.toBeChecked();
  });

  it.skip('openchoice (radiobuttons) gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addOpenChoiceAnswer('6a', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
    });

    const { container } = wrapper(onChange, questionnaireWithAllItemTypes);

    await selectRadioButtonOption('1', 0.1, container);
    const item = findItem('6a-hn-1', container);
    expect(item).toBeChecked();
  });

  it.skip('openchoice (checkboxes) gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addOpenChoiceAnswer('6b', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
    });

    const { container } = wrapper(onChange, questionnaireWithAllItemTypes);

    await changeCheckBoxOption('1', '2', container);
    const item = findItem('6b-2', container);
    expect(item).toBeChecked();
  });

  it.skip('date gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addDateAnswer('7a', '2020-05-17');
    });

    const { container } = wrapper(onChange, questionnaireWithAllItemTypes);

    inputAnswer('1', 0.1, container);
    const item = findItem('7a-datepicker_input', container);
    expect(item).toHaveValue('17.05.2020');
  });

  it.skip('date gets cleared', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addDateAnswer('7a', '2020-05-17');
      actionRequester.clearDateAnswer('7a');
    });

    const { container } = wrapper(onChange, questionnaireWithAllItemTypes);

    inputAnswer('1', 0.1, container);
    const item = findItem('7a-datepicker_input', container);
    expect(item).toHaveValue(null);
  });

  it.skip('time gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addTimeAnswer('7b', '12:01');
    });

    const { container } = wrapper(onChange, questionnaireWithAllItemTypes);

    inputAnswer('1', 0.1, container);

    let item = screen.getByLabelText('#item_7b_hours');
    expect(item).toHaveValue('12');

    item = screen.getByLabelText('#item_7b_minutes');
    expect(item).toHaveValue('01');
  });

  it.skip('time gets cleared', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addTimeAnswer('7b', '12:01');
      actionRequester.clearTimeAnswer('7b');
    });

    const { container } = wrapper(onChange, questionnaireWithAllItemTypes);

    inputAnswer('1', 0.1, container);

    let item = screen.getByLabelText('#item_7b_hours');
    expect(item).toHaveValue(null);

    item = screen.getByLabelText('#item_7b_minutes');
    expect(item).toHaveValue(null);
  });

  it.skip('dateTime gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addDateTimeAnswer('7c', '2020-05-17T12:01:00Z');
    });

    const { container } = wrapper(onChange, questionnaireWithAllItemTypes);

    inputAnswer('1', 0.1, container);

    const item = screen.getByTestId('date-time-picker');
    const date = item.getAttribute('value');
    const dateString = moment(date).locale('nb').utc().format(Constants.DATE_TIME_FORMAT);
    expect(dateString).toBe('2020-05-17T12:01:00+00:00');
  });

  it.skip('dateTime gets cleared', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addDateTimeAnswer('7c', '2020-05-17T12:01:00Z');
      actionRequester.clearDateTimeAnswer('7c');
    });

    const { container } = wrapper(onChange, questionnaireWithAllItemTypes);

    inputAnswer('1', 0.1, container);

    const item = screen.getByTestId('date-time-picker');
    const date = item.getAttribute('value');
    expect(date).toBe(undefined);
  });

  it.skip('string gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addStringAnswer('8', 'Hello World!');
    });

    const { container } = wrapper(onChange, questionnaireWithAllItemTypes);

    inputAnswer('1', 0.1, container);
    const item = findItem('8', container);
    expect(item).toHaveValue('Hello World!');
  });

  it.skip('string gets cleared', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addStringAnswer('8', 'Hello World!');
      actionRequester.clearStringAnswer('8');
    });

    const { container } = wrapper(onChange, questionnaireWithAllItemTypes);

    inputAnswer('1', 0.1, container);
    const item = findItem('8', container);
    expect(item).toHaveValue(null);
  });

  it.skip('text gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addStringAnswer('9', 'Hello\nWorld!');
    });

    const { container } = wrapper(onChange, questionnaireWithAllItemTypes);

    inputAnswer('1', 0.1, container);

    const item = screen.getByLabelText('textarea#item_9');
    expect(item).toHaveValue('Hello\nWorld!');
  });

  it.skip('can request many changes', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addStringAnswer('8', 'Hello World!');
      actionRequester.addIntegerAnswer('2', 42);
    });

    const { container } = wrapper(onChange, questionnaireWithAllItemTypes);

    inputAnswer('1', 0.1, container);

    let item = findItem('8', container);
    expect(item).toHaveValue('Hello World!');

    item = findItem('2', container);
    expect(item).toHaveValue('42');
  });

  it.skip('opencboice other option can be updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addOpenChoiceAnswer('6a', toCoding(OPEN_CHOICE_ID));
      actionRequester.addOpenChoiceAnswer('6a', 'Hello World!');
    });

    const { container } = wrapper(onChange, questionnaireWithAllItemTypes);

    inputAnswer('1', 0.1, container);

    let item = findItem('6a-hn-2', container);
    expect(item).toBeChecked();

    item = screen.getByLabelText('textField#item_6a input');
    expect(item).toHaveValue('Hello World!');
  });

  it.skip('can select multiple checkboxes', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addChoiceAnswer('5b', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
      actionRequester.addChoiceAnswer('5b', toCoding('1', 'urn:oid:2.16.578.1.12.4.1.1101'));
    });

    const { container } = wrapper(onChange, questionnaireWithAllItemTypes);

    await changeCheckBoxOption('1', '2', container);

    let item = findItem('5b-2', container);
    expect(item).toBeChecked();

    item = findItem('5b-1', container);
    expect(item).toBeChecked();
  });

  it.skip('can select and unselect multiple checkboxes', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addChoiceAnswer('5b', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
      actionRequester.addChoiceAnswer('5b', toCoding('1', 'urn:oid:2.16.578.1.12.4.1.1101'));
      actionRequester.removeChoiceAnswer('5b', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
    });

    const { container } = wrapper(onChange, questionnaireWithAllItemTypes);

    await changeCheckBoxOption('1', '2', container);

    let item = findItem('5b-2', container);
    expect(item).not.toBeChecked();

    item = findItem('5b-1', container);
    expect(item).toBeChecked();
  });

  it.skip('can update repeated items', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addDecimalAnswer('1', 0.1, 0);
      actionRequester.addDecimalAnswer('1', 1.1, 1);
      actionRequester.addDecimalAnswer('1', 2.1, 2);
    });

    const { container } = wrapper(onChange, questionnaireWithRepeats);

    inputAnswer('2', 42, container);

    let item = findItem('1^0', container);
    expect(item).toHaveValue('0.1');

    item = findItem('1^1^1', container);
    expect(item).toHaveValue('1.1');

    item = findItem('1^2^2', container);
    expect(item).toHaveValue('2.1');
  });

  it.skip('can update nested items', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addStringAnswer('1.3.1', 'Hello');
    });

    const { container } = wrapper(onChange, questionnaireWithNestedItems);

    inputAnswer('1.1', 0.1, container);

    const item = findItem('1.3.1', container);
    expect(item).toHaveValue('Hello');
  });

  it.skip('can update items nested under answer', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addIntegerAnswer('1.3.1.1', 42);
    });

    const { container } = wrapper(onChange, questionnaireWithAllItemTypes);

    inputAnswer('1.1', 0.1, container);

    const item = findItem('1.3.1.1', container);
    expect(item).toHaveValue(42);
  });

  it.skip('can query to get both questionnaire and questionnaire response', async () => {
    let result: QuestionnaireItemPair[] = [];
    const onChange = createOnChangeFuncForQuestionnaireInspector((questionnaireInspector: IQuestionnaireInspector) => {
      result = questionnaireInspector.findItemWithLinkIds('1.3.1.1');
    });

    const { container } = wrapper(onChange, questionnaireWithNestedItems);

    inputAnswer('1.1', 0.1, container);

    expect(result.length).toBe(1);
    expect(result[0].QuestionnaireItem.linkId).toBe('1.3.1.1');
    expect(result[0].QuestionnaireResponseItems).toBeDefined();
    expect(result[0].QuestionnaireResponseItems.length).toBe(1);
    expect(result[0].QuestionnaireResponseItems[0].item.linkId).toBe('1.3.1.1');
  });

  it.skip('querying non-existant linkIds returns nothing', async () => {
    let result: QuestionnaireItemPair[] = [];
    const onChange = createOnChangeFuncForQuestionnaireInspector((questionnaireInspector: IQuestionnaireInspector) => {
      result = questionnaireInspector.findItemWithLinkIds('xxx');
    });

    const { container } = wrapper(onChange, questionnaireWithNestedItems);

    inputAnswer('1.1', 0.1, container);

    expect(result.length).toBe(0);
  });

  it.skip('can query several linkIds', async () => {
    let result: QuestionnaireItemPair[] = [];
    const onChange = createOnChangeFuncForQuestionnaireInspector((questionnaireInspector: IQuestionnaireInspector) => {
      result = questionnaireInspector.findItemWithLinkIds('1.3.1.1', '1.1');
    });

    const { container } = wrapper(onChange, questionnaireWithNestedItems);

    inputAnswer('1.1', 0.1, container);

    expect(result.length).toBe(2);
    expect(result[0].QuestionnaireItem.linkId).toBe('1.3.1.1');
    expect(result[0].QuestionnaireResponseItems).toBeDefined();
    expect(result[0].QuestionnaireResponseItems.length).toBe(1);
    expect(result[0].QuestionnaireResponseItems[0].item.linkId).toBe('1.3.1.1');

    expect(result[1].QuestionnaireItem.linkId).toBe('1.1');
    expect(result[1].QuestionnaireResponseItems).toBeDefined();
    expect(result[1].QuestionnaireResponseItems.length).toBe(1);
    expect(result[1].QuestionnaireResponseItems[0].item.linkId).toBe('1.1');
  });

  it.skip('querying for repeated items returns all responseitems', async () => {
    let result: QuestionnaireItemPair[] = [];
    const onChange = createOnChangeFuncForQuestionnaireInspector((questionnaireInspector: IQuestionnaireInspector) => {
      result = questionnaireInspector.findItemWithLinkIds('1');
    });

    const { container } = wrapper(onChange, questionnaireWithRepeats);

    inputAnswer('2', 1, container);

    expect(result.length).toBe(1);
    expect(result[0].QuestionnaireItem.linkId).toBe('1');
    expect(result[0].QuestionnaireResponseItems).toBeDefined();
    expect(result[0].QuestionnaireResponseItems.length).toBe(3);
    expect(result[0].QuestionnaireResponseItems[0].item.linkId).toBe('1');
    expect(result[0].QuestionnaireResponseItems[1].item.linkId).toBe('1');
    expect(result[0].QuestionnaireResponseItems[2].item.linkId).toBe('1');
  });
});

function wrapper(
  onChange: (
    item: QuestionnaireItem,
    answer: QuestionnaireResponseItemAnswer,
    actionRequester: IActionRequester,
    questionnaireInspector: IQuestionnaireInspector
  ) => void,
  q: Questionnaire
) {
  return renderRefero({ questionnaire: q, props: { onChange } });
}
