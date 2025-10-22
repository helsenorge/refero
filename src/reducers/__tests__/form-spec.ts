/* tslint:disable */

import '../../util/__tests__/defineFetch';
import { fail } from 'assert';

import { PayloadAction } from '@reduxjs/toolkit';
import { renderReferoWithStore, screen, userEvent, waitFor } from '@test/test-utils';
import { Questionnaire, QuestionnaireResponseItem } from 'fhir/r4';

import dataModel from './__data__/dummy-data-model';
import { reduce } from './utils';
import {
  newStringValueAction,
  newBooleanValueAction,
  newDecimalValueAction,
  newIntegerValueAction,
  newDateValueAction,
  newDateTimeValueAction,
  newTimeValueAction,
  newCodingValueAction,
  addRepeatItemAction,
  deleteRepeatItemAction,
  NewValuePayload,
  newAttachmentAction,
} from '../../actions/newValue';
import {
  getQuestionnaireDefinitionItem,
  getDefinitionItems,
  getResponseItems,
  getQuestionnaireResponseItemWithLinkid,
  getItemWithIdFromResponseItemArray,
} from '../../util/refero-core';
import { Form } from '../form';

describe('new value action', () => {
  it('should update string value', async () => {
    let action: PayloadAction<NewValuePayload> = newStringValueAction({
      itemPath: [{ linkId: '1' }],
      valueString: 'ny string',
      item: undefined,
    });
    let newState: Form | undefined = await reduce(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    let item = newState.FormData.Content.item[0];
    if (!item || item.answer === undefined || item.answer === null || !item.answer[0]) {
      return fail();
    }
    expect(item.answer[0].valueString).toEqual('ny string');

    action = newStringValueAction({ itemPath: [{ linkId: '1' }], valueString: '', item: undefined });
    newState = await reduce(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    item = newState.FormData.Content.item[0];
    expect(item.answer).toBeUndefined();
  });

  it('should update boolean value', async () => {
    let action: PayloadAction<NewValuePayload> = newBooleanValueAction({
      itemPath: [{ linkId: 'b' }],
      valueBoolean: true,
      item: undefined,
    });
    let newState: Form | undefined = await reduce(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    let item = newState.FormData.Content.item[1];
    if (!item || item.answer === undefined || item.answer === null || !item.answer[0]) {
      return fail();
    }
    expect(item.answer[0].valueBoolean).toEqual(true);

    action = newBooleanValueAction({ itemPath: [{ linkId: 'b' }], valueBoolean: false, item: undefined });
    newState = await reduce(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    item = newState.FormData.Content.item[1];
    if (!item || item.answer === undefined || item.answer === null || !item.answer[0]) {
      return fail();
    }
    expect(item.answer[0].valueBoolean).toEqual(false);
  });

  it('should update decimal value', async () => {
    let action: PayloadAction<NewValuePayload> = newDecimalValueAction({ itemPath: [{ linkId: 'd' }], valueDecimal: 1.5, item: undefined });
    let newState: Form | undefined = await reduce(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    let item = newState.FormData.Content.item[2];
    if (!item || item.answer === undefined || item.answer === null || !item.answer[0]) {
      return fail();
    }
    expect(item.answer[0].valueDecimal).toEqual(1.5);

    action = newDecimalValueAction({ itemPath: [{ linkId: 'd' }], valueDecimal: 2.5, item: undefined });
    newState = await reduce(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    item = newState.FormData.Content.item[2];
    if (!item || item.answer === undefined || item.answer === null || !item.answer[0]) {
      return fail();
    }
    expect(item.answer[0].valueDecimal).toEqual(2.5);
  });

  it('should update integer value', async () => {
    let action: PayloadAction<NewValuePayload> = newIntegerValueAction({ itemPath: [{ linkId: 'i' }], valueInteger: 3, item: undefined });
    let newState: Form | undefined = await reduce(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    let item = newState.FormData.Content.item[3];
    if (!item || item.answer === undefined || item.answer === null || !item.answer[0]) {
      return fail();
    }
    expect(item.answer[0].valueInteger).toEqual(3);

    action = newIntegerValueAction({ itemPath: [{ linkId: 'i' }], valueInteger: 4, item: undefined });
    newState = await reduce(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    item = newState.FormData.Content.item[3];
    if (!item || item.answer === undefined || item.answer === null || !item.answer[0]) {
      return fail();
    }
    expect(item.answer[0].valueInteger).toEqual(4);
  });

  it('should update date value', async () => {
    let action: PayloadAction<NewValuePayload> = newDateValueAction({
      itemPath: [{ linkId: 'date' }],
      valueDate: '2018-05-18T10:28:45Z',
      item: undefined,
    });
    let newState: Form | undefined = await reduce(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    let item = newState.FormData.Content.item[4];
    if (!item || item.answer === undefined || item.answer === null || !item.answer[0]) {
      return fail();
    }
    expect(item.answer[0].valueDate).toEqual('2018-05-18T10:28:45Z');

    action = newDateValueAction({ itemPath: [{ linkId: 'date' }], valueDate: '2017-05-18T10:28:45Z', item: undefined });
    newState = await reduce(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    item = newState.FormData.Content.item[4];
    if (!item || item.answer === undefined || item.answer === null || !item.answer[0]) {
      return fail();
    }
    expect(item.answer[0].valueDate).toEqual('2017-05-18T10:28:45Z');
  });

  it('should update datetime value', async () => {
    const action: PayloadAction<NewValuePayload> = newDateTimeValueAction({
      itemPath: [{ linkId: 'dt' }],
      valueDateTime: '2018-05-11T10:28:45Z',
      item: undefined,
    });
    const newState: Form | undefined = await reduce(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    const item = newState.FormData.Content.item[5];
    if (!item || item.answer === undefined || item.answer === null || !item.answer[0]) {
      return fail();
    }
    expect(item.answer[0].valueDateTime).toEqual('2018-05-11T10:28:45Z');
  });
  it('should update datetime value', async () => {
    let action: PayloadAction<NewValuePayload> = newDateTimeValueAction({
      itemPath: [{ linkId: 'dt' }],
      valueDateTime: '2018-05-11T10:28:45Z',
      item: undefined,
    });
    let newState: Form | undefined = await reduce(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    let item = newState.FormData.Content.item[5];
    if (!item || item.answer === undefined || item.answer === null || !item.answer[0]) {
      return fail();
    }
    expect(item.answer[0].valueDateTime).toEqual('2018-05-11T10:28:45Z');

    action = newDateTimeValueAction({ itemPath: [{ linkId: 'dt' }], valueDateTime: '2017-05-18T10:28:45Z', item: undefined });
    newState = await reduce(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    item = newState.FormData.Content.item[5];
    if (!item || item.answer === undefined || item.answer === null || !item.answer[0]) {
      return fail();
    }
    expect(item.answer[0].valueDateTime).toEqual('2017-05-18T10:28:45Z');
  });

  it('should update time value', async () => {
    let action: PayloadAction<NewValuePayload> = newTimeValueAction({ itemPath: [{ linkId: 't' }], valueTime: '09:00', item: undefined });
    let newState: Form | undefined = await reduce(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    let item = newState.FormData.Content.item[6];
    if (!item || item.answer === undefined || item.answer === null || !item.answer[0]) {
      return fail();
    }
    expect(item.answer[0].valueTime).toEqual('09:00');

    action = newTimeValueAction({ itemPath: [{ linkId: 't' }], valueTime: '17:00', item: undefined });
    newState = await reduce(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    item = newState.FormData.Content.item[6];
    if (!item || item.answer === undefined || item.answer === null || !item.answer[0]) {
      return fail();
    }
    expect(item.answer[0].valueTime).toEqual('17:00');
  });

  it('should update string value', async () => {
    let action: PayloadAction<NewValuePayload> = newStringValueAction({
      itemPath: [{ linkId: 't0' }],
      valueString: 'test',
      item: undefined,
    });
    let newState: Form | undefined = await reduce(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    let item = newState.FormData.Content.item[8];
    if (!item || item.answer === undefined || item.answer === null || !item.answer[0]) {
      return fail();
    }
    expect(item.answer[0].valueString).toEqual('test');

    action = newStringValueAction({ itemPath: [{ linkId: 't0' }], valueString: 'test2', item: undefined });
    newState = await reduce(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item || newState.FormData.Content.item.length === 0) {
      return fail();
    }
    item = newState.FormData.Content.item[8];
    if (!item || item.answer === undefined || item.answer === null || !item.answer[0]) {
      return fail();
    }
    expect(item.answer[0].valueString).toEqual('test2');
  });

  it('should update coding value', async () => {
    let action: PayloadAction<NewValuePayload> = newCodingValueAction({
      itemPath: [{ linkId: 'c' }],
      valueCoding: { code: 'y', display: 'displayy' },
      item: undefined,
    });
    let newState: Form | undefined = await reduce(dataModel.refero.form, action);
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

    action = newCodingValueAction({ itemPath: [{ linkId: 'c' }], valueCoding: { code: 'n', display: 'new display' }, item: undefined });
    newState = await reduce(dataModel.refero.form, action);
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

  it('should update attachment fields', async () => {
    const action: PayloadAction<NewValuePayload> = newAttachmentAction({
      itemPath: [{ linkId: 'attachment' }],
      valueAttachment: { url: 'y', title: 'display', data: '123', contentType: 'image/jpg' },
      item: undefined,
    });
    const newState: Form | undefined = await reduce(dataModel.refero.form, action);
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

  it('should update attachment value', async () => {
    let action: PayloadAction<NewValuePayload> = newAttachmentAction({
      itemPath: [{ linkId: 'attachment' }],
      valueAttachment: { url: 'y', title: 'displayy' },
      item: undefined,
    });
    let newState: Form | undefined = await reduce(dataModel.refero.form, action);
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

    action = newAttachmentAction({
      itemPath: [{ linkId: 'attachment' }],
      valueAttachment: { url: 'n', title: 'new display' },
      item: undefined,
    });
    newState = await reduce(dataModel.refero.form, action);
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

  it('should be able to remove attachment value', async () => {
    let action: PayloadAction<NewValuePayload> = newAttachmentAction({
      itemPath: [{ linkId: 'attachment' }],
      valueAttachment: { url: 'y', title: 'display' },
      item: undefined,
    });
    let newState: Form | undefined = await reduce(dataModel.refero.form, action);
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

    action = newAttachmentAction({ itemPath: [{ linkId: 'attachment' }], valueAttachment: undefined, item: undefined });
    newState = await reduce(dataModel.refero.form, action);
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
  it('should not copy non existing item', async () => {
    const action: PayloadAction<NewValuePayload> = addRepeatItemAction({
      parentPath: [{ linkId: 'foobar' }],
      item: { linkId: 'foobar', type: 'group' },
      responseItems: undefined,
    });
    const newState: Form | undefined = await reduce(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item) {
      return fail();
    }
    expect(newState.FormData.Content.item.length).toEqual(12);
  });

  it('should add group', async () => {
    const action: PayloadAction<NewValuePayload> = addRepeatItemAction({
      parentPath: [],
      item: { linkId: 'addGroupTest1', type: 'group' },
      responseItems: [
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
      ],
    });
    if (!dataModel.refero.form.FormData.Content || !dataModel.refero.form.FormData.Content.item) {
      return fail();
    }
    expect(dataModel.refero.form.FormData.Content.item.length).toEqual(12);
    const newState: Form | undefined = await reduce(dataModel.refero.form, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item) {
      return fail();
    }
    expect(newState.FormData.Content.item.length).toEqual(13);
    expect(dataModel.refero.form.FormData.Content.item.length).toEqual(12);

    const repeatGroupResponseItems = getItemWithIdFromResponseItemArray('addGroupTest1', newState.FormData.Content.item);
    expect(repeatGroupResponseItems).toBeDefined();
    if (repeatGroupResponseItems) {
      expect(repeatGroupResponseItems.length).toEqual(2);
    }

    const addedGroup = newState.FormData.Content.item[10];
    expect(addedGroup).toBeDefined();

    if (!addedGroup || !addedGroup.item) {
      return fail();
    }
    expect(addedGroup.item[0].linkId).toEqual('addGroupTest11');
    const items = addedGroup.item[0].item;
    if (!items) {
      return fail();
    }
    expect(items.length).toEqual(1);
    expect(items[0]).toBeDefined();

    expect(items[0].linkId).toEqual('addGroupTest111');
    // also check answer items are copied but not answer value
    expect(items[0].answer).toBeUndefined();
    expect(addedGroup.item[1].linkId).toEqual('addGroupTest12');
  });
  it('should add nested group', async () => {
    let action: PayloadAction<NewValuePayload> = addRepeatItemAction({
      parentPath: [{ linkId: 'group110' }],
      item: { linkId: 'group110.1', type: 'group' },
      responseItems: [
        {
          linkId: 'group110.1',
          item: [
            {
              linkId: 'group110.11',
            },
          ],
        },
      ],
    });
    if (!dataModel.refero.form.FormData.Content || !dataModel.refero.form.FormData.Content.item) {
      return fail();
    }

    expect(dataModel.refero.form.FormData.Content.item.length).toEqual(12);
    let newState: Form | undefined = await reduce(dataModel.refero.form, action);

    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item) {
      return fail();
    }

    let addedGroup = getQuestionnaireResponseItemWithLinkid('group110.1', newState.FormData.Content.item[11], [
      { linkId: 'group110' },
      { linkId: 'group110.1' },
    ]);
    expect(addedGroup).toBeDefined();

    if (!addedGroup || !addedGroup.item) {
      return fail();
    }
    expect(addedGroup.item.length).toEqual(1);
    expect(addedGroup.item[0].linkId).toEqual('group110.11');

    action = addRepeatItemAction({
      parentPath: [{ linkId: 'group110' }],
      item: { linkId: 'group110.1', type: 'group' },
      responseItems: [
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
      ],
    });
    newState = await reduce(newState, action);
    if (!newState || !newState.FormData.Content || !newState.FormData.Content.item) {
      return fail();
    }
    addedGroup = getQuestionnaireResponseItemWithLinkid('group110.1', newState.FormData.Content.item[11], [
      { linkId: 'group110' },
      { linkId: 'group110.1', index: 1 },
    ]);
    expect(addedGroup).toBeDefined();

    action = deleteRepeatItemAction({
      itemPath: [{ linkId: 'group110' }, { linkId: 'group110.1', index: 1 }],
      item: { linkId: 'group110.1', type: 'group' },
    });

    newState = await reduce(newState, action);

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
  it('should update deactivated and tømme answers', async () => {
    let newState: Form = dataModel.refero.form;
    const { store } = await createWrapper(newState.FormDefinition.Content);

    // slå PÅ b
    await userEvent.click(await screen.findByTestId('item_b-label-boolean'));

    newState = store.getState().refero.form;

    // slå AV b (trigger enableWhen → skal tømme felt som avhenger)
    await userEvent.click(await screen.findByTestId('item_b-label-boolean'));

    await userEvent.click(await screen.findByTestId('item_b-label-boolean'));
    await userEvent.type(await screen.findByTestId('item_d-decimal-label'), '2.5');
    newState = store.getState().refero.form;

    // --- diagnostikk: vis hele toppnivået og spesifikt 'd'/'i'
    const definitionItems = getDefinitionItems(newState.FormDefinition);
    if (!definitionItems || definitionItems.length === 0) return fail();

    const responseItems = getResponseItems(newState.FormData);
    if (!responseItems) return fail();

    // eksisterende søkeloop – med logging per treff
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
    if (!answerItem) return fail('answerItem not found');
    if (!answerItem.answer) return fail('answerItem has no answer array');
    for (let i = 0; responseItems && i < responseItems.length; i++) {
      let responseItem: QuestionnaireResponseItem | undefined = responseItems[i];
      if (responseItem && responseItem.linkId !== 'i') {
        responseItem = getQuestionnaireResponseItemWithLinkid('i', responseItems[i], []);
      }
      if (!responseItem) {
        continue;
      } else {
        answerItem = responseItem;
      }
    }
    const integerAnswer = answerItem.answer;
    const integer = getQuestionnaireDefinitionItem('i', definitionItems);
    if (!integer) return fail();

    expect(integerAnswer).toBeUndefined();
  });
});
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function createWrapper(questionnaire: Questionnaire | undefined | null) {
  return waitFor(async () => await renderReferoWithStore({ questionnaire, props: { authorized: true } }));
}
