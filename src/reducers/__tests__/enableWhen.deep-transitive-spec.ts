import { fail } from 'assert';

import { renderReferoWithStore, screen, userEvent, waitFor } from '@test/test-utils';

import type { Form } from '../form';
import type { Questionnaire } from 'fhir/r4';

import dataModel from './__data__/enableWhenDeepTransitive';
import { getResponseItem, pathify } from './utils';

describe('deep transitive wiping', () => {
  let newState: Form;

  beforeEach(() => {
    newState = dataModel.refero.form;
  });

  it('A=false wiper både B.1 og C.1 (via transitiv disable)', async () => {
    const { store } = await createWrapper(newState.FormDefinition.Content);
    //Click checkbox with label "A"
    await userEvent.click(screen.getByText('A'));
    //Click checkbox with label "B.1"
    await userEvent.click(await screen.findByText('B.1'));
    //Fill in text with label "C.1"
    await userEvent.type(await screen.findByLabelText('C.1'), 'hello');
    //Check that text input has value 'hello'
    expect(await screen.findByDisplayValue('hello')).toBeInTheDocument();
    let b1 = getResponseItem('B.1', store.getState().refero.form, pathify('B', 'B.1'));
    let c1 = getResponseItem('C.1', store.getState().refero.form, pathify('B', 'C', 'C.1'));
    if (!b1 || !c1) return fail();
    expect(b1.answer).toMatchObject([{ valueBoolean: true }]);
    expect(c1.answer).toMatchObject([{ valueString: 'hello' }]);

    // disable roten
    //Click checkbox with label "A"
    await userEvent.click(screen.getByText('A'));

    newState = store.getState().refero.form;
    b1 = getResponseItem('B.1', newState, pathify('B', 'B.1'));
    c1 = getResponseItem('C.1', newState, pathify('B', 'C', 'C.1'));
    if (!b1 || !c1) return fail();

    expect(b1.answer).toMatchObject([{ valueBoolean: false }]); // bool → false
    expect(c1.answer).toBeUndefined(); // string → tom
  });
});
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function createWrapper(questionnaire: Questionnaire | undefined | null) {
  return waitFor(async () => await renderReferoWithStore({ questionnaire, props: { authorized: true } }));
}
