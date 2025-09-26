import { fail } from 'assert';

import { QuestionnaireItem, Questionnaire, QuestionnaireResponse } from 'fhir/r4';

import { Form } from '../form';
import { createGlobalStateWithQuestionnaire, clickCheckbox, getResponseItem, pathify } from './utils';
import { getQuestionnaireDefinitionItem, getDefinitionItems } from '../../util/refero-core';

const q: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'test-enablewhen',
  item: [
    {
      linkId: '1',
      text: 'Hva trenger du nå',
      type: 'group',
      item: [{ linkId: '1.1', text: 'Vet du hva du trenger nå?', type: 'boolean' }],
    },
    {
      linkId: '2',
      text: 'Selvhjelp',
      type: 'group',
      enableBehavior: 'any',
      enableWhen: [{ question: '1.1', operator: '=', answerBoolean: true }],
      item: [{ linkId: '2.1', text: 'Ønsker du selvhjelp?', type: 'boolean' }],
    },
    {
      linkId: '3',
      text: 'Rådgiving og psykolog',
      type: 'group',
      enableBehavior: 'any',
      enableWhen: [{ question: '2.1', operator: '=', answerBoolean: true }],
      item: [{ linkId: '3.1', text: 'Har du utfordringer?', type: 'boolean' }],
    },
  ],
} as Questionnaire;

// minimal tom QR
const qr: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  item: [
    { linkId: '1', item: [{ linkId: '1.1', answer: [{ valueBoolean: false }] }] },
    { linkId: '2', item: [{ linkId: '2.1', answer: [{ valueBoolean: false }] }] },
    { linkId: '3', item: [{ linkId: '3.1', answer: [{ valueBoolean: false }] }] },
  ],
};

describe('booleans keep explicit value when hidden (enableWhen)', () => {
  let newState: Form;
  let definitionItems: QuestionnaireItem[];

  beforeEach(() => {
    const gs = createGlobalStateWithQuestionnaire(q, qr);
    newState = gs.refero.form;
    const dItems = getDefinitionItems(newState.FormDefinition);
    if (!dItems?.length) return fail();
    definitionItems = dItems;
  });

  it('2.1 og 3.1 blir eksplisitt false når 1.1 settes false', async () => {
    // Skru på kjeden 1.1 -> 2.1 -> 3.1
    newState = await clickCheckbox(newState, pathify('1', '1.1'), true, getQuestionnaireDefinitionItem('1.1', definitionItems));
    newState = await clickCheckbox(newState, pathify('2', '2.1'), true, getQuestionnaireDefinitionItem('2.1', definitionItems));
    newState = await clickCheckbox(newState, pathify('3', '3.1'), true, getQuestionnaireDefinitionItem('3.1', definitionItems));

    // slå av 1.1 => begge etterkommere skjules og skal bli false (ikke tomme)
    newState = await clickCheckbox(newState, pathify('1', '1.1'), false, getQuestionnaireDefinitionItem('1.1', definitionItems));

    const ri21 = getResponseItem('2.1', newState, pathify('2', '2.1'));
    const ri31 = getResponseItem('3.1', newState, pathify('3', '3.1'));
    if (!ri21 || !ri31) return fail();

    expect(ri21.answer).toMatchObject([{ valueBoolean: false }]);
    expect(ri31.answer).toMatchObject([{ valueBoolean: false }]);
  });

  it('re-enable påvirker ikke wiped verdi (verdier kommer ikke tilbake automatisk)', async () => {
    newState = await clickCheckbox(newState, pathify('1', '1.1'), true, getQuestionnaireDefinitionItem('1.1', definitionItems));
    newState = await clickCheckbox(newState, pathify('2', '2.1'), true, getQuestionnaireDefinitionItem('2.1', definitionItems));
    // slå av 1.1 -> wipes under
    newState = await clickCheckbox(newState, pathify('1', '1.1'), false, getQuestionnaireDefinitionItem('1.1', definitionItems));
    // skru på igjen
    newState = await clickCheckbox(newState, pathify('1', '1.1'), true, getQuestionnaireDefinitionItem('1.1', definitionItems));

    const ri21 = getResponseItem('2.1', newState, pathify('2', '2.1'));
    if (!ri21) return fail();
    // den er fortsatt false (default), ikke auto-restored til true
    expect(ri21.answer).toMatchObject([{ valueBoolean: false }]);
  });
});
