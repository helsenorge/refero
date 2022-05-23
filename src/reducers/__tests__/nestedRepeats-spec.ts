import dataModel from './__data__/nestedRepeats';
import { Form } from '../form';
import { QuestionnaireItem, QuestionnaireResponseItem } from '../../types/fhir';
import { getQuestionnaireDefinitionItem, getDefinitionItems, getResponseItemWithPath } from '../../util/refero-core';
import { pathify, clickRepeat, uploadAttachment, createAttachment } from './utils';

describe('update enable when action', () => {
  let newState: Form;
  let definitionItems: QuestionnaireItem[];

  beforeEach(() => {
    newState = dataModel.refero.form;
    const dItems = getDefinitionItems(newState.FormDefinition);
    if (!dItems || dItems.length === 0) {
      return fail();
    }
    definitionItems = dItems;
  });

  it('should add right number of items for nested repeats', () => {
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

  it('should not copy answers from repeating items inside repeating group', () => {
    if (!newState.FormDefinition.Content) {
      return fail();
    }

    let firstRootItem = getResponseItemWithPath(pathify('1^0'), newState.FormData);
    if (!firstRootItem || !firstRootItem.item) {
      return fail();
    }

    newState = uploadAttachment(
      newState,
      pathify('1^0', '1.3^0'),
      createAttachment('1', 'fil1'),
      getQuestionnaireDefinitionItem('1.3', definitionItems),
      true
    );

    newState = uploadAttachment(
      newState,
      pathify('1^0', '1.3^0'),
      createAttachment('2', 'fil2'),
      getQuestionnaireDefinitionItem('1.3', definitionItems),
      true
    );
    firstRootItem = getResponseItemWithPath(pathify('1^0'), newState.FormData);
    const answer = firstRootItem && firstRootItem.item && firstRootItem.item.filter(i => i.linkId === '1.3')[0].answer;
    if (!answer) {
      return fail();
    }
    expect(answer.length).toBe(2);

    const rootDefItem = getQuestionnaireDefinitionItem('1', definitionItems);
    if (!rootDefItem) return fail();
    newState = clickRepeat(newState, [], rootDefItem, [firstRootItem as QuestionnaireResponseItem]);

    let secondRootItem = getResponseItemWithPath(pathify('1^1'), newState.FormData);
    if (!secondRootItem || !secondRootItem.item) {
      return fail();
    }
    expect(secondRootItem.item.filter(i => i.linkId === '1.3')[0].answer).toBe(undefined);
  });
});
