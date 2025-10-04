import { fail } from 'assert';

import { Questionnaire, QuestionnaireResponse, QuestionnaireItem } from 'fhir/r4';

import { Form } from '../form';
import { createGlobalStateWithQuestionnaire, clickCheckbox, getResponseItem, pathify } from './utils';
import { getQuestionnaireDefinitionItem, getDefinitionItems } from '../../util/refero-core';

const makeQR = (): QuestionnaireResponse => ({
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  item: [
    {
      linkId: 'A',
      item: [
        { linkId: 'A.1', answer: [{ valueBoolean: false }] },
        { linkId: 'A.2', answer: [{ valueBoolean: false }] },
      ],
    },
    { linkId: 'T', item: [{ linkId: 'T.1', answer: [{ valueBoolean: false }] }] },
  ],
});

describe('enableBehavior any vs all', () => {
  let def: QuestionnaireItem[];

  it('ANY: ett sant vil enable; når det blir false wipes T.1', async () => {
    const q: Questionnaire = {
      resourceType: 'Questionnaire',
      item: [
        {
          linkId: 'A',
          type: 'group',
          item: [
            { linkId: 'A.1', type: 'boolean' },
            { linkId: 'A.2', type: 'boolean' },
          ],
        },
        {
          linkId: 'T',
          type: 'group',
          enableBehavior: 'any',
          enableWhen: [
            { question: 'A.1', operator: '=', answerBoolean: true },
            { question: 'A.2', operator: '=', answerBoolean: true },
          ],
          item: [{ linkId: 'T.1', type: 'boolean' }],
        },
      ],
    } as Questionnaire;

    let state: Form = createGlobalStateWithQuestionnaire(q, makeQR()).refero.form;
    def = getDefinitionItems(state.FormDefinition)!;

    // Sett A.1 = true -> T enabled
    state = await clickCheckbox(state, pathify('A', 'A.1'), true, getQuestionnaireDefinitionItem('A.1', def));
    // Sett T.1 = true
    state = await clickCheckbox(state, pathify('T', 'T.1'), true, getQuestionnaireDefinitionItem('T.1', def));
    // Sett A.1 = false -> ANY har fortsatt A.2=false, ingen true => disable, wipe T.1 -> false
    state = await clickCheckbox(state, pathify('A', 'A.1'), false, getQuestionnaireDefinitionItem('A.1', def));

    const t1 = getResponseItem('T.1', state, pathify('T', 'T.1'));
    if (!t1) return fail();
    expect(t1.answer).toMatchObject([{ valueBoolean: false }]);
  });

  it('ALL: alle må være sanne; sette én til false skal wipe', async () => {
    const q: Questionnaire = {
      resourceType: 'Questionnaire',
      item: [
        {
          linkId: 'A',
          type: 'group',
          item: [
            { linkId: 'A.1', type: 'boolean' },
            { linkId: 'A.2', type: 'boolean' },
          ],
        },
        {
          linkId: 'T',
          type: 'group',
          enableBehavior: 'all',
          enableWhen: [
            { question: 'A.1', operator: '=', answerBoolean: true },
            { question: 'A.2', operator: '=', answerBoolean: true },
          ],
          item: [{ linkId: 'T.1', type: 'boolean' }],
        },
      ],
    } as Questionnaire;

    let state: Form = createGlobalStateWithQuestionnaire(q, makeQR()).refero.form;
    def = getDefinitionItems(state.FormDefinition)!;

    state = await clickCheckbox(state, pathify('A', 'A.1'), true, getQuestionnaireDefinitionItem('A.1', def));
    state = await clickCheckbox(state, pathify('A', 'A.2'), true, getQuestionnaireDefinitionItem('A.2', def));
    state = await clickCheckbox(state, pathify('T', 'T.1'), true, getQuestionnaireDefinitionItem('T.1', def));

    // Slå av A.2 -> ALL bryter og T.1 wipes -> false
    state = await clickCheckbox(state, pathify('A', 'A.2'), false, getQuestionnaireDefinitionItem('A.2', def));

    const t1 = getResponseItem('T.1', state, pathify('T', 'T.1'));
    if (!t1) return fail();
    expect(t1.answer).toMatchObject([{ valueBoolean: false }]);
  });
});
