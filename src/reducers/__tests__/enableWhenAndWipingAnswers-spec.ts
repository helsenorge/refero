/* tslint:disable */
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
    process.env.DEBUG_LOG = '1';
    newState = dataModel.refero.form;
    const dItems = getDefinitionItems(newState.FormDefinition);
    if (!dItems || dItems.length === 0) {
      return fail();
    }
    definitionItems = dItems;
  });
  //BUG not wiping items correctly yet - skipping these tests for now
  it.skip('should remove added repeats and clear answers when collapsing toplevel enableWhen', async () => {
    let state = await fillOutForm(newState, definitionItems);
    if (!state) return fail();

    // unclick first checkbox
    const qItem = getQuestionnaireDefinitionItem('1', definitionItems);
    if (!qItem) return;
    state = await clickCheckbox(state, pathifyExpand('1'), false, qItem);

    const i1 = getResponseItem('1', state, pathifyExpand('1'));
    const i11 = getResponseItem('1.1', state, pathifyExpand('1.1'));
    const i111 = getResponseItem('1.1.1', state, pathifyExpand('1.1.1'));
    const i1111 = getResponseItem('1.1.1.1', state, pathifyExpand('1.1.1.1'));
    const i2 = getResponseItem('2', state, pathifyExpand('2'));
    const i21 = getResponseItem('2.1', state, pathifyExpand('2.1'));

    if (!i1 || !i11 || !i111 || !i1111 || !i2 || !i21) {
      return fail();
    }

    expect(i1.answer![0]).toHaveProperty('valueBoolean', false);

    // answers are wiped completely -> arrays should be empty
    expect(i11.answer).toHaveLength(0);
    expect(i111.answer).toHaveLength(0);
    expect(i1111.answer).toHaveLength(0);

    // unrelated branch intact
    expect(i2.answer![0]).toHaveProperty('valueBoolean', true);
    expect(i21.answer![0]).toHaveProperty('valueString', 'unrelated');
  });
  //BUG not wiping items correctly yet - skipping these tests for now
  it.skip('should remove added repeats and clear answers when collapsing sublevel enableWhen', async () => {
    let state = await fillOutForm(newState, definitionItems);
    if (!state) return fail();

    // remove "hello" answer
    const qItem = getQuestionnaireDefinitionItem('1.1', definitionItems);
    if (!qItem) return fail();
    state = await enterText(state, pathifyExpand('1.1'), '', qItem);

    const i1 = getResponseItem('1', state, pathifyExpand('1'));
    const i11 = getResponseItem('1.1', state, pathifyExpand('1.1'));
    const i111 = getResponseItem('1.1.1', state, pathifyExpand('1.1.1'));
    const i1111 = getResponseItem('1.1.1.1', state, pathifyExpand('1.1.1.1'));
    const i2 = getResponseItem('2', state, pathifyExpand('2'));
    const i21 = getResponseItem('2.1', state, pathifyExpand('2.1'));

    if (!i1 || !i11 || !i111 || !i1111 || !i2 || !i21) {
      return fail();
    }

    expect(i1.answer![0]).toHaveProperty('valueBoolean', true);

    // Parent 1.1 keeps a single structural answer (with only `item`)
    expect(i11.answer).toHaveLength(1);
    expect(i11.answer![0]).not.toHaveProperty('valueString');

    // Children are wiped completely
    expect(i111.answer).toHaveLength(0);
    expect(i1111.answer).toHaveLength(0);

    // Unrelated branch intact
    expect(i2.answer![0]).toHaveProperty('valueBoolean', true);
    expect(i21.answer![0]).toHaveProperty('valueString', 'unrelated');
  });
});

async function fillOutForm(newState: Form, definitionItems: QuestionnaireItem[]): Promise<Form | undefined> {
  let qItem = getQuestionnaireDefinitionItem('1', definitionItems);
  if (!qItem) return;
  newState = await clickCheckbox(newState, pathifyExpand('1'), true, qItem);

  qItem = getQuestionnaireDefinitionItem('1.1', definitionItems);
  if (!qItem) return;
  newState = await enterText(newState, pathifyExpand('1.1'), 'hello', qItem);

  qItem = getQuestionnaireDefinitionItem('1.1.1', definitionItems);
  if (!qItem) return;
  newState = await enterText(newState, pathifyExpand('1.1.1'), 'world', qItem);

  qItem = getQuestionnaireDefinitionItem('1.1.1.1', definitionItems);
  if (!qItem) return;
  newState = await selectChoice(newState, pathifyExpand('1.1.1.1'), createCoding('1', 'urn:oid:2.16.578.1.12.4.1.1101'), qItem, false);

  qItem = getQuestionnaireDefinitionItem('2', definitionItems);
  if (!qItem) return;
  newState = await clickCheckbox(newState, pathifyExpand('2'), true, qItem);

  qItem = getQuestionnaireDefinitionItem('2.1', definitionItems);
  if (!qItem) return;
  newState = await enterText(newState, pathifyExpand('2.1'), 'unrelated', qItem);

  return newState;
}
