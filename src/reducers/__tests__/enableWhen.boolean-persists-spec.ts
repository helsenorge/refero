import { fail } from 'assert';

import { renderReferoWithStore, screen, userEvent, waitFor } from '@test/test-utils';

import type { Form } from '../form';
import type { Questionnaire } from 'fhir/r4';

import dataModel from './__data__/enableWhenBooleanPersists';
import { getResponseItem, pathify } from './utils';

describe('booleans keep explicit value when hidden (enableWhen)', () => {
  let newState: Form;

  beforeEach(() => {
    newState = dataModel.refero.form;
  });

  it('2.1 og 3.1 blir eksplisitt false når 1.1 settes false', async () => {
    const { store } = await createWrapper(newState.FormDefinition.Content);
    // Skru på kjeden 1.1 -> 2.1 -> 3.1
    // newState = await clickCheckbox(newState, pathify('1', '1.1'), true, getQuestionnaireDefinitionItem('1.1', definitionItems));
    //Click checkbox with label "Vet du hva du trenger nå?"
    await userEvent.click(screen.getByText('Vet du hva du trenger nå?'));
    //Click checkbox with label "Ønsker du selvhjelp?"
    await userEvent.click(await screen.findByText('Ønsker du selvhjelp?'));

    //Click checkbox with label "Har du utfordringer?"
    await userEvent.click(await screen.findByText('Har du utfordringer?'));

    //Click checkbox with label "Vet du hva du trenger nå?"
    // slå av 1.1 => begge etterkommere skjules og skal bli false (ikke tomme)
    await userEvent.click(screen.getByText('Vet du hva du trenger nå?'));

    //Check store that boolean answers are false, not undefined/null/empty
    newState = store.getState().refero.form;
    const ri21 = getResponseItem('2.1', newState, pathify('2', '2.1'));
    const ri31 = getResponseItem('3.1', newState, pathify('3', '3.1'));

    if (!ri21 || !ri31) return fail();

    expect(ri21.answer).toMatchObject([{ valueBoolean: false }]);
    expect(ri31.answer).toMatchObject([{ valueBoolean: false }]);
  });

  it('re-enable påvirker ikke wiped verdi (verdier kommer ikke tilbake automatisk)', async () => {
    const { store } = await createWrapper(newState.FormDefinition.Content);

    //Click checkbox with label "Vet du hva du trenger nå?"
    await userEvent.click(screen.getByText('Vet du hva du trenger nå?'));
    //Click checkbox with label "Ønsker du selvhjelp?"
    await userEvent.click(await screen.findByText('Ønsker du selvhjelp?'));
    //Click checkbox with label "Har du utfordringer?"
    await userEvent.click(await screen.findByText('Har du utfordringer?'));
    //Click checkbox with label "Vet du hva du trenger nå?"
    // slå av 1.1 -> wipes under
    await userEvent.click(screen.getByText('Vet du hva du trenger nå?'));
    // newState = await clickCheckbox(newState, pathify('1', '1.1'), false, getQuestionnaireDefinitionItem('1.1', definitionItems));

    //Click checkbox with label "Vet du hva du trenger nå?"
    // skru på igjen 1.1
    await userEvent.click(screen.getByText('Vet du hva du trenger nå?'));

    newState = store.getState().refero.form;
    const ri21 = getResponseItem('2.1', newState, pathify('2', '2.1'));
    const ri31 = getResponseItem('3.1', newState, pathify('3', '3.1'));

    if (!ri21 || !ri31) return fail();
    // den er fortsatt false (default), ikke auto-restored til true
    expect(ri21.answer).toMatchObject([{ valueBoolean: false }]);
    expect(ri31.answer).toMatchObject([{ valueBoolean: false }]);
  });
});
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function createWrapper(questionnaire: Questionnaire | undefined | null) {
  return waitFor(async () => await renderReferoWithStore({ questionnaire, props: { authorized: true } }));
}
