import { Coding, QuestionnaireItem, Attachment, QuestionnaireResponseItem, Quantity } from 'fhir/r4';
import { ThunkDispatch, createAction } from '@reduxjs/toolkit';

import { AppDispatch, GlobalState } from '../reducers';
import { Path } from '../util/refero-core';

export type NEW_VALUE = 'refero/NEW_VALUE';
export const NEW_VALUE: NEW_VALUE = 'refero/NEW_VALUE';
export type NEW_CODINGSTRING_VALUE = 'refero/NEW_CODINGSTRING_VALUE';
export const NEW_CODINGSTRING_VALUE: NEW_CODINGSTRING_VALUE = 'refero/NEW_CODINGSTRING_VALUE';
export type REMOVE_CODINGSTRING_VALUE = 'refero/REMOVE_CODINGSTRING_VALUE';
export const REMOVE_CODINGSTRING_VALUE: REMOVE_CODINGSTRING_VALUE = 'refero/REMOVE_CODINGSTRING_VALUE';
export const REMOVE_CODING_VALUE = 'refero/REMOVE_CODING_VALUE';
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
export const newValue = createAction<NewValuePayload>(NEW_VALUE);

// export function newAttachment(
//   itemPath: Array<Path>,
//   value: Attachment,
//   item: QuestionnaireItem | undefined,
//   multipleAnswers?: boolean
// ): NewValueAction {
//   return {
//     type: NEW_VALUE,
//     itemPath,
//     valueAttachment: value,
//     item: item,
//     multipleAnswers,
//   };
// }
export const newAttachment = createAction<NewAttachmentPayload>(NEW_VALUE);

export function newAttachmentAsync(
  itemPath: Array<Path>,
  value: Attachment,
  item: QuestionnaireItem | undefined,
  multipleAnswers?: boolean
) {
  return async (dispatch: AppDispatch, getState: () => GlobalState): Promise<GlobalState> => {
    dispatch(newAttachment({ itemPath, valueAttachment: value, item, multipleAnswers }));
    return await Promise.resolve(getState());
  };
}
export const removeAttachment = createAction<RemoveAttachmentPayload>(REMOVE_ATTACHMENT_VALUE);
// export function removeAttachment2(itemPath: Array<Path>, value: Attachment, item: QuestionnaireItem | undefined): NewValueAction {
//   return {
//     type: REMOVE_ATTACHMENT_VALUE,
//     itemPath,
//     valueAttachment: value,
//     item: item,
//   };
// }

export function removeAttachmentAsync(itemPath: Array<Path>, value: Attachment, item?: QuestionnaireItem) {
  return async (dispatch: AppDispatch, getState: () => GlobalState): Promise<GlobalState> => {
    dispatch(removeAttachment({ itemPath, valueAttachment: value, item }));
    return await Promise.resolve(getState());
  };
}
export const newBooleanValue = createAction<BooleanItemPayload>(NEW_VALUE);

// export function newBooleanValue2(itemPath: Array<Path>, value: boolean, item: QuestionnaireItem | undefined): NewValueAction {
//   return {
//     type: NEW_VALUE,
//     itemPath,
//     valueBoolean: value,
//     item,
//   };
// }

export function newBooleanValueAsync(itemPath: Array<Path>, value: boolean, item?: QuestionnaireItem) {
  return async (dispatch: AppDispatch, getState: () => GlobalState): Promise<GlobalState> => {
    dispatch(newBooleanValue({ itemPath, valueBoolean: value, item }));
    return await Promise.resolve(getState());
  };
}
export const newCodingValue = createAction<CodingValueItemPayload>(NEW_VALUE);
// export function newCodingValue2(
//   itemPath: Array<Path>,
//   value: Coding,
//   item: QuestionnaireItem | undefined,
//   multipleAnswers?: boolean
// ): NewValueAction {
//   return {
//     type: NEW_VALUE,
//     itemPath,
//     valueCoding: value,
//     item: item,
//     multipleAnswers,
//   };
// }

export function newCodingValueAsync(itemPath: Array<Path>, value: Coding, item?: QuestionnaireItem, multipleAnswers?: boolean) {
  return async (dispatch: AppDispatch, getState: () => GlobalState): Promise<GlobalState> => {
    dispatch(newCodingValue({ itemPath, valueCoding: value, item, multipleAnswers }));
    return await Promise.resolve(getState());
  };
}

export const newCodingStringValue = createAction<CodingStringPayload>(NEW_CODINGSTRING_VALUE);
// export function newCodingStringValue2(
//   itemPath: Array<Path>,
//   value: string,
//   item: QuestionnaireItem | undefined,
//   multipleAnswers?: boolean
// ): NewValueAction {
//   return {
//     type: NEW_CODINGSTRING_VALUE,
//     itemPath,
//     valueString: value,
//     item: item,
//     multipleAnswers,
//   };
// }

export function newCodingStringValueAsync(
  itemPath: Array<Path>,
  value: string,
  item: QuestionnaireItem | undefined,
  multipleAnswers?: boolean
) {
  return async (dispatch: AppDispatch, getState: () => GlobalState): Promise<GlobalState> => {
    dispatch(newCodingStringValue({ itemPath, valueString: value, item, multipleAnswers }));
    return await Promise.resolve(getState());
  };
}

export const removeCodingStringValue = createAction<RemoveCodingStringPayload>(REMOVE_CODINGSTRING_VALUE);
// export function removeCodingStringValue2(itemPath: Array<Path>, item?: QuestionnaireItem): NewValueAction {
//   return {
//     type: REMOVE_CODINGSTRING_VALUE,
//     itemPath,
//     item: item,
//   };
// }

export function removeCodingStringValueAsync(itemPath: Array<Path>, item?: QuestionnaireItem) {
  return async (dispatch: AppDispatch, getState: () => GlobalState): Promise<GlobalState> => {
    dispatch(removeCodingStringValue({ itemPath, item }));
    return await Promise.resolve(getState());
  };
}

// export function newQuantityValue2(itemPath: Array<Path>, value: Quantity, item?: QuestionnaireItem): NewValueAction {
//   return {
//     type: NEW_VALUE,
//     itemPath,
//     valueQuantity: value,
//     item,
//   };
// }
export const newQuantityValue = createAction<QuantityItemPayload>(NEW_VALUE);

export function newQuantityValueAsync(itemPath: Array<Path>, value: Quantity, item?: QuestionnaireItem) {
  return async (dispatch: AppDispatch, getState: () => GlobalState): Promise<GlobalState> => {
    dispatch(newQuantityValue({ itemPath, valueQuantity: value, item }));
    return await Promise.resolve(getState());
  };
}

export const removeCodingValue = createAction<RemoveCodingValuePayload>(REMOVE_CODING_VALUE);
// export function removeCodingValue2(itemPath: Array<Path>, value: Coding, item?: QuestionnaireItem): NewValueAction {
//   return {
//     type: REMOVE_CODING_VALUE,
//     itemPath,
//     valueCoding: value,
//     item: item,
//   };
// }

export function removeCodingValueAsync(itemPath: Array<Path>, value: Coding, item?: QuestionnaireItem) {
  return async (dispatch: AppDispatch, getState: () => GlobalState): Promise<GlobalState> => {
    dispatch(removeCodingValue({ itemPath, valueCoding: value, item }));
    return await Promise.resolve(getState());
  };
}
export const newDecimalValue = createAction<DecimalValuePayload>(NEW_VALUE);
export function newDecimalValueAsync(itemPath: Array<Path>, value: number, item?: QuestionnaireItem) {
  return async (dispatch: AppDispatch, getState: () => GlobalState): Promise<GlobalState> => {
    dispatch(newDecimalValue({ itemPath, valueDecimal: value, item }));
    return await Promise.resolve(getState());
  };
}
// export function newDecimalValue2(itemPath: Array<Path>, value?: number, item?: QuestionnaireItem): NewValueAction {
//   return {
//     type: NEW_VALUE,
//     itemPath,
//     valueDecimal: value,
//     item: item,
//   };
// }

export const newIntegerValue = createAction<IntegerItemPayload>(NEW_VALUE);
// export function newIntegerValue2(itemPath: Array<Path>, value?: number, item?: QuestionnaireItem): NewValueAction {
//   return {
//     type: NEW_VALUE,
//     itemPath,
//     valueInteger: value,
//     item,
//   };
// }

export function newIntegerValueAsync(itemPath: Path[], value: number, item?: QuestionnaireItem) {
  return async (dispatch: AppDispatch, getState: () => GlobalState): Promise<GlobalState> => {
    dispatch(newIntegerValue({ itemPath, valueInteger: value, item }));
    return await Promise.resolve(getState());
  };
}

export const newStringValue = createAction<StringItemPayload>(NEW_VALUE);

export function newStringValueAsync(itemPath: Array<Path>, value: string, item?: QuestionnaireItem) {
  return async (dispatch: AppDispatch, getState: () => GlobalState): Promise<GlobalState> => {
    dispatch(newStringValue({ itemPath, valueString: value, item }));
    return await Promise.resolve(getState());
  };
}
// export function newStringValue2(itemPath: Array<Path>, value: string, item?: QuestionnaireItem): NewValueAction {
//   return {
//     type: NEW_VALUE,
//     itemPath,
//     valueString: value,
//     item: item,
//   };
// }

export const newDateValue = createAction<DateItemPayload>(NEW_VALUE);
// export function newDateValue2(itemPath: Array<Path>, value: string, item?: QuestionnaireItem): NewValueAction {
//   return {
//     type: NEW_VALUE,
//     itemPath,
//     valueDate: value,
//     item: item,
//   };
// }

export function newDateValueAsync(itemPath: Array<Path>, value: string, item?: QuestionnaireItem) {
  return async (dispatch: AppDispatch, getState: () => GlobalState): Promise<GlobalState> => {
    dispatch(newDateValue({ itemPath, valueDate: value, item }));
    return await Promise.resolve(getState());
  };
}

export const newTimeValue = createAction<TimeItemPayload>(NEW_VALUE);
// export function newTimeValue2(itemPath: Array<Path>, value: string, item: QuestionnaireItem | undefined): NewValueAction {
//   return {
//     type: NEW_VALUE,
//     itemPath,
//     valueTime: value,
//     item: item,
//   };
// }
export function newTimeValueAsync(itemPath: Array<Path>, value: string, item?: QuestionnaireItem) {
  return async (dispatch: AppDispatch, getState: () => GlobalState): Promise<GlobalState> => {
    dispatch(newTimeValue({ itemPath, valueTime: value, item }));
    return await Promise.resolve(getState());
  };
}

export const newDateTimeValue = createAction<DateTimeItemPayload>(NEW_VALUE);
// export function newDateTimeValue(itemPath: Array<Path>, value: string, item: QuestionnaireItem | undefined): NewValueAction {
//   return {
//     type: NEW_VALUE,
//     itemPath,
//     valueDateTime: value,
//     item: item,
//   };
// }

export function newDateTimeValueAsync(itemPath: Array<Path>, value: string, item?: QuestionnaireItem) {
  return async (dispatch: AppDispatch, getState: () => GlobalState): Promise<GlobalState> => {
    dispatch(newDateTimeValue({ itemPath, valueDateTime: value, item }));
    return await Promise.resolve(getState());
  };
}
export const addRepeatItem = createAction<RepeatItemPayload>(ADD_REPEAT_ITEM);
// export function addRepeatItem(
//   parentPath: Array<Path> | undefined,
//   item: QuestionnaireItem,
//   responseItems: Array<QuestionnaireResponseItem> | undefined
// ): NewValueAction {
//   return {
//     type: ADD_REPEAT_ITEM,
//     parentPath,
//     item,
//     responseItems,
//   };
// }

export const deleteRepeatItem = createAction<DeleteRepeatItemPayload>(DELETE_REPEAT_ITEM);
// export function deleteRepeatItem(itemPath: Array<Path>, item: QuestionnaireItem): NewValueAction {
//   return {
//     type: DELETE_REPEAT_ITEM,
//     itemPath,
//     item,
//   };
// }

export function deleteRepeatItemAsync(itemPath: Path[], item: QuestionnaireItem) {
  return async (dispatch: AppDispatch, getState: () => GlobalState): Promise<GlobalState> => {
    dispatch(deleteRepeatItem({ itemPath, item }));
    return await Promise.resolve(getState());
  };
}
