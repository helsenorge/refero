import * as fs from 'fs';

import type { Form } from '../form';
import type { Questionnaire, QuestionnaireResponseItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';

import dataModel from './__data__/copyItemInitialChildren';
import { clickRepeat, createGlobalStateWithQuestionnaire } from './utils';
import { generateQuestionnaireResponse } from '../../actions/generateQuestionnaireResponse';
import { getDefinitionItems, getQuestionnaireDefinitionItem } from '../../util/refero-core';

const loadQuestionnaire = (): Questionnaire =>
  JSON.parse(fs.readFileSync(__dirname + '/__data__/copyItemInitialChildren/q.json').toString()) as Questionnaire;

const repeatGroup = async (state: Form, linkId: string = 'grp'): Promise<QuestionnaireResponseItem> => {
  const defItems = getDefinitionItems(state.FormDefinition) ?? [];
  const defGroup = getQuestionnaireDefinitionItem(linkId, defItems);
  const groups = (state.FormData.Content?.item ?? []).filter(i => i.linkId === linkId);
  const next = await clickRepeat(state, [], defGroup!, [groups[0]]);
  const all = (next.FormData.Content?.item ?? []).filter(i => i.linkId === linkId);
  expect(all).toHaveLength(2);
  return all[1];
};

const answersOf = (group: QuestionnaireResponseItem, linkId: string): QuestionnaireResponseItemAnswer[] | undefined =>
  group.item?.find(i => i.linkId === linkId)?.answer;

describe('copyItem - initial values and child items on a new repetition', () => {
  describe('characterization of existing behaviour', () => {
    let newGroup: QuestionnaireResponseItem;

    beforeEach(async () => {
      newGroup = await repeatGroup(structuredClone(dataModel.refero.form));
    });

    it('question with initial and no children gets the initial value, not the typed one', () => {
      expect(answersOf(newGroup, 'initOnly')).toEqual([{ valueString: 'init' }]);
    });

    it('question with children and no initial gets one answer holding the copied child', () => {
      expect(answersOf(newGroup, 'childOnly')).toEqual([{ item: [{ linkId: 'childOnly.child' }] }]);
    });

    it('boolean gets an answer from its definition', () => {
      expect(answersOf(newGroup, 'bool')).toEqual([{ valueBoolean: true }]);
    });

    it('attachment is not copied', () => {
      expect(answersOf(newGroup, 'att')).toBeUndefined();
    });

    it('repeating question without initial gets one answer per source answer, each with its child', () => {
      expect(answersOf(newGroup, 'multi')).toEqual([{ item: [{ linkId: 'multi.child' }] }, { item: [{ linkId: 'multi.child' }] }]);
    });

    it('child with its own initial gets that initial, parent without initial gets no value', () => {
      expect(answersOf(newGroup, 'childInit')).toEqual([
        { item: [{ linkId: 'childInit.child', answer: [{ valueString: 'childDefault' }] }] },
      ]);
    });

    it('group nested under an answer is copied with the initial of its question', () => {
      expect(answersOf(newGroup, 'nested')).toEqual([
        { item: [{ linkId: 'nested.group', item: [{ linkId: 'nested.group.text', answer: [{ valueString: 'nestedDefault' }] }] }] },
      ]);
    });

    it('does not change the first repetition', async () => {
      const state = structuredClone(dataModel.refero.form);
      const before = structuredClone(state.FormData.Content?.item?.[0]);
      const defGroup = getQuestionnaireDefinitionItem('grp', getDefinitionItems(state.FormDefinition) ?? []);
      const next = await clickRepeat(state, [], defGroup!, [state.FormData.Content!.item![0]]);
      expect(next.FormData.Content?.item?.[0]).toEqual(before);
    });
  });

  describe('question with initial value and a child question', () => {
    let newGroup: QuestionnaireResponseItem;

    beforeEach(async () => {
      newGroup = await repeatGroup(structuredClone(dataModel.refero.form));
    });

    it('gets exactly one answer with the initial value and the child below it', () => {
      expect(answersOf(newGroup, 'parentInit')).toEqual([
        { valueString: 'Dr. Hansen', item: [{ linkId: 'parentInit.child', answer: [{ valueString: 'Fastlege' }] }] },
      ]);
    });

    it('child without initial is kept under the single answer', () => {
      expect(answersOf(newGroup, 'parentInitPlainChild')).toEqual([{ valueString: 'P', item: [{ linkId: 'parentInitPlainChild.child' }] }]);
    });

    it('boolean with initial gets exactly one answer with the child below it', () => {
      expect(answersOf(newGroup, 'boolChild')).toEqual([{ valueBoolean: true, item: [{ linkId: 'boolChild.child' }] }]);
    });

    it('repeating question with two initials and two source answers gets each child under its own initial', () => {
      expect(answersOf(newGroup, 'multiInit')).toEqual([
        { valueString: 'i1', item: [{ linkId: 'multiInit.child' }] },
        { valueString: 'i2', item: [{ linkId: 'multiInit.child' }] },
      ]);
    });

    it('more initials than source answers: the extra initial stays a plain answer', () => {
      expect(answersOf(newGroup, 'fewSources')).toEqual([
        { valueString: 'i1', item: [{ linkId: 'fewSources.child' }] },
        { valueString: 'i2' },
      ]);
    });

    it('more source answers than initials: the extra source answer keeps its child as a separate answer', () => {
      expect(answersOf(newGroup, 'moreSources')).toEqual([
        { valueString: 'x', item: [{ linkId: 'moreSources.child' }] },
        { item: [{ linkId: 'moreSources.child' }] },
      ]);
    });

    it('also holds when the repeating group is inside an enclosing group', async () => {
      const state = structuredClone(dataModel.refero.form);
      const defGroup = getQuestionnaireDefinitionItem('grp2', getDefinitionItems(state.FormDefinition) ?? []);
      const outer = state.FormData.Content!.item!.find(i => i.linkId === 'outer')!;
      const next = await clickRepeat(state, [{ linkId: 'outer', index: 0 }], defGroup!, [outer.item![0]]);
      const groups = next.FormData.Content!.item!.find(i => i.linkId === 'outer')!.item!.filter(i => i.linkId === 'grp2');
      expect(groups).toHaveLength(2);
      expect(answersOf(groups[1], 'parentInit2')).toEqual([
        { valueString: 'Dr. Hansen', item: [{ linkId: 'parentInit2.child', answer: [{ valueString: 'Fastlege' }] }] },
      ]);
    });

    it('also holds when the response was generated from the questionnaire (initial objects are shared with the definition)', async () => {
      const q = loadQuestionnaire();
      const state = createGlobalStateWithQuestionnaire(q, generateQuestionnaireResponse(q)!).refero.form;
      const first = state.FormData.Content!.item!.find(i => i.linkId === 'grp')!;
      expect(answersOf(first, 'parentInit')).toHaveLength(1);

      const newGroup = await repeatGroup(state);
      expect(answersOf(newGroup, 'parentInit')).toEqual([
        {
          valueString: 'Dr. Hansen',
          item: [{ linkId: 'parentInit.child', text: 'Behandlerens rolle', answer: [{ valueString: 'Fastlege' }] }],
        },
      ]);
    });
  });
});
