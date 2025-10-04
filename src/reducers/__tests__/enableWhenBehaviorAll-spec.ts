import { fail } from 'assert';

import { QuestionnaireItem } from 'fhir/r4';

import { Form } from '../form';
import enableWhenDataModel from './__data__/enableWhenBehaviorAll';
import { getResponseItem, pathify, clickCheckbox } from './utils';
import { getQuestionnaireDefinitionItem, getDefinitionItems } from '../../util/refero-core';

describe('questionnaire with enableWhen behavior all', () => {
  let newState: Form;
  let definitionItems: QuestionnaireItem[];

  beforeEach(() => {
    newState = enableWhenDataModel.refero.form;
    const dItems = getDefinitionItems(newState.FormDefinition);
    if (!dItems || dItems.length === 0) {
      return fail();
    }
    definitionItems = dItems;
  });

  it('should clear answer when one enableWhen condition is false', async () => {
    newState = await clickCheckbox(newState, pathify('1', '1.1'), true, getQuestionnaireDefinitionItem('1.1', definitionItems));
    newState = await clickCheckbox(newState, pathify('1', '1.2'), true, getQuestionnaireDefinitionItem('1.2', definitionItems));
    newState = await clickCheckbox(newState, pathify('2', '2.1'), true, getQuestionnaireDefinitionItem('2.1', definitionItems));
    let responseItem21 = getResponseItem('2.1', newState, pathify('2', '2.1'));

    if (!responseItem21) return fail();
    expect(responseItem21.answer).toMatchObject([{ valueBoolean: true }]);

    newState = await clickCheckbox(newState, pathify('1', '1.1'), false, getQuestionnaireDefinitionItem('1.1', definitionItems));

    responseItem21 = getResponseItem('2.1', newState, pathify('2', '2.1'));
    if (!responseItem21) return fail();
    expect(responseItem21.answer).toMatchObject([{ valueBoolean: false }]);
  });
});
