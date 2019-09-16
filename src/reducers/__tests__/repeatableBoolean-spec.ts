import repeatableBooleanDataModel from './__data__/repeatableBoolean';
import { Form } from '../form';
import { QuestionnaireItem, QuestionnaireResponseItem } from '../../types/fhir';
import { getDefinitionItems } from '../../util/skjemautfyller-core';
import { pathify, getResponseItem, clickRepeat } from './utils';

describe('Given a questionnaire with multiple repeatable booleans', () => {
  let newState: Form;

  beforeEach(() => {
    newState = repeatableBooleanDataModel.skjemautfyller.form;
    const dItems = getDefinitionItems(newState.FormDefinition);
    if (!dItems || dItems.length === 0) {
      return fail();
    }
  });

  describe('When boolean is repeated', () => {
    beforeEach(() => {
      const itemToRepeat = getResponseItem('1^0', newState) as QuestionnaireItem;
      const responseItemToRepeate = getResponseItem('1.0^0', newState) as QuestionnaireResponseItem;
      newState = clickRepeat(newState, pathify('1'), itemToRepeat, [responseItemToRepeate]);
    });

    it('Then repeated item should have an answer with 3 items', () => {
      let repeatedResponseItem = getResponseItem('1.0.4^1', newState) as QuestionnaireResponseItem;

      if (!repeatedResponseItem || !repeatedResponseItem.answer) return fail();

      expect(repeatedResponseItem.answer.length).toBe(1);

      const answer = repeatedResponseItem.answer[0];

      if (!answer || !answer.item) return fail();

      expect(answer.item.length).toBe(3);
    });
  });
});
