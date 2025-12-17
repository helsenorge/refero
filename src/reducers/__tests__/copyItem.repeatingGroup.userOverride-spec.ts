// copyItem.repeatingGroup.userOverride.test.ts
import { fail } from 'assert';

import type { Form } from '../form';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';

import dataModel from './__data__/repeatingInitialGroupUserOverride';
import { pathify, clickRepeat } from './utils';
import { getDefinitionItems, getQuestionnaireDefinitionItem, getResponseItemWithPath } from '../../util/refero-core';

describe('copyItem - repeating group - user override', () => {
  let state: Form;
  let definitionItems: QuestionnaireItem[];

  beforeEach(() => {
    state = dataModel.refero.form;
    const dItems = getDefinitionItems(state.FormDefinition);
    if (!dItems || dItems.length === 0) {
      return fail('No definition items found');
    }
    definitionItems = dItems;
  });

  it('new repetition gets initial, first keeps user value', async () => {
    const defGroup = getQuestionnaireDefinitionItem('1', definitionItems);
    if (!defGroup) {
      return fail('Missing definition item 1');
    }

    const defText = getQuestionnaireDefinitionItem('1.1', definitionItems);
    if (!defText || !defText.initial || defText.initial.length === 0) {
      return fail('Missing initial on 1.1');
    }
    const expectedInitial = defText.initial[0].valueString;

    const firstGroup = getResponseItemWithPath(pathify('1^0'), state.FormData);
    if (!firstGroup || !firstGroup.item) {
      return fail('Missing first group');
    }

    const firstText = firstGroup.item.find(i => i.linkId === '1.1');
    if (!firstText || !firstText.answer) {
      return fail('Missing text item or answer in first group');
    }
    expect(firstText.answer[0].valueString).toBe('Brukersvar overskriver initial verdi');

    const updatedState = await clickRepeat(state, [], defGroup, [firstGroup as QuestionnaireResponseItem]);

    const secondGroup = getResponseItemWithPath(pathify('1^1'), updatedState.FormData);
    if (!secondGroup || !secondGroup.item) {
      return fail('Missing second group');
    }

    const secondText = secondGroup.item.find(i => i.linkId === '1.1');
    expect(secondText).toBeDefined();
    expect(secondText?.answer?.[0].valueString).toBe(expectedInitial);

    const firstGroupAfter = getResponseItemWithPath(pathify('1^0'), updatedState.FormData);
    const firstTextAfter = firstGroupAfter?.item?.find(i => i.linkId === '1.1');
    expect(firstTextAfter?.answer?.[0].valueString).toBe('Brukersvar overskriver initial verdi');
  });
});
