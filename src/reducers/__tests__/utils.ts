import reducer, { Form } from '../form';
import { Path, getResponseItems, getQuestionnaireResponseItemWithLinkid } from '../../util/skjemautfyller-core';
import { Coding, QuestionnaireItem, QuestionnaireResponseItem } from '../../types/fhir';
import { newCodingValue, addRepeatItem, newStringValue, newBooleanValue, NewValueAction } from '../../actions/newValue';

export function pathify(...linkIds: string[]): Path[] {
  return linkIds.map(id => <Path>{ linkId: id });
}

export function selectChoice(state: Form, path: Path[], coding: Coding, qItem: QuestionnaireItem, multi: boolean = false): Form {
  let action = newCodingValue(path, coding, qItem, multi);
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

export function clickCheckbox(state: Form, path: Path[], value: boolean, qItem: QuestionnaireItem | undefined = undefined): Form {
  let action = newBooleanValue(path, value, qItem);
  return reduce(state, action);
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
