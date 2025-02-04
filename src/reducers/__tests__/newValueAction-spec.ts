import { fail } from 'assert';

import { Attachment, QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import * as uuid from 'uuid';
import { Assertion, Mocked, vi } from 'vitest';

import { Form } from '../form';
import state from './data/newValueAction';
import {
  getResponseItem,
  pathify,
  enterText,
  enterQuantity,
  createQuantity,
  enterInteger,
  enterDecimal,
  enterDate,
  enterTime,
  enterDateTime,
  enterBoolean,
  uploadAttachment,
  createAttachment,
  deleteAttachment,
  selectChoice,
  createCoding,
  unselectChoice,
  enterOpenChoiceText,
  removeOpenChoiceText,
} from './utils';
import { getDefinitionItems, getQuestionnaireDefinitionItem, Path } from '../../util/refero-core';

vi.mock('uuid');

describe('QuestionnaireResponseAnswer shall reflect user input', () => {
  let newState: Form;
  let definitionItems: QuestionnaireItem[];

  beforeEach(() => {
    newState = state.refero.form;
    const dItems = getDefinitionItems(newState.FormDefinition);
    if (!dItems || dItems.length === 0) {
      return fail();
    }
    definitionItems = dItems;

    const mockedUuid = uuid as Mocked<typeof uuid>;
    //@ts-expect-error - uuid is mocked
    mockedUuid.v4.mockReturnValue('uuid');
  });

  it('When the user enters a text, then removes the content of a text input field, answer should be undefined', () => {
    const linkId = '1.1';
    newState = enterText(newState, pathify('1', linkId), 'hello');
    verifyAnswer(linkId, newState, pathify('1', linkId), it => it.toEqual([{ valueString: 'hello' }]));

    newState = enterText(newState, pathify('1', linkId), 'world');
    verifyAnswer(linkId, newState, pathify('1', linkId), it => it.toEqual([{ valueString: 'world' }]));

    newState = enterText(newState, pathify('1', linkId), '');
    verifyAnswer(linkId, newState, pathify('1', linkId), it => it.toBeUndefined());
  });

  it('When the user enters a string, then removes the content of a string input field, answer should be undefined', () => {
    const linkId = '1.2';
    newState = enterText(newState, pathify('1', linkId), 'hello');
    verifyAnswer(linkId, newState, pathify('1', linkId), it => it.toEqual([{ valueString: 'hello' }]));

    newState = enterText(newState, pathify('1', linkId), 'world');
    verifyAnswer(linkId, newState, pathify('1', linkId), it => it.toEqual([{ valueString: 'world' }]));

    newState = enterText(newState, pathify('1', linkId), '');
    verifyAnswer(linkId, newState, pathify('1', linkId), it => it.toBeUndefined());
  });

  it('When the user enters a quantity, then removes the content of a quantity input field, answer should be undefined', () => {
    const linkId = '1.3';
    newState = enterQuantity(newState, pathify('1', linkId), createQuantity(10.0, 'cm', 'lengths'));
    verifyAnswer(linkId, newState, pathify('1', linkId), it => it.toEqual([{ valueQuantity: createQuantity(10.0, 'cm', 'lengths') }]));

    newState = enterQuantity(newState, pathify('1', linkId), createQuantity(44.0, 'cm', 'lengths'));
    verifyAnswer(linkId, newState, pathify('1', linkId), it => it.toEqual([{ valueQuantity: createQuantity(44.0, 'cm', 'lengths') }]));

    newState = enterQuantity(newState, pathify('1', linkId), createQuantity());
    verifyAnswer(linkId, newState, pathify('1', linkId), it => it.toBeUndefined());
  });

  it('When the user enters an integer, then removes the content of an integer input field, answer should be undefined', () => {
    const linkId = '1.4';
    newState = enterInteger(newState, pathify('1', linkId), 42);
    verifyAnswer(linkId, newState, pathify('1', linkId), it => it.toEqual([{ valueInteger: 42 }]));

    newState = enterInteger(newState, pathify('1', linkId), 19);
    verifyAnswer(linkId, newState, pathify('1', linkId), it => it.toEqual([{ valueInteger: 19 }]));

    newState = enterInteger(newState, pathify('1', linkId), NaN);
    verifyAnswer(linkId, newState, pathify('1', linkId), it => it.toBeUndefined());
  });

  it('When the user enters a decimal, then removes the content of a decimal input field, answer should be undefined', () => {
    const linkId = '1.5';
    newState = enterDecimal(newState, pathify('1', linkId), 42.0);
    verifyAnswer(linkId, newState, pathify('1', linkId), it => it.toEqual([{ valueDecimal: 42.0 }]));

    newState = enterDecimal(newState, pathify('1', linkId), 19.0);
    verifyAnswer(linkId, newState, pathify('1', linkId), it => it.toEqual([{ valueDecimal: 19.0 }]));

    newState = enterDecimal(newState, pathify('1', linkId), NaN);
    verifyAnswer(linkId, newState, pathify('1', linkId), it => it.toBeUndefined());
  });

  it('When the user enters a date, then removes the content of a date input field, answer should be undefined', () => {
    const linkId = '1.6';
    newState = enterDate(newState, pathify('1', linkId), '2019-08-30');
    verifyAnswer(linkId, newState, pathify('1', linkId), it => it.toEqual([{ valueDate: '2019-08-30' }]));

    newState = enterDate(newState, pathify('1', linkId), '2019-09-01');
    verifyAnswer(linkId, newState, pathify('1', linkId), it => it.toEqual([{ valueDate: '2019-09-01' }]));

    newState = enterDate(newState, pathify('1', linkId), '');
    verifyAnswer(linkId, newState, pathify('1', linkId), it => it.toBeUndefined());
  });

  it('When the user enters a time, then removes the content of a time input field, answer should be undefined', () => {
    const linkId = '1.7';
    newState = enterTime(newState, pathify('1', linkId), '10:11');
    verifyAnswer(linkId, newState, pathify('1', linkId), it => it.toEqual([{ valueTime: '10:11' }]));

    newState = enterTime(newState, pathify('1', linkId), '12:13');
    verifyAnswer(linkId, newState, pathify('1', linkId), it => it.toEqual([{ valueTime: '12:13' }]));

    newState = enterTime(newState, pathify('1', linkId), '');
    verifyAnswer(linkId, newState, pathify('1', linkId), it => it.toBeUndefined());
  });

  it('When the user enters a dateTime, then removes the content of a dateTime input field, answer should be undefined', () => {
    const linkId = '1.8';
    newState = enterDateTime(newState, pathify('1', linkId), '2019-07-30T23:02:00+00:00');
    verifyAnswer(linkId, newState, pathify('1', linkId), it => it.toEqual([{ valueDateTime: '2019-07-30T23:02:00+00:00' }]));

    newState = enterDateTime(newState, pathify('1', linkId), '2019-09-01T13:13:13+02:00');
    verifyAnswer(linkId, newState, pathify('1', linkId), it => it.toEqual([{ valueDateTime: '2019-09-01T13:13:13+02:00' }]));

    newState = enterDateTime(newState, pathify('1', linkId), '');
    verifyAnswer(linkId, newState, pathify('1', linkId), it => it.toBeUndefined());
  });

  it('When the user enters a boolean, then removes the content of a boolean input field, answer should be undefined', () => {
    const linkId = '1.9';
    newState = enterBoolean(newState, pathify('1', linkId), true);
    verifyAnswer(linkId, newState, pathify('1', linkId), it => it.toEqual([{ valueBoolean: true }]));

    newState = enterBoolean(newState, pathify('1', linkId), true);
    verifyAnswer(linkId, newState, pathify('1', linkId), it => it.toEqual([{ valueBoolean: true }]));

    newState = enterBoolean(newState, pathify('1', linkId), false);
    verifyAnswer(linkId, newState, pathify('1', linkId), it => it.toEqual([{ valueBoolean: false }]));
  });

  it('When the user uploads a file, then removes the content of an attachment input field, answer should be undefined', () => {
    const item = {
      linkId: '1.10',
      type: 'attachment',
      text: 'Attachment',
      required: false,
    } as QuestionnaireItem;
    newState = uploadAttachment(newState, pathify('1', item.linkId), createAttachment('1', 'fil1'), item);
    verifyAttachmentAnswer(item.linkId, newState, pathify('1', item.linkId), 0, createAttachment('1', 'fil1'));

    newState = deleteAttachment(newState, pathify('1', item.linkId), createAttachment('1', 'fil1'), item);
    verifyAttachmentAnswer(item.linkId, newState, pathify('1', item.linkId), 0, undefined);
  });

  it('When the user uploads many files, then removes the content of an attachment input field, answer should be undefined', () => {
    const item = {
      linkId: '1.10',
      type: 'attachment',
      text: 'Attachment',
      required: false,
      repeats: true,
    } as QuestionnaireItem;
    newState = uploadAttachment(newState, pathify('1', item.linkId), createAttachment('1', 'fil1'), item, true);
    verifyAttachmentAnswer(item.linkId, newState, pathify('1', item.linkId), 0, createAttachment('1', 'fil1'));

    newState = uploadAttachment(newState, pathify('1', item.linkId), createAttachment('2', 'fil2'), item, true);
    verifyAttachmentAnswer(item.linkId, newState, pathify('1', item.linkId), 1, createAttachment('2', 'fil2'));

    newState = deleteAttachment(newState, pathify('1', item.linkId), createAttachment('1', 'fil1'));
    verifyAttachmentAnswer(item.linkId, newState, pathify('1', item.linkId), 0, createAttachment('2', 'fil2'));

    newState = deleteAttachment(newState, pathify('1', item.linkId), createAttachment('2', 'fil2'));
    verifyAttachmentAnswer(item.linkId, newState, pathify('1', item.linkId), 0, undefined);
  });

  it('When the user selects a radio-button, the answer should be the selected item', () => {
    const linkId = '1.11';
    const qItem = getQuestionnaireDefinitionItem(linkId, definitionItems);
    if (!qItem) return fail();

    newState = selectChoice(newState, pathify('1', linkId), createCoding('1', 'foo'), qItem, false);
    verifyAnswer(linkId, newState, pathify('1', linkId), it => it.toEqual([{ valueCoding: createCoding('1', 'foo') }]));

    newState = selectChoice(newState, pathify('1', linkId), createCoding('2', 'foo'), qItem, false);
    verifyAnswer(linkId, newState, pathify('1', linkId), it => it.toEqual([{ valueCoding: createCoding('2', 'foo') }]));
  });

  it('When the user selects checkboxes, then removes the content of the checkbox input fields, answer should be undefined', () => {
    const linkId = '1.12';
    const qItem = getQuestionnaireDefinitionItem(linkId, definitionItems);
    if (!qItem) return fail();

    newState = selectChoice(newState, pathify('1', linkId), createCoding('1', 'foo'), qItem, true);
    verifyAnswer(linkId, newState, pathify('1', linkId), it => it.toEqual([{ valueCoding: createCoding('1', 'foo') }]));

    newState = selectChoice(newState, pathify('1', linkId), createCoding('2', 'foo'), qItem, true);
    verifyAnswer(linkId, newState, pathify('1', linkId), it =>
      it.toEqual([{ valueCoding: createCoding('1', 'foo') }, { valueCoding: createCoding('2', 'foo') }])
    );

    newState = unselectChoice(newState, pathify('1', linkId), createCoding('1', 'foo'), qItem);
    verifyAnswer(linkId, newState, pathify('1', linkId), it => it.toEqual([{ valueCoding: createCoding('2', 'foo') }]));

    newState = unselectChoice(newState, pathify('1', linkId), createCoding('2', 'foo'), qItem);
    verifyAnswer(linkId, newState, pathify('1', linkId), it => it.toBeUndefined());
  });

  it('When the user selects an open-choice radio-button, the answer should be the selected item', () => {
    const linkId = '1.13';
    const qItem = getQuestionnaireDefinitionItem(linkId, definitionItems);
    if (!qItem) return fail();

    newState = selectChoice(newState, pathify('1', linkId), createCoding('1', 'foo'), qItem, false);
    verifyAnswer(linkId, newState, pathify('1', linkId), it => it.toEqual([{ valueCoding: createCoding('1', 'foo') }]));

    newState = selectChoice(newState, pathify('1', linkId), createCoding('uuid', 'foo'), qItem, false);
    verifyAnswer(linkId, newState, pathify('1', linkId), it => it.toEqual([{ valueCoding: createCoding('uuid', 'foo') }]));

    newState = enterOpenChoiceText(newState, pathify('1', linkId), 'hello', qItem);
    verifyAnswer(linkId, newState, pathify('1', linkId), it =>
      it.toEqual([{ valueCoding: createCoding('uuid', 'foo') }, { valueString: 'hello' }])
    );

    newState = removeOpenChoiceText(newState, pathify('1', linkId), qItem);
    verifyAnswer(linkId, newState, pathify('1', linkId), it => it.toEqual([{ valueCoding: createCoding('uuid', 'foo') }]));
  });

  it('When the user selects an open-choice checkbox, then removes the content of the open-choice checkbox input fields, answer should be undefined', () => {
    const linkId = '1.14';
    const qItem = getQuestionnaireDefinitionItem(linkId, definitionItems);
    if (!qItem) return fail();

    newState = selectChoice(newState, pathify('1', linkId), createCoding('1', 'foo'), qItem, true);
    verifyAnswer(linkId, newState, pathify('1', linkId), it => it.toEqual([{ valueCoding: createCoding('1', 'foo') }]));

    newState = selectChoice(newState, pathify('1', linkId), createCoding('uuid', 'foo'), qItem, true);
    verifyAnswer(linkId, newState, pathify('1', linkId), it =>
      it.toEqual([{ valueCoding: createCoding('1', 'foo') }, { valueCoding: createCoding('uuid', 'foo') }])
    );

    newState = enterOpenChoiceText(newState, pathify('1', linkId), 'hello', qItem);
    verifyAnswer(linkId, newState, pathify('1', linkId), it =>
      it.toEqual([{ valueCoding: createCoding('1', 'foo') }, { valueCoding: createCoding('uuid', 'foo') }, { valueString: 'hello' }])
    );

    newState = unselectChoice(newState, pathify('1', linkId), createCoding('1', 'foo'), qItem);
    verifyAnswer(linkId, newState, pathify('1', linkId), it =>
      it.toEqual([{ valueCoding: createCoding('uuid', 'foo') }, { valueString: 'hello' }])
    );

    newState = removeOpenChoiceText(newState, pathify('1', linkId), qItem);
    verifyAnswer(linkId, newState, pathify('1', linkId), it => it.toEqual([{ valueCoding: createCoding('uuid', 'foo') }]));

    newState = unselectChoice(newState, pathify('1', linkId), createCoding('uuid', 'foo'), qItem);
    verifyAnswer(linkId, newState, pathify('1', linkId), it => it.toBeUndefined());
  });
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function verifyAnswer(
  linkId: string,
  state: Form,
  path: Array<Path>,
  test: (it: Assertion<QuestionnaireResponseItemAnswer[] | undefined | void>) => unknown
) {
  const r = getResponseItem(linkId, state, path);
  if (!r) return fail();
  return test(expect(r.answer));
}

function verifyAttachmentAnswer(
  linkId: string,
  state: Form,
  path: Array<Path>,
  expectedIndex: number,
  expected: Attachment | undefined
): void {
  const r = getResponseItem(linkId, state, path);
  const answer = r?.answer?.[expectedIndex].valueAttachment;
  if (expected) {
    expect((expected as Attachment).url).toBe((answer as Attachment).url);
    expect((expected as Attachment).title).toBe((answer as Attachment).title);
  } else {
    expect(answer).toBeUndefined();
  }
}
