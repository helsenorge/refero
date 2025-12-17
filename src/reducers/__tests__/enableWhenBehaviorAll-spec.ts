import { fail } from 'assert';

import { renderReferoWithStore, screen, userEvent, waitFor } from '@test/test-utils';

import type { Form } from '../form';
import type { Questionnaire } from 'fhir/r4';

import enableWhenDataModel from './__data__/enableWhenBehaviorAll';
import { getResponseItem, pathify } from './utils';

describe('questionnaire with enableWhen behavior all', () => {
  let newState: Form;

  beforeEach(() => {
    newState = enableWhenDataModel.refero.form;
  });

  it('should clear answer when one enableWhen condition is false', async () => {
    const { store } = await createWrapper(newState.FormDefinition.Content);
    //Click checkbox with label "Spørsmål 1.1"
    await userEvent.click(screen.getByText('Spørsmål 1.1'));
    //Click checkbox with label "Spørsmål 1.2"
    await userEvent.click(screen.getByText('Spørsmål 1.2'));
    //Click checkbox with label "Vises bare dersom alle over er krysset av"
    await userEvent.click(await screen.findByText('Vises bare dersom alle over er krysset av'));
    //Verify that item 2.1 (Vises bare dersom alle over er krysset av) is checked
    expect(await screen.findByLabelText('Vises bare dersom alle over er krysset av')).toBeChecked();
    //Verify that item 2.1 (Vises bare dersom alle over er krysset av) has answer true in state
    newState = store.getState().refero.form;
    let responseItem21 = getResponseItem('2.1', newState, pathify('2', '2.1'));

    if (!responseItem21) return fail();
    expect(responseItem21.answer).toMatchObject([{ valueBoolean: true }]);
    //Click checkbox with label "Spørsmål 1.1"
    await userEvent.click(screen.getByText('Spørsmål 1.1'));

    newState = store.getState().refero.form;

    responseItem21 = getResponseItem('2.1', newState, pathify('2', '2.1'));
    if (!responseItem21) return fail();
    expect(responseItem21.answer).toMatchObject([{ valueBoolean: false }]);
  });
});
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function createWrapper(questionnaire: Questionnaire | undefined | null) {
  return waitFor(async () => await renderReferoWithStore({ questionnaire, props: { authorized: true } }));
}
