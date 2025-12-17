import '@/util/__tests__/defineFetch';
import type { Form } from '../form';
import type { Action } from '@reduxjs/toolkit';
import type {
  Coding,
  QuestionnaireItem,
  QuestionnaireResponseItem,
  Questionnaire,
  QuestionnaireResponse,
  Quantity,
  Attachment,
} from 'fhir/r4';

import { store as reduxStore, type GlobalState } from '..';

import {
  newCodingValueAction,
  addRepeatItemAction,
  newStringValueAction,
  newBooleanValueAction,
  newIntegerValueAction,
  newDecimalValueAction,
  newQuantityValueAction,
  newDateValueAction,
  newTimeValueAction,
  newDateTimeValueAction,
  removeAttachmentAction,
  removeCodingValueAction,
  newCodingStringValueAction,
  removeCodingStringValueAction,
  newAttachmentAction,
} from '@/actions/newValue';
import { type Path, getResponseItemWithPath } from '@/util/refero-core';

export function pathify(...linkIds: string[]): Path[] {
  return linkIds.map(id => ({ linkId: id.split('^')[0], ...(id.includes('^') && { index: Number(id.split('^')[1]) }) }));
}

export function pathifyExpand(linkId: string): Path[] {
  const paths = [];
  const currentPath = [];
  const parts = linkId.split('.');
  for (const part of parts) {
    currentPath.push(part);
    paths.push({ linkId: currentPath.join('.'), index: 0 });
  }
  return paths;
}

export async function selectChoice(
  state: Form,
  path: Path[],
  coding: Coding,
  qItem: QuestionnaireItem,
  multi: boolean = false
): Promise<Form> {
  const action = newCodingValueAction({ itemPath: path, valueCoding: coding, item: qItem, multipleAnswers: multi });
  return await reduce(state, action);
}

export async function unselectChoice(state: Form, path: Path[], coding: Coding, qItem: QuestionnaireItem): Promise<Form> {
  const action = removeCodingValueAction({ itemPath: path, valueCoding: coding, item: qItem });
  return await reduce(state, action);
}

export async function clickRepeat(
  state: Form,
  path: Path[],
  qItem: QuestionnaireItem,
  qrItems: QuestionnaireResponseItem[] | undefined
): Promise<Form> {
  const action = addRepeatItemAction({ parentPath: path, item: qItem, responseItems: qrItems });
  return await reduce(state, action);
}

export async function enterText(state: Form, path: Path[], text: string, qItem: QuestionnaireItem | undefined = undefined): Promise<Form> {
  const action = newStringValueAction({ itemPath: path, valueString: text, item: qItem });
  return await reduce(state, action);
}

export async function enterInteger(
  state: Form,
  path: Path[],
  integer: number,
  qItem: QuestionnaireItem | undefined = undefined
): Promise<Form> {
  const action = newIntegerValueAction({ itemPath: path, valueInteger: integer, item: qItem });
  return await reduce(state, action);
}

export async function enterDecimal(
  state: Form,
  path: Path[],
  decimal: number,
  qItem: QuestionnaireItem | undefined = undefined
): Promise<Form> {
  const action = newDecimalValueAction({ itemPath: path, valueDecimal: decimal, item: qItem });
  return await reduce(state, action);
}

export async function enterQuantity(
  state: Form,
  path: Path[],
  quantity: Quantity,
  qItem: QuestionnaireItem | undefined = undefined
): Promise<Form> {
  const action = newQuantityValueAction({ itemPath: path, valueQuantity: quantity, item: qItem });
  return await reduce(state, action);
}

export async function enterDate(state: Form, path: Path[], date: string, qItem: QuestionnaireItem | undefined = undefined): Promise<Form> {
  const action = newDateValueAction({ itemPath: path, valueDate: date, item: qItem });
  return await reduce(state, action);
}

export async function enterTime(state: Form, path: Path[], time: string, qItem: QuestionnaireItem | undefined = undefined): Promise<Form> {
  const action = newTimeValueAction({ itemPath: path, valueTime: time, item: qItem });
  return await reduce(state, action);
}

export async function enterDateTime(
  state: Form,
  path: Path[],
  dateTime: string,
  qItem: QuestionnaireItem | undefined = undefined
): Promise<Form> {
  const action = newDateTimeValueAction({ itemPath: path, valueDateTime: dateTime, item: qItem });
  return await reduce(state, action);
}

export async function enterBoolean(
  state: Form,
  path: Path[],
  boolean: boolean,
  qItem: QuestionnaireItem | undefined = undefined
): Promise<Form> {
  return await clickCheckbox(state, path, boolean, qItem);
}

export async function clickCheckbox(
  state: Form,
  path: Path[],
  value: boolean,
  qItem: QuestionnaireItem | undefined = undefined
): Promise<Form> {
  const action = newBooleanValueAction({ itemPath: path, valueBoolean: value, item: qItem });
  return await reduce(state, action);
}

export async function uploadAttachment(
  state: Form,
  path: Path[],
  attachment: Attachment,
  qItem: QuestionnaireItem | undefined = undefined,
  multipleAnswers: boolean | undefined = undefined
): Promise<Form> {
  const action = newAttachmentAction({ itemPath: path, valueAttachment: attachment, item: qItem, multipleAnswers: multipleAnswers });
  return await reduce(state, action);
}

export async function deleteAttachment(
  state: Form,
  path: Path[],
  attachment: Attachment,
  qItem: QuestionnaireItem | undefined = undefined
): Promise<Form> {
  const action = removeAttachmentAction({ itemPath: path, valueAttachment: attachment, item: qItem });
  return await reduce(state, action);
}

export async function enterOpenChoiceText(
  state: Form,
  path: Path[],
  string: string,
  qItem: QuestionnaireItem | undefined = undefined,
  multipleAnswers: boolean | undefined = undefined
): Promise<Form> {
  const action = newCodingStringValueAction({ itemPath: path, valueString: string, item: qItem, multipleAnswers: multipleAnswers });
  return await reduce(state, action);
}
export async function removeOpenChoiceText(state: Form, path: Path[], qItem: QuestionnaireItem | undefined = undefined): Promise<Form> {
  const action = removeCodingStringValueAction({ itemPath: path, item: qItem });
  return await reduce(state, action);
}

export function createQuantity(
  value: number | undefined = undefined,
  code: string | undefined = undefined,
  system: string | undefined = undefined
): Quantity {
  return {
    value: value,
    system: system,
    code: code,
  } as Quantity;
}

export function createAttachment(url: string, title: string): Attachment {
  return {
    url: url,
    title: title,
  } as Attachment;
}

export function createCoding(code: string, system: string): Coding {
  return { code: code, system: system } as Coding;
}
const FLUSH_LIMIT = 10;

async function flushAllTimersAndMicrotasks(): Promise<void> {
  // kjør inntil ingen timere/microtasks gjenstår, med en øvre grense så vi ikke spinner uendelig
  for (let i = 0; i < FLUSH_LIMIT; i++) {
    const pending = vi.getTimerCount();
    if (pending === 0) break;
    // Debounce er 120ms – flytt tiden forbi terskelen
    await vi.advanceTimersByTimeAsync(200);
    // la event loop ta unna evt. microtasks (Promises)
    await Promise.resolve();
  }
}
export async function reduce(state: Form, action: Action): Promise<Form> {
  // Viktig: aktiver fake timers FØR store init, så middleware/lyttere bruker samme klokke
  vi.useFakeTimers();

  const store = reduxStore(state);

  // snapshot før dispatch (nyttig ved feiling)

  store.dispatch(action);

  // Flush debounce + evt. påfølgende runder
  await flushAllTimersAndMicrotasks();
  const newState = store.getState().refero.form;
  if (!newState?.FormData?.Content?.item) {
    throw new Error('no state');
  }

  // ekstra flush i tilfelle dispatch i effect trigget ny debounce
  await flushAllTimersAndMicrotasks();

  // (valgfritt) rydd opp hvis du vil
  // vi.useRealTimers();

  return newState;
}

export function getResponseItem(linkId: string, state: Form, path: Path[]): QuestionnaireResponseItem | undefined {
  const condition = linkId === path[path.length - 1].linkId;
  if (condition) return getResponseItemWithPath(path, state.FormData);
}

export function createGlobalStateWithQuestionnaire(q: Questionnaire, qr: QuestionnaireResponse): GlobalState {
  return {
    refero: {
      form: {
        Language: 'no',
        FormDefinition: {
          Content: q,
        },
        FormData: {
          Content: qr,
        },
      },
    },
  };
}
