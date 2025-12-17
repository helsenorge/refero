import { fail } from 'assert';

import { renderReferoWithStore, screen, userEvent, waitFor } from '@test/test-utils';

import type { Form } from '../form';
import type { Questionnaire } from 'fhir/r4';

import dataModel from './__data__/enableWhenCodingWipe';
import { pathify, getResponseItem } from './utils';

describe('wiping of coding answers on disable', () => {
  let newState: Form;

  beforeEach(() => {
    newState = dataModel.refero.form;
  });

  it('setter C.1 til tomt når A=false etter at valg er gjort', async () => {
    const { store } = await createWrapper(newState.FormDefinition.Content);

    //Click checkbox with label "A"
    await userEvent.click(screen.getByText('A'));
    // velg coding
    await userEvent.click(screen.getByText('x'));
    //check that radio with text x is checked
    expect(await screen.findByRole('radio', { name: 'C1 x' })).toBeChecked();

    //Click checkbox with label "A"
    await userEvent.click(screen.getByText('A'));
    //x is not visible
    expect(screen.queryByText('x')).toBeNull();
    //Click checkbox with label "A" to show C.1 again
    await userEvent.click(screen.getByText('A'));
    //C.1 should be unchecked
    expect(screen.getByRole('radio', { name: 'C1 x' })).not.toBeChecked();

    //check that the state has been wiped
    newState = store.getState().refero.form;
    const c1 = getResponseItem('C.1', newState, pathify('C', 'C.1'));
    if (!c1) return fail();
    expect(c1.answer?.length ?? 0).toBe(0);
  });
});
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function createWrapper(questionnaire: Questionnaire | undefined | null) {
  return waitFor(async () => await renderReferoWithStore({ questionnaire, props: { authorized: true } }));
}
