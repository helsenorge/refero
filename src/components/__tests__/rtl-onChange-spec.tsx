import React from 'react';
import { render, screen, waitFor, fireEvent, userEvent, renderWithRedux } from './test-utils/test-utils';
import { prettyDOM } from '@testing-library/dom';
import moment from 'moment';
import '@testing-library/jest-dom/extend-expect';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer, Quantity, Coding } from 'fhir/r4';

import '../../util/defineFetch';
import { ReferoContainer } from '..';
import Constants, { OPEN_CHOICE_ID } from '../../constants/index';
import { IActionRequester } from '../../util/actionRequester';
import { IQuestionnaireInspector, QuestionnaireItemPair } from '../../util/questionnaireInspector';
import { Resources } from '../../util/resources';
import questionnaireWithAllItemTypes from './__data__/onChange/allItemTypes';
import questionnaireWithNestedItems from './__data__/onChange/nestedItems';
import questionnaireWithRepeats from './__data__/onChange/repeats';
import { inputAnswer, selectRadioButtonOption, selectCheckBoxOption, findItem } from './utils';
import { generateQuestionnaireResponse } from '../../actions/generateQuestionnaireResponse';

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

    renderWithRedux(
      <ReferoContainer
        loginButton={<React.Fragment />}
        authorized={true}
        onCancel={() => {}}
        onSave={() => {}}
        onSubmit={() => {}}
        questionnaire={questionnaireWithAllItemTypes}
        resources={{} as Resources}
        onChange={onChange}
      />,
      {
        initialState: {
          refero: {
            form: {
              FormDefinition: {
                Content: questionnaireWithAllItemTypes,
              },
              FormData: {
                Content: generateQuestionnaireResponse(questionnaireWithAllItemTypes),
              },
              Language: 'nb',
            },
          },
        },
      }
    );
    const decimal = screen.getByLabelText('Decimal');

    userEvent.type(decimal, '0.1');
    userEvent.tab();
    const integerAnswer = await screen.findByDisplayValue('42');
    const decimalAnswer = await screen.findByDisplayValue('0.1');

    expect(integerAnswer).toBeInTheDocument();
    expect(decimalAnswer).toBeInTheDocument();
  });

  it('integers gets cleared', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addIntegerAnswer('2', 42);
      actionRequester.clearIntegerAnswer('2');
    });

    renderWithRedux(
      <ReferoContainer
        loginButton={<React.Fragment />}
        authorized={true}
        onCancel={() => {}}
        onSave={() => {}}
        onSubmit={() => {}}
        questionnaire={questionnaireWithAllItemTypes}
        resources={{} as Resources}
        onChange={onChange}
      />,
      {
        initialState: {
          refero: {
            form: {
              FormDefinition: {
                Content: questionnaireWithAllItemTypes,
              },
              FormData: {
                Content: generateQuestionnaireResponse(questionnaireWithAllItemTypes),
              },
              Language: 'nb',
            },
          },
        },
      }
    );
    const decimal = screen.getByLabelText('Decimal');

    userEvent.type(decimal, '0.1');
    userEvent.tab();
    const integerAnswer = screen.getByRole('spinbutton', { name: 'Integer' });
    const decimalAnswer = screen.getByRole('spinbutton', { name: 'Decimal' });
    expect(decimalAnswer).toHaveValue(0.1);
    expect(integerAnswer).toHaveValue(null);
  });

  it('decimals gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addDecimalAnswer('1', 42);
    });

    renderWithRedux(
      <ReferoContainer
        loginButton={<React.Fragment />}
        authorized={true}
        onCancel={() => {}}
        onSave={() => {}}
        onSubmit={() => {}}
        questionnaire={questionnaireWithAllItemTypes}
        resources={{} as Resources}
        onChange={onChange}
      />,
      {
        initialState: {
          refero: {
            form: {
              FormDefinition: {
                Content: questionnaireWithAllItemTypes,
              },
              FormData: {
                Content: generateQuestionnaireResponse(questionnaireWithAllItemTypes),
              },
              Language: 'nb',
            },
          },
        },
      }
    );
    const integer = screen.getByLabelText('Integer');

    userEvent.type(integer, '1');
    userEvent.tab();
    const updatedInput = await screen.findByDisplayValue('42');
    expect(updatedInput).toBeInTheDocument();
  });

  it.only('decimals gets cleared', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addDecimalAnswer('1', 42);
      actionRequester.clearDecimalAnswer('1');
    });

    renderWithRedux(
      <ReferoContainer
        loginButton={<React.Fragment />}
        authorized={true}
        onCancel={() => {}}
        onSave={() => {}}
        onSubmit={() => {}}
        questionnaire={questionnaireWithAllItemTypes}
        resources={{} as Resources}
        onChange={onChange}
      />,
      {
        initialState: {
          refero: {
            form: {
              FormDefinition: {
                Content: questionnaireWithAllItemTypes,
              },
              FormData: {
                Content: generateQuestionnaireResponse(questionnaireWithAllItemTypes),
              },
              Language: 'nb',
            },
          },
        },
      }
    );

    const integer = screen.getByLabelText('Integer');

    userEvent.type(integer, '1');
    userEvent.tab();
    const decimalAnswer = screen.getByRole('spinbutton', { name: 'Decimal' });
    expect(decimalAnswer).toHaveValue(null);
  });

  it('quantity gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addQuantityAnswer('3', toQuantity(42, 'kg', 'kilogram', 'http://unitsofmeasure.org'));
    });

    renderWithRedux(
      <ReferoContainer
        loginButton={<React.Fragment />}
        authorized={true}
        onCancel={() => {}}
        onSave={() => {}}
        onSubmit={() => {}}
        questionnaire={questionnaireWithAllItemTypes}
        resources={{} as Resources}
        onChange={onChange}
      />,
      {
        initialState: {
          refero: {
            form: {
              FormDefinition: {
                Content: questionnaireWithAllItemTypes,
              },
              FormData: {
                Content: generateQuestionnaireResponse(questionnaireWithAllItemTypes),
              },
              Language: 'nb',
            },
          },
        },
      }
    );

    await inputAnswer('1', 0.1);
    const item = findItem('3');
    expect(item.value).toBe('42');
  });

  it('quantity gets cleared', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addQuantityAnswer('3', toQuantity(42, 'kg', 'kilogram', 'http://unitsofmeasure.org'));
      actionRequester.clearQuantityAnswer('3');
    });

    render(
      <ReferoContainer
        loginButton={<React.Fragment />}
        authorized={true}
        onCancel={() => {}}
        onSave={() => {}}
        onSubmit={() => {}}
        resources={{} as Resources}
        questionnaire={questionnaireWithAllItemTypes}
        onChange={onChange}
      />,
      { initialState: {}, defaultValues: {} }
    );

    await inputAnswer('1', 0.1);
    const item = findItem('3');
    expect(item.value).toBe('');
  });

  it('boolean gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addBooleanAnswer('4', true);
    });

    render(
      <ReferoContainer
        loginButton={<React.Fragment />}
        authorized={true}
        onCancel={() => {}}
        onSave={() => {}}
        onSubmit={() => {}}
        resources={{} as Resources}
        questionnaire={questionnaireWithAllItemTypes}
        onChange={onChange}
      />,
      { initialState: {}, defaultValues: {} }
    );

    await inputAnswer('1', 0.1);
    const item = findItem('4');
    expect(item.checked).toBe(true);
  });

  it('boolean gets cleared', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addBooleanAnswer('4', true);
      actionRequester.clearBooleanAnswer('4');
    });

    render(
      <ReferoContainer
        loginButton={<React.Fragment />}
        authorized={true}
        onCancel={() => {}}
        onSave={() => {}}
        onSubmit={() => {}}
        resources={{} as Resources}
        questionnaire={questionnaireWithAllItemTypes}
        onChange={onChange}
      />,
      { initialState: {}, defaultValues: {} }
    );

    await inputAnswer('1', 0.1);
    const item = findItem('4');
    expect(item.checked).toBe(false);
  });

  it('choice (radiobuttons) gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addChoiceAnswer('5a', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
    });

    render(
      <ReferoContainer
        loginButton={<React.Fragment />}
        authorized={true}
        onCancel={() => {}}
        onSave={() => {}}
        onSubmit={() => {}}
        resources={{} as Resources}
        questionnaire={questionnaireWithAllItemTypes}
        onChange={onChange}
      />,
      { initialState: {}, defaultValues: {} }
    );

    await selectRadioButtonOption('1', 0.1);
    const item = findItem('5a-hn-1');
    expect(item.checked).toBe(true);
  });

  it('choice (radiobuttons) does not get cleared', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addChoiceAnswer('5a', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
      actionRequester.removeChoiceAnswer('5a', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
    });

    render(
      <ReferoContainer
        loginButton={<React.Fragment />}
        authorized={true}
        onCancel={() => {}}
        onSave={() => {}}
        onSubmit={() => {}}
        resources={{} as Resources}
        questionnaire={questionnaireWithAllItemTypes}
        onChange={onChange}
      />,
      { initialState: {}, defaultValues: {} }
    );

    await selectRadioButtonOption('1', 0.1);
    const item = findItem('5a-hn-1');
    expect(item.checked).toBe(true);
  });

  it('choice (checkboxes) gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addChoiceAnswer('5b', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
    });

    render(
      <ReferoContainer
        loginButton={<React.Fragment />}
        authorized={true}
        onCancel={() => {}}
        onSave={() => {}}
        onSubmit={() => {}}
        resources={{} as Resources}
        questionnaire={questionnaireWithAllItemTypes}
        onChange={onChange}
      />,
      { initialState: {}, defaultValues: {} }
    );

    await selectCheckBoxOption('1', '2');
    const item = findItem('5b-2');
    expect(item.checked).toBe(true);
  });

  it('choice (checkboxes) gets cleared', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addChoiceAnswer('5b', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
      actionRequester.removeChoiceAnswer('5b', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
    });

    render(
      <ReferoContainer
        loginButton={<React.Fragment />}
        authorized={true}
        onCancel={() => {}}
        onSave={() => {}}
        onSubmit={() => {}}
        resources={{} as Resources}
        questionnaire={questionnaireWithAllItemTypes}
        onChange={onChange}
      />,
      { initialState: {}, defaultValues: {} }
    );

    await selectCheckBoxOption('1', '2');
    const item = findItem('5b-2');
    expect(item.checked).toBe(false);
  });

  it('openchoice (radiobuttons) gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addOpenChoiceAnswer('6a', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
    });

    render(
      <ReferoContainer
        loginButton={<React.Fragment />}
        authorized={true}
        onCancel={() => {}}
        onSave={() => {}}
        onSubmit={() => {}}
        resources={{} as Resources}
        questionnaire={questionnaireWithAllItemTypes}
        onChange={onChange}
      />,
      { initialState: {}, defaultValues: {} }
    );

    await selectRadioButtonOption('1', 0.1);
    const item = findItem('6a-hn-1');
    expect(item.checked).toBe(true);
  });

  it('openchoice (checkboxes) gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addOpenChoiceAnswer('6b', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
    });

    render(
      <ReferoContainer
        loginButton={<React.Fragment />}
        authorized={true}
        onCancel={() => {}}
        onSave={() => {}}
        onSubmit={() => {}}
        resources={{} as Resources}
        questionnaire={questionnaireWithAllItemTypes}
        onChange={onChange}
      />,
      { initialState: {}, defaultValues: {} }
    );

    await selectCheckBoxOption('1', '2');
    const item = findItem('6b-2');
    expect(item.checked).toBe(true);
  });

  it('date gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addDateAnswer('7a', '2020-05-17');
    });

    render(
      <ReferoContainer
        loginButton={<React.Fragment />}
        authorized={true}
        onCancel={() => {}}
        onSave={() => {}}
        onSubmit={() => {}}
        resources={{} as Resources}
        questionnaire={questionnaireWithAllItemTypes}
        onChange={onChange}
      />,
      { initialState: {}, defaultValues: {} }
    );

    await inputAnswer('1', 0.1);
    const item = findItem('7a-datepicker_input');
    expect(item.value).toBe('17.05.2020');
  });

  it('date gets cleared', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addDateAnswer('7a', '2020-05-17');
      actionRequester.clearDateAnswer('7a');
    });

    render(
      <ReferoContainer
        loginButton={<React.Fragment />}
        authorized={true}
        onCancel={() => {}}
        onSave={() => {}}
        onSubmit={() => {}}
        resources={{} as Resources}
        questionnaire={questionnaireWithAllItemTypes}
        onChange={onChange}
      />,
      { initialState: {}, defaultValues: {} }
    );

    await inputAnswer('1', 0.1);
    const item = findItem('7a-datepicker_input');
    expect(item.value).toBe('');
  });

  it('time gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addTimeAnswer('7b', '12:01');
    });

    render(
      <ReferoContainer
        loginButton={<React.Fragment />}
        authorized={true}
        onCancel={() => {}}
        onSave={() => {}}
        onSubmit={() => {}}
        resources={{} as Resources}
        questionnaire={questionnaireWithAllItemTypes}
        onChange={onChange}
      />,
      { initialState: {}, defaultValues: {} }
    );

    await inputAnswer('1', 0.1);

    let item = screen.getByLabelText('#item_7b_hours');
    expect(item.value).toBe('12');

    item = screen.getByLabelText('#item_7b_minutes');
    expect(item.value).toBe('01');
  });

  it('time gets cleared', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addTimeAnswer('7b', '12:01');
      actionRequester.clearTimeAnswer('7b');
    });

    render(
      <ReferoContainer
        loginButton={<React.Fragment />}
        authorized={true}
        onCancel={() => {}}
        onSave={() => {}}
        onSubmit={() => {}}
        resources={{} as Resources}
        questionnaire={questionnaireWithAllItemTypes}
        onChange={onChange}
      />,
      { initialState: {}, defaultValues: {} }
    );

    await inputAnswer('1', 0.1);

    let item = screen.getByLabelText('#item_7b_hours');
    expect(item.value).toBe('');

    item = screen.getByLabelText('#item_7b_minutes');
    expect(item.value).toBe('');
  });

  it('dateTime gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addDateTimeAnswer('7c', '2020-05-17T12:01:00Z');
    });

    render(
      <ReferoContainer
        loginButton={<React.Fragment />}
        authorized={true}
        onCancel={() => {}}
        onSave={() => {}}
        onSubmit={() => {}}
        resources={{} as Resources}
        questionnaire={questionnaireWithAllItemTypes}
        onChange={onChange}
      />,
      { initialState: {}, defaultValues: {} }
    );

    await inputAnswer('1', 0.1);

    const item = screen.getByTestId('date-time-picker');
    const date = item.value;
    const dateString = moment(date).locale('nb').utc().format(Constants.DATE_TIME_FORMAT);
    expect(dateString).toBe('2020-05-17T12:01:00+00:00');
  });

  it('dateTime gets cleared', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addDateTimeAnswer('7c', '2020-05-17T12:01:00Z');
      actionRequester.clearDateTimeAnswer('7c');
    });

    render(
      <ReferoContainer
        loginButton={<React.Fragment />}
        authorized={true}
        onCancel={() => {}}
        onSave={() => {}}
        onSubmit={() => {}}
        resources={{} as Resources}
        questionnaire={questionnaireWithAllItemTypes}
        onChange={onChange}
      />,
      { initialState: {}, defaultValues: {} }
    );

    await inputAnswer('1', 0.1);

    const item = screen.getByTestId('date-time-picker');
    const date = item.value;
    expect(date).toBe(undefined);
  });

  it('string gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addStringAnswer('8', 'Hello World!');
    });

    render(
      <ReferoContainer
        loginButton={<React.Fragment />}
        authorized={true}
        onCancel={() => {}}
        onSave={() => {}}
        onSubmit={() => {}}
        resources={{} as Resources}
        questionnaire={questionnaireWithAllItemTypes}
        onChange={onChange}
      />,
      { initialState: {}, defaultValues: {} }
    );

    await inputAnswer('1', 0.1);
    const item = findItem('8');
    expect(item.value).toBe('Hello World!');
  });

  it('string gets cleared', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addStringAnswer('8', 'Hello World!');
      actionRequester.clearStringAnswer('8');
    });

    render(
      <ReferoContainer
        loginButton={<React.Fragment />}
        authorized={true}
        onCancel={() => {}}
        onSave={() => {}}
        onSubmit={() => {}}
        resources={{} as Resources}
        questionnaire={questionnaireWithAllItemTypes}
        onChange={onChange}
      />,
      { initialState: {}, defaultValues: {} }
    );

    await inputAnswer('1', 0.1);
    const item = findItem('8');
    expect(item.value).toBe('');
  });

  it('text gets updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addStringAnswer('9', 'Hello\nWorld!');
    });

    render(
      <ReferoContainer
        loginButton={<React.Fragment />}
        authorized={true}
        onCancel={() => {}}
        onSave={() => {}}
        onSubmit={() => {}}
        resources={{} as Resources}
        questionnaire={questionnaireWithAllItemTypes}
        onChange={onChange}
      />,
      { initialState: {}, defaultValues: {} }
    );

    await inputAnswer('1', 0.1);

    const item = screen.getByLabelText('textarea#item_9');
    expect(item.value).toBe('Hello\nWorld!');
  });

  it('can request many changes', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addStringAnswer('8', 'Hello World!');
      actionRequester.addIntegerAnswer('2', 42);
    });

    render(
      <ReferoContainer
        loginButton={<React.Fragment />}
        authorized={true}
        onCancel={() => {}}
        onSave={() => {}}
        onSubmit={() => {}}
        resources={{} as Resources}
        questionnaire={questionnaireWithAllItemTypes}
        onChange={onChange}
      />,
      { initialState: {}, defaultValues: {} }
    );

    await inputAnswer('1', 0.1);

    let item = findItem('8');
    expect(item.value).toBe('Hello World!');

    item = findItem('2');
    expect(item.value).toBe('42');
  });

  it('opencboice other option can be updated', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addOpenChoiceAnswer('6a', toCoding(OPEN_CHOICE_ID));
      actionRequester.addOpenChoiceAnswer('6a', 'Hello World!');
    });

    render(
      <ReferoContainer
        loginButton={<React.Fragment />}
        authorized={true}
        onCancel={() => {}}
        onSave={() => {}}
        onSubmit={() => {}}
        resources={{} as Resources}
        questionnaire={questionnaireWithAllItemTypes}
        onChange={onChange}
      />,
      { initialState: {}, defaultValues: {} }
    );

    await inputAnswer('1', 0.1);

    let item = findItem('6a-hn-2');
    expect(item.checked).toBe(true);

    item = screen.getByLabelText('textField#item_6a input');
    expect(item.value).toBe('Hello World!');
  });

  it('can select multiple checkboxes', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addChoiceAnswer('5b', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
      actionRequester.addChoiceAnswer('5b', toCoding('1', 'urn:oid:2.16.578.1.12.4.1.1101'));
    });

    render(
      <ReferoContainer
        loginButton={<React.Fragment />}
        authorized={true}
        onCancel={() => {}}
        onSave={() => {}}
        onSubmit={() => {}}
        resources={{} as Resources}
        questionnaire={questionnaireWithAllItemTypes}
        onChange={onChange}
      />,
      { initialState: {}, defaultValues: {} }
    );

    await selectCheckBoxOption('1', '2');

    let item = findItem('5b-2');
    expect(item.checked).toBe(true);

    item = findItem('5b-1');
    expect(item.checked).toBe(true);
  });

  it('can select and unselect multiple checkboxes', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addChoiceAnswer('5b', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
      actionRequester.addChoiceAnswer('5b', toCoding('1', 'urn:oid:2.16.578.1.12.4.1.1101'));
      actionRequester.removeChoiceAnswer('5b', toCoding('2', 'urn:oid:2.16.578.1.12.4.1.1101'));
    });

    render(
      <ReferoContainer
        loginButton={<React.Fragment />}
        authorized={true}
        onCancel={() => {}}
        onSave={() => {}}
        onSubmit={() => {}}
        resources={{} as Resources}
        questionnaire={questionnaireWithAllItemTypes}
        onChange={onChange}
      />,
      { initialState: {}, defaultValues: {} }
    );

    await selectCheckBoxOption('1', '2');

    let item = findItem('5b-2');
    expect(item.checked).toBe(false);

    item = findItem('5b-1');
    expect(item.checked).toBe(true);
  });

  it('can update repeated items', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addDecimalAnswer('1', 0.1, 0);
      actionRequester.addDecimalAnswer('1', 1.1, 1);
      actionRequester.addDecimalAnswer('1', 2.1, 2);
    });

    render(
      <ReferoContainer
        loginButton={<React.Fragment />}
        authorized={true}
        onCancel={() => {}}
        onSave={() => {}}
        onSubmit={() => {}}
        resources={{} as Resources}
        questionnaire={questionnaireWithRepeats}
        onChange={onChange}
      />,
      { initialState: {}, defaultValues: {} }
    );

    await inputAnswer('2', 42);

    let item = findItem('1^0');
    expect(item.value).toBe('0.1');

    item = findItem('1^1^1');
    expect(item.value).toBe('1.1');

    item = findItem('1^2^2');
    expect(item.value).toBe('2.1');
  });

  it('can update nested items', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addStringAnswer('1.3.1', 'Hello');
    });

    render(
      <ReferoContainer
        loginButton={<React.Fragment />}
        authorized={true}
        onCancel={() => {}}
        onSave={() => {}}
        onSubmit={() => {}}
        resources={{} as Resources}
        questionnaire={questionnaireWithNestedItems}
        onChange={onChange}
      />,
      { initialState: {}, defaultValues: {} }
    );

    await inputAnswer('1.1', 0.1);

    const item = findItem('1.3.1');
    expect(item.value).toBe('Hello');
  });

  it('can update items nested under answer', async () => {
    const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
      actionRequester.addIntegerAnswer('1.3.1.1', 42);
    });

    render(
      <ReferoContainer
        loginButton={<React.Fragment />}
        authorized={true}
        onCancel={() => {}}
        onSave={() => {}}
        onSubmit={() => {}}
        resources={{} as Resources}
        questionnaire={questionnaireWithNestedItems}
        onChange={onChange}
      />,
      { initialState: {}, defaultValues: {} }
    );

    await inputAnswer('1.1', 0.1);

    const item = findItem('1.3.1.1');
    expect(item.value).toBe(42);
  });

  it('can query to get both questionnaire and questionnaire response', async () => {
    let result: QuestionnaireItemPair[] = [];
    const onChange = createOnChangeFuncForQuestionnaireInspector((questionnaireInspector: IQuestionnaireInspector) => {
      result = questionnaireInspector.findItemWithLinkIds('1.3.1.1');
    });

    render(
      <ReferoContainer
        loginButton={<React.Fragment />}
        authorized={true}
        onCancel={() => {}}
        onSave={() => {}}
        onSubmit={() => {}}
        resources={{} as Resources}
        questionnaire={questionnaireWithNestedItems}
        onChange={onChange}
      />,
      { initialState: {}, defaultValues: {} }
    );

    await inputAnswer('1.1', 0.1);

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

    render(
      <ReferoContainer
        loginButton={<React.Fragment />}
        authorized={true}
        onCancel={() => {}}
        onSave={() => {}}
        onSubmit={() => {}}
        resources={{} as Resources}
        questionnaire={questionnaireWithNestedItems}
        onChange={onChange}
      />,
      { initialState: {}, defaultValues: {} }
    );

    await inputAnswer('1.1', 0.1);

    expect(result.length).toBe(0);
  });

  it('can query several linkIds', async () => {
    let result: QuestionnaireItemPair[] = [];
    const onChange = createOnChangeFuncForQuestionnaireInspector((questionnaireInspector: IQuestionnaireInspector) => {
      result = questionnaireInspector.findItemWithLinkIds('1.3.1.1', '1.1');
    });

    render(
      <ReferoContainer
        loginButton={<React.Fragment />}
        authorized={true}
        onCancel={() => {}}
        onSave={() => {}}
        onSubmit={() => {}}
        resources={{} as Resources}
        questionnaire={questionnaireWithNestedItems}
        onChange={onChange}
      />,
      { initialState: {}, defaultValues: {} }
    );

    await inputAnswer('1.1', 0.1);

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

    render(
      <ReferoContainer
        loginButton={<React.Fragment />}
        authorized={true}
        onCancel={() => {}}
        onSave={() => {}}
        onSubmit={() => {}}
        resources={{} as Resources}
        questionnaire={questionnaireWithRepeats}
        onChange={onChange}
      />,
      { initialState: {}, defaultValues: {} }
    );

    await inputAnswer('2', 1);

    expect(result.length).toBe(1);
    expect(result[0].QuestionnaireItem.linkId).toBe('1');
    expect(result[0].QuestionnaireResponseItems).toBeDefined();
    expect(result[0].QuestionnaireResponseItems.length).toBe(3);
    expect(result[0].QuestionnaireResponseItems[0].item.linkId).toBe('1');
    expect(result[0].QuestionnaireResponseItems[1].item.linkId).toBe('1');
    expect(result[0].QuestionnaireResponseItems[2].item.linkId).toBe('1');
  });
});
