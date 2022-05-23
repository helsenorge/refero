import enableWhenDataModel from './__data__/multipleEnableWhen';
import { Form } from '../form';
import { QuestionnaireItem } from '../../types/fhir';
import { getQuestionnaireDefinitionItem, getDefinitionItems } from '../../util/refero-core';
import { getResponseItem, pathify, clickCheckbox } from './utils';

describe('questionnaire with multiple dependent enable when items', () => {
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

  it('should clear all answers when enable when parent enableWhen is false', () => {
    // check first checkbox
    newState = clickCheckbox(newState, pathify('1', '1.1'), true, getQuestionnaireDefinitionItem('1.1', definitionItems));
    newState = clickCheckbox(newState, pathify('2', '2.1'), true, getQuestionnaireDefinitionItem('2.1', definitionItems));
    newState = clickCheckbox(newState, pathify('3', '3.1'), true, getQuestionnaireDefinitionItem('3.1', definitionItems));
    let responseItem31 = getResponseItem('3.1', newState, pathify('3', '3.1'));

    if (!responseItem31) return fail();
    expect(responseItem31.answer).toMatchObject([{ valueBoolean: true }]);

    newState = clickCheckbox(newState, pathify('1', '1.1'), false, getQuestionnaireDefinitionItem('1.1', definitionItems));

    let responseItem21 = getResponseItem('2.1', newState, pathify('2', '2.1'));
    if (!responseItem21) return fail();
    expect(responseItem21.answer).toMatchObject([{ valueBoolean: false }]);

    responseItem31 = getResponseItem('3.1', newState, pathify('3', '3.1'));
    if (!responseItem31) return fail();
    expect(responseItem31.answer).toMatchObject([{ valueBoolean: false }]);
  });
});
