import { fail } from 'assert';

import { renderReferoWithStore, screen, userEvent, waitFor } from '@test/test-utils';
import { Questionnaire } from 'fhir/r4';

import { Form } from '../form';
import dataModels from './__data__/enableWhenAnyVsAll';
import { getResponseItem, pathify } from './utils';

describe('enableBehavior any vs all', () => {
  let newState: Form;
  it('ANY: ett sant vil enable; når det blir false wipes T.1', async () => {
    newState = dataModels.anyDataModel.refero.form;
    const { store } = await createWrapper(newState.FormDefinition.Content);
    newState = store.getState().refero.form;

    //Click checkbox with label "Spørsmål A1"
    await userEvent.click(screen.getByText('Spørsmål A1'));
    //Check that T.1 is visible
    expect(await screen.findByText('Spørsmål T1')).toBeVisible();
    //click checkbox with label "Spørsmål T1"
    await userEvent.click(screen.getByText('Spørsmål T1'));

    //Check that T.1 is checked
    newState = store.getState().refero.form;
    let t1 = getResponseItem('T.1', newState, pathify('T', 'T.1'));
    if (!t1) return fail();
    expect(t1.answer).toMatchObject([{ valueBoolean: true }]);

    //Click checkbox with label "Spørsmål A1" again to uncheck it
    await userEvent.click(screen.getByText('Spørsmål A1'));
    //Check that T.1 is not visible
    expect(screen.queryByText('Spørsmål T1')).toBeNull();

    //Check that T.1 is wiped (false)
    newState = store.getState().refero.form;
    t1 = getResponseItem('T.1', newState, pathify('T', 'T.1'));
    if (!t1) return fail();
    expect(t1.answer).toMatchObject([{ valueBoolean: false }]);
  });

  it('ALL: alle må være sanne; sette én til false skal wipe', async () => {
    newState = dataModels.allDataModel.refero.form;
    const { store } = await createWrapper(newState.FormDefinition.Content);
    newState = store.getState().refero.form;
    //Click checkbox with label "Spørsmål A1"
    await userEvent.click(screen.getByText('Spørsmål A1'));
    //Click checkbox with label "Spørsmål A2"
    await userEvent.click(screen.getByText('Spørsmål A2'));
    //Check that T.1 is visible
    expect(await screen.findByText('Spørsmål T1')).toBeVisible();
    //click checkbox with label "Spørsmål T1"
    await userEvent.click(screen.getByText('Spørsmål T1'));

    //Check that T.1 is checked
    newState = store.getState().refero.form;
    const t1 = getResponseItem('T.1', newState, pathify('T', 'T.1'));
    if (!t1) return fail();
    expect(t1.answer).toMatchObject([{ valueBoolean: true }]);

    //Click checkbox with label "Spørsmål A2" again to uncheck it
    await userEvent.click(screen.getByText('Spørsmål A2'));
    //Check that T.1 is not visible
    expect(screen.queryByText('Spørsmål T1')).toBeNull();

    //Check that T.1 is wiped (false)
    newState = store.getState().refero.form;
    const t1After = getResponseItem('T.1', newState, pathify('T', 'T.1'));
    if (!t1After) return fail();
    expect(t1After.answer).toMatchObject([{ valueBoolean: false }]);
  });
});
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function createWrapper(questionnaire: Questionnaire | undefined | null) {
  return waitFor(async () => await renderReferoWithStore({ questionnaire, props: { authorized: true } }));
}
