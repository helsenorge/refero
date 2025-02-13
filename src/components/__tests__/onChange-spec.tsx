import { QuestionnaireItem, QuestionnaireResponseItemAnswer, Quantity, Coding, Questionnaire } from 'fhir/r4';

import { screen, userEvent, renderRefero, waitFor } from '../../../test/test-utils';
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
import { clickByLabelText, typeByLabelText } from '../../../test/selectors';

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

describe('onAnswerChange callback gets called and can request additional changes', () => {
  it('integers gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addIntegerAnswer('1', 42);
    });

    await wrapper(onChange, questionnaireWithAllItemTypes);
    await clickByLabelText(/Boolean/i);

    const updatedInput = await screen.findByDisplayValue('42');
    expect(updatedInput).toBeInTheDocument();
  });

  it('integers gets cleared', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addIntegerAnswer('1', 42);
      actionRequester.clearIntegerAnswer('1');
    });

    await wrapper(onChange, questionnaireWithAllItemTypes);
    await clickByLabelText(/Boolean/i);

    const item = screen.queryByLabelText(/Integer/i);
    expect(item).toHaveValue(null);
  });

  it('decimals gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addDecimalAnswer('2', 42);
    });

    await wrapper(onChange, questionnaireWithAllItemTypes);
    await clickByLabelText(/Boolean/i);

    const updatedInput = await screen.findByDisplayValue('42');
    expect(updatedInput).toBeInTheDocument();
  });

  it('decimals gets cleared', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addDecimalAnswer('2', 42);
      actionRequester.clearDecimalAnswer('2');
    });

    await wrapper(onChange, questionnaireWithAllItemTypes);
    await clickByLabelText(/Boolean/i);

    const item = screen.queryByLabelText(/Decimal/i);
    expect(item).toHaveValue(null);
  });

  it('quantity gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addQuantityAnswer('3', toQuantity(42, 'kg', 'kilogram', 'http://unitsofmeasure.org'));
    });

    const { container } = await wrapper(onChange, questionnaireWithAllItemTypes);

    await inputAnswer('1', 0.1, container);
    const item = await findItemByDispayValue('42');
    expect(item).toHaveValue(42);
  });

  it('quantity gets cleared', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addQuantityAnswer('3', toQuantity(42, 'kg', 'kilogram', 'http://unitsofmeasure.org'));
      actionRequester.clearQuantityAnswer('3');
    });

    const { container } = await wrapper(onChange, questionnaireWithAllItemTypes);
    await inputAnswer('1', 0.1, container);
    const item = findItem('3', container);
    expect(item).toHaveValue(null);
  });

  it('boolean gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addBooleanAnswer('4', true);
    });

    await wrapper(onChange, questionnaireWithAllItemTypes);
    await clickByLabelText(/Boolean/i);
    const updatedInput = screen.queryByLabelText(/Boolean/i);
    expect(updatedInput).toBeChecked();
  });

  it('boolean gets cleared', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addBooleanAnswer('4', true);
      actionRequester.clearBooleanAnswer('4');
    });

    await wrapper(onChange, questionnaireWithAllItemTypes);
    await clickByLabelText(/Boolean/i);
    const updatedInput = screen.queryByLabelText(/Boolean/i);
    expect(updatedInput).not.toBeChecked();
  });

  it('choice (radiobuttons) gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addChoiceAnswer('5a', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
    });

    await wrapper(onChange, questionnaireWithAllItemTypes);
    await clickByLabelText(/Boolean/i);

    expect(screen.queryByTestId('item_5a-1-radio-choice-label')?.querySelector('#item_5a-hn-1')).toBeChecked();
  });

  it('choice (radiobuttons) get cleared', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addChoiceAnswer('5a', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
      actionRequester.removeChoiceAnswer('5a', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
    });

    await wrapper(onChange, questionnaireWithAllItemTypes);
    await clickByLabelText(/Boolean/i);

    expect(screen.queryByTestId('item_5a-1-radio-choice-label')?.querySelector('#item_5a-hn-1')).toBeChecked();
  });

  it('choice (checkboxes) gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addChoiceAnswer('5b', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
    });

    const { container } = await wrapper(onChange, questionnaireWithAllItemTypes);
    await clickByLabelText(/Boolean/i);
    expect(container.querySelector('#item_5b-hn-1')).toBeChecked();
  });

  it('choice (checkboxes) gets cleared', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addChoiceAnswer('5b', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
      actionRequester.removeChoiceAnswer('5b', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
    });

    const { container } = await wrapper(onChange, questionnaireWithAllItemTypes);

    await clickByLabelText(/Boolean/i);
    expect(container.querySelector('#item_5b-hn-1')).not.toBeChecked();
  });

  it('openchoice (radiobuttons) gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addOpenChoiceAnswer('6a', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
    });

    await wrapper(onChange, questionnaireWithAllItemTypes);
    await clickByLabelText(/Boolean/i);

    expect(screen.queryByTestId('item_6a-1-radio-open-choice-label')?.querySelector('#item_6a-hn-1')).toBeChecked();
  });
  it('openchoice (radiobuttons) get cleared', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addChoiceAnswer('6a', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
      actionRequester.removeChoiceAnswer('6a', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
    });

    await wrapper(onChange, questionnaireWithAllItemTypes);
    await clickByLabelText(/Boolean/i);

    expect(screen.queryByTestId('item_6a-1-radio-open-choice-label')?.querySelector('#item_6a-hn-1')).toBeChecked();
  });
  it('openchoice (checkboxes) gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addOpenChoiceAnswer('6b', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
    });

    const { container } = await wrapper(onChange, questionnaireWithAllItemTypes);
    await clickByLabelText(/Boolean/i);
    expect(container.querySelector('#item_6b-hn-1')).toBeChecked();
  });
  describe('date fields gets updated', () => {
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
      await wrapper(onChange, questionnaireWithAllItemTypes);
      await clickByLabelText(/Boolean/i);

      const dateElement = screen.getByTestId(/datepicker-test/i);
      const dateInput = dateElement.querySelector('input');
      await waitFor(async () => await expect(dateInput).toHaveValue('14.08.2024'));
    });
    it('date gets cleared', async () => {
      const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
        actionRequester.addDateAnswer('7a', '2024-08-14');
        actionRequester.clearDateAnswer('7a');
      });
      await wrapper(onChange, questionnaireWithAllItemTypes);
      await clickByLabelText(/Boolean/i);

      const dateElement = screen.getByTestId(/datepicker-test/i);
      const dateInput = dateElement.querySelector('input');

      expect(dateInput).not.toHaveValue('14.08.2024');
    });
    it('dateTime gets updated', async () => {
      const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
        actionRequester.addDateTimeAnswer('7b', '2024-08-14T12:30:00+02:00');
      });
      const { container } = await wrapper(onChange, questionnaireWithAllItemTypes);

      await inputAnswer('1', 0.1, container);
      const date = screen.getByLabelText(/DateTime/i);

      expect(date).toHaveValue('14.08.2024');
    });
    it('dateTime gets cleared', async () => {
      const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
        actionRequester.addDateTimeAnswer('7b', '1994-05-31T12:30:00+02:00');
        actionRequester.clearDateTimeAnswer('7b');
      });
      const { container } = await wrapper(onChange, questionnaireWithAllItemTypes);

      await inputAnswer('1', 0.1, container);
      const date = screen.getByLabelText(/DateTime/i);

      expect(date).toHaveValue('');
    });
    it('dateYear gets updated', async () => {
      const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
        actionRequester.addDateAnswer('7c', '2024');
      });
      const { container } = await wrapper(onChange, questionnaireWithAllItemTypes);

      await inputAnswer('1', 0.1, container);
      const date = screen.getByLabelText(/DateYear/i);

      expect(date).toHaveValue(2024);
    });
    it('dateYear gets cleared', async () => {
      const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
        actionRequester.addDateAnswer('7c', '2024');
        actionRequester.clearDateAnswer('7c');
      });
      const { container } = await wrapper(onChange, questionnaireWithAllItemTypes);

      await inputAnswer('1', 0.1, container);
      const date = screen.getByLabelText(/DateYear/i);

      expect(date).toHaveValue(null);
    });
    it('dateMonth gets updated', async () => {
      const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
        actionRequester.addDateAnswer('7d', '2024-05');
      });
      const { container } = await wrapper(onChange, questionnaireWithAllItemTypes);

      await inputAnswer('1', 0.1, container);
      const dateElement = screen.getByLabelText(/DateMonth/i);
      const monthElement = await screen.findByTestId('month-select');
      const monthSelect = monthElement.querySelector('select');

      await waitFor(async () => expect(dateElement).toHaveValue(2024));
      await waitFor(async () => expect(monthSelect).toHaveValue('05'));
    });
    it('dateMonth gets cleared', async () => {
      const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
        actionRequester.addDateAnswer('7d', '2024-05');
        actionRequester.clearDateAnswer('7d');
      });
      const { container } = await wrapper(onChange, questionnaireWithAllItemTypes);

      await inputAnswer('1', 0.1, container);
      const date = screen.getByLabelText(/DateMonth/i);

      expect(date).toHaveValue(null);
    });
  });

  it('time gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addTimeAnswer('8', '12:01:00');
    });
    const { container } = await wrapper(onChange, questionnaireWithAllItemTypes);
    await inputAnswer('1', 0.1, container);

    const hoursElement = screen.getByTestId(/time-1/i);
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
      actionRequester.addTimeAnswer('8', '12:01');
      actionRequester.clearTimeAnswer('8');
    });
    const { container } = await wrapper(onChange, questionnaireWithAllItemTypes);
    await inputAnswer('1', 0.1, container);

    const hoursElement = screen.getByTestId(/time-1/i);
    const hoursInput = hoursElement.querySelector('input');
    const minutesElement = screen.getByTestId(/time-2/i);
    const minutesInput = minutesElement.querySelector('input');

    expect(hoursInput).toHaveValue(null);
    expect(minutesInput).toHaveValue(null);
  });

  it('string gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addStringAnswer('9', 'Hello World!');
    });

    await wrapper(onChange, questionnaireWithAllItemTypes);
    await clickByLabelText(/Boolean/i);
    expect(screen.queryByLabelText(/String/i)).toHaveValue('Hello World!');
  });

  it('string gets cleared', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addStringAnswer('9', 'Hello World!');
      actionRequester.clearStringAnswer('9');
    });

    await wrapper(onChange, questionnaireWithAllItemTypes);

    await clickByLabelText(/Boolean/i);

    expect(screen.queryByText('Hello World!')).not.toBeInTheDocument();
  });

  it('text gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addStringAnswer('10', 'Hello\nWorld!');
    });

    await wrapper(onChange, questionnaireWithAllItemTypes);

    await clickByLabelText(/Boolean/i);
    expect(screen.getByText(/Hello/i)).toBeInTheDocument();
  });

  it('can request many changes', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addStringAnswer('10', 'Hello\nWorld!');
      actionRequester.addIntegerAnswer('1', 42);
    });

    await wrapper(onChange, questionnaireWithAllItemTypes);

    await clickByLabelText(/Boolean/i);
    expect(screen.getByText(/Hello/i)).toBeInTheDocument();

    expect(screen.getByLabelText(/Integer/i)).toHaveValue(42);
  });

  it('opencboice other option can be updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addOpenChoiceAnswer('6a', toCoding(OPEN_CHOICE_ID));
      actionRequester.addOpenChoiceAnswer('6a', 'Hello World!');
    });

    const { container } = await wrapper(onChange, questionnaireWithAllItemTypes);

    await clickByLabelText(/Boolean/i);

    const item1 = findItem('6a-hn-2', container);
    expect(item1).toBeChecked();

    const item2 = findItem('6a-extra-field', container);
    expect(item2).toHaveValue('Hello World!');
  });

  it('can select multiple checkboxes', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addChoiceAnswer('5b', toCoding('1', 'urn:oid:2.16.578.1.12.4.1.1101'));
      actionRequester.addChoiceAnswer('5b', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
    });

    const { container } = await wrapper(onChange, questionnaireWithAllItemTypes);
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

    const { container } = await wrapper(onChange, questionnaireWithAllItemTypes);
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

    await wrapper(onChange, questionnaireWithRepeats);

    await userEvent.type(await screen.findByLabelText(/Integer/i), '1');
    const items = screen.queryAllByLabelText(/Decimal/i);
    expect(items).toHaveLength(3);

    expect(items[0]).toHaveValue(0.1);
    expect(items[1]).toHaveValue(1.1);
    expect(items[2]).toHaveValue(2.1);
  });

  it('can update nested items', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addIntegerAnswer('1.3.2', 42);
    });

    await wrapper(onChange, questionnaireWithNestedItems);

    await typeByLabelText(/Decimal/i, '1');

    expect(screen.queryByLabelText(/IntegerNested/i)).toHaveValue(42);
  });

  it('can update items nested under answer', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addIntegerAnswer('1.3.1.1', 42);
    });

    await wrapper(onChange, questionnaireWithNestedItems);
    await typeByLabelText(/Decimal/i, '1');
    expect(screen.queryByLabelText(/nested under non-group/i)).toHaveValue(42);
  });

  it('can query to get both questionnaire and questionnaire response', async () => {
    let result: QuestionnaireItemPair[] = [];
    const onChange = createOnChangeFuncForQuestionnaireInspector((questionnaireInspector: IQuestionnaireInspector) => {
      result = questionnaireInspector.findItemWithLinkIds('1.3.1.1');
    });

    await wrapper(onChange, questionnaireWithNestedItems);

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

    await wrapper(onChange, questionnaireWithNestedItems);

    await typeByLabelText(/Decimal/i, '1');

    expect(result.length).toBe(0);
  });

  it('can query several linkIds', async () => {
    let result: QuestionnaireItemPair[] = [];
    const onChange = createOnChangeFuncForQuestionnaireInspector((questionnaireInspector: IQuestionnaireInspector) => {
      result = questionnaireInspector.findItemWithLinkIds('1.3.1.1', '1.1');
    });

    await wrapper(onChange, questionnaireWithNestedItems);

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

    await wrapper(onChange, questionnaireWithRepeats);

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

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function wrapper(
  onChange: (
    item: QuestionnaireItem,
    answer: QuestionnaireResponseItemAnswer,
    actionRequester: IActionRequester,
    questionnaireInspector: IQuestionnaireInspector
  ) => void,
  q: Questionnaire
) {
  return await waitFor(async () => {
    return renderRefero({ questionnaire: q, props: { onChange } });
  });
}
