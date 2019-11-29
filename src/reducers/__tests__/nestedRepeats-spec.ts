import dataModel from './__data__/nestedRepeats';
import { Form } from '../form';
import { Coding, QuestionnaireItem } from '../../types/fhir';
import { getQuestionnaireDefinitionItem, getDefinitionItems, getResponseItemWithPath } from '../../util/skjemautfyller-core';
import { pathify, selectChoice, getResponseItem, enterText, clickRepeat } from './utils';

describe('update enable when action', () => {
  let newState: Form;
  let definitionItems: QuestionnaireItem[];

  beforeEach(() => {
    newState = dataModel.skjemautfyller.form;
    const dItems = getDefinitionItems(newState.FormDefinition);
    if (!dItems || dItems.length === 0) {
      return fail();
    }
    definitionItems = dItems;
  });

  it('should remove added repeats and clear answers when collapsing enableWhens', () => {
    if (!newState.FormDefinition.Content) {
      return fail();
    }

    let firstRootItem = getResponseItemWithPath(pathify('1^0'), newState.FormData);
    if (!firstRootItem || !firstRootItem.item) {
      return fail();
    }

    expect(firstRootItem.item.filter(i => i.linkId === '1.2').length).toBe(2);

    const defItem = getQuestionnaireDefinitionItem('1.2', definitionItems);
    if (!defItem) return fail();
    newState = clickRepeat(newState, pathify('1^0'), defItem, [{ linkId: '1.2' }]);

    firstRootItem = getResponseItemWithPath(pathify('1^0'), newState.FormData);
    if (!firstRootItem || !firstRootItem.item) {
      return fail();
    }
    expect(firstRootItem.item.filter(i => i.linkId === '1.2').length).toBe(3);

    const rootDefItem = getQuestionnaireDefinitionItem('1', definitionItems);
    if (!rootDefItem) return fail();
    newState = clickRepeat(newState, [], rootDefItem, [firstRootItem]);

    let secondRootItem = getResponseItemWithPath(pathify('1^1'), newState.FormData);
    if (!secondRootItem || !secondRootItem.item) {
      return fail();
    }

    expect(secondRootItem.item.filter(i => i.linkId === '1.2').length).toBe(2);
  });
});
