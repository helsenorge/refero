import { fail } from 'assert';

import { QuestionnaireItem } from 'fhir/r4';

import { Form } from '../form';
import dataModel from './__data__/enableWhenAndWipingAnswers';
import { getResponseItem, clickCheckbox, enterText, selectChoice, createCoding, pathifyExpand } from './utils';
import { getQuestionnaireDefinitionItem, getDefinitionItems } from '../../util/refero-core';


describe('wipe answers when collapsing enable whens', () => {
  let newState: Form;
  let definitionItems: QuestionnaireItem[];

  beforeEach(() => {
    newState = dataModel.refero.form;
    const dItems = getDefinitionItems(newState.FormDefinition);
    if (!dItems || dItems.length === 0) {
      return fail();
    }
    definitionItems = dItems;
  });

  it('should remove added repeats and clear answers when collapsing toplevel enableWhen', () => {
    let state = fillOutForm(newState, definitionItems);
    if (!state) {
      return fail();
    }

    // unclick first checkbox
    const qItem = getQuestionnaireDefinitionItem('1', definitionItems);
    if (!qItem) return;
    state = clickCheckbox(state, pathifyExpand('1'), false, qItem);

    const i1 = getResponseItem('1', state, pathifyExpand('1'));
    const i11 = getResponseItem('1.1', state, pathifyExpand('1.1'));
    const i111 = getResponseItem('1.1.1', state, pathifyExpand('1.1.1'));
    const i1111 = getResponseItem('1.1.1.1', state, pathifyExpand('1.1.1.1'));
    const i2 = getResponseItem('2', state, pathifyExpand('2'));
    const i21 = getResponseItem('2.1', state, pathifyExpand('2.1'));

    if (!i1 || !i11 || !i111 || !i1111 || !i2 || !i21) return fail();

    expect(i1.answer![0]).toHaveProperty('valueBoolean', false);
    expect(i11.answer![0]).not.toHaveProperty('valueString');
    expect(i111.answer![0]).not.toHaveProperty('valueString');
    expect(i1111.answer).toHaveLength(0);

    expect(i2.answer![0]).toHaveProperty('valueBoolean', true);
    expect(i21.answer![0]).toHaveProperty('valueString', 'unrelated');
  });

  it('should remove added repeats and clear answers when collapsing sublevel enableWhen', () => {
    let state = fillOutForm(newState, definitionItems);
    if (!state) {
      return fail();
    }

    // remove "hello" answer
    const qItem = getQuestionnaireDefinitionItem('1.1', definitionItems);
    if (!qItem) return fail();
    state = enterText(state, pathifyExpand('1.1'), '', qItem);

    const i1 = getResponseItem('1', state, pathifyExpand('1'));
    const i11 = getResponseItem('1.1', state, pathifyExpand('1.1'));
    const i111 = getResponseItem('1.1.1', state, pathifyExpand('1.1.1'));
    const i1111 = getResponseItem('1.1.1.1', state, pathifyExpand('1.1.1.1'));
    const i2 = getResponseItem('2', state, pathifyExpand('2'));
    const i21 = getResponseItem('2.1', state, pathifyExpand('2.1'));

    if (!i1 || !i11 || !i111 || !i1111 || !i2 || !i21) return fail();

    expect(i1.answer![0]).toHaveProperty('valueBoolean', true);
    expect(i11.answer![0]).not.toHaveProperty('valueString');
    expect(i111.answer![0]).not.toHaveProperty('valueString');
    expect(i1111.answer).toHaveLength(0);

    expect(i2.answer![0]).toHaveProperty('valueBoolean', true);
    expect(i21.answer![0]).toHaveProperty('valueString', 'unrelated');
  });
});

function fillOutForm(newState: Form, definitionItems: QuestionnaireItem[]): Form | undefined {
  // check first checkbox
  let qItem = getQuestionnaireDefinitionItem('1', definitionItems);
  if (!qItem) return;
  newState = clickCheckbox(newState, pathifyExpand('1'), true, qItem);

  // enter "hello"
  qItem = getQuestionnaireDefinitionItem('1.1', definitionItems);
  if (!qItem) return;
  newState = enterText(newState, pathifyExpand('1.1'), 'hello', qItem);

  // enter "world"
  qItem = getQuestionnaireDefinitionItem('1.1.1', definitionItems);
  if (!qItem) return;
  newState = enterText(newState, pathifyExpand('1.1.1'), 'world', qItem);

  // select yes
  qItem = getQuestionnaireDefinitionItem('1.1.1.1', definitionItems);
  if (!qItem) return;
  newState = selectChoice(newState, pathifyExpand('1.1.1.1'), createCoding('1', 'urn:oid:2.16.578.1.12.4.1.1101'), qItem, false);

  // check second checkbox
  qItem = getQuestionnaireDefinitionItem('2', definitionItems);
  if (!qItem) return;
  newState = clickCheckbox(newState, pathifyExpand('2'), true, qItem);

  // enter "unrelated"
  qItem = getQuestionnaireDefinitionItem('2.1', definitionItems);
  if (!qItem) return;
  newState = enterText(newState, pathifyExpand('2.1'), 'unrelated', qItem);

  return newState;
}
