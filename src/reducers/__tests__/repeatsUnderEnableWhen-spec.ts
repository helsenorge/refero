import enableWhenDataModel from './__data__/repeatsUnderEnableWhen';
import { Form } from '../form';
import { Coding, QuestionnaireItem } from '../../types/fhir';
import { getQuestionnaireDefinitionItem, getDefinitionItems } from '../../util/skjemautfyller-core';
import { pathify, selectChoice, getResponseItem, enterText, clickRepeat } from './utils';

describe('update enable when action', () => {
  let newState: Form;
  let definitionItems: QuestionnaireItem[];

  beforeEach(() => {
    newState = enableWhenDataModel.skjemautfyller.form;
    let dItems = getDefinitionItems(newState.FormDefinition);
    if (!dItems || dItems.length === 0) {
      return fail();
    }
    definitionItems = dItems;
  });

  it('should remove added repeats and clear answers when collapsing enableWhens', () => {
    // select "Fra en eller flere avdelinger" (3)
    let choice = <Coding>{ code: '3', system: { value: 'http://ehelse.no/JournalDeler' } };
    newState = selectChoice(newState, pathify('7', '7.1'), choice, { linkId: '7.1', type: 'choice' });

    // add repeat item
    let item = getQuestionnaireDefinitionItem('7.1.2', definitionItems);
    if (!item) return fail();
    newState = clickRepeat(newState, pathify('7', '7.1'), item, [{ linkId: '7.1.2^0' }]);

    // enter "hello"
    newState = enterText(newState, pathify('7', '7.1', '7.1.2^0'), 'hello');

    // enter "world"
    newState = enterText(newState, pathify('7', '7.1', '7.1.2^1'), 'world');

    let r1 = getResponseItem('7.1.2^0', newState);
    let r2 = getResponseItem('7.1.2^1', newState);
    if (!r1 || !r2) return fail();

    expect(r1.answer).toMatchObject([{ valueString: 'hello' }]);
    expect(r2.answer).toMatchObject([{ valueString: 'world' }]);

    // select "Fra alle innleggelser/konsultasjoner" (4)
    choice = <Coding>{ code: '4', system: { value: 'http://ehelse.no/JournalDeler' } };
    newState = selectChoice(newState, pathify('7', '7.1'), choice, { linkId: '7.1', type: 'choice' });

    r1 = getResponseItem('7.1.2^0', newState);
    r2 = getResponseItem('7.1.2^1', newState);
    if (!r1) return fail();

    expect(r1.answer).toMatchObject({});
    expect(r2).toBeUndefined();
  });
});
