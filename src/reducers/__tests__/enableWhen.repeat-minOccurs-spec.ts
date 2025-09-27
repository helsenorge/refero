import { Extension, Questionnaire, QuestionnaireItem, QuestionnaireResponse } from 'fhir/r4';

import { Form } from '../form';
import { createGlobalStateWithQuestionnaire, clickCheckbox, getResponseItem, pathify } from './utils';
import { getQuestionnaireDefinitionItem, getDefinitionItems } from '../../util/refero-core';

const minOccursExt = (n: number): Extension => ({
  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-minOccurs',
  valueInteger: n,
});

const q: Questionnaire = {
  resourceType: 'Questionnaire',
  item: [
    { linkId: 'A', type: 'boolean' },
    {
      linkId: 'G',
      type: 'group',
      repeats: true,
      extension: [minOccursExt(2)],
      enableWhen: [{ question: 'A', operator: '=', answerBoolean: true }],
      item: [{ linkId: 'G.1', type: 'boolean' }],
    },
  ],
} as Questionnaire;

// 👉 Preseed med 3 forekomster av G (over minOccurs=2)
const qr: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  item: [
    { linkId: 'A', answer: [{ valueBoolean: false }] },
    { linkId: 'G', item: [{ linkId: 'G.1', answer: [{ valueBoolean: false }] }] }, // G^0
    { linkId: 'G', item: [{ linkId: 'G.1', answer: [{ valueBoolean: false }] }] }, // G^1
    { linkId: 'G', item: [{ linkId: 'G.1', answer: [{ valueBoolean: false }] }] }, // G^2 (skal fjernes)
  ],
};

describe('repeat removals honor minOccurs', () => {
  let state: Form;
  let def: QuestionnaireItem[];

  beforeEach(() => {
    state = createGlobalStateWithQuestionnaire(q, qr).refero.form;
    def = getDefinitionItems(state.FormDefinition)!;
  });

  it('disable fjerner repeats utover minOccurs, men beholder to', async () => {
    // enable først (A=true), deretter disable (A=false) for å trigge trimming på disable
    state = await clickCheckbox(state, pathify('A'), true, getQuestionnaireDefinitionItem('A', def));
    state = await clickCheckbox(state, pathify('A'), false, getQuestionnaireDefinitionItem('A', def));

    const g0 = getResponseItem('G', state, pathify('G^0'));
    const g1 = getResponseItem('G', state, pathify('G^1'));
    const g2 = getResponseItem('G', state, pathify('G^2')); // skal være fjernet

    expect(!!g0).toBe(true);
    expect(!!g1).toBe(true);
    expect(g2).toBeUndefined();
  });
});
