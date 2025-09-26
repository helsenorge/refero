import { fail } from 'assert';

import { Questionnaire, QuestionnaireResponse, QuestionnaireItem } from 'fhir/r4';

import { Form } from '../form';
import { createGlobalStateWithQuestionnaire, enterText, clickCheckbox, getResponseItem, pathify } from './utils';
import { getDefinitionItems, getQuestionnaireDefinitionItem } from '../../util/refero-core';

const q: Questionnaire = {
  resourceType: 'Questionnaire',
  item: [
    { linkId: 'A', type: 'boolean' },
    {
      linkId: 'B',
      type: 'group',
      enableBehavior: 'all',
      enableWhen: [{ question: 'A', operator: '=', answerBoolean: true }],
      item: [
        { linkId: 'B.1', type: 'boolean' },
        {
          linkId: 'C',
          type: 'group',
          enableBehavior: 'all',
          enableWhen: [{ question: 'B.1', operator: '=', answerBoolean: true }],
          item: [{ linkId: 'C.1', type: 'string' }],
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
    {
      linkId: 'B',
      item: [
        { linkId: 'B.1', answer: [{ valueBoolean: false }] },
        { linkId: 'C', item: [{ linkId: 'C.1', answer: [] }] },
      ],
    },
  ],
};

describe('deep transitive wiping', () => {
  let s: Form;
  let def: QuestionnaireItem[];

  beforeEach(() => {
    s = createGlobalStateWithQuestionnaire(q, qr).refero.form;
    def = getDefinitionItems(s.FormDefinition)!;
  });

  it('A=false wiper både B.1 og C.1 (via transitiv disable)', async () => {
    // enable hele kjeden og fyll strengen
    s = await clickCheckbox(s, pathify('A'), true, getQuestionnaireDefinitionItem('A', def));
    s = await clickCheckbox(s, pathify('B', 'B.1'), true, getQuestionnaireDefinitionItem('B.1', def));
    s = await enterText(s, pathify('B', 'C', 'C.1'), 'hello', getQuestionnaireDefinitionItem('C.1', def));

    // disable roten
    s = await clickCheckbox(s, pathify('A'), false, getQuestionnaireDefinitionItem('A', def));

    const b1 = getResponseItem('B.1', s, pathify('B', 'B.1'));
    const c1 = getResponseItem('C.1', s, pathify('B', 'C', 'C.1'));
    if (!b1 || !c1) return fail();

    expect(b1.answer).toMatchObject([{ valueBoolean: false }]); // bool → false
    expect(c1.answer?.length ?? 0).toBe(0); // string → tom
  });
});
