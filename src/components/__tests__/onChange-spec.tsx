import { screen, userEvent, renderRefero } from '../../../test/test-utils';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer, Quantity, Coding, Questionnaire } from 'fhir/r4';

import '../../util/__tests__/defineFetch';
import { OPEN_CHOICE_ID } from '../../constants/index';
import { IActionRequester } from '../../util/actionRequester';
import { IQuestionnaireInspector, QuestionnaireItemPair } from '../../util/questionnaireInspector';
import questionnaireWithAllItemTypes from './__data__/onChange/allItemTypes';
import questionnaireWithNestedItems from './__data__/onChange/nestedItems';
import questionnaireWithRepeats from './__data__/onChange/repeats';
import {
  inputAnswer,
  findItem,
  findItemByDispayValue,
  createOnChangeFuncForActionRequester,
  createOnChangeFuncForQuestionnaireInspector,
} from './utils';
import { clickByLabelText, typeAndTabByLabelText, typeByLabelText } from '../../../test/selectors';

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

async function addValueToInputByTypeAndTab(componentLabel: string, value: string) {
  const regexLabel = new RegExp(componentLabel, 'i');
  const element = await screen.findByLabelText(regexLabel);
  await typeAndTabByLabelText(regexLabel, value);

  const answer = screen.getByRole('spinbutton', { name: `${componentLabel} (Valgfritt)` });
  return { answer, element };
}

describe('onAnswerChange callback gets called and can request additional changes', () => {
  it('integers gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addIntegerAnswer('2', 42);
    });

    const { queryByDisplayValue } = wrapper(onChange, questionnaireWithAllItemTypes);

    const { answer } = await addValueToInputByTypeAndTab('Decimal', '0.1');

    const elm = queryByDisplayValue(42);
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

    const integerAnswer = getByLabelText(/Integer/i);

    expect(answer).toHaveValue(0.1);
    expect(integerAnswer).toHaveValue(null);
  });

  it('decimals gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addDecimalAnswer('1', 42);
    });

    const { container } = wrapper(onChange, questionnaireWithAllItemTypes);
    await inputAnswer('1', 0.1, container);

    const updatedInput = await screen.findByDisplayValue('42');
    expect(updatedInput).toBeInTheDocument();
  });

  it('decimals gets cleared', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addDecimalAnswer('1', 42);
      actionRequester.clearDecimalAnswer('1');
    });

    const { container } = wrapper(onChange, questionnaireWithAllItemTypes);
    await inputAnswer('1', 0.1, container);
    const item = findItem('2', container);

    expect(item).toHaveValue(null);
  });

  it('quantity gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addQuantityAnswer('3', toQuantity(42, 'kg', 'kilogram', 'http://unitsofmeasure.org'));
    });

    const { container } = wrapper(onChange, questionnaireWithAllItemTypes);

    await inputAnswer('1', 0.1, container);
    const item = await findItemByDispayValue('42');
    expect(item).toHaveValue(42);
  });

  it('quantity gets cleared', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addQuantityAnswer('3', toQuantity(42, 'kg', 'kilogram', 'http://unitsofmeasure.org'));
      actionRequester.clearQuantityAnswer('3');
    });

    const { container } = wrapper(onChange, questionnaireWithAllItemTypes);
    await inputAnswer('1', 0.1, container);
    const item = findItem('3', container);
    expect(item).toHaveValue(null);
  });

  it('boolean gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addBooleanAnswer('4', true);
    });

    const { queryByLabelText } = wrapper(onChange, questionnaireWithAllItemTypes);
    await clickByLabelText(/Boolean/i);
    const updatedInput = queryByLabelText(/Boolean/i);
    expect(updatedInput).toBeChecked();
  });

  it('boolean gets cleared', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addBooleanAnswer('4', true);
      actionRequester.clearBooleanAnswer('4');
    });

    const { queryByLabelText } = wrapper(onChange, questionnaireWithAllItemTypes);
    await clickByLabelText(/Boolean/i);
    const updatedInput = queryByLabelText(/Boolean/i);
    expect(updatedInput).not.toBeChecked();
  });

  it('choice (radiobuttons) gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addChoiceAnswer('5a', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
    });

    const { queryByTestId } = wrapper(onChange, questionnaireWithAllItemTypes);
    await clickByLabelText(/Boolean/i);

    expect(queryByTestId('item_5a-1-radio-choice-label')?.querySelector('#item_5a-hn-1')).toHaveAttribute('checked', '');
  });

  it('choice (radiobuttons) does not get cleared', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addChoiceAnswer('5a', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
      actionRequester.removeChoiceAnswer('5a', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
    });

    const { queryByTestId } = wrapper(onChange, questionnaireWithAllItemTypes);
    await clickByLabelText(/Boolean/i);

    expect(queryByTestId('item_5a-1-radio-choice-label')?.querySelector('#item_5a-hn-1')).toHaveAttribute('checked', '');
  });

  it('choice (checkboxes) gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addChoiceAnswer('5b', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
    });

    const { container } = wrapper(onChange, questionnaireWithAllItemTypes);
    await clickByLabelText(/Boolean/i);
    expect(container.querySelector('#item_5b-hn-1')).toBeChecked();
  });

  it('choice (checkboxes) gets cleared', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addChoiceAnswer('5b', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
      actionRequester.removeChoiceAnswer('5b', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
    });

    const { container } = wrapper(onChange, questionnaireWithAllItemTypes);

    await clickByLabelText(/Boolean/i);
    expect(container.querySelector('#item_5b-hn-1')).not.toBeChecked();
  });

  it('openchoice (radiobuttons) gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addOpenChoiceAnswer('6a', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
    });

    const { queryByTestId } = wrapper(onChange, questionnaireWithAllItemTypes);
    await clickByLabelText(/Boolean/i);

    expect(queryByTestId('item_6a-1-radio-open-choice-label')?.querySelector('#item_6a-hn-1')).toHaveAttribute('checked', '');
  });
  it('openchoice (radiobuttons) does not get cleared', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addChoiceAnswer('6a', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
      actionRequester.removeChoiceAnswer('6a', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
    });

    const { queryByTestId } = wrapper(onChange, questionnaireWithAllItemTypes);
    await clickByLabelText(/Boolean/i);

    expect(queryByTestId('item_6a-1-radio-open-choice-label')?.querySelector('#item_6a-hn-1')).toHaveAttribute('checked', '');
  });
  it('openchoice (checkboxes) gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addOpenChoiceAnswer('6b', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
    });

    const { container } = wrapper(onChange, questionnaireWithAllItemTypes);
    await clickByLabelText(/Boolean/i);

    expect(container.querySelector('#item_6b-2')).toBeChecked();
  });
  describe('date and time fields gets updated', () => {
    beforeEach(() => {
      process.env.TZ = 'Europe/Oslo';
    });
    afterEach(() => {
      delete process.env.TZ;
    });
    it('date gets updated', async () => {
      const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
        actionRequester.addDateAnswer('7a', '2024-08-14');
      });
      const { getByTestId } = wrapper(onChange, questionnaireWithAllItemTypes);
      await clickByLabelText(/Boolean/i);

      const dateElement = getByTestId(/datepicker-test/i);
      const dateInput = dateElement.querySelector('input');

      expect(dateInput).toHaveValue('14.08.2024');
    });
    it('date gets cleared', async () => {
      const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
        actionRequester.addDateAnswer('7a', '2024-08-14');
        actionRequester.clearDateAnswer('7a');
      });
      const { getByTestId } = wrapper(onChange, questionnaireWithAllItemTypes);
      await clickByLabelText(/Boolean/i);

      const dateElement = getByTestId(/datepicker-test/i);
      const dateInput = dateElement.querySelector('input');

      expect(dateInput).not.toHaveValue('14.08.2024');
    });
    it('time gets updated', async () => {
      const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
        actionRequester.addTimeAnswer('7b', '12:01:00');
      });
      const { container, getByTestId } = wrapper(onChange, questionnaireWithAllItemTypes);
      await inputAnswer('1', 0.1, container);

      const hoursElement = getByTestId(/time-1/i);
      const hoursInput = hoursElement.querySelector('input');
      const minutesElement = screen.getByTestId(/time-2/i);
      const minutesInput = minutesElement.querySelector('input');

      if (hoursInput) {
        await userEvent.type(hoursInput, '12');
      }
      if (minutesInput) {
        await userEvent.type(minutesInput, '01');
      }

      expect(hoursInput).toHaveValue(Number('12'));
      expect(minutesInput).toHaveValue(Number('01'));
    });
    it('time gets cleared', async () => {
      const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
        actionRequester.addTimeAnswer('7b', '12:01');
        actionRequester.clearTimeAnswer('7b');
      });
      const { container, getByTestId } = wrapper(onChange, questionnaireWithAllItemTypes);
      await inputAnswer('1', 0.1, container);

      const hoursElement = getByTestId(/time-1/i);
      const hoursInput = hoursElement.querySelector('input');
      const minutesElement = screen.getByTestId(/time-2/i);
      const minutesInput = minutesElement.querySelector('input');

      expect(hoursInput).toHaveValue(null);
      expect(minutesInput).toHaveValue(null);
    });
    it('dateTime gets updated', async () => {
      const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
        actionRequester.addDateTimeAnswer('7c', '2024-08-14T12:30:00+02:00');
      });
      const { container, getByLabelText } = wrapper(onChange, questionnaireWithAllItemTypes);

      await inputAnswer('1', 0.1, container);
      const date = getByLabelText(/DateTime/i);

      expect(date).toHaveValue('14.08.2024');
    });
    //DateTime component does not clear the value of the input when the new date set from actionRequester is undefined.
    //The date gets cleared from the QuestionnaireResponse and answer is empty
    it('dateTime gets cleared', async () => {
      const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
        actionRequester.addDateTimeAnswer('7c', '1994-05-31T12:30:00+02:00');
        actionRequester.clearDateTimeAnswer('7c');
      });
      const { container, getByLabelText } = wrapper(onChange, questionnaireWithAllItemTypes);

      await inputAnswer('1', 0.1, container);
      const date = getByLabelText(/DateTime/i);

      expect(date).toHaveValue('');
    });
  });

  it('string gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addStringAnswer('8', 'Hello World!');
    });

    const { queryByLabelText } = wrapper(onChange, questionnaireWithAllItemTypes);
    await clickByLabelText(/Boolean/i);
    expect(queryByLabelText(/String/i)).toHaveValue('Hello World!');
  });

  it('string gets cleared', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addStringAnswer('8', 'Hello World!');
      actionRequester.clearStringAnswer('8');
    });

    const { queryByText } = wrapper(onChange, questionnaireWithAllItemTypes);

    await clickByLabelText(/Boolean/i);

    expect(queryByText('Hello World!')).not.toBeInTheDocument();
  });

  it('text gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addStringAnswer('9', 'Hello\nWorld!');
    });

    const { queryByText } = wrapper(onChange, questionnaireWithAllItemTypes);

    await clickByLabelText(/Boolean/i);
    expect(queryByText(/Hello/i)).toBeInTheDocument();
  });

  it('can request many changes', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addStringAnswer('8', 'Hello World!');
      actionRequester.addIntegerAnswer('2', 42);
    });

    const { queryByLabelText } = wrapper(onChange, questionnaireWithAllItemTypes);

    await clickByLabelText(/Boolean/i);
    expect(queryByLabelText(/String/i)).toHaveValue('Hello World!');

    expect(queryByLabelText(/Integer/i)).toHaveValue(42);
  });

  it('opencboice other option can be updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addOpenChoiceAnswer('6a', toCoding(OPEN_CHOICE_ID));
      actionRequester.addOpenChoiceAnswer('6a', 'Hello World!');
    });

    const { container } = wrapper(onChange, questionnaireWithAllItemTypes);

    await clickByLabelText(/Boolean/i);

    const item1 = findItem('6a-hn-2', container);
    expect(item1).toHaveAttribute('checked', '');

    const item2 = findItem('6a-extra-field', container);
    expect(item2).toHaveValue('Hello World!');
  });

  it('can select multiple checkboxes', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addChoiceAnswer('5b', toCoding('1', 'urn:oid:2.16.578.1.12.4.1.1101'));
      actionRequester.addChoiceAnswer('5b', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
    });

    const { container } = wrapper(onChange, questionnaireWithAllItemTypes);
    await clickByLabelText(/Boolean/i);
    expect(container.querySelector('#item_5b-hn-0')).toBeChecked();
    expect(container.querySelector('#item_5b-hn-1')).toBeChecked();
  });

  it('can select and unselect multiple checkboxes', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addChoiceAnswer('5b', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
      actionRequester.addChoiceAnswer('5b', toCoding('1', 'urn:oid:2.16.578.1.12.4.1.1101'));
      actionRequester.removeChoiceAnswer('5b', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
    });

    const { container } = wrapper(onChange, questionnaireWithAllItemTypes);
    await clickByLabelText(/Boolean/i);
    expect(container.querySelector('#item_5b-hn-0')).toBeChecked();
    expect(container.querySelector('#item_5b-hn-1')).not.toBeChecked();
  });

  it('can update repeated items', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addDecimalAnswer('1', 0.1, 0);
      actionRequester.addDecimalAnswer('1', 1.1, 1);
      actionRequester.addDecimalAnswer('1', 2.1, 2);
    });

    const { queryAllByLabelText, findByLabelText } = wrapper(onChange, questionnaireWithRepeats);

    await userEvent.type(await findByLabelText(/Integer/i), '1');
    const items = queryAllByLabelText(/Decimal/i);
    expect(items).toHaveLength(3);

    expect(items[0]).toHaveValue(0.1);
    expect(items[1]).toHaveValue(1.1);
    expect(items[2]).toHaveValue(2.1);
  });

  it('can update nested items', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addStringAnswer('1.3.1', 'Hello');
    });

    const { queryByLabelText } = wrapper(onChange, questionnaireWithNestedItems);

    await typeByLabelText(/Decimal/i, '1');

    expect(queryByLabelText(/String/i)).toHaveValue('Hello');
  });

  it('can update items nested under answer', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addIntegerAnswer('1.3.1.1', 42);
    });

    const { queryByLabelText } = wrapper(onChange, questionnaireWithNestedItems);
    await typeByLabelText(/Decimal/i, '1');
    expect(queryByLabelText(/nested under non-group/i)).toHaveValue(42);
  });

  it('can query to get both questionnaire and questionnaire response', async () => {
    let result: QuestionnaireItemPair[] = [];
    const onChange = createOnChangeFuncForQuestionnaireInspector((questionnaireInspector: IQuestionnaireInspector) => {
      result = questionnaireInspector.findItemWithLinkIds('1.3.1.1');
    });

    wrapper(onChange, questionnaireWithNestedItems);

    await typeByLabelText(/Decimal/i, '1');

    expect(result.length).toBe(1);
    expect(result[0].QuestionnaireItem.linkId).toBe('1.3.1.1');
    expect(result[0].QuestionnaireResponseItems).toBeDefined();
    expect(result[0].QuestionnaireResponseItems.length).toBe(1);
    expect(result[0].QuestionnaireResponseItems[0].item.linkId).toBe('1.3.1.1');
  });

  it('querying non-existant linkIds returns nothing', async () => {
    let result: QuestionnaireItemPair[] = [];
    const onChange = createOnChangeFuncForQuestionnaireInspector((questionnaireInspector: IQuestionnaireInspector) => {
      result = questionnaireInspector.findItemWithLinkIds('xxx');
    });

    wrapper(onChange, questionnaireWithNestedItems);

    await typeByLabelText(/Decimal/i, '1');

    expect(result.length).toBe(0);
  });

  it('can query several linkIds', async () => {
    let result: QuestionnaireItemPair[] = [];
    const onChange = createOnChangeFuncForQuestionnaireInspector((questionnaireInspector: IQuestionnaireInspector) => {
      result = questionnaireInspector.findItemWithLinkIds('1.3.1.1', '1.1');
    });

    wrapper(onChange, questionnaireWithNestedItems);

    await typeByLabelText(/Decimal/i, '1');

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

  it('querying for repeated items returns all responseitems', async () => {
    let result: QuestionnaireItemPair[] = [];
    const onChange = createOnChangeFuncForQuestionnaireInspector((questionnaireInspector: IQuestionnaireInspector) => {
      result = questionnaireInspector.findItemWithLinkIds('1');
    });

    wrapper(onChange, questionnaireWithRepeats);

    await typeByLabelText(/Integer/i, '1');

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
