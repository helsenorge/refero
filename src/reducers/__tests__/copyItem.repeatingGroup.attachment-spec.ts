// copyItem.repeatingGroup.attachment.test.ts
import { fail } from 'assert';

import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';

import { Form } from '../form';
import dataModel from './__data__/repeatingInitialGroupAttachment';
import { pathify, clickRepeat } from './utils';
import { getDefinitionItems, getQuestionnaireDefinitionItem, getResponseItemWithPath } from '../../util/refero-core';

describe('copyItem - repeating group - attachment', () => {
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

  it('text gets initial, attachments are not copied to new repetition', async () => {
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
    const firstAttachment = firstGroup.item.find(i => i.linkId === '1.2');

    expect(firstText?.answer?.[0].valueString).toBe('Brukersvar');
    expect(firstAttachment?.answer?.length).toBe(1);
    expect(firstAttachment?.answer?.[0].valueAttachment?.title).toBe('Første vedlegg');

    const updatedState = await clickRepeat(state, [], defGroup, [firstGroup as QuestionnaireResponseItem]);

    const secondGroup = getResponseItemWithPath(pathify('1^1'), updatedState.FormData);
    if (!secondGroup || !secondGroup.item) {
      return fail('Missing second group');
    }

    const secondText = secondGroup.item.find(i => i.linkId === '1.1');
    const secondAttachment = secondGroup.item.find(i => i.linkId === '1.2');

    expect(secondText?.answer?.[0].valueString).toBe(expectedInitial);

    // Per your implementation: no automatic attachment answer on new repetition
    expect(secondAttachment?.answer).toBeUndefined();
  });
});
