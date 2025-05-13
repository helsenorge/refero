import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Coding, QuestionnaireItem, Attachment, QuestionnaireResponseItem, Quantity, QuestionnaireResponseItemAnswer } from 'fhir/r4';

import { AppDispatch, GlobalState } from '../reducers';
import { runCalculatorsAction } from './thunks';
import { Path } from '../util/refero-core';

//#region Action Types & Payloads
export type NEW_VALUE = 'refero/NEW_VALUE';
export const NEW_VALUE: NEW_VALUE = 'refero/NEW_VALUE';
export type NEW_CODINGSTRING_VALUE = 'refero/NEW_CODINGSTRING_VALUE';
export const NEW_CODINGSTRING_VALUE: NEW_CODINGSTRING_VALUE = 'refero/NEW_CODINGSTRING_VALUE';
export type REMOVE_CODINGSTRING_VALUE = 'refero/REMOVE_CODINGSTRING_VALUE';
export const REMOVE_CODINGSTRING_VALUE: REMOVE_CODINGSTRING_VALUE = 'refero/REMOVE_CODINGSTRING_VALUE';
export const REMOVE_CODING_VALUE = 'refero/REMOVE_CODING_VALUE';
export type NEW_ANSWER_VALUE = 'refero/NEW_ANSWER_VALUE';
export const NEW_ANSWER_VALUE: NEW_ANSWER_VALUE = 'refero/NEW_ANSWER_VALUE';
export type ADD_REPEAT_ITEM = 'refero/ADD_REPEAT_ITEM';
export const ADD_REPEAT_ITEM: ADD_REPEAT_ITEM = 'refero/ADD_REPEAT_ITEM';
export type DELETE_REPEAT_ITEM = 'refero/DELETE_REPEAT_ITEM';
export const DELETE_REPEAT_ITEM: DELETE_REPEAT_ITEM = 'refero/DELETE_REPEAT_ITEM';
export type REMOVE_ATTACHMENT_VALUE = 'refero/REMOVE_ATTACHMENT_VALUE';
export const REMOVE_ATTACHMENT_VALUE: REMOVE_ATTACHMENT_VALUE = 'refero/REMOVE_ATTACHMENT_VALUE';

export type NewValuePayload = {
  itemPath?: Array<Path>;
  parentPath?: Array<Path>;
  valueBoolean?: boolean;
  valueAttachment?: Attachment;
  valueString?: string;
  valueDecimal?: number;
  valueInteger?: number;
  valueDate?: string;
  valueDateTime?: string;
  valueTime?: string;
  valueCoding?: Coding;
  valueQuantity?: Quantity;
  item?: QuestionnaireItem;
  responseItems?: Array<QuestionnaireResponseItem>;
  multipleAnswers?: boolean;
  newAnswer?: QuestionnaireResponseItemAnswer[];
};

export type RemoveAttachmentPayload = Pick<NewValuePayload, 'itemPath' | 'valueAttachment' | 'item'>;
export type NewAttachmentPayload = Pick<NewValuePayload, 'itemPath' | 'valueAttachment' | 'item' | 'multipleAnswers'>;
export type CodingStringPayload = Pick<NewValuePayload, 'itemPath' | 'valueString' | 'item' | 'multipleAnswers'>;
export type RemoveCodingStringPayload = Pick<NewValuePayload, 'itemPath' | 'item'>;
export type RepeatItemPayload = Pick<NewValuePayload, 'parentPath' | 'responseItems' | 'item'>;
export type RemoveCodingValuePayload = Pick<NewValuePayload, 'itemPath' | 'valueCoding' | 'item'>;
export type BooleanItemPayload = Pick<NewValuePayload, 'itemPath' | 'item' | 'valueBoolean'>;
export type QuantityItemPayload = Pick<NewValuePayload, 'itemPath' | 'item' | 'valueQuantity'>;
export type DecimalValuePayload = Pick<NewValuePayload, 'itemPath' | 'valueDecimal' | 'item'>;
export type CodingValueItemPayload = Pick<NewValuePayload, 'itemPath' | 'valueCoding' | 'item' | 'multipleAnswers'>;
export type IntegerItemPayload = Pick<NewValuePayload, 'itemPath' | 'item' | 'valueInteger'>;
export type StringItemPayload = Pick<NewValuePayload, 'itemPath' | 'valueString' | 'item'>;
export type DateItemPayload = Pick<NewValuePayload, 'itemPath' | 'valueDate' | 'item'>;
export type TimeItemPayload = Pick<NewValuePayload, 'itemPath' | 'valueTime' | 'item'>;
export type DateTimeItemPayload = Pick<NewValuePayload, 'itemPath' | 'valueDateTime' | 'item'>;
export type DeleteRepeatItemPayload = Pick<NewValuePayload, 'itemPath' | 'item'>;
export type AnswerValueItemPayload = Pick<NewValuePayload, 'itemPath' | 'item' | 'newAnswer'>;
//#endregion

//#region Synchronous Action Creators
export const newValue = createAction<NewValuePayload>(NEW_VALUE);
export const newAttachmentAction = createAction<NewAttachmentPayload>(NEW_VALUE);
export const removeAttachmentAction = createAction<RemoveAttachmentPayload>(REMOVE_ATTACHMENT_VALUE);
export const newBooleanValueAction = createAction<BooleanItemPayload>(NEW_VALUE);
export const newAnswerValueAction = createAction<AnswerValueItemPayload>(NEW_ANSWER_VALUE);
export const newCodingValueAction = createAction<CodingValueItemPayload>(NEW_VALUE);
export const newCodingStringValueAction = createAction<CodingStringPayload>(NEW_CODINGSTRING_VALUE);
export const removeCodingStringValueAction = createAction<RemoveCodingStringPayload>(REMOVE_CODINGSTRING_VALUE);
export const newQuantityValueAction = createAction<QuantityItemPayload>(NEW_VALUE);
export const newDecimalValueAction = createAction<DecimalValuePayload>(NEW_VALUE);
export const removeCodingValueAction = createAction<RemoveCodingValuePayload>(REMOVE_CODING_VALUE);
export const newIntegerValueAction = createAction<IntegerItemPayload>(NEW_VALUE);
export const newStringValueAction = createAction<StringItemPayload>(NEW_VALUE);
export const newDateValueAction = createAction<DateItemPayload>(NEW_VALUE);
export const newTimeValueAction = createAction<TimeItemPayload>(NEW_VALUE);
export const newDateTimeValueAction = createAction<DateTimeItemPayload>(NEW_VALUE);
export const addRepeatItemAction = createAction<RepeatItemPayload>(ADD_REPEAT_ITEM);
export const deleteRepeatItemAction = createAction<DeleteRepeatItemPayload>(DELETE_REPEAT_ITEM);
//#endregion

//#region Async Thunks

export const newValueAsync = createAsyncThunk<GlobalState, NewValuePayload, { state: GlobalState; dispatch: AppDispatch }>(
  'refero/newValueAsync',
  async (payload, { dispatch, getState }) => {
    dispatch(newValue(payload));
    await dispatch(runCalculatorsAction());
    return getState();
  }
);

export const newAttachmentAsync = createAsyncThunk<GlobalState, NewAttachmentPayload, { state: GlobalState; dispatch: AppDispatch }>(
  'refero/newAttachmentAsync',
  async (payload, { dispatch, getState }) => {
    dispatch(newAttachmentAction(payload));
    await dispatch(runCalculatorsAction());
    return getState();
  }
);

export const removeAttachmentAsync = createAsyncThunk<GlobalState, RemoveAttachmentPayload, { state: GlobalState; dispatch: AppDispatch }>(
  'refero/removeAttachmentAsync',
  async (payload, { dispatch, getState }) => {
    dispatch(removeAttachmentAction(payload));
    await dispatch(runCalculatorsAction());
    return getState();
  }
);

export const newBooleanValueAsync = createAsyncThunk<GlobalState, BooleanItemPayload, { state: GlobalState; dispatch: AppDispatch }>(
  'refero/newBooleanValueAsync',
  async (payload, { dispatch, getState }) => {
    dispatch(newBooleanValueAction(payload));
    await dispatch(runCalculatorsAction());
    return getState();
  }
);

export const newCodingValueAsync = createAsyncThunk<GlobalState, CodingValueItemPayload, { state: GlobalState; dispatch: AppDispatch }>(
  'refero/newCodingValueAsync',
  async (payload, { dispatch, getState }) => {
    dispatch(newCodingValueAction(payload));
    await dispatch(runCalculatorsAction());
    return getState();
  }
);

export const newCodingStringValueAsync = createAsyncThunk<GlobalState, CodingStringPayload, { state: GlobalState; dispatch: AppDispatch }>(
  'refero/newCodingStringValueAsync',
  async (payload, { dispatch, getState }) => {
    dispatch(newCodingStringValueAction(payload));
    await dispatch(runCalculatorsAction());
    return getState();
  }
);

export const removeCodingStringValueAsync = createAsyncThunk<
  GlobalState,
  RemoveCodingStringPayload,
  { state: GlobalState; dispatch: AppDispatch }
>('refero/removeCodingStringValueAsync', async (payload, { dispatch, getState }) => {
  dispatch(removeCodingStringValueAction(payload));
  await dispatch(runCalculatorsAction());
  return getState();
});

export const newQuantityValueAsync = createAsyncThunk<GlobalState, QuantityItemPayload, { state: GlobalState; dispatch: AppDispatch }>(
  'refero/newQuantityValueAsync',
  async (payload, { dispatch, getState }) => {
    dispatch(newQuantityValueAction(payload));
    await dispatch(runCalculatorsAction());
    return getState();
  }
);

export const removeCodingValueAsync = createAsyncThunk<
  GlobalState,
  RemoveCodingValuePayload,
  { state: GlobalState; dispatch: AppDispatch }
>('refero/removeCodingValueAsync', async (payload, { dispatch, getState }) => {
  dispatch(removeCodingValueAction(payload));
  await dispatch(runCalculatorsAction());
  return getState();
});

export const newDecimalValueAsync = createAsyncThunk<GlobalState, DecimalValuePayload, { state: GlobalState; dispatch: AppDispatch }>(
  'refero/newDecimalValueAsync',
  async (payload, { dispatch, getState }) => {
    dispatch(newDecimalValueAction(payload));
    await dispatch(runCalculatorsAction());
    return getState();
  }
);

export const newIntegerValueAsync = createAsyncThunk<GlobalState, IntegerItemPayload, { state: GlobalState; dispatch: AppDispatch }>(
  'refero/newIntegerValueAsync',
  async (payload, { dispatch, getState }) => {
    dispatch(newIntegerValueAction(payload));
    await dispatch(runCalculatorsAction());
    return getState();
  }
);

export const newStringValueAsync = createAsyncThunk<GlobalState, StringItemPayload, { state: GlobalState; dispatch: AppDispatch }>(
  'refero/newStringValueAsync',
  async (payload, { dispatch, getState }) => {
    dispatch(newStringValueAction(payload));
    await dispatch(runCalculatorsAction());
    return getState();
  }
);

export const newDateValueAsync = createAsyncThunk<GlobalState, DateItemPayload, { state: GlobalState; dispatch: AppDispatch }>(
  'refero/newDateValueAsync',
  async (payload, { dispatch, getState }) => {
    dispatch(newDateValueAction(payload));
    await dispatch(runCalculatorsAction());
    return getState();
  }
);

export const newTimeValueAsync = createAsyncThunk<GlobalState, TimeItemPayload, { state: GlobalState; dispatch: AppDispatch }>(
  'refero/newTimeValueAsync',
  async (payload, { dispatch, getState }) => {
    dispatch(newTimeValueAction(payload));
    await dispatch(runCalculatorsAction());
    return getState();
  }
);

export const newDateTimeValueAsync = createAsyncThunk<GlobalState, DateTimeItemPayload, { state: GlobalState; dispatch: AppDispatch }>(
  'refero/newDateTimeValueAsync',
  async (payload, { dispatch, getState }) => {
    dispatch(newDateTimeValueAction(payload));
    await dispatch(runCalculatorsAction());
    return getState();
  }
);

export const addRepeatItemAsync = createAsyncThunk<GlobalState, RepeatItemPayload, { state: GlobalState; dispatch: AppDispatch }>(
  'refero/addRepeatItemAsync',
  async (payload, { dispatch, getState }) => {
    dispatch(addRepeatItemAction(payload));
    await dispatch(runCalculatorsAction());
    return getState();
  }
);

export const deleteRepeatItemAsync = createAsyncThunk<GlobalState, DeleteRepeatItemPayload, { state: GlobalState; dispatch: AppDispatch }>(
  'refero/deleteRepeatItemAsync',
  async (payload, { dispatch, getState }) => {
    dispatch(deleteRepeatItemAction(payload));
    await dispatch(runCalculatorsAction());
    return getState();
  }
);
//#endregion
