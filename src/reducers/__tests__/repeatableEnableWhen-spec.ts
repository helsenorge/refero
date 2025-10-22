import { fail } from 'assert';

import { renderReferoWithStore, screen, userEvent, waitFor } from '@test/test-utils';
import { Questionnaire } from 'fhir/r4';

import { Form } from '../form';
import enableWhenDataModel from './__data__/repeatableEnableWhen';
import { getResponseItem, pathify } from './utils';

describe('update enable when action', () => {
  let newState: Form;

  beforeEach(() => {
    newState = enableWhenDataModel.refero.form;
  });

  it('should remove added repeats and clear answers when collapsing enableWhens', async () => {
    const { store } = await createWrapper(newState.FormDefinition.Content);
    // add repeat item
    await userEvent.click(await screen.findByTestId('8.1-repeat-button'));

    // check first checkbox
    await userEvent.click((await screen.findAllByText('Checkbox'))[0]);

    // enter "hello"
    await userEvent.type(await screen.findByLabelText('Analyse'), 'hello');

    // check second checkbox
    await userEvent.click((await screen.findAllByText('Checkbox'))[1]);

    // enter "world"
    await userEvent.type((await screen.findAllByLabelText('Analyse'))[1], 'world');
    expect(await screen.findByText('world')).toBeVisible();
    // verify both answers are present
    newState = store.getState().refero.form;
    let r1 = getResponseItem('8.1.2', newState, pathify('8', '8.1^0', '8.1.2'));
    if (!r1) return fail();

    let r2 = getResponseItem('8.1.2', newState, pathify('8', '8.1^1', '8.1.2'));
    if (!r2) return fail();

    expect(r1.answer).toMatchObject([{ valueString: 'hello' }]);
    expect(r2.answer).toMatchObject([{ valueString: 'world' }]);

    // uncheck first checkbox
    await userEvent.click((await screen.findAllByText('Checkbox'))[0]);

    // verify first repeat is removed and answer wiped, second remains
    expect(await screen.findAllByLabelText('Analyse')).toHaveLength(1);
    newState = store.getState().refero.form;
    // first repeat is removed, second remains with answer intact
    r1 = getResponseItem('8.1.2', newState, pathify('8', '8.1^0', '8.1.2'));
    r2 = getResponseItem('8.1.2', newState, pathify('8', '8.1^1', '8.1.2'));
    if (!r1 || !r2) return fail();

    expect(r1.answer).not.toMatchObject([{ valueString: 'hello' }]);
    expect(r2.answer).toMatchObject([{ valueString: 'world' }]);
  });
});
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function createWrapper(questionnaire: Questionnaire | undefined | null) {
  return waitFor(async () => await renderReferoWithStore({ questionnaire, props: { authorized: true } }));
}
