/* tslint:disable */
import { fail } from 'assert';

import { renderReferoWithStore, screen, userEvent, waitFor } from '@test/test-utils';
import { Questionnaire } from 'fhir/r4';

import { AppStore } from '..';
import { Form } from '../form';
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

    // remove "hello" answer
    // const qItem = getQuestionnaireDefinitionItem('1.1', definitionItems);
    await userEvent.type(await screen.findByLabelText('skriv noe'), '{backspace}{backspace}{backspace}{backspace}{backspace}');
    // if (!qItem) return fail();
    // newState = await enterText(newState, pathifyExpand('1.1'), '', qItem);
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
  // let qItem = getQuestionnaireDefinitionItem('1', definitionItems);
  // if (!qItem) return;
  //Click checkbox with label "Klikk for å åpne"
  await userEvent.click(screen.getByText('Klikk for å åpne'));

  // qItem = getQuestionnaireDefinitionItem('1.1', definitionItems);
  // if (!qItem) return;
  // newState = await enterText(newState, pathifyExpand('1.1'), 'hello', qItem);
  //Fill out first enable when question
  await userEvent.type(await screen.findByLabelText('skriv noe'), 'hello');
  // qItem = getQuestionnaireDefinitionItem('1.1.1', definitionItems);
  // if (!qItem) fail();
  // newState = await enterText(newState, pathifyExpand('1.1.1'), 'world', qItem);
  //fill out nested enable when question
  await userEvent.type(await screen.findByLabelText('nested enable when'), 'world');
  // qItem = getQuestionnaireDefinitionItem('1.1.1.1', definitionItems);
  // if (!qItem) fail();
  // newState = await selectChoice(newState, pathifyExpand('1.1.1.1'), createCoding('1', 'urn:oid:2.16.578.1.12.4.1.1101'), qItem, false);
  //Select option "Ja" (in turtles all the way down)
  await userEvent.click(await screen.findByText('Ja'));
  // qItem = getQuestionnaireDefinitionItem('2', definitionItems);
  // if (!qItem) fail();
  // newState = await clickCheckbox(newState, pathifyExpand('2'), true, qItem);
  //Click checkbox with label "unrelated"
  await userEvent.click(await screen.findByText('unrelated'));
  // qItem = getQuestionnaireDefinitionItem('2.1', definitionItems);
  // if (!qItem) fail();
  await userEvent.type(await screen.findByLabelText('urelated nested'), 'unrelated');
  // newState = await enterText(newState, pathifyExpand('2.1'), 'unrelated', qItem);

  return store.getState().refero.form;
}
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function createWrapper(questionnaire: Questionnaire | undefined | null) {
  return waitFor(async () => await renderReferoWithStore({ questionnaire, props: { authorized: true } }));
}
