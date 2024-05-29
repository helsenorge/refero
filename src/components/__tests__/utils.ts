import { Coding, Extension, QuestionnaireItem } from 'fhir/r4';
import ExtensionConstants from '../../constants/extensions';
import { queryHelpers, userEvent, screen, fireEvent, findByLabelText } from './test-utils/test-utils';

export function inputAnswer(linkId: string, answer: number | string, element: HTMLElement) {
  const input = findItem(linkId, element);
  userEvent.type(input, answer.toString());
  userEvent.tab();
}

export function inputTextAnswer(linkId: string, answer: string, element: HTMLElement) {
  const textarea = findItem(linkId, element);
  userEvent.type(textarea, answer);
  userEvent.tab();
}
export function selectBoolean(linkId: string, element: HTMLElement) {
  const item = findItem(linkId, element);
  fireEvent.change(item, { target: { checked: true } });
  // userEvent.selectOptions(item, 'true');
}

export function selectRadioButtonOption(linkId: string, index: number, element: HTMLElement) {
  const id = `${linkId}-hn-${index}`;
  const item = findItem(id, element);
  userEvent.click(item);
}

export async function changeCheckBoxOption(label: string, element: HTMLElement) {
  userEvent.click(await findByLabelText(element, label));
}

export function findItem(linkId: string, element: HTMLElement) {
  const id = `item_${linkId}`;
  return findItemById(id, element);
}
export function findItemById(id: string, element: HTMLElement) {
  const el = element.querySelector(`#${id}`);
  if (!el) {
    throw queryHelpers.getElementError(`Found no elements with the [id="${id}"]`, element);
  }
  return el;
}
export function queryItemById(id: string, element: HTMLElement) {
  const el = element.querySelectorAll(`#${id}`);
  if (!el) {
    throw queryHelpers.getElementError(`Found no elements with the [id="${id}"]`, element);
  }
  return el;
}

export async function findItemByDispayValue(value: string) {
  const el = await screen.findByDisplayValue(value);
  if (!el) {
    throw queryHelpers.getElementError(`Found no elements with the [id="${value}"]`, el);
  }
  return el;
}

function createItemControlCoding(code: string): Coding {
  return {
    code: code,
    system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control',
  };
}

export function createIDataReceiverExpressionExtension(value: string): Extension {
  return {
    url: ExtensionConstants.Copy_EXPRESSION,
    valueString: value,
  };
}
export function createItemControlExtension(code: string): Extension {
  return {
    url: ExtensionConstants.ITEMCONTROL_URL,
    valueCodeableConcept: {
      coding: [createItemControlCoding(code)],
    },
  };
}
export function findQuestionnaireItem(linkId: string, items?: QuestionnaireItem[]): QuestionnaireItem | undefined {
  if (items === undefined) return;
  for (let item of items) {
    if (item.linkId === linkId) return item;

    const found = findQuestionnaireItem(linkId, item.item);
    if (found !== undefined) return found;
  }
  return undefined;
}
