/* tslint:disable */
import { fail } from 'assert';

import { renderReferoWithStore, screen, userEvent, waitFor } from '@test/test-utils';


import type { AppStore } from '..';
import type { Form } from '../form';
import type { Questionnaire } from 'fhir/r4';

import dataModel from './__data__/enableWhenAndWipingAnswers';
import { getResponseItem, pathifyExpand } from './utils';

describe('wipe answers when collapsing enable whens', () => {
  let newState: Form;

  beforeEach(() => {
    newState = dataModel.refero.form;
  });
  it('should remove added repeats and clear answers when collapsing toplevel enableWhen', async () => {
    const { store } = await createWrapper(newState.FormDefinition.Content);
    newState = (await fillOutForm(store)) as Form;
    if (!newState) return fail();

    //Click checkbox with label "Klikk for å åpne"
    await userEvent.click(screen.getByText('Klikk for å åpne'));
    newState = store.getState().refero.form;
    const i1 = getResponseItem('1', newState, pathifyExpand('1'));
    const i11 = getResponseItem('1.1', newState, pathifyExpand('1.1'));
    const i111 = getResponseItem('1.1.1', newState, pathifyExpand('1.1.1'));
    const i1111 = getResponseItem('1.1.1.1', newState, pathifyExpand('1.1.1.1'));
    const i2 = getResponseItem('2', newState, pathifyExpand('2'));
    const i21 = getResponseItem('2.1', newState, pathifyExpand('2.1'));

    if (!i1 || !i11 || !i111 || !i1111 || !i2 || !i21) {
      return fail();
    }

    expect(i1.answer![0]).toHaveProperty('valueBoolean', false);

    // answers are wiped completely -> arrays should be empty
    expect(i11.answer).toEqual([
      {
        item: [
          {
            linkId: '1.1.1',
            text: 'nested enable when',
            answer: [
              {
                item: [
                  {
                    linkId: '1.1.1.1',
                    text: 'turtles all the way down',
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);
    expect(i111.answer).toEqual([
      {
        item: [
          {
            linkId: '1.1.1.1',
            text: 'turtles all the way down',
          },
        ],
      },
    ]);
    expect(i1111.answer).toBeUndefined();

    // unrelated branch intact
    expect(i2.answer![0]).toHaveProperty('valueBoolean', true);
    expect(i21.answer![0]).toHaveProperty('valueString', 'unrelated');
  });
  it('should remove added repeats and clear answers when collapsing sublevel enableWhen', async () => {
    const { store } = await createWrapper(newState.FormDefinition.Content);
    newState = (await fillOutForm(store)) as Form;
    if (!newState) return fail();

    await userEvent.type(await screen.findByLabelText('skriv noe'), '{backspace}{backspace}{backspace}{backspace}{backspace}');
    newState = store.getState().refero.form;
    const i1 = getResponseItem('1', newState, pathifyExpand('1'));
    const i11 = getResponseItem('1.1', newState, pathifyExpand('1.1'));
    const i111 = getResponseItem('1.1.1', newState, pathifyExpand('1.1.1'));
    const i1111 = getResponseItem('1.1.1.1', newState, pathifyExpand('1.1.1.1'));
    const i2 = getResponseItem('2', newState, pathifyExpand('2'));
    const i21 = getResponseItem('2.1', newState, pathifyExpand('2.1'));

    if (!i1 || !i11 || !i111 || !i1111 || !i2 || !i21) {
      return fail();
    }

    expect(i1.answer![0]).toHaveProperty('valueBoolean', true);

    // Parent 1.1 keeps a single structural answer (with only `item`)
    expect(i11.answer).toHaveLength(1);
    expect(i11.answer![0]).not.toHaveProperty('valueString');

    // Children are wiped completely
    expect(i111.answer).toEqual([
      {
        item: [
          {
            linkId: '1.1.1.1',
            text: 'turtles all the way down',
          },
        ],
      },
    ]);
    expect(i1111.answer).toBeUndefined();

    // Unrelated branch intact
    expect(i2.answer![0]).toHaveProperty('valueBoolean', true);
    expect(i21.answer![0]).toHaveProperty('valueString', 'unrelated');
  });
});

async function fillOutForm(store: AppStore): Promise<Form | undefined> {
  await userEvent.click(screen.getByText('Klikk for å åpne'));

  await userEvent.type(await screen.findByLabelText('skriv noe'), 'hello');

  await userEvent.type(await screen.findByLabelText('nested enable when'), 'world');

  await userEvent.click(await screen.findByText('Ja'));

  await userEvent.click(await screen.findByText('unrelated'));
  await userEvent.type(await screen.findByLabelText('urelated nested'), 'unrelated');

  return store.getState().refero.form;
}
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function createWrapper(questionnaire: Questionnaire | undefined | null) {
  return waitFor(async () => await renderReferoWithStore({ questionnaire, props: { authorized: true } }));
}
