import { Coding, QuestionnaireItem, Attachment, QuestionnaireResponseItem, Quantity, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { createAction, PayloadAction } from '@reduxjs/toolkit';

import { AppDispatch, GlobalState } from '../reducers';
import { Path } from '../util/refero-core';

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

export const newValue = createAction<NewValuePayload>(NEW_VALUE);

export const newAttachmentAction = createAction<NewAttachmentPayload>(NEW_VALUE);

/*
 * @deprecated this will be removed in a future version, use newAttachmentAction instead
 */
export const newAttachment = (
  itemPath: NewAttachmentPayload['itemPath'],
  value: NewAttachmentPayload['valueAttachment'],
  item: NewAttachmentPayload['item'],
  multipleAnswers?: NewAttachmentPayload['multipleAnswers']
): PayloadAction<NewAttachmentPayload> => newAttachmentAction({ itemPath, valueAttachment: value, item, multipleAnswers });

export function newAttachmentAsync(
  itemPath: Array<Path>,
  value: Attachment,
  item: QuestionnaireItem | undefined,
  multipleAnswers?: boolean
) {
  return async (dispatch: AppDispatch, getState: () => GlobalState): Promise<GlobalState> => {
    dispatch(newAttachmentAction({ itemPath, valueAttachment: value, item, multipleAnswers }));
    return await Promise.resolve(getState());
  };
}
export const removeAttachmentAction = createAction<RemoveAttachmentPayload>(REMOVE_ATTACHMENT_VALUE);

/*
 * @deprecated this will be removed in a future version, use removeAttachmentAction instead
 */
export const removeAttachment = (
  itemPath: RemoveAttachmentPayload['itemPath'],
  value: RemoveAttachmentPayload['valueAttachment'],
  item: RemoveAttachmentPayload['item']
): PayloadAction<RemoveAttachmentPayload> => removeAttachmentAction({ itemPath, valueAttachment: value, item });

export function removeAttachmentAsync(itemPath: Array<Path>, value: Attachment, item?: QuestionnaireItem) {
  return async (dispatch: AppDispatch, getState: () => GlobalState): Promise<GlobalState> => {
    dispatch(removeAttachmentAction({ itemPath, valueAttachment: value, item }));
    return await Promise.resolve(getState());
  };
}
export const newBooleanValueAction = createAction<BooleanItemPayload>(NEW_VALUE);
/*
 * @deprecated this will be removed in a future version, use newBooleanValueAction instead
 */
export const newBooleanValue = (
  itemPath: BooleanItemPayload['itemPath'],
  value: BooleanItemPayload['valueBoolean'],
  item: BooleanItemPayload['item']
): PayloadAction<BooleanItemPayload> => newBooleanValueAction({ itemPath, valueBoolean: value, item });

export function newBooleanValueAsync(itemPath: Array<Path>, value: boolean, item?: QuestionnaireItem) {
  return async (dispatch: AppDispatch, getState: () => GlobalState): Promise<GlobalState> => {
    dispatch(newBooleanValueAction({ itemPath, valueBoolean: value, item }));
    return await Promise.resolve(getState());
  };
}
export const newAnswerValueAction = createAction<AnswerValueItemPayload>(NEW_ANSWER_VALUE);

export const newCodingValueAction = createAction<CodingValueItemPayload>(NEW_VALUE);
/*
 * @deprecated this will be removed in a future version, use newCodingValueAction instead
 */
export const newCodingValue = (
  itemPath: CodingValueItemPayload['itemPath'],
  value: CodingValueItemPayload['valueCoding'],
  item: CodingValueItemPayload['item'],
  multipleAnswers?: CodingValueItemPayload['multipleAnswers']
): PayloadAction<CodingValueItemPayload> => newCodingValueAction({ itemPath, valueCoding: value, item, multipleAnswers });

export function newCodingValueAsync(itemPath: Array<Path>, value: Coding, item?: QuestionnaireItem, multipleAnswers?: boolean) {
  return async (dispatch: AppDispatch, getState: () => GlobalState): Promise<GlobalState> => {
    dispatch(newCodingValueAction({ itemPath, valueCoding: value, item, multipleAnswers }));
    return await Promise.resolve(getState());
  };
}

export const newCodingStringValueAction = createAction<CodingStringPayload>(NEW_CODINGSTRING_VALUE);
/*
 * @deprecated this will be removed in a future version, use newCodingStringValueAction instead
 */
export const newCodingStringValue = (
  itemPath: CodingStringPayload['itemPath'],
  value: CodingStringPayload['valueString'],
  item: CodingStringPayload['item'],
  multipleAnswers?: CodingStringPayload['multipleAnswers']
): PayloadAction<CodingStringPayload> => newCodingStringValueAction({ itemPath, valueString: value, item, multipleAnswers });

export function newCodingStringValueAsync(
  itemPath: Array<Path>,
  value: string,
  item: QuestionnaireItem | undefined,
  multipleAnswers?: boolean
) {
  return async (dispatch: AppDispatch, getState: () => GlobalState): Promise<GlobalState> => {
    dispatch(newCodingStringValueAction({ itemPath, valueString: value, item, multipleAnswers }));
    return await Promise.resolve(getState());
  };
}

export const removeCodingStringValueAction = createAction<RemoveCodingStringPayload>(REMOVE_CODINGSTRING_VALUE);
/*
 * @deprecated this will be removed in a future version, use removeCodingStringValueAction instead
 */
export const removeCodingStringValue = (
  itemPath: RemoveCodingStringPayload['itemPath'],
  item: RemoveCodingStringPayload['item']
): PayloadAction<RemoveCodingStringPayload> => removeCodingStringValueAction({ itemPath, item });

export function removeCodingStringValueAsync(itemPath: Array<Path>, item?: QuestionnaireItem) {
  return async (dispatch: AppDispatch, getState: () => GlobalState): Promise<GlobalState> => {
    dispatch(removeCodingStringValueAction({ itemPath, item }));
    return await Promise.resolve(getState());
  };
}

export const newQuantityValueAction = createAction<QuantityItemPayload>(NEW_VALUE);
/*
 * @deprecated this will be removed in a future version, use newQuantityValueAction instead
 */
export const newQuantityValue = (
  itemPath: QuantityItemPayload['itemPath'],
  value: QuantityItemPayload['valueQuantity'],
  item: QuantityItemPayload['item']
): PayloadAction<QuantityItemPayload> => newQuantityValueAction({ itemPath, valueQuantity: value, item });

export function newQuantityValueAsync(itemPath: Array<Path>, value: Quantity, item?: QuestionnaireItem) {
  return async (dispatch: AppDispatch, getState: () => GlobalState): Promise<GlobalState> => {
    dispatch(newQuantityValueAction({ itemPath, valueQuantity: value, item }));
    return await Promise.resolve(getState());
  };
}

export const removeCodingValueAction = createAction<RemoveCodingValuePayload>(REMOVE_CODING_VALUE);

/*
 * @deprecated this will be removed in a future version, use removeCodingValueAction instead
 */
export const removeCodingValue = (
  itemPath: RemoveCodingValuePayload['itemPath'],
  value: RemoveCodingValuePayload['valueCoding'],
  item: RemoveCodingValuePayload['item']
): PayloadAction<RemoveCodingValuePayload> => removeCodingValueAction({ itemPath, valueCoding: value, item });

export function removeCodingValueAsync(itemPath: Array<Path>, value: Coding, item?: QuestionnaireItem) {
  return async (dispatch: AppDispatch, getState: () => GlobalState): Promise<GlobalState> => {
    dispatch(removeCodingValueAction({ itemPath, valueCoding: value, item }));
    return await Promise.resolve(getState());
  };
}

export const newDecimalValueAction = createAction<DecimalValuePayload>(NEW_VALUE);
/*
 * @deprecated this will be removed in a future version, use newDecimalValueAction instead
 */
export const newDecimalValue = (
  itemPath: DecimalValuePayload['itemPath'],
  value: DecimalValuePayload['valueDecimal'],
  item: DecimalValuePayload['item']
): PayloadAction<DecimalValuePayload> => newDecimalValueAction({ itemPath, valueDecimal: value, item });

export function newDecimalValueAsync(itemPath: Array<Path>, value: number, item?: QuestionnaireItem) {
  return async (dispatch: AppDispatch, getState: () => GlobalState): Promise<GlobalState> => {
    dispatch(newDecimalValueAction({ itemPath, valueDecimal: value, item }));
    return await Promise.resolve(getState());
  };
}

export const newIntegerValueAction = createAction<IntegerItemPayload>(NEW_VALUE);

/*
 * @deprecated this will be removed in a future version, use newIntegerValueAction instead
 */
export const newIntegerValue = (
  itemPath: IntegerItemPayload['itemPath'],
  value: IntegerItemPayload['valueInteger'],
  item: IntegerItemPayload['item']
): PayloadAction<IntegerItemPayload> => newIntegerValueAction({ itemPath, valueInteger: value, item });

export function newIntegerValueAsync(itemPath: Path[], value: number, item?: QuestionnaireItem) {
  return async (dispatch: AppDispatch, getState: () => GlobalState): Promise<GlobalState> => {
    dispatch(newIntegerValueAction({ itemPath, valueInteger: value, item }));
    return await Promise.resolve(getState());
  };
}

export const newStringValueAction = createAction<StringItemPayload>(NEW_VALUE);

/*
 * @deprecated this will be removed in a future version, use newStringValueAction instead
 */
export const newStringValue = (
  itemPath: StringItemPayload['itemPath'],
  value: StringItemPayload['valueString'],
  item: StringItemPayload['item']
): PayloadAction<StringItemPayload> => newStringValueAction({ itemPath, valueString: value, item });

export function newStringValueAsync(itemPath: Array<Path>, value: string, item?: QuestionnaireItem) {
  return async (dispatch: AppDispatch, getState: () => GlobalState): Promise<GlobalState> => {
    dispatch(newStringValueAction({ itemPath, valueString: value, item }));
    return await Promise.resolve(getState());
  };
}

export const newDateValueAction = createAction<DateItemPayload>(NEW_VALUE);
/*
 * @deprecated this will be removed in a future version, use newDateValueAction instead
 */
export const newDateValue = (
  itemPath: DateItemPayload['itemPath'],
  value: DateItemPayload['valueDate'],
  item: DateItemPayload['item']
): PayloadAction<DateItemPayload> => newDateValueAction({ itemPath, valueDate: value, item });

export function newDateValueAsync(itemPath: Array<Path>, value: string, item?: QuestionnaireItem) {
  return async (dispatch: AppDispatch, getState: () => GlobalState): Promise<GlobalState> => {
    dispatch(newDateValueAction({ itemPath, valueDate: value, item }));
    return await Promise.resolve(getState());
  };
}

export const newTimeValueAction = createAction<TimeItemPayload>(NEW_VALUE);
/*
 * @deprecated this will be removed in a future version, use newTimeValueAction instead
 */
export const newTimeValue = (
  itemPath: TimeItemPayload['itemPath'],
  value: TimeItemPayload['valueTime'],
  item: TimeItemPayload['item']
): PayloadAction<TimeItemPayload> => newTimeValueAction({ itemPath, valueTime: value, item });

export function newTimeValueAsync(itemPath: Array<Path>, value: string, item?: QuestionnaireItem) {
  return async (dispatch: AppDispatch, getState: () => GlobalState): Promise<GlobalState> => {
    dispatch(newTimeValueAction({ itemPath, valueTime: value, item }));
    return await Promise.resolve(getState());
  };
}

export const newDateTimeValueAction = createAction<DateTimeItemPayload>(NEW_VALUE);
/*
 * @deprecated this will be removed in a future version, use newDateTimeValueAction instead
 */
export const newDateTimeValue = (
  itemPath: DateTimeItemPayload['itemPath'],
  value: DateTimeItemPayload['valueDateTime'],
  item: DateTimeItemPayload['item']
): PayloadAction<DateTimeItemPayload> => newDateTimeValueAction({ itemPath, valueDateTime: value, item });

export function newDateTimeValueAsync(itemPath: Array<Path>, value: string, item?: QuestionnaireItem) {
  return async (dispatch: AppDispatch, getState: () => GlobalState): Promise<GlobalState> => {
    dispatch(newDateTimeValueAction({ itemPath, valueDateTime: value, item }));
    return await Promise.resolve(getState());
  };
}

export const addRepeatItemAction = createAction<RepeatItemPayload>(ADD_REPEAT_ITEM);

export const addRepeatItemAsync = (parentPath?: Path[], item?: QuestionnaireItem, responseItems?: QuestionnaireResponseItem[]) => {
  return async (dispatch: AppDispatch, getState: () => GlobalState): Promise<GlobalState> => {
    dispatch(addRepeatItemAction({ parentPath, item, responseItems }));
    return await Promise.resolve(getState());
  };
};
/*
 * @deprecated this will be removed in a future version, use addRepeatItemAction instead
 */
export const addRepeatItem = (
  parentPath: RepeatItemPayload['parentPath'],
  item: RepeatItemPayload['item'],
  responseItems: RepeatItemPayload['responseItems']
): PayloadAction<RepeatItemPayload> => addRepeatItemAction({ parentPath, item, responseItems });

export const deleteRepeatItemAction = createAction<DeleteRepeatItemPayload>(DELETE_REPEAT_ITEM);
/*
 * @deprecated this will be removed in a future version, use deleteRepeatItemAction instead
 */
export const deleteRepeatItem = (
  itemPath: DeleteRepeatItemPayload['itemPath'],
  item: DeleteRepeatItemPayload['item']
): PayloadAction<DeleteRepeatItemPayload> => deleteRepeatItemAction({ itemPath, item });

export function deleteRepeatItemAsync(itemPath: Path[], item: QuestionnaireItem) {
  return async (dispatch: AppDispatch, getState: () => GlobalState): Promise<GlobalState> => {
    dispatch(deleteRepeatItemAction({ itemPath, item }));
    return await Promise.resolve(getState());
  };
}
