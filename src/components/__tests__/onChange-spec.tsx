import * as React from 'react';
import rootReducer from '../../reducers';
import { createStore, applyMiddleware } from 'redux';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { Questionnaire, QuestionnaireItem, QuestionnaireResponseAnswer, Quantity, decimal, code, uri, Coding } from '../../types/fhir';
import { SkjemautfyllerContainer } from '..';
import { Resources } from '../../util/resources';
import { IActionRequester } from '../../util/actionRequester';
import questionnaireWithAllItemTypes from './__data__/onChange/allItemTypes';
import questionnaireWithRepeats from './__data__/onChange/repeats';
import questionnaireWithNestedItems from './__data__/onChange/nestedItems';
import { inputAnswer, findItem } from './utils';
import DateTime from '@helsenorge/toolkit/components/molecules/date-time-input';
import * as moment from 'moment';
import Constants, { OPEN_CHOICE_ID } from '../../constants/index';

describe('onAnswerChange callback gets called and can request additional changes', () => {
  beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation(_ => {
      return {};
    });
  });

  it('integers gets updated', async () => {
    let onChange = createOnChangeFunc((actionRequester: IActionRequester) => {
      actionRequester.addIntegerAnswer('2', 42);
    });

    const wrapper = createWrapper(questionnaireWithAllItemTypes, onChange);
    await inputAnswer('1', 0.1, wrapper);

    let item = findItem('2', wrapper);
    expect(item.props().value).toBe('42');
  });

  it('integers gets cleared', async () => {
    let onChange = createOnChangeFunc((actionRequester: IActionRequester) => {
      actionRequester.addIntegerAnswer('2', 42);
      actionRequester.clearIntegerAnswer('2');
    });

    const wrapper = createWrapper(questionnaireWithAllItemTypes, onChange);
    await inputAnswer('1', 0.1, wrapper);

    let item = findItem('2', wrapper);
    expect(item.props().value).toBe('');
  });

  it('decimals gets updated', async () => {
    let onChange = createOnChangeFunc((actionRequester: IActionRequester) => {
      actionRequester.addDecimalAnswer('1', 42);
    });

    const wrapper = createWrapper(questionnaireWithAllItemTypes, onChange);
    await inputAnswer('2', 1, wrapper);

    let item = findItem('1', wrapper);
    expect(item.props().value).toBe('42');
  });

  it('decimals gets cleared', async () => {
    let onChange = createOnChangeFunc((actionRequester: IActionRequester) => {
      actionRequester.addDecimalAnswer('1', 42);
      actionRequester.clearDecimalAnswer('1');
    });

    const wrapper = createWrapper(questionnaireWithAllItemTypes, onChange);
    await inputAnswer('2', 1, wrapper);

    let item = findItem('1', wrapper);
    expect(item.props().value).toBe('');
  });

  it('quantity gets updated', async () => {
    let onChange = createOnChangeFunc((actionRequester: IActionRequester) => {
      actionRequester.addQuantityAnswer('3', toQuantity(42, 'kg', 'kilogram', 'http://unitsofmeasure.org'));
    });

    const wrapper = createWrapper(questionnaireWithAllItemTypes, onChange);
    await inputAnswer('1', 0.1, wrapper);

    let item = findItem('3', wrapper);
    expect(item.props().value).toBe('42');
  });

  it('quantity gets cleared', async () => {
    let onChange = createOnChangeFunc((actionRequester: IActionRequester) => {
      actionRequester.addQuantityAnswer('3', toQuantity(42, 'kg', 'kilogram', 'http://unitsofmeasure.org'));
      actionRequester.clearQuantityAnswer('3');
    });

    const wrapper = createWrapper(questionnaireWithAllItemTypes, onChange);
    await inputAnswer('1', 0.1, wrapper);

    let item = findItem('3', wrapper);
    expect(item.props().value).toBe('');
  });

  it('boolean gets updated', async () => {
    let onChange = createOnChangeFunc((actionRequester: IActionRequester) => {
      actionRequester.addBooleanAnswer('4', true);
    });

    const wrapper = createWrapper(questionnaireWithAllItemTypes, onChange);
    await inputAnswer('1', 0.1, wrapper);

    let item = findItem('4', wrapper);
    expect(item.props().checked).toBe(true);
  });

  it('boolean gets cleared', async () => {
    let onChange = createOnChangeFunc((actionRequester: IActionRequester) => {
      actionRequester.addBooleanAnswer('4', true);
      actionRequester.clearBooleanAnswer('4');
    });

    const wrapper = createWrapper(questionnaireWithAllItemTypes, onChange);
    await inputAnswer('1', 0.1, wrapper);

    let item = findItem('4', wrapper);
    expect(item.props().checked).toBe(false);
  });

  it('choice (radiobuttons) gets updated', async () => {
    let onChange = createOnChangeFunc((actionRequester: IActionRequester) => {
      actionRequester.addChoiceAnswer('5a', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
    });

    const wrapper = createWrapper(questionnaireWithAllItemTypes, onChange);
    await inputAnswer('1', 0.1, wrapper);

    // radiobuttons are 0-based
    let item = findItem('5a-hn-1', wrapper);
    expect(item.props().checked).toBe(true);
  });

  it('choice (radiobuttons) does not get cleared', async () => {
    let onChange = createOnChangeFunc((actionRequester: IActionRequester) => {
      actionRequester.addChoiceAnswer('5a', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
      actionRequester.removeChoiceAnswer('5a', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
    });

    const wrapper = createWrapper(questionnaireWithAllItemTypes, onChange);
    await inputAnswer('1', 0.1, wrapper);

    let item = findItem('5a-hn-1', wrapper);
    expect(item.props().checked).toBe(true);
  });

  it('choice (checkboxes) gets updated', async () => {
    let onChange = createOnChangeFunc((actionRequester: IActionRequester) => {
      actionRequester.addChoiceAnswer('5b', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
    });

    const wrapper = createWrapper(questionnaireWithAllItemTypes, onChange);
    await inputAnswer('1', 0.1, wrapper);

    // checkboxes are 1-based
    let item = findItem('5b-2', wrapper);
    expect(item.props().checked).toBe(true);
  });

  it('choice (checkboxes) gets cleared', async () => {
    let onChange = createOnChangeFunc((actionRequester: IActionRequester) => {
      actionRequester.addChoiceAnswer('5b', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
      actionRequester.removeChoiceAnswer('5b', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
    });

    const wrapper = createWrapper(questionnaireWithAllItemTypes, onChange);
    await inputAnswer('1', 0.1, wrapper);

    let item = findItem('5b-2', wrapper);
    expect(item.props().checked).toBe(false);
  });

  it('openchoice (radiobuttons) gets updated', async () => {
    let onChange = createOnChangeFunc((actionRequester: IActionRequester) => {
      actionRequester.addOpenChoiceAnswer('6a', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
    });

    const wrapper = createWrapper(questionnaireWithAllItemTypes, onChange);
    await inputAnswer('1', 0.1, wrapper);

    let item = findItem('6a-hn-1', wrapper);
    expect(item.props().checked).toBe(true);
  });

  it('openchoice (checkboxes) gets updated', async () => {
    let onChange = createOnChangeFunc((actionRequester: IActionRequester) => {
      actionRequester.addOpenChoiceAnswer('6b', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
    });

    const wrapper = createWrapper(questionnaireWithAllItemTypes, onChange);
    await inputAnswer('1', 0.1, wrapper);

    let item = findItem('6b-2', wrapper);
    expect(item.props().checked).toBe(true);
  });

  it('date gets updated', async () => {
    let onChange = createOnChangeFunc((actionRequester: IActionRequester) => {
      actionRequester.addDateAnswer('7a', '2020-05-17');
    });

    const wrapper = createWrapper(questionnaireWithAllItemTypes, onChange);
    await inputAnswer('1', 0.1, wrapper);

    let item = findItem('7a-datepicker_input', wrapper);
    expect(item.props().value).toBe('17.05.2020');
  });

  it('date gets cleared', async () => {
    let onChange = createOnChangeFunc((actionRequester: IActionRequester) => {
      actionRequester.addDateAnswer('7a', '2020-05-17');
      actionRequester.clearDateAnswer('7a');
    });

    const wrapper = createWrapper(questionnaireWithAllItemTypes, onChange);
    await inputAnswer('1', 0.1, wrapper);

    let item = findItem('7a-datepicker_input', wrapper);
    expect(item.props().value).toBe('');
  });

  it('time gets updated', async () => {
    let onChange = createOnChangeFunc((actionRequester: IActionRequester) => {
      actionRequester.addTimeAnswer('7b', '12:01');
    });

    const wrapper = createWrapper(questionnaireWithAllItemTypes, onChange);
    await inputAnswer('1', 0.1, wrapper);

    let item = wrapper.find('#item_7b_hours input');
    expect(item.props().value).toBe('12');

    item = wrapper.find('#item_7b_minutes input');
    expect(item.props().value).toBe('01');
  });

  it('time gets cleared', async () => {
    let onChange = createOnChangeFunc((actionRequester: IActionRequester) => {
      actionRequester.addTimeAnswer('7b', '12:01');
      actionRequester.clearTimeAnswer('7b');
    });

    const wrapper = createWrapper(questionnaireWithAllItemTypes, onChange);
    await inputAnswer('1', 0.1, wrapper);

    let item = wrapper.find('#item_7b_hours input');
    expect(item.props().value).toBe('');

    item = wrapper.find('#item_7b_minutes input');
    expect(item.props().value).toBe('');
  });

  it('dateTime gets updated', async () => {
    let onChange = createOnChangeFunc((actionRequester: IActionRequester) => {
      actionRequester.addDateTimeAnswer('7c', '2020-05-17T12:01:00Z');
    });
    const wrapper = createWrapper(questionnaireWithAllItemTypes, onChange);
    await inputAnswer('1', 0.1, wrapper);

    let item = wrapper.find(DateTime);
    let date = item.props().value;
    let dateString = moment(date)
      .locale('nb')
      .utc()
      .format(Constants.DATE_TIME_FORMAT);
    expect(dateString).toBe('2020-05-17T12:01:00+00:00');
  });

  it('dateTime gets cleared', async () => {
    let onChange = createOnChangeFunc((actionRequester: IActionRequester) => {
      actionRequester.addDateTimeAnswer('7c', '2020-05-17T12:01:00Z');
      actionRequester.clearDateTimeAnswer('7c');
    });
    const wrapper = createWrapper(questionnaireWithAllItemTypes, onChange);
    await inputAnswer('1', 0.1, wrapper);

    let item = wrapper.find(DateTime);
    let date = item.props().value;
    expect(date).toBe(undefined);
  });

  it('string gets updated', async () => {
    let onChange = createOnChangeFunc((actionRequester: IActionRequester) => {
      actionRequester.addStringAnswer('8', 'Hello World!');
    });

    const wrapper = createWrapper(questionnaireWithAllItemTypes, onChange);
    await inputAnswer('1', 0.1, wrapper);

    let item = findItem('8', wrapper);
    expect(item.props().value).toBe('Hello World!');
  });

  it('string gets cleared', async () => {
    let onChange = createOnChangeFunc((actionRequester: IActionRequester) => {
      actionRequester.addStringAnswer('8', 'Hello World!');
      actionRequester.clearStringAnswer('8');
    });

    const wrapper = createWrapper(questionnaireWithAllItemTypes, onChange);
    await inputAnswer('1', 0.1, wrapper);

    let item = findItem('8', wrapper);
    expect(item.props().value).toBe('');
  });

  it('text gets updated', async () => {
    let onChange = createOnChangeFunc((actionRequester: IActionRequester) => {
      actionRequester.addStringAnswer('9', 'Hello\nWorld!');
    });

    const wrapper = createWrapper(questionnaireWithAllItemTypes, onChange);
    await inputAnswer('1', 0.1, wrapper);

    let item = wrapper.find('textarea#item_9');
    expect(item.props().value).toBe('Hello\nWorld!');
  });

  it('can request many changes', async () => {
    let onChange = createOnChangeFunc((actionRequester: IActionRequester) => {
      actionRequester.addStringAnswer('8', 'Hello World!');
      actionRequester.addIntegerAnswer('2', 42);
    });

    const wrapper = createWrapper(questionnaireWithAllItemTypes, onChange);
    await inputAnswer('1', 0.1, wrapper);

    let item = findItem('8', wrapper);
    expect(item.props().value).toBe('Hello World!');

    item = findItem('2', wrapper);
    expect(item.props().value).toBe('42');
  });

  it('opencboice other option can be updated', async () => {
    let onChange = createOnChangeFunc((actionRequester: IActionRequester) => {
      actionRequester.addOpenChoiceAnswer('6a', toCoding(OPEN_CHOICE_ID));
      actionRequester.addOpenChoiceAnswer('6a', 'Hello World!');
    });

    const wrapper = createWrapper(questionnaireWithAllItemTypes, onChange);
    await inputAnswer('1', 0.1, wrapper);

    let item = findItem('6a-hn-2', wrapper);
    expect(item.props().checked).toBe(true);

    item = wrapper.find('textField#item_6a input');
    expect(item.props().value).toBe('Hello World!');
  });

  it('can select multiple checkboxes', async () => {
    let onChange = createOnChangeFunc((actionRequester: IActionRequester) => {
      actionRequester.addChoiceAnswer('5b', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
      actionRequester.addChoiceAnswer('5b', toCoding('1', 'urn:oid:2.16.578.1.12.4.1.1101'));
    });

    const wrapper = createWrapper(questionnaireWithAllItemTypes, onChange);
    await inputAnswer('1', 0.1, wrapper);

    let item = findItem('5b-2', wrapper);
    expect(item.props().checked).toBe(true);

    item = findItem('5b-1', wrapper);
    expect(item.props().checked).toBe(true);
  });

  it('can select and unselect multiple checkboxes', async () => {
    let onChange = createOnChangeFunc((actionRequester: IActionRequester) => {
      actionRequester.addChoiceAnswer('5b', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
      actionRequester.addChoiceAnswer('5b', toCoding('1', 'urn:oid:2.16.578.1.12.4.1.1101'));
      actionRequester.removeChoiceAnswer('5b', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
    });

    const wrapper = createWrapper(questionnaireWithAllItemTypes, onChange);
    await inputAnswer('1', 0.1, wrapper);

    let item = findItem('5b-2', wrapper);
    expect(item.props().checked).toBe(false);

    item = findItem('5b-1', wrapper);
    expect(item.props().checked).toBe(true);
  });

  it('can update repeated items', async () => {
    let onChange = createOnChangeFunc((actionRequester: IActionRequester) => {
      actionRequester.addDecimalAnswer('1', 0.1, 0);
      actionRequester.addDecimalAnswer('1', 1.1, 1);
      actionRequester.addDecimalAnswer('1', 2.1, 2);
    });

    const wrapper = createWrapper(questionnaireWithRepeats, onChange);
    await inputAnswer('2', 42, wrapper);

    let item = findItem('1^0', wrapper);
    expect(item.props().value).toBe('0.1');

    item = findItem('1^1^1', wrapper);
    expect(item.props().value).toBe('1.1');

    item = findItem('1^2^2', wrapper);
    expect(item.props().value).toBe('2.1');
  });

  it('can update nested items', async () => {
    let onChange = createOnChangeFunc((actionRequester: IActionRequester) => {
      actionRequester.addStringAnswer('1.3.1', 'Hello');
    });

    const wrapper = createWrapper(questionnaireWithNestedItems, onChange);
    await inputAnswer('1.1', 0.1, wrapper);

    let item = findItem('1.3.1', wrapper);
    expect(item.props().value).toBe('Hello');
  });

  it('can update items nested under answer', async () => {
    let onChange = createOnChangeFunc((actionRequester: IActionRequester) => {
      actionRequester.addIntegerAnswer('1.3.1.1', 42);
    });

    const wrapper = createWrapper(questionnaireWithNestedItems, onChange);
    await inputAnswer('1.1', 0.1, wrapper);

    let item = findItem('1.3.1.1', wrapper);
    expect(item.props().value).toBe('42');
  });
});

function toCoding(code: string, system?: string): Coding {
  return {
    code: code,
    system: system,
  } as Coding;
}

function toQuantity(value: number, code: string, unit: string, system?: string): Quantity {
  return {
    value: (value as unknown) as decimal,
    code: (code as unknown) as code,
    unit: unit,
    system: (system as unknown) as uri,
  } as Quantity;
}

function createOnChangeFunc(actions: (actionRequester: IActionRequester) => void) {
  return (_item: QuestionnaireItem, _answer: QuestionnaireResponseAnswer, actionRequester: IActionRequester) => {
    actions(actionRequester);
  };
}

function createWrapper(
  questionnaire: Questionnaire,
  onChange: (item: QuestionnaireItem, answer: QuestionnaireResponseAnswer, actionRequester: IActionRequester) => void
) {
  const store: any = createStore(rootReducer, applyMiddleware(thunk));
  return mount(
    <Provider store={store}>
      <SkjemautfyllerContainer
        loginButton={<React.Fragment />}
        store={store}
        authorized={true}
        onCancel={() => {}}
        onSave={() => {}}
        onSubmit={() => {}}
        resources={{} as Resources}
        questionnaire={questionnaire}
        onChange={onChange}
      />
    </Provider>
  );
}
