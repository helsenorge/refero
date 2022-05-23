/* tslint:disable */
import * as chai from 'chai';

import '../../util/defineFetch';
import reducer, { Form } from '../form';
import { Coding, QuestionnaireResponseItem, Attachment } from '../../types/fhir';
import {
  newStringValue,
  newBooleanValue,
  newDecimalValue,
  newIntegerValue,
  newDateValue,
  newDateTimeValue,
  newTimeValue,
  newCodingValue,
  addRepeatItem,
  newAttachment,
  deleteRepeatItem,
  NewValueAction,
} from '../../actions/newValue';
import {
  getQuestionnaireDefinitionItem,
  getDefinitionItems,
  getResponseItems,
  getQuestionnaireResponseItemWithLinkid,
  getItemWithIdFromResponseItemArray,
} from '../../util/refero-core';
import dataModel from './__data__/dummy-data-model';

const should = chai.should();

describe('new value action', () => {
  it('should update string value', () => {
    let action: NewValueAction = newStringValue([{ linkId: '1' }], 'ny string', undefined);
    let newState: Form | undefined = reducer(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    let item = newState.FormData.Content.item[0];
    if (!item || item.answer === undefined || item.answer === null || !item.answer[0]) {
      return fail();
    }
    expect(item.answer[0].valueString).toEqual('ny string');

    action = newStringValue([{ linkId: '1' }], '', undefined);
    newState = reducer(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    item = newState.FormData.Content.item[0];
    expect(item.answer).toBeUndefined;
  });

  it('should update boolean value', () => {
    let action: NewValueAction = newBooleanValue([{ linkId: 'b' }], true, undefined);
    let newState: Form | undefined = reducer(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    let item = newState.FormData.Content.item[1];
    if (!item || item.answer === undefined || item.answer === null || !item.answer[0]) {
      return fail();
    }
    expect(item.answer[0].valueBoolean).toEqual(true);

    action = newBooleanValue([{ linkId: 'b' }], false, undefined);
    newState = reducer(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    item = newState.FormData.Content.item[1];
    if (!item || item.answer === undefined || item.answer === null || !item.answer[0]) {
      return fail();
    }
    expect(item.answer[0].valueBoolean).toEqual(false);
  });

  it('should update decimal value', () => {
    let action: NewValueAction = newDecimalValue([{ linkId: 'd' }], 1.5, undefined);
    let newState: Form | undefined = reducer(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    let item = newState.FormData.Content.item[2];
    if (!item || item.answer === undefined || item.answer === null || !item.answer[0]) {
      return fail();
    }
    expect(item.answer[0].valueDecimal).toEqual(1.5);

    action = newDecimalValue([{ linkId: 'd' }], 2.5, undefined);
    newState = reducer(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    item = newState.FormData.Content.item[2];
    if (!item || item.answer === undefined || item.answer === null || !item.answer[0]) {
      return fail();
    }
    expect(item.answer[0].valueDecimal).toEqual(2.5);
  });

  it('should update integer value', () => {
    let action: NewValueAction = newIntegerValue([{ linkId: 'i' }], 3, undefined);
    let newState: Form | undefined = reducer(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    let item = newState.FormData.Content.item[3];
    if (!item || item.answer === undefined || item.answer === null || !item.answer[0]) {
      return fail();
    }
    expect(item.answer[0].valueInteger).toEqual(3);

    action = newIntegerValue([{ linkId: 'i' }], 4, undefined);
    newState = reducer(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    item = newState.FormData.Content.item[3];
    if (!item || item.answer === undefined || item.answer === null || !item.answer[0]) {
      return fail();
    }
    expect(item.answer[0].valueInteger).toEqual(4);
  });

  it('should update date value', () => {
    let action: NewValueAction = newDateValue([{ linkId: 'date' }], '2018-05-18T10:28:45Z', undefined);
    let newState: Form | undefined = reducer(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    let item = newState.FormData.Content.item[4];
    if (!item || item.answer === undefined || item.answer === null || !item.answer[0]) {
      return fail();
    }
    expect(item.answer[0].valueDate).toEqual('2018-05-18T10:28:45Z');

    action = newDateValue([{ linkId: 'date' }], '2017-05-18T10:28:45Z', undefined);
    newState = reducer(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    item = newState.FormData.Content.item[4];
    if (!item || item.answer === undefined || item.answer === null || !item.answer[0]) {
      return fail();
    }
    expect(item.answer[0].valueDate).toEqual('2017-05-18T10:28:45Z');
  });

  it('should update datetime value', () => {
    const action: NewValueAction = newDateTimeValue([{ linkId: 'dt' }], '2018-05-11T10:28:45Z', undefined);
    const newState: Form | undefined = reducer(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    const item = newState.FormData.Content.item[5];
    if (!item || item.answer === undefined || item.answer === null || !item.answer[0]) {
      return fail();
    }
    expect(item.answer[0].valueDateTime).toEqual('2018-05-11T10:28:45Z');
  });
  it('should update datetime value', () => {
    let action: NewValueAction = newDateTimeValue([{ linkId: 'dt' }], '2018-05-11T10:28:45Z', undefined);
    let newState: Form | undefined = reducer(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    let item = newState.FormData.Content.item[5];
    if (!item || item.answer === undefined || item.answer === null || !item.answer[0]) {
      return fail();
    }
    expect(item.answer[0].valueDateTime).toEqual('2018-05-11T10:28:45Z');

    action = newDateTimeValue([{ linkId: 'dt' }], '2017-05-18T10:28:45Z', undefined);
    newState = reducer(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    item = newState.FormData.Content.item[5];
    if (!item || item.answer === undefined || item.answer === null || !item.answer[0]) {
      return fail();
    }
    expect(item.answer[0].valueDateTime).toEqual('2017-05-18T10:28:45Z');
  });

  it('should update time value', () => {
    let action: NewValueAction = newTimeValue([{ linkId: 't' }], '09:00', undefined);
    let newState: Form | undefined = reducer(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    let item = newState.FormData.Content.item[6];
    if (!item || item.answer === undefined || item.answer === null || !item.answer[0]) {
      return fail();
    }
    expect(item.answer[0].valueTime).toEqual('09:00');

    action = newTimeValue([{ linkId: 't' }], '17:00', undefined);
    newState = reducer(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    item = newState.FormData.Content.item[6];
    if (!item || item.answer === undefined || item.answer === null || !item.answer[0]) {
      return fail();
    }
    expect(item.answer[0].valueTime).toEqual('17:00');
  });

  it('should update string value', () => {
    let action: NewValueAction = newStringValue([{ linkId: 't0' }], 'test', undefined);
    let newState: Form | undefined = reducer(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    let item = newState.FormData.Content.item[8];
    if (!item || item.answer === undefined || item.answer === null || !item.answer[0]) {
      return fail();
    }
    expect(item.answer[0].valueString).toEqual('test');

    action = newStringValue([{ linkId: 't0' }], 'test2', undefined);
    newState = reducer(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    item = newState.FormData.Content.item[8];
    if (!item || item.answer === undefined || item.answer === null || !item.answer[0]) {
      return fail();
    }
    expect(item.answer[0].valueString).toEqual('test2');
  });

  it('should update coding value', () => {
    let action: NewValueAction = newCodingValue([{ linkId: 'c' }], { code: 'y', display: 'displayy' } as Coding, undefined);
    let newState: Form | undefined = reducer(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    let item = newState.FormData.Content.item[7];
    if (!item || item.answer === undefined || item.answer === null || !item.answer[0]) {
      return fail();
    }
    let answer = item.answer[0];
    if (!answer || !answer.valueCoding) {
      return fail();
    }
    expect(answer.valueCoding.code).toEqual('y');
    expect(answer.valueCoding.display).toEqual('displayy');

    action = newCodingValue([{ linkId: 'c' }], { code: 'n', display: 'new display' } as Coding, undefined);
    newState = reducer(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    item = newState.FormData.Content.item[7];
    if (!item || item.answer === undefined || item.answer === null || !item.answer[0]) {
      return fail();
    }
    answer = item.answer[0];
    if (!answer || !answer.valueCoding) {
      return fail();
    }
    expect(answer.valueCoding.code).toEqual('n');
    expect(answer.valueCoding.display).toEqual('new display');
  });

  it('should update coding value with multiple answers', () => {
    let action: NewValueAction = newCodingValue([{ linkId: 'c' }], { code: 'y', display: 'displayy' } as Coding, undefined, true);
    let newState: Form | undefined = reducer(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    let item = newState.FormData.Content.item[7];
    if (!item || item.answer === undefined || item.answer === null || !item.answer[0]) {
      return fail();
    }
    const answer = item.answer[0];
    if (!answer || !answer.valueCoding) {
      return fail();
    }
    expect(answer.valueCoding.code).toMatchSnapshot();
    expect(answer.valueCoding.display).toMatchSnapshot();

    action = newCodingValue([{ linkId: 'c' }], { code: 'n', display: 'new display' } as Coding, undefined, true);
    newState = reducer(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    item = newState.FormData.Content.item[7];
    if (!item || item.answer === undefined || item.answer === null || !item.answer[0]) {
      return fail();
    }
    expect(item.answer.length).toMatchSnapshot();
    expect(item.answer[0]).toMatchSnapshot();
    expect(item.answer[1]).toMatchSnapshot();
  });
  it('should update attachment fields', () => {
    const action: NewValueAction = newAttachment(
      [{ linkId: 'attachment' }],
      { url: 'y', title: 'display', data: '123', contentType: 'image/jpg' } as Attachment,
      undefined
    );
    const newState: Form | undefined = reducer(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    const item = newState.FormData.Content.item[10];
    if (!item || item.answer === undefined || item.answer === null || !item.answer[0]) {
      return fail();
    }
    const answer = item.answer[0];
    if (!answer || !answer.valueAttachment) {
      return fail();
    }
    expect(answer.valueAttachment.url).toEqual('y');
    expect(answer.valueAttachment.title).toEqual('display');
    expect(answer.valueAttachment.data).toEqual('123');
    expect(answer.valueAttachment.contentType).toEqual('image/jpg');
    expect(answer.valueAttachment.hash).toBeUndefined();
  });

  it('should update attachment value', () => {
    let action: NewValueAction = newAttachment([{ linkId: 'attachment' }], { url: 'y', title: 'displayy' } as Attachment, undefined);
    let newState: Form | undefined = reducer(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    let item = newState.FormData.Content.item[10];
    if (!item || item.answer === undefined || item.answer === null || !item.answer[0]) {
      return fail();
    }
    let answer = item.answer[0];
    if (!answer || !answer.valueAttachment) {
      return fail();
    }
    expect(answer.valueAttachment.url).toEqual('y');
    expect(answer.valueAttachment.title).toEqual('displayy');

    action = newAttachment([{ linkId: 'attachment' }], { url: 'n', title: 'new display' } as Attachment, undefined);
    newState = reducer(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    item = newState.FormData.Content.item[10];
    if (!item || item.answer === undefined || item.answer === null || !item.answer[0]) {
      return fail();
    }
    answer = item.answer[0];
    if (!answer || !answer.valueAttachment) {
      return fail();
    }
    expect(answer.valueAttachment.url).toEqual('n');
    expect(answer.valueAttachment.title).toEqual('new display');
  });

  it('should be able to remove attachment value', () => {
    let action: NewValueAction = newAttachment([{ linkId: 'attachment' }], { url: 'y', title: 'display' } as Attachment, undefined);
    let newState: Form | undefined = reducer(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    let item = newState.FormData.Content.item[10];
    if (!item || item.answer === undefined || item.answer === null || !item.answer[0]) {
      return fail();
    }
    const answer = item.answer[0];
    if (!answer || !answer.valueAttachment) {
      return fail();
    }
    expect(answer.valueAttachment.url).toEqual('y');
    expect(answer.valueAttachment.title).toEqual('display');

    action = newAttachment([{ linkId: 'attachment' }], {} as Attachment, undefined);
    newState = reducer(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    item = newState.FormData.Content.item[10];

    if (!item) {
      return fail();
    }
    expect(item.answer).toBeUndefined();
  });
});

describe('new value action', () => {
  it('should not copy non existing item', () => {
    const action: NewValueAction = addRepeatItem([{ linkId: 'foobar' }], { linkId: 'foobar', type: 'group' }, undefined);
    const newState: Form | undefined = reducer(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item) {
      return fail();
    }
    expect(newState.FormData.Content.item.length).toEqual(12);
  });

  it('should add group', () => {
    const action: NewValueAction = addRepeatItem([], { linkId: 'addGroupTest1', type: 'group' }, [
      {
        linkId: 'addGroupTest1',
        item: [
          {
            linkId: 'addGroupTest11',
            item: [
              {
                linkId: 'addGroupTest111',
                answer: [{ valueString: 'testSvar' }],
              },
            ],
          } as QuestionnaireResponseItem,
          {
            linkId: 'addGroupTest12',
          },
        ],
      },
    ]);
    if (!dataModel.refero.form.FormData.Content || !dataModel.refero.form.FormData.Content.item) {
      return fail();
    }
    expect(dataModel.refero.form.FormData.Content.item.length).toEqual(12);
    const newState: Form | undefined = reducer(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item) {
      return fail();
    }
    expect(newState.FormData.Content.item.length).toEqual(13);
    expect(dataModel.refero.form.FormData.Content.item.length).toEqual(12);

    const repeatGroupResponseItems = getItemWithIdFromResponseItemArray('addGroupTest1', newState.FormData.Content.item);
    should.exist(repeatGroupResponseItems);
    if (repeatGroupResponseItems) {
      expect(repeatGroupResponseItems.length).toEqual(2);
    }

    const addedGroup = newState.FormData.Content.item[10];
    should.exist(addedGroup);

    if (!addedGroup || !addedGroup.item) {
      return fail();
    }
    expect(addedGroup.item[0].linkId).toEqual('addGroupTest11');
    const items = addedGroup.item[0].item;
    if (!items) {
      return fail();
    }
    expect(items.length).toEqual(1);
    should.exist(items[0]);

    expect(items[0].linkId).toEqual('addGroupTest111');
    // also check answer items are copied but not answer value
    expect(items[0].answer).toBeUndefined;
    expect(addedGroup.item[1].linkId).toEqual('addGroupTest12');
  });

  it('should add nested group', () => {
    let action: NewValueAction = addRepeatItem([{ linkId: 'group110' }], { linkId: 'group110.1', type: 'group' }, [
      {
        linkId: 'group110.1',
        item: [
          {
            linkId: 'group110.11',
          },
        ],
      },
    ]);
    if (!dataModel.refero.form.FormData.Content || !dataModel.refero.form.FormData.Content.item) {
      return fail();
    }

    expect(dataModel.refero.form.FormData.Content.item.length).toEqual(12);
    let newState: Form | undefined = reducer(dataModel.refero.form, action);

    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item) {
      return fail();
    }

    let addedGroup = getQuestionnaireResponseItemWithLinkid('group110.1', newState.FormData.Content.item[11], [
      { linkId: 'group110' },
      { linkId: 'group110.1' },
    ]);
    should.exist(addedGroup);

    if (!addedGroup || !addedGroup.item) {
      return fail();
    }
    expect(addedGroup.item.length).toEqual(1);
    expect(addedGroup.item[0].linkId).toEqual('group110.11');

    action = addRepeatItem([{ linkId: 'group110' }], { linkId: 'group110.1', type: 'group' }, [
      {
        linkId: 'group110.1',
        item: [
          {
            linkId: 'group110.11',
          },
        ],
      },
      {
        linkId: 'group110.1',
        item: [
          {
            linkId: 'group110.11',
          },
        ],
      },
    ]);
    newState = reducer(newState, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item) {
      return fail();
    }
    addedGroup = getQuestionnaireResponseItemWithLinkid('group110.1', newState.FormData.Content.item[11], [
      { linkId: 'group110' },
      { linkId: 'group110.1', index: 1 },
    ]);
    should.exist(addedGroup);

    action = deleteRepeatItem([{ linkId: 'group110' }, { linkId: 'group110.1', index: 1 }], { linkId: 'group110.1', type: 'group' });

    newState = reducer(newState, action);

    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item) {
      return fail();
    }

    const deletedGroup = getQuestionnaireResponseItemWithLinkid('group110.1', newState.FormData.Content.item[11], [
      { linkId: 'group110' },
      { linkId: 'group110.1', index: 2 },
    ]);
    expect(deletedGroup).toEqual(undefined);

    const groupMovedForward = getQuestionnaireResponseItemWithLinkid('group110.1', newState.FormData.Content.item[11], [
      { linkId: 'group110' },
      { linkId: 'group110.1', index: 1 },
    ]);

    if (!groupMovedForward || !groupMovedForward.item) {
      return fail();
    }
    expect(groupMovedForward.item[0].linkId).toEqual('group110.11');
  });
});

describe('update enable when action', () => {
  it('should update deactivated and tømme answers', () => {
    let action: NewValueAction = newBooleanValue([{ linkId: 'b' }], true, {
      linkId: 'b',
      type: 'boolean',
    });
    let newState: Form | undefined = reducer(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }

    action = newBooleanValue([{ linkId: 'b' }], false, {
      linkId: 'b',
      type: 'boolean',
    });
    newState = reducer(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    const definitionItems = getDefinitionItems(newState.FormDefinition);
    if (!definitionItems || definitionItems.length === 0) {
      return fail();
    }
    const responseItems = getResponseItems(newState.FormData);

    let answerItem: QuestionnaireResponseItem | undefined;
    for (let i = 0; responseItems && i < responseItems.length; i++) {
      let responseItem: QuestionnaireResponseItem | undefined = responseItems[i];
      if (responseItem && responseItem.linkId !== 'd') {
        responseItem = getQuestionnaireResponseItemWithLinkid('d', responseItems[i], []);
      }
      if (!responseItem) {
        continue;
      } else {
        answerItem = responseItem;
      }
    }
    if (!answerItem || !answerItem.answer) {
      return fail();
    }
    const integerAnswer = answerItem.answer;
    const integer = getQuestionnaireDefinitionItem('i', definitionItems);
    if (!integer) {
      return fail();
    }
    expect(integerAnswer).toHaveLength(0);
  });
});
