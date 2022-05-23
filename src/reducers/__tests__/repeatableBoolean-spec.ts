import repeatableBooleanDataModel from './__data__/repeatableBoolean';
import { Form } from '../form';
import { QuestionnaireItem, QuestionnaireResponseItem } from '../../types/fhir';
import { getDefinitionItems } from '../../util/refero-core';
import { pathify, getResponseItem, clickRepeat } from './utils';

describe('Given a questionnaire with multiple repeatable booleans', () => {
  let newState: Form;

  beforeEach(() => {
    newState = repeatableBooleanDataModel.refero.form;
    const dItems = getDefinitionItems(newState.FormDefinition);
    if (!dItems || dItems.length === 0) {
      return fail();
    }
  });

  describe('When boolean is repeated', () => {
    beforeEach(() => {
      const itemToRepeat = getResponseItem('1', newState, pathify('1^0')) as QuestionnaireItem;
      const responseItemToRepeate = getResponseItem('1.0', newState, pathify('1^0', '1.0')) as QuestionnaireResponseItem;
      newState = clickRepeat(newState, pathify('1'), itemToRepeat, [responseItemToRepeate]);
    });

    it('Then repeated item should have an answer with 3 items', () => {
      const repeatedResponseItem = getResponseItem('1.0.4', newState, pathify('1', '1.0^1', '1.0.4')) as QuestionnaireResponseItem;

      if (!repeatedResponseItem) return fail();

      if (!repeatedResponseItem.answer) return fail();

      expect(repeatedResponseItem.answer.length).toBe(1);

      const answer = repeatedResponseItem.answer[0];

      if (!answer || !answer.item) return fail();

      expect(answer.item.length).toBe(3);
    });
  });
});
