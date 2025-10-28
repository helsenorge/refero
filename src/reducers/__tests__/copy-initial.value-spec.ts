import { fail } from 'assert';

import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';

import { Form } from '../form';
import dataModel from './__data__/nestedInitialValues';
import { pathify, clickRepeat } from './utils';
import { getQuestionnaireDefinitionItem, getDefinitionItems, getResponseItemWithPath } from '../../util/refero-core';

describe('copy item - initial values', () => {
  let newState: Form;
  let definitionItems: QuestionnaireItem[];

  beforeEach(() => {
    newState = dataModel.refero.form;
    const dItems = getDefinitionItems(newState.FormDefinition);
    if (!dItems || dItems.length === 0) {
      return fail('No definition items found');
    }
    definitionItems = dItems;
  });

  it('should not copy initial values when source has answer', async () => {
    // get first group
    const firstRootItem = getResponseItemWithPath(pathify('1^0'), newState.FormData);
    if (!firstRootItem || !firstRootItem.item) {
      return fail('Missing root item');
    }

    const textItem = firstRootItem.item.find(i => i.linkId === '1.1');
    if (!textItem || !textItem.answer) {
      return fail('Missing text item or answer');
    }

    expect(textItem.answer[0].valueString).toBe('Brukersvar overskriver initial verdi');

    // click repeat
    const defItem = getQuestionnaireDefinitionItem('1', definitionItems);
    if (!defItem) return fail('Missing definition item for 1');

    const updatedState = await clickRepeat(newState, [], defItem, [firstRootItem as QuestionnaireResponseItem]);

    const secondRootItem = getResponseItemWithPath(pathify('1^1'), updatedState.FormData);
    if (!secondRootItem || !secondRootItem.item) {
      return fail('Missing second root item');
    }

    const copiedTextItem = secondRootItem.item.find(i => i.linkId === '1.1');
    expect(copiedTextItem).toBeDefined();
    // 👇 Dette er kjernen i testen:
    // initialverdi skal IKKE dukke opp når source hadde svar
    expect(copiedTextItem?.answer).toBeUndefined();
  });
});
