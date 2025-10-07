import '../../util/__tests__/defineFetch';
import { Questionnaire } from 'fhir/r4';

import { q as questionnaireWithEnableWhen, prr, q2, q3 } from './__data__/enableWhen';
import { selectCheckboxOption } from '../../../test/selectors';
import { renderRefero, screen, userEvent, waitFor, within } from '../../../test/test-utils';

describe('enableWhen with checkboxes and multiple answers', () => {
  it('enableWhen should trigger when correct answer is selected', async () => {
    await createWrapper(questionnaireWithEnableWhen);
    expect(screen.queryByLabelText(/Flere sykdommer/i)).not.toBeInTheDocument();
    await selectCheckboxOption(/Andre sykdommer/i);

    expect(screen.getByLabelText(/Flere sykdommer/i)).toBeInTheDocument();
  });

  it('enableWhen should trigger when correct answer is selected along with other answers', async () => {
    await createWrapper(questionnaireWithEnableWhen);
    expect(screen.queryByLabelText(/Flere sykdommer/i)).not.toBeInTheDocument();
    await selectCheckboxOption(/Allergi/i);
    await selectCheckboxOption(/Hepatitt C/i);
    await selectCheckboxOption(/Andre sykdommer/i);

    expect(screen.getByLabelText(/Flere sykdommer/i)).toBeInTheDocument();
  });
});

describe.skip('enableWhen med repeterende gruppe på root', () => {
  it('skal ikke slette valg i repeterende grupper selv om de er på første nivå av items', async () => {
    await createWrapper(prr);
    // Velg alternativ 3 i item nr 1 (Andre legemidler)
    await userEvent.click(screen.getByText('Andre legemidler'));
    // Fyll ut tekstfelt som kommer opp
    await userEvent.type(within(screen.getByTestId('test-string-item_100%2E20%2E2%2E70')).getByRole('textbox'), 'abc');
    // Legg til nytt item
    await userEvent.click(screen.getByTestId('100-repeat-button'));
    // Velg alternativ 3 i item nr 2 (Andre legemidler)
    await userEvent.click(screen.getByTestId('item_100%2E3^1-2-radio-choice-label'));
    // Sjekk at tekst i item nr 1 fortsatt er der
    await waitFor(async () =>
      expect(within(screen.getByTestId('test-string-item_100%2E20%2E2%2E70')).getByRole('textbox')).toHaveValue('abc')
    );
  });

  it('skal slette valg i repeterende grupper når de blir disabled', async () => {
    await createWrapper(prr);
    // velg alternativ 3  i item nr 1
    await userEvent.click(screen.getByText('Andre legemidler'));
    //legg til text
    await userEvent.type(within(screen.getByTestId('test-string-item_100%2E20%2E2%2E70')).getByRole('textbox'), 'abc');
    //legg til nytt item
    await userEvent.click(screen.getByTestId('100-repeat-button'));
    //velg alternativ 3 i item nr 2
    await userEvent.click(screen.getAllByText('Andre legemidler')[1]);
    //legg til text i alternativ nr 2
    await userEvent.type(within(screen.getByTestId('test-string-item_100%2E20%2E2%2E70^1')).getByRole('textbox'), 'xyz');
    //velg alternativ 2 i item nr 2
    await userEvent.click(screen.getAllByText('Annen vaksine')[1]);
    //velg alternativ 3 i item nr 2
    await userEvent.click(screen.getAllByText('Andre legemidler')[1]);
    // sjekk at text i item nr 2 er borte
    await waitFor(async () =>
      expect(within(await screen.findByTestId('test-string-item_100%2E20%2E2%2E70^1')).getByRole('textbox')).not.toHaveValue('xyz')
    );
  });

  it('skal slette valg i repeterende grupper når de blir disabled - simple questionnaire', async () => {
    await createWrapper(q3);
    // velg alternativ 'Ja' i item nr 1
    await userEvent.click(screen.getByText('Ja'));
    //legg til text
    await userEvent.type(screen.getByTestId('item_1%2E2-string-label'), 'Dette er en test');
    //legg til nytt item
    await userEvent.click(screen.getByTestId('1-repeat-button'));
    //velg alternativ 'Ja' i item nr 2
    await userEvent.click(screen.getAllByText('Ja')[1]);
    //forventer at teksten i item nr 1 fortsatt er der

    expect(within(await screen.findByTestId('test-string-item_1%2E2')).getByRole('textbox')).toHaveValue('Dette er en test');
  });
  it('Når man endrer svar i gruppe med index 0 skal ikke svar i gruppe med index 1 bli påvirket', async () => {
    await createWrapper(prr);
    //Velg valg nr 3 (Andre legemidler) i item nr 1
    expect(await screen.findByTestId('item_100%2E3-2-radio-choice-label')).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('item_100%2E3-2-radio-choice-label'));

    //fyll ut tekstfelt som kommer opp
    expect(screen.getByTestId('item_100%2E20%2E2%2E70-string-label')).toBeInTheDocument();
    await userEvent.type(screen.getByTestId('item_100%2E20%2E2%2E70-string-label'), 'Dette er en test');

    //Legg til nytt item
    await userEvent.click(screen.getByTestId('100-repeat-button'));

    //Velg valg nr 3 (Andre legemidler) i item nr 2
    expect(screen.getByTestId('item_100%2E3^1-2-radio-choice-label')).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('item_100%2E3^1-2-radio-choice-label'));

    //Item nr 1 skal fortsatt ha svar i tekstfeltet
    const inputWrapper = await screen.findByTestId('test-string-item_100%2E20%2E2%2E70');
    await waitFor(() => expect(within(inputWrapper).getByDisplayValue('Dette er en test')).toBeInTheDocument());
  });
  it('skal ikke slette valg i første item når man fjerner valg i andre item', async () => {
    await createWrapper(prr);
    //Velg Andre legemidler i choice
    await userEvent.click(screen.getByText('Andre legemidler'));

    // fyll ut tekstfelt
    await userEvent.type(within(screen.getByTestId('test-string-item_100%2E20%2E2%2E70')).getByRole('textbox'), 'abc');

    //Legg til nytt item
    await userEvent.click(screen.getByTestId('100-repeat-button'));

    //Velg Andre legemidler i choice i andre item
    await userEvent.click(screen.getAllByText('Andre legemidler')[1]);

    //Fyll ut tekst i andre item
    await userEvent.type(within(screen.getByTestId('test-string-item_100%2E20%2E2%2E70^1')).getByRole('textbox'), 'xyz');

    //velg Annen vaksine i choice i andre item
    await userEvent.click(screen.getAllByText('Annen vaksine')[1]);

    //textinput i første item skal fortsatt ha verdi
    await waitFor(async () =>
      expect(within(await screen.findByTestId('test-string-item_100%2E20%2E2%2E70')).getByRole('textbox')).toHaveValue('abc')
    );
  });
});

describe.skip('choice  med repeat som første item, inneholder text som child', () => {
  it('enableWhen ikke slette svar i felter som ikke er barn', async () => {
    await createWrapper(q2);

    //Velg "Ja" i radioknapp og skriv i tekstfelt som kommer opp
    await userEvent.click(screen.getByText('Ja')); // 1 = Ja
    await userEvent.type(within(await screen.findByTestId('test-string-item_2')).getByRole('textbox'), 'abc');
    //legg til nytt item
    await userEvent.click(screen.getByText('Legg til'));

    //velg "Nei" i radioknapp i andre item
    await userEvent.click(screen.getAllByText('Nei')[1]);

    expect(within(await screen.findByTestId('test-string-item_2')).getByRole('textbox')).toHaveValue('abc');
  });

  it('skifter fra Ja→Nei i item #2 tømmer KUN tekst i item #2', async () => {
    await createWrapper(q2);

    // Instans #0: velg "Ja" og skriv tekst
    await userEvent.click(screen.getByText('Ja')); // 1 = Ja
    await userEvent.type(within(await screen.findByTestId('test-string-item_2')).getByRole('textbox'), 'abc');

    // Legg til instans #1
    await userEvent.click(screen.getByTestId('1-repeat-button'));

    // Instans #1: velg "Ja" og skriv tekst
    await userEvent.click(screen.getAllByText('Ja')[1]);
    await userEvent.type(within(screen.getByTestId('test-string-item_2^1')).getByRole('textbox'), 'xyz');

    // Skjul i instans #1 (velg "Nei")
    await userEvent.click(screen.getAllByText('Nei')[1]);
    await userEvent.click(screen.getAllByText('Ja')[1]);

    // Forvent: tekst i instans #1 er tømt
    await waitFor(async () => {
      expect(within(await screen.findByTestId('test-string-item_2^1')).getByRole('textbox')).not.toHaveValue('xyz');
    });
    // Forvent: tekst i instans #0 er uendret
    await waitFor(async () => {
      expect(within(await screen.findByTestId('test-string-item_2')).getByRole('textbox')).toHaveValue('abc');
    });
  });
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function createWrapper(questionnaire: Questionnaire) {
  return waitFor(async () => await renderRefero({ questionnaire, props: { authorized: true } }));
}
