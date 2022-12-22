import { act } from 'react-dom/test-utils';
import { ReactWrapper } from 'enzyme';
import { QuestionnaireItem, Extension, Coding } from '../../types/fhir';
import ExtensionConstants from '../../constants/extensions';

export async function inputAnswer(linkId: string, answer: number | string, wrapper: ReactWrapper<{}, {}>) {
  const id = 'item_' + linkId;
  const input = wrapper.find('input[id="' + id + '"]');
  await act(async () => {
    input.simulate('change', { target: { value: answer } });
  });

  await new Promise(r => {
    setTimeout(r);
  });
  wrapper.update();

  await act(async () => {
    input.simulate('blur');
  });
  await new Promise(r => {
    setTimeout(r);
  });
  wrapper.update();
}

export async function inputTextAnswer(linkId: string, answer: string, wrapper: ReactWrapper<{}, {}>) {
  const textarea = wrapper.find('textarea#item_' + linkId);
  await act(async () => {
    textarea.simulate('change', { target: { value: answer } });
  });

  await new Promise(r => {
    setTimeout(r);
  });
  wrapper.update();

  await act(async () => {
    textarea.simulate('blur');
  });

  await new Promise(r => {
    setTimeout(r);
  });
  wrapper.update();
}

export async function selectRadioButtonOption(linkId: string, index: number, wrapper: ReactWrapper<{}, {}>) {
  await act(async () => {
    const id = 'item_' + linkId + '-hn-' + index;
    const input = wrapper.find('input[id="' + id + '"]');
    input.simulate('click');
  });

  await new Promise(r => {
    setTimeout(r);
  });
  wrapper.update();
}

export async function selectCheckBoxOption(linkId: string, index: string, wrapper: ReactWrapper<{}, {}>) {
  await changeCheckBoxOption(linkId, index, true, wrapper);
}

export async function unSelectCheckBoxOption(linkId: string, index: string, wrapper: ReactWrapper<{}, {}>) {
  await changeCheckBoxOption(linkId, index, false, wrapper);
}

export async function changeCheckBoxOption(linkId: string, index: string, on: boolean, wrapper: ReactWrapper<{}, {}>) {
  await act(async () => {
    const id = 'item_' + linkId + '-' + index;
    const input = wrapper.find('input[id="' + id + '"]');
    input.simulate('change', { target: { checked: on } });
  });

  await new Promise(r => {
    setTimeout(r);
  });
  wrapper.update();
}

export function findItem(linkId: string, wrapper: ReactWrapper<{}, {}>) {
  const id = 'item_' + linkId;
  const expr = 'input[id="' + id + '"]';
  const input = wrapper.find(expr);
  return input.at(0);
}

export function findQuestionnaireItem(linkId: string, items: QuestionnaireItem[] | undefined): QuestionnaireItem | undefined {
  if (items === undefined) return;
  for (let item of items) {
    if (item.linkId === linkId) return item;

    const found = findQuestionnaireItem(linkId, item.item);
    if (found !== undefined) return found;
  }
}

export function submit(name: string, wrapper: ReactWrapper<{}, {}>) {
  let submit = wrapper.findWhere(it => it.text() === name).find('button');
  submit.simulate('click');
  wrapper.update();
}

export function createItemControlExtension(code: string): Extension {
  return {
    url: ExtensionConstants.ITEMCONTROL_URL,
    valueCodeableConcept: {
      coding: [createItemControlCoding(code)],
    },
  } as Extension;
}

function createItemControlCoding(code: string): Coding {
  return {
    code: code,
    system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control',
  } as Coding;
}

export function createIDataReceiverExpressionExtension(value: string): Extension {
  return {
    url: ExtensionConstants.Copy_EXPRESSION,
    valueString: value,
  } as Extension;
}
