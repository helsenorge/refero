import { fail } from 'assert';

import { renderReferoWithStore, screen, userEvent, waitFor } from '@test/test-utils';

import type { Form } from '../form';
import type { Questionnaire } from 'fhir/r4';

import enableWhenDataModel from './__data__/multipleEnableWhen';
import { getResponseItem, pathify } from './utils';

describe('questionnaire with multiple dependent enable when items', () => {
  let newState: Form;

  beforeEach(() => {
    newState = enableWhenDataModel.refero.form;
    // const dItems = getDefinitionItems(newState.FormDefinition);
    // if (!dItems || dItems.length === 0) {
    //   return fail();
    // }
    // definitionItems = dItems;
  });

  it('should clear all answers when enable when parent enableWhen is false', async () => {
    // check first checkbox
    const { store } = await createWrapper(newState.FormDefinition.Content);
    //Click checkbox with label "Vet du hva du trenger nå?"
    await userEvent.click(screen.getByText('Vet du hva du trenger nå?'));
    //Click checkbox with label "Er selvhjelpsverkøy noe du ønsker å forsøke?"
    await userEvent.click(screen.getByText('Er selvhjelpsverkøy noe du ønsker å forsøke?'));
    //Click checkbox with label "Sliter med en eller flere av disse utfordringene?"
    await userEvent.click(screen.getByText('Sliter med en eller flere av disse utfordringene?'));

    // should now see the next question with label "Opplever du at du er engstelig eller redd?"
    expect(await screen.findByText('Opplever du at du er engstelig eller redd?')).toBeInTheDocument();
    //fill in text in the textfield
    await userEvent.type(await screen.findByLabelText('Opplever du at du er engstelig eller redd?'), 'hello');

    //see that text is present in the document
    expect(await screen.findByText('hello')).toBeInTheDocument();

    //Check state to see that the answer is present in the store
    newState = store.getState().refero.form;
    let responseItem31 = getResponseItem('3.1', newState, pathify('3', '3.1'));

    if (!responseItem31) return fail();
    expect(responseItem31.answer).toMatchObject([{ valueBoolean: true }]);

    //Click checkbox with label "Vet du hva du trenger nå?"
    await userEvent.click(screen.getByText('Vet du hva du trenger nå?'));

    newState = store.getState().refero.form;
    const responseItem21 = getResponseItem('2.1', newState, pathify('2', '2.1'));
    if (!responseItem21) return fail();
    expect(responseItem21.answer).toMatchObject([{ valueBoolean: false }]);

    responseItem31 = getResponseItem('3.1', newState, pathify('3', '3.1'));
    if (!responseItem31) return fail();
    expect(responseItem31.answer).toMatchObject([{ valueBoolean: false }]);
  });
});
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function createWrapper(questionnaire: Questionnaire | undefined | null) {
  return waitFor(async () => await renderReferoWithStore({ questionnaire, props: { authorized: true } }));
}
