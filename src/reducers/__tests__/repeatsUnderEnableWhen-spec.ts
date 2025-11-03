import { fail } from 'assert';

import { renderReferoWithStore, screen, userEvent, waitFor } from '@test/test-utils';
import { Questionnaire } from 'fhir/r4';

import { Form } from '../form';
import enableWhenDataModel from './__data__/repeatsUnderEnableWhen';
import { pathify, getResponseItem } from './utils';

describe('update enable when action', () => {
  let newState: Form;

  beforeEach(() => {
    newState = enableWhenDataModel.refero.form;
  });

  it('should remove added repeats and clear answers when collapsing enableWhens', async () => {
    // select "Fra en eller flere avdelinger" (3)
    const { store } = await createWrapper(newState.FormDefinition.Content);
    //Click checkbox with label "Fra en eller flere avdelinger"
    await userEvent.click(screen.getByText('Fra en eller flere avdelinger'));
    //see that text with label "Oppgi avdeling(er) du ønsker kopi av journal fra:" is present
    expect(await screen.findByText('Oppgi avdeling(er) du ønsker kopi av journal fra:')).toBeInTheDocument();
    //fill text in item #1
    await userEvent.type(await screen.findByLabelText('Oppgi avdeling(er) du ønsker kopi av journal fra:'), 'hello');
    //see that text is present in the document
    expect(await screen.findByText('hello')).toBeInTheDocument();
    //repeat item
    await waitFor(() => expect(screen.getByTestId('7.1.2-repeat-button')).toBeEnabled());
    await userEvent.click(await screen.findByTestId('7.1.2-repeat-button'));

    //See that there are two text inputs with the same label
    await waitFor(async () => expect(await screen.findAllByLabelText('Oppgi avdeling(er) du ønsker kopi av journal fra:')).toHaveLength(2));
    //fill text in item #2
    const inputs = await screen.findAllByLabelText('Oppgi avdeling(er) du ønsker kopi av journal fra:');
    await userEvent.type(inputs[1], 'world');

    //see that text is present in the document
    await waitFor(async () => expect(await screen.findByText('world')).toBeInTheDocument());
    //check that both answers are present in state
    newState = store.getState().refero.form;
    let r1 = getResponseItem('7.1.2', newState, pathify('7', '7.1', '7.1.2^0'));
    let r2 = getResponseItem('7.1.2', newState, pathify('7', '7.1', '7.1.2^1'));

    if (!r1 || !r2) return fail();
    //check that both answers are present in state
    expect(r1.answer).toMatchObject([{ valueString: 'hello' }]);
    expect(r2.answer).toMatchObject([{ valueString: 'world' }]);
    //select "Fra alle innleggelser/konsultasjoner" (4)
    await userEvent.click(screen.getByText('Fra alle innleggelser/konsultasjoner'));

    //See that there is only one text input with the same label
    await waitFor(async () => expect(screen.queryAllByLabelText('Oppgi avdeling(er) du ønsker kopi av journal fra:')).toHaveLength(0));
    //Click the original checkbox again to see that the text input is back and empty
    await userEvent.click(screen.getByText('Fra en eller flere avdelinger'));
    expect(await screen.findAllByText('Oppgi avdeling(er) du ønsker kopi av journal fra:')).toHaveLength(1);
    //see that text with value "hello" is not present in the document
    await waitFor(() => expect(screen.queryByText('hello')).not.toBeInTheDocument());
    //see that text with value "world" is not present in the document
    await waitFor(() => expect(screen.queryByText('world')).not.toBeInTheDocument());

    newState = store.getState().refero.form;
    //check that both answers are removed from state
    r1 = getResponseItem('7.1.2', newState, pathify('7', '7.1', '7.1.2^0'));
    r2 = getResponseItem('7.1.2', newState, pathify('7', '7.1', '7.1.2^1'));
    if (!r1) return fail();
    expect(r1).toMatchObject({
      linkId: '7.1.2',
      text: 'Oppgi avdeling(er) du ønsker kopi av journal fra:',
    });
    expect(r1.answer).toBeUndefined();
    expect(r2).toBeUndefined();
  });
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function createWrapper(questionnaire: Questionnaire | undefined | null) {
  return waitFor(async () => await renderReferoWithStore({ questionnaire, props: { authorized: true } }));
}
