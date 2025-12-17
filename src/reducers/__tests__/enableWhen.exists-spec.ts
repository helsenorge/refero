import { fail } from 'assert';

import { renderReferoWithStore, screen, userEvent, waitFor } from '@test/test-utils';

import type { Form } from '../form';
import type { Questionnaire } from 'fhir/r4';

import dataModel from './__data__/enableWhenExcists';
import { getResponseItem, pathify } from './utils';

describe('enableWhen operator: exists/hasAnswer', () => {
  let newState: Form;

  beforeEach(() => {
    newState = dataModel.refero.form;
  });
  it('T er enabled når A.1 har svar, disabled + wipe når A.1 tømmes', async () => {
    const { store } = await createWrapper(newState.FormDefinition.Content);
    // gi A.1 verdi
    await userEvent.type(await screen.findByLabelText('A.1'), 'hello');
    // fyll T.1
    await userEvent.type(await screen.findByLabelText('T.1'), 'keeps?');

    // tøm A.1 -> exists=false => T disables og T.1 wipes (blir tomt svar-array)
    await userEvent.type(await screen.findByLabelText('A.1'), '{backspace}{backspace}{backspace}{backspace}{backspace}');
    expect(screen.queryByText('keeps?a')).not.toBeInTheDocument();
    newState = store.getState().refero.form;
    const t1 = getResponseItem('T.1', newState, pathify('T', 'T.1'));
    if (!t1) return fail();
    expect(t1.answer?.length ?? 0).toBe(0);
  });
});
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function createWrapper(questionnaire: Questionnaire | undefined | null) {
  return waitFor(async () => await renderReferoWithStore({ questionnaire, props: { authorized: true } }));
}
