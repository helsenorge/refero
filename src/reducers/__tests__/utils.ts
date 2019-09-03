import reducer, { Form } from '../form';
import { Path, getResponseItems, getQuestionnaireResponseItemWithLinkid } from '../../util/skjemautfyller-core';
import {
  Coding,
  QuestionnaireItem,
  QuestionnaireResponseItem,
  Questionnaire,
  QuestionnaireResponse,
  Quantity,
  Attachment,
  decimal,
  uri,
  code,
} from '../../types/fhir';
import {
  newCodingValue,
  addRepeatItem,
  newStringValue,
  newBooleanValue,
  NewValueAction,
  newIntegerValue,
  newDecimalValue,
  newQuantityValue,
  newDateValue,
  newTimeValue,
  newDateTimeValue,
  newAttachment,
  removeAttachment,
  removeCodingValue,
  newCodingStringValue,
  removeCodingStringValue,
} from '../../actions/newValue';
import { GlobalState } from '..';

export function pathify(...linkIds: string[]): Path[] {
  return linkIds.map(id => <Path>{ linkId: id });
}

export function selectChoice(state: Form, path: Path[], coding: Coding, qItem: QuestionnaireItem, multi: boolean = false): Form {
  let action = newCodingValue(path, coding, qItem, multi);
  return reduce(state, action);
}

export function unselectChoice(state: Form, path: Path[], coding: Coding, qItem: QuestionnaireItem): Form {
  let action = removeCodingValue(path, coding, qItem);
  return reduce(state, action);
}

export function clickRepeat(state: Form, path: Path[], qItem: QuestionnaireItem, qrItems: QuestionnaireResponseItem[] | undefined): Form {
  let action = addRepeatItem(path, qItem, qrItems);
  return reduce(state, action);
}

export function enterText(state: Form, path: Path[], text: string, qItem: QuestionnaireItem | undefined = undefined): Form {
  let action = newStringValue(path, text, qItem);
  return reduce(state, action);
}

export function enterInteger(state: Form, path: Path[], integer: number, qItem: QuestionnaireItem | undefined = undefined): Form {
  let action = newIntegerValue(path, integer, qItem);
  return reduce(state, action);
}

export function enterDecimal(state: Form, path: Path[], decimal: number, qItem: QuestionnaireItem | undefined = undefined): Form {
  let action = newDecimalValue(path, decimal, qItem);
  return reduce(state, action);
}

export function enterQuantity(state: Form, path: Path[], quantity: Quantity, qItem: QuestionnaireItem | undefined = undefined): Form {
  let action = newQuantityValue(path, quantity, qItem);
  return reduce(state, action);
}

export function enterDate(state: Form, path: Path[], date: string, qItem: QuestionnaireItem | undefined = undefined): Form {
  let action = newDateValue(path, date, qItem);
  return reduce(state, action);
}

export function enterTime(state: Form, path: Path[], time: string, qItem: QuestionnaireItem | undefined = undefined): Form {
  let action = newTimeValue(path, time, qItem);
  return reduce(state, action);
}

export function enterDateTime(state: Form, path: Path[], dateTime: string, qItem: QuestionnaireItem | undefined = undefined): Form {
  let action = newDateTimeValue(path, dateTime, qItem);
  return reduce(state, action);
}

export function enterBoolean(state: Form, path: Path[], boolean: boolean, qItem: QuestionnaireItem | undefined = undefined): Form {
  return clickCheckbox(state, path, boolean, qItem);
}

export function clickCheckbox(state: Form, path: Path[], value: boolean, qItem: QuestionnaireItem | undefined = undefined): Form {
  let action = newBooleanValue(path, value, qItem);
  return reduce(state, action);
}

export function uploadAttachment(
  state: Form,
  path: Path[],
  attachment: Attachment,
  qItem: QuestionnaireItem | undefined = undefined,
  multipleAnswers: boolean | undefined = undefined
): Form {
  let action = newAttachment(path, attachment, qItem, multipleAnswers);
  return reduce(state, action);
}

export function deleteAttachment(
  state: Form,
  path: Path[],
  attachment: Attachment,
  qItem: QuestionnaireItem | undefined = undefined
): Form {
  let action = removeAttachment(path, attachment, qItem);
  return reduce(state, action);
}

export function enterOpenChoiceText(
  state: Form,
  path: Path[],
  string: string,
  qItem: QuestionnaireItem | undefined = undefined,
  multipleAnswers: boolean | undefined = undefined
): Form {
  let action = newCodingStringValue(path, string, qItem, multipleAnswers);
  return reduce(state, action);
}

export function removeOpenChoiceText(state: Form, path: Path[], qItem: QuestionnaireItem | undefined = undefined): Form {
  let action = removeCodingStringValue(path, qItem);
  return reduce(state, action);
}

export function createQuantity(
  value: number | undefined = undefined,
  code: string | undefined = undefined,
  system: string | undefined = undefined
): Quantity {
  return {
    value: value as decimal | undefined,
    system: system as uri | undefined,
    code: code as code | undefined,
  } as Quantity;
}

export function createAttachment(url: string, title: string): Attachment {
  return {
    url: url,
    title: title,
  } as Attachment;
}

export function createCoding(code: string, system: string): Coding {
  return <Coding>{ code: code, system: { value: system } };
}

function reduce(state: Form, action: NewValueAction): Form {
  let newState = reducer(state, action);

  if (!newState || !newState.FormData.Content || !newState.FormData.Content.item) {
    throw new Error('no state');
  }

  return newState;
}

export function getResponseItem(linkId: string, state: Form): QuestionnaireResponseItem | undefined {
  let items = getResponseItems(state.FormData);
  if (!items) return;

  for (let item of items) {
    let result = getQuestionnaireResponseItemWithLinkid(linkId, item, true);
    if (result) return result;
  }

  return;
}

export function createGlobalStateWithQuestionnaire(q: Questionnaire, qr: QuestionnaireResponse): GlobalState {
  return {
    skjemautfyller: {
      form: {
        InitialFormData: {
          Content: undefined,
        },
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
