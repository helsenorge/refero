import { fail } from 'assert';

import { Questionnaire, QuestionnaireResponse, QuestionnaireItem } from 'fhir/r4';

import { Form } from '../form';
import { createGlobalStateWithQuestionnaire, selectChoice, createCoding, pathify, clickCheckbox, getResponseItem } from './utils';
import { getDefinitionItems, getQuestionnaireDefinitionItem } from '../../util/refero-core';

const q: Questionnaire = {
  resourceType: 'Questionnaire',
  item: [
    { linkId: 'A', type: 'boolean' },
    {
      linkId: 'C',
      type: 'group',
      enableWhen: [{ question: 'A', operator: '=', answerBoolean: true }],
      item: [
        {
          linkId: 'C.1',
          type: 'choice',
          answerOption: [{ valueCoding: { code: 'x', system: 's' } }, { valueCoding: { code: 'y', system: 's' } }],
        },
      ],
    },
  ],
} as Questionnaire;

const qr: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  item: [
    { linkId: 'A', answer: [{ valueBoolean: false }] },
    { linkId: 'C', item: [{ linkId: 'C.1', answer: [] }] },
  ],
};

describe('wiping of coding answers on disable', () => {
  let s: Form;
  let def: QuestionnaireItem[];

  beforeEach(() => {
    s = createGlobalStateWithQuestionnaire(q, qr).refero.form;
    def = getDefinitionItems(s.FormDefinition)!;
  });

  it('setter C.1 til tomt når A=false etter at valg er gjort', async () => {
    // enable
    s = await clickCheckbox(s, pathify('A'), true, getQuestionnaireDefinitionItem('A', def));
    // velg coding
    s = await selectChoice(s, pathify('C', 'C.1'), createCoding('x', 's'), getQuestionnaireDefinitionItem('C.1', def)!);

    // disable
    s = await clickCheckbox(s, pathify('A'), false, getQuestionnaireDefinitionItem('A', def));

    const c1 = getResponseItem('C.1', s, pathify('C', 'C.1'));
    if (!c1) return fail();
    expect(c1.answer?.length ?? 0).toBe(0);
  });
});
