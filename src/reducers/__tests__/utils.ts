import '@/util/__tests__/defineFetch';
import { PayloadAction } from '@reduxjs/toolkit';
import { Coding, QuestionnaireItem, QuestionnaireResponseItem, Questionnaire, QuestionnaireResponse, Quantity, Attachment } from 'fhir/r4';

import { GlobalState } from '..';
import reducer, { Form } from '../form';

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
  NewValuePayload,
  newAttachmentAction,
} from '@/actions/newValue';
import { Path, getResponseItemWithPath } from '@/util/refero-core';



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

export function selectChoice(state: Form, path: Path[], coding: Coding, qItem: QuestionnaireItem, multi: boolean = false): Form {
  const action = newCodingValueAction({ itemPath: path, valueCoding: coding, item: qItem, multipleAnswers: multi });
  return reduce(state, action);
}

export function unselectChoice(state: Form, path: Path[], coding: Coding, qItem: QuestionnaireItem): Form {
  const action = removeCodingValueAction({ itemPath: path, valueCoding: coding, item: qItem });
  return reduce(state, action);
}

export function clickRepeat(state: Form, path: Path[], qItem: QuestionnaireItem, qrItems: QuestionnaireResponseItem[] | undefined): Form {
  const action = addRepeatItemAction({ parentPath: path, item: qItem, responseItems: qrItems });
  return reduce(state, action);
}

export function enterText(state: Form, path: Path[], text: string, qItem: QuestionnaireItem | undefined = undefined): Form {
  const action = newStringValueAction({ itemPath: path, valueString: text, item: qItem });
  return reduce(state, action);
}

export function enterInteger(state: Form, path: Path[], integer: number, qItem: QuestionnaireItem | undefined = undefined): Form {
  const action = newIntegerValueAction({ itemPath: path, valueInteger: integer, item: qItem });
  return reduce(state, action);
}

export function enterDecimal(state: Form, path: Path[], decimal: number, qItem: QuestionnaireItem | undefined = undefined): Form {
  const action = newDecimalValueAction({ itemPath: path, valueDecimal: decimal, item: qItem });
  return reduce(state, action);
}

export function enterQuantity(state: Form, path: Path[], quantity: Quantity, qItem: QuestionnaireItem | undefined = undefined): Form {
  const action = newQuantityValueAction({ itemPath: path, valueQuantity: quantity, item: qItem });
  return reduce(state, action);
}

export function enterDate(state: Form, path: Path[], date: string, qItem: QuestionnaireItem | undefined = undefined): Form {
  const action = newDateValueAction({ itemPath: path, valueDate: date, item: qItem });
  return reduce(state, action);
}

export function enterTime(state: Form, path: Path[], time: string, qItem: QuestionnaireItem | undefined = undefined): Form {
  const action = newTimeValueAction({ itemPath: path, valueTime: time, item: qItem });
  return reduce(state, action);
}

export function enterDateTime(state: Form, path: Path[], dateTime: string, qItem: QuestionnaireItem | undefined = undefined): Form {
  const action = newDateTimeValueAction({ itemPath: path, valueDateTime: dateTime, item: qItem });
  return reduce(state, action);
}

export function enterBoolean(state: Form, path: Path[], boolean: boolean, qItem: QuestionnaireItem | undefined = undefined): Form {
  return clickCheckbox(state, path, boolean, qItem);
}

export function clickCheckbox(state: Form, path: Path[], value: boolean, qItem: QuestionnaireItem | undefined = undefined): Form {
  const action = newBooleanValueAction({ itemPath: path, valueBoolean: value, item: qItem });
  return reduce(state, action);
}

export function uploadAttachment(
  state: Form,
  path: Path[],
  attachment: Attachment,
  qItem: QuestionnaireItem | undefined = undefined,
  multipleAnswers: boolean | undefined = undefined
): Form {
  const action = newAttachmentAction({ itemPath: path, valueAttachment: attachment, item: qItem, multipleAnswers: multipleAnswers });
  return reduce(state, action);
}

export function deleteAttachment(
  state: Form,
  path: Path[],
  attachment: Attachment,
  qItem: QuestionnaireItem | undefined = undefined
): Form {
  const action = removeAttachmentAction({ itemPath: path, valueAttachment: attachment, item: qItem });
  return reduce(state, action);
}

export function enterOpenChoiceText(
  state: Form,
  path: Path[],
  string: string,
  qItem: QuestionnaireItem | undefined = undefined,
  multipleAnswers: boolean | undefined = undefined
): Form {
  const action = newCodingStringValueAction({ itemPath: path, valueString: string, item: qItem, multipleAnswers: multipleAnswers });
  return reduce(state, action);
}

export function removeOpenChoiceText(state: Form, path: Path[], qItem: QuestionnaireItem | undefined = undefined): Form {
  const action = removeCodingStringValueAction({ itemPath: path, item: qItem });
  return reduce(state, action);
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

function reduce(state: Form, action: PayloadAction<NewValuePayload>): Form {
  const newState = reducer(state, action);

  if (!newState || !newState.FormData.Content || !newState.FormData.Content.item) {
    throw new Error('no state');
  }

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
