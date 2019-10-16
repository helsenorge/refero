import enableWhenDataModel from './__data__/repeatableEnableWhen';
import { Form } from '../form';
import { QuestionnaireItem } from '../../types/fhir';
import { getQuestionnaireDefinitionItem, getDefinitionItems } from '../../util/skjemautfyller-core';
import { getResponseItem, clickRepeat, pathify, clickCheckbox, enterText } from './utils';

describe('update enable when action', () => {
  let newState: Form;
  let definitionItems: QuestionnaireItem[];

  beforeEach(() => {
    newState = enableWhenDataModel.skjemautfyller.form;
    const dItems = getDefinitionItems(newState.FormDefinition);
    if (!dItems || dItems.length === 0) {
      return fail();
    }
    definitionItems = dItems;
  });

  it('should remove added repeats and clear answers when collapsing enableWhens', () => {
    // add repeat item
    const qItem = getQuestionnaireDefinitionItem('8.1', definitionItems);
    const qrItem = getResponseItem('8.1^0', newState);
    if (!qItem || !qrItem) return fail();
    newState = clickRepeat(newState, pathify('8'), qItem, [qrItem]);

    // check first checkbox
    newState = clickCheckbox(newState, pathify('8', '8.1^0', '8.1.1^0'), true);

    // enter "hello"
    newState = enterText(newState, pathify('8', '8.1^0', '8.1.2^0'), 'hello');

    // check second checkbox
    newState = clickCheckbox(newState, pathify('8', '8.1^1', '8.1.1^1'), true);

    // enter "world"
    newState = enterText(newState, pathify('8', '8.1^1', '8.1.2^1'), 'world');

    let r1 = getResponseItem('8.1.2^0', newState);
    let r2 = getResponseItem('8.1.2^1', newState);
    if (!r1 || !r2) return fail();

    expect(r1.answer).toMatchObject([{ valueString: 'hello' }]);
    expect(r2.answer).toMatchObject([{ valueString: 'world' }]);

    // uncheck first checkbox
    newState = clickCheckbox(newState, pathify('8', '8.1^0', '8.1.1^0'), false);

    r1 = getResponseItem('8.1.2^0', newState);
    r2 = getResponseItem('8.1.2^1', newState);
    if (!r1 || !r2) return fail();

    expect(r1.answer).toMatchObject({});
    expect(r2.answer).toMatchObject([{ valueString: 'world' }]);
  });
});
