import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { Path } from '../util/skjemautfyller-core';
import { Coding, QuestionnaireItem, Attachment, QuestionnaireResponseItem, Quantity } from '../types/fhir';
import { GlobalState } from '../reducers';

export type NEW_VALUE = 'skjemautfyller/NEW_VALUE';
export const NEW_VALUE: NEW_VALUE = 'skjemautfyller/NEW_VALUE';
export type NEW_CODINGSTRING_VALUE = 'skjemautfyller/NEW_CODINGSTRING_VALUE';
export const NEW_CODINGSTRING_VALUE: NEW_CODINGSTRING_VALUE = 'skjemautfyller/NEW_CODINGSTRING_VALUE';
export type REMOVE_CODINGSTRING_VALUE = 'skjemautfyller/REMOVE_CODINGSTRING_VALUE';
export const REMOVE_CODINGSTRING_VALUE: REMOVE_CODINGSTRING_VALUE = 'skjemautfyller/REMOVE_CODINGSTRING_VALUE';
export const REMOVE_CODING_VALUE = 'skjemautfyller/REMOVE_CODING_VALUE';
export type ADD_REPEAT_ITEM = 'skjemautfyller/ADD_REPEAT_ITEM';
export const ADD_REPEAT_ITEM: ADD_REPEAT_ITEM = 'skjemautfyller/ADD_REPEAT_ITEM';
export type DELETE_REPEAT_ITEM = 'skjemautfyller/DELETE_REPEAT_ITEM';
export const DELETE_REPEAT_ITEM: DELETE_REPEAT_ITEM = 'skjemautfyller/DELETE_REPEAT_ITEM';
export const PROCESS_SKJEMA = 'skjemautfyller/PROCESS_SKJEMA';
export type REMOVE_ATTACHMENT_VALUE = 'skjemautfyller/REMOVE_ATTACHMENT_VALUE';
export const REMOVE_ATTACHMENT_VALUE: REMOVE_ATTACHMENT_VALUE = 'skjemautfyller/REMOVE_ATTACHMENT_VALUE';

export interface NewValueAction extends Action {
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
  item?: QuestionnaireItem | undefined;
  responseItems?: Array<QuestionnaireResponseItem> | undefined;
  multipleAnswers?: boolean;
}

export function newAttachment(
  itemPath: Array<Path>,
  value: Attachment,
  item: QuestionnaireItem | undefined,
  multipleAnswers?: boolean
): NewValueAction {
  return {
    type: NEW_VALUE,
    itemPath,
    valueAttachment: value,
    item: item,
    multipleAnswers,
  };
}

export function newAttachmentAsync(
  itemPath: Array<Path>,
  value: Attachment,
  item: QuestionnaireItem | undefined,
  multipleAnswers?: boolean
) {
  return async (dispatch: ThunkDispatch<GlobalState, void, NewValueAction>, getState: () => GlobalState) => {
    dispatch(newAttachment(itemPath, value, item, multipleAnswers));
    return await Promise.resolve(getState());
  };
}

export function removeAttachment(itemPath: Array<Path>, value: Attachment, item: QuestionnaireItem | undefined) {
  return {
    type: REMOVE_ATTACHMENT_VALUE,
    itemPath,
    valueAttachment: value,
    item: item,
  };
}

export function removeAttachmentAsync(itemPath: Array<Path>, value: Attachment, item: QuestionnaireItem | undefined) {
  return async (dispatch: ThunkDispatch<GlobalState, void, NewValueAction>, getState: () => GlobalState) => {
    dispatch(removeAttachment(itemPath, value, item));
    return await Promise.resolve(getState());
  };
}

export function newBooleanValue(itemPath: Array<Path>, value: boolean, item: QuestionnaireItem | undefined): NewValueAction {
  return {
    type: NEW_VALUE,
    itemPath,
    valueBoolean: value,
    item: item,
  };
}

export function newBooleanValueAsync(itemPath: Array<Path>, value: boolean, item: QuestionnaireItem | undefined) {
  return async (dispatch: ThunkDispatch<GlobalState, void, NewValueAction>, getState: () => GlobalState) => {
    dispatch(newBooleanValue(itemPath, value, item));
    return await Promise.resolve(getState());
  };
}

export function newCodingValue(itemPath: Array<Path>, value: Coding, item: QuestionnaireItem | undefined, multipleAnswers?: boolean) {
  return {
    type: NEW_VALUE,
    itemPath,
    valueCoding: value,
    item: item,
    multipleAnswers,
  };
}

export function newCodingValueAsync(itemPath: Array<Path>, value: Coding, item: QuestionnaireItem | undefined, multipleAnswers?: boolean) {
  return async (dispatch: ThunkDispatch<GlobalState, void, NewValueAction>, getState: () => GlobalState) => {
    dispatch(newCodingValue(itemPath, value, item, multipleAnswers));
    return await Promise.resolve(getState());
  };
}

export function newCodingStringValue(
  itemPath: Array<Path>,
  value: string,
  item: QuestionnaireItem | undefined,
  multipleAnswers?: boolean
): NewValueAction {
  return {
    type: NEW_CODINGSTRING_VALUE,
    itemPath,
    valueString: value,
    item: item,
    multipleAnswers,
  };
}

export function newCodingStringValueAsync(
  itemPath: Array<Path>,
  value: string,
  item: QuestionnaireItem | undefined,
  multipleAnswers?: boolean
) {
  return async (dispatch: ThunkDispatch<GlobalState, void, NewValueAction>, getState: () => GlobalState) => {
    dispatch(newCodingStringValue(itemPath, value, item, multipleAnswers));
    return await Promise.resolve(getState());
  };
}

export function removeCodingStringValue(itemPath: Array<Path>, item: QuestionnaireItem | undefined): NewValueAction {
  return {
    type: REMOVE_CODINGSTRING_VALUE,
    itemPath,
    item: item,
  };
}

export function removeCodingStringValueAsync(itemPath: Array<Path>, item: QuestionnaireItem | undefined) {
  return async (dispatch: ThunkDispatch<GlobalState, void, NewValueAction>, getState: () => GlobalState) => {
    dispatch(removeCodingStringValue(itemPath, item));
    return await Promise.resolve(getState());
  };
}

export function newQuantityValue(itemPath: Array<Path>, value: Quantity, item: QuestionnaireItem | undefined): NewValueAction {
  return {
    type: NEW_VALUE,
    itemPath,
    valueQuantity: value,
    item: item,
  };
}

export function newQuantityValueAsync(itemPath: Array<Path>, value: Quantity, item: QuestionnaireItem | undefined) {
  return async (dispatch: ThunkDispatch<GlobalState, void, NewValueAction>, getState: () => GlobalState) => {
    dispatch(newQuantityValue(itemPath, value, item));
    return await Promise.resolve(getState());
  };
}

export function removeCodingValue(itemPath: Array<Path>, value: Coding, item: QuestionnaireItem | undefined): NewValueAction {
  return {
    type: REMOVE_CODING_VALUE,
    itemPath,
    valueCoding: value,
    item: item,
  };
}

export function removeCodingValueAsync(itemPath: Array<Path>, value: Coding, item: QuestionnaireItem | undefined) {
  return async (dispatch: ThunkDispatch<GlobalState, void, NewValueAction>, getState: () => GlobalState) => {
    dispatch(removeCodingValue(itemPath, value, item));
    return await Promise.resolve(getState());
  };
}

export function newDecimalValue(itemPath: Array<Path>, value: number, item: QuestionnaireItem | undefined): NewValueAction {
  return {
    type: NEW_VALUE,
    itemPath,
    valueDecimal: value,
    item: item,
  };
}

export function newDecimalValueAsync(itemPath: Array<Path>, value: number, item: QuestionnaireItem | undefined) {
  return async (dispatch: ThunkDispatch<GlobalState, void, NewValueAction>, getState: () => GlobalState) => {
    dispatch(newDecimalValue(itemPath, value, item));
    return await Promise.resolve(getState());
  };
}

export function newIntegerValue(itemPath: Array<Path>, value: number, item: QuestionnaireItem | undefined): NewValueAction {
  return {
    type: NEW_VALUE,
    itemPath,
    valueInteger: value,
    item: item,
  };
}

export function newIntegerValueAsync(itemPath: Array<Path>, value: number, item: QuestionnaireItem | undefined) {
  return async (dispatch: ThunkDispatch<GlobalState, void, NewValueAction>, getState: () => GlobalState) => {
    dispatch(newIntegerValue(itemPath, value, item));
    return await Promise.resolve(getState());
  };
}

export function newStringValue(itemPath: Array<Path>, value: string, item: QuestionnaireItem | undefined): NewValueAction {
  return {
    type: NEW_VALUE,
    itemPath,
    valueString: value,
    item: item,
  };
}

export function newStringValueAsync(itemPath: Array<Path>, value: string, item: QuestionnaireItem | undefined) {
  return async (dispatch: ThunkDispatch<GlobalState, void, NewValueAction>, getState: () => GlobalState) => {
    dispatch(newStringValue(itemPath, value, item));
    return await Promise.resolve(getState());
  };
}

export function newDateValue(itemPath: Array<Path>, value: string, item: QuestionnaireItem | undefined): NewValueAction {
  return {
    type: NEW_VALUE,
    itemPath,
    valueDate: value,
    item: item,
  };
}

export function newDateValueAsync(itemPath: Array<Path>, value: string, item: QuestionnaireItem | undefined) {
  return async (dispatch: ThunkDispatch<GlobalState, void, NewValueAction>, getState: () => GlobalState) => {
    dispatch(newDateValue(itemPath, value, item));
    return await Promise.resolve(getState());
  };
}

export function newTimeValue(itemPath: Array<Path>, value: string, item: QuestionnaireItem | undefined): NewValueAction {
  return {
    type: NEW_VALUE,
    itemPath,
    valueTime: value,
    item: item,
  };
}

export function newTimeValueAsync(itemPath: Array<Path>, value: string, item: QuestionnaireItem | undefined) {
  return async (dispatch: ThunkDispatch<GlobalState, void, NewValueAction>, getState: () => GlobalState) => {
    dispatch(newTimeValue(itemPath, value, item));
    return await Promise.resolve(getState());
  };
}

export function newDateTimeValue(itemPath: Array<Path>, value: string, item: QuestionnaireItem | undefined): NewValueAction {
  return {
    type: NEW_VALUE,
    itemPath,
    valueDateTime: value,
    item: item,
  };
}

export function newDateTimeValueAsync(itemPath: Array<Path>, value: string, item: QuestionnaireItem | undefined) {
  return async (dispatch: ThunkDispatch<GlobalState, void, NewValueAction>, getState: () => GlobalState) => {
    dispatch(newDateTimeValue(itemPath, value, item));
    return await Promise.resolve(getState());
  };
}

export function addRepeatItem(
  parentPath: Array<Path> | undefined,
  item: QuestionnaireItem,
  responseItems: Array<QuestionnaireResponseItem> | undefined
): NewValueAction {
  return {
    type: ADD_REPEAT_ITEM,
    parentPath,
    item,
    responseItems,
  };
}

export function deleteRepeatItem(itemPath: Array<Path>, item: QuestionnaireItem): NewValueAction {
  return {
    type: DELETE_REPEAT_ITEM,
    itemPath,
    item,
  };
}

export function deleteRepeatItemAsync(itemPath: Array<Path>, item: QuestionnaireItem) {
  return async (dispatch: ThunkDispatch<GlobalState, void, NewValueAction>, getState: () => GlobalState) => {
    dispatch(deleteRepeatItem(itemPath, item));
    return await Promise.resolve(getState());
  };
}
