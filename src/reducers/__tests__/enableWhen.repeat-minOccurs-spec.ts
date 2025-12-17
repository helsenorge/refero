import { renderReferoWithStore, screen, userEvent, waitFor } from '@test/test-utils';

import type { Form } from '../form';
import type { Questionnaire } from 'fhir/r4';

import dataModel from './__data__/enableWhenRepeatMinOccurs';
import { getResponseItem, pathify } from './utils';

describe('repeat removals honor minOccurs', () => {
  let newState: Form;

  beforeEach(() => {
    newState = dataModel.refero.form;
  });

  it('disable fjerner repeats utover minOccurs, men beholder to', async () => {
    const { store } = await createWrapper(newState.FormDefinition.Content);
    // enable først (A=true), deretter disable (A=false) for å trigge trimming på disable
    //Click checkbox with label "A?"
    await userEvent.click(await screen.findByTestId('item_A-label-boolean'));

    // chweck that we have 2 G items now in state and in DOM
    expect(await screen.findAllByText('G', { exact: true })).toHaveLength(2);
    newState = store.getState().refero.form;
    let g0 = getResponseItem('G', newState, pathify('G^0'));
    let g1 = getResponseItem('G', newState, pathify('G^1'));
    expect(g0?.item?.[0]?.answer).toEqual([{ valueBoolean: false }]);
    expect(g1?.item?.[0]?.answer).toEqual([{ valueBoolean: false }]);
    //repeat
    await userEvent.click(await screen.findByTestId('G-repeat-button'));

    // check that we have 3 G items now in state
    newState = store.getState().refero.form;
    g0 = getResponseItem('G', newState, pathify('G^0'));
    g1 = getResponseItem('G', newState, pathify('G^1'));
    let g2 = getResponseItem('G', newState, pathify('G^2'));
    expect(g0?.item?.[0]?.answer).toEqual([{ valueBoolean: false }]);
    expect(g1?.item?.[0]?.answer).toEqual([{ valueBoolean: false }]);
    expect(g2?.item?.[0]?.answer).toEqual([{ valueBoolean: false }]);

    //Click checkbox with label "A?"
    await userEvent.click(await screen.findByTestId('item_A-label-boolean'));
    //Click checkbox with label "A?"
    await userEvent.click(await screen.findByTestId('item_A-label-boolean'));

    //chweck that we have 2 G items now in state (3rd should be removed)
    newState = store.getState().refero.form;
    g0 = getResponseItem('G', newState, pathify('G^0'));
    g1 = getResponseItem('G', newState, pathify('G^1'));
    g2 = getResponseItem('G', newState, pathify('G^2')); // skal være fjernet

    expect(!!g0).toBe(true);
    expect(!!g1).toBe(true);
    expect(g2).toBeUndefined();
  });
});
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function createWrapper(questionnaire: Questionnaire | undefined | null) {
  return waitFor(async () => await renderReferoWithStore({ questionnaire, props: { authorized: true } }));
}
