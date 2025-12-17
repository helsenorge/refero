import { fail } from 'assert';

import type { Form } from '../form';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';

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

  it('should apply initial value on new repeated group even when source has answer', async () => {
    // get first group (1^0)
    const firstRootItem = getResponseItemWithPath(pathify('1^0'), newState.FormData);
    if (!firstRootItem || !firstRootItem.item) {
      return fail('Missing root item');
    }

    const textItem = firstRootItem.item.find(i => i.linkId === '1.1');
    if (!textItem || !textItem.answer) {
      return fail('Missing text item or answer');
    }

    // user has already overwritten the initial value in the first repetition
    expect(textItem.answer[0].valueString).toBe('Brukersvar overskriver initial verdi');

    // click repeat on group "1"
    const defGroupItem = getQuestionnaireDefinitionItem('1', definitionItems);
    if (!defGroupItem) {
      return fail('Missing definition item for linkId 1');
    }

    const updatedState = await clickRepeat(newState, [], defGroupItem, [firstRootItem as QuestionnaireResponseItem]);

    // get second group instance (1^1)
    const secondRootItem = getResponseItemWithPath(pathify('1^1'), updatedState.FormData);
    if (!secondRootItem || !secondRootItem.item) {
      return fail('Missing second root item');
    }

    const copiedTextItem = secondRootItem.item.find(i => i.linkId === '1.1');
    expect(copiedTextItem).toBeDefined();

    // look up initial value from Questionnaire definition for item 1.1
    const defTextItem = getQuestionnaireDefinitionItem('1.1', definitionItems);
    if (!defTextItem) {
      return fail('Missing definition item for linkId 1.1');
    }
    if (!defTextItem.initial || defTextItem.initial.length === 0) {
      return fail('Definition item 1.1 has no initial value');
    }

    const expectedInitialValue = defTextItem.initial[0].valueString;

    expect(copiedTextItem?.answer).toBeDefined();
    expect(copiedTextItem?.answer?.length).toBe(1);
    expect(copiedTextItem?.answer?.[0].valueString).toBe(expectedInitialValue);
  });
});
