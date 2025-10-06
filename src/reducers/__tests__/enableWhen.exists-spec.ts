import { fail } from 'assert';

import { Questionnaire, QuestionnaireResponse, QuestionnaireItem } from 'fhir/r4';

import { Form } from '../form';
import { createGlobalStateWithQuestionnaire, enterText, getResponseItem, pathify } from './utils';
import { getQuestionnaireDefinitionItem, getDefinitionItems } from '../../util/refero-core';

const q: Questionnaire = {
  resourceType: 'Questionnaire',
  item: [
    { linkId: 'A', type: 'group', item: [{ linkId: 'A.1', type: 'string' }] },
    {
      linkId: 'T',
      type: 'group',
      enableWhen: [{ question: 'A.1', operator: 'exists', answerBoolean: true }],
      item: [{ linkId: 'T.1', type: 'string' }],
    },
  ],
} as Questionnaire;

const qr: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  item: [
    { linkId: 'A', item: [{ linkId: 'A.1', answer: [] }] },
    { linkId: 'T', item: [{ linkId: 'T.1', answer: [] }] },
  ],
};

describe('enableWhen operator: exists/hasAnswer', () => {
  let state: Form;
  let def: QuestionnaireItem[];

  beforeEach(() => {
    const gs = createGlobalStateWithQuestionnaire(q, qr);
    state = gs.refero.form;
    def = getDefinitionItems(state.FormDefinition)!;
  });

  it('T er enabled når A.1 har svar, disabled + wipe når A.1 tømmes', async () => {
    // gi A.1 verdi
    state = await enterText(state, pathify('A', 'A.1'), 'x', getQuestionnaireDefinitionItem('A.1', def));
    // fyll T.1
    state = await enterText(state, pathify('T', 'T.1'), 'keeps?', getQuestionnaireDefinitionItem('T.1', def));

    // tøm A.1 -> exists=false => T disables og T.1 wipes (blir tomt svar-array)
    state = await enterText(state, pathify('A', 'A.1'), '', getQuestionnaireDefinitionItem('A.1', def));

    const t1 = getResponseItem('T.1', state, pathify('T', 'T.1'));
    if (!t1) return fail();
    expect(t1.answer?.length ?? 0).toBe(0);
  });
});
