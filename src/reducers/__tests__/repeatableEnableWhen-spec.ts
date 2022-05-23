import enableWhenDataModel from './__data__/repeatableEnableWhen';
import { Form } from '../form';
import { QuestionnaireItem } from '../../types/fhir';
import { getQuestionnaireDefinitionItem, getDefinitionItems } from '../../util/refero-core';
import { getResponseItem, clickRepeat, pathify, clickCheckbox, enterText } from './utils';

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
    // add repeat item
    const qItem = getQuestionnaireDefinitionItem('8.1', definitionItems);
    const qrItem = getResponseItem('8.1', newState, [{ linkId: '8' }, { linkId: '8.1', index: 0 }]);
    if (!qItem || !qrItem) return fail();
    newState = clickRepeat(newState, pathify('8'), qItem, [qrItem]);

    // check first checkbox
    newState = clickCheckbox(newState, pathify('8', '8.1^0', '8.1.1'), true);

    // enter "hello"
    newState = enterText(newState, pathify('8', '8.1^0', '8.1.2'), 'hello');

    // check second checkbox
    newState = clickCheckbox(newState, pathify('8', '8.1^1', '8.1.1'), true);

    // enter "world"
    newState = enterText(newState, pathify('8', '8.1^1', '8.1.2'), 'world');

    let r1 = getResponseItem('8.1.2', newState, pathify('8', '8.1^0', '8.1.2'));
    if (!r1) return fail();

    let r2 = getResponseItem('8.1.2', newState, pathify('8', '8.1^1', '8.1.2'));
    if (!r2) return fail();

    expect(r1.answer).toMatchObject([{ valueString: 'hello' }]);
    expect(r2.answer).toMatchObject([{ valueString: 'world' }]);

    // uncheck first checkbox
    newState = clickCheckbox(newState, pathify('8', '8.1^0', '8.1.1^0'), false);

    r1 = getResponseItem('8.1.2', newState, pathify('8', '8.1^0', '8.1.2'));
    r2 = getResponseItem('8.1.2', newState, pathify('8', '8.1^1', '8.1.2'));
    if (!r1 || !r2) return fail();

    expect(r1.answer).toMatchObject({});
    expect(r2.answer).toMatchObject([{ valueString: 'world' }]);
  });
});
