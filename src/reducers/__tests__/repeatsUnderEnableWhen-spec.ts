import enableWhenDataModel from './__data__/repeatsUnderEnableWhen';
import { Form } from '../form';
import { Coding, QuestionnaireItem } from '../../types/fhir';
import { getQuestionnaireDefinitionItem, getDefinitionItems, getResponseItemWithPath } from '../../util/refero-core';
import { pathify, selectChoice, getResponseItem, enterText, clickRepeat } from './utils';

describe('update enable when action', () => {
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

  it('should remove added repeats and clear answers when collapsing enableWhens', () => {
    // select "Fra en eller flere avdelinger" (3)
    let choice = { code: '3', system: 'http://ehelse.no/JournalDeler' } as Coding;
    if (!newState.FormDefinition.Content) {
      return fail();
    }
    const defItem = getQuestionnaireDefinitionItem('7.1', newState.FormDefinition.Content.item);
    if (!defItem) {
      return fail();
    }
    newState = selectChoice(newState, pathify('7', '7.1'), choice, defItem);

    // add repeat item
    const item = getQuestionnaireDefinitionItem('7.1.2', definitionItems);
    if (!item) return fail();

    newState = clickRepeat(newState, pathify('7', '7.1'), item, [{ linkId: '7.1.2' }]);

    let responseItem = getResponseItemWithPath(pathify('7', '7.1', '7.1.2^0'), newState.FormData);
    if (!responseItem) {
      return fail();
    }

    let responseItem2 = getResponseItemWithPath(pathify('7', '7.1', '7.1.2^1'), newState.FormData);
    if (!responseItem2) {
      return fail();
    }
    expect(responseItem).not.toBe(responseItem2);

    // enter "hello"
    newState = enterText(newState, pathify('7', '7.1', '7.1.2^0'), 'hello');

    responseItem = getResponseItemWithPath(pathify('7', '7.1', '7.1.2^0'), newState.FormData);
    if (!responseItem) {
      return fail();
    }

    expect(responseItem.answer).toMatchObject([{ valueString: 'hello' }]);

    // enter "world"
    newState = enterText(newState, pathify('7', '7.1', '7.1.2^1'), 'world');

    responseItem = getResponseItemWithPath(pathify('7', '7.1', '7.1.2^0'), newState.FormData);
    if (!responseItem) {
      return fail();
    }

    responseItem2 = getResponseItemWithPath(pathify('7', '7.1', '7.1.2^1'), newState.FormData);

    expect(responseItem).not.toBe(responseItem2);
    expect(responseItem.answer).toMatchObject([{ valueString: 'hello' }]);

    let r1 = getResponseItem('7.1.2', newState, pathify('7', '7.1', '7.1.2^0'));
    let r2 = getResponseItem('7.1.2', newState, pathify('7', '7.1', '7.1.2^1'));

    if (!r1 || !r2) return fail();

    expect(r1.answer).toMatchObject([{ valueString: 'hello' }]);
    expect(r2.answer).toMatchObject([{ valueString: 'world' }]);

    // select "Fra alle innleggelser/konsultasjoner" (4)
    choice = { code: '4', system: 'http://ehelse.no/JournalDeler' } as Coding;
    newState = selectChoice(newState, pathify('7', '7.1'), choice, { linkId: '7.1', type: 'choice' });

    r1 = getResponseItem('7.1.2', newState, pathify('7', '7.1', '7.1.2^0'));
    r2 = getResponseItem('7.1.2', newState, pathify('7', '7.1', '7.1.2^1'));
    if (!r1) return fail();

    expect(r1.answer).toMatchObject({});
    expect(r2).toBeUndefined();
  });
});
