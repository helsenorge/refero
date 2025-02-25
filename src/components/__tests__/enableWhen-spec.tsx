import '../../util/__tests__/defineFetch';
import userEvent from '@testing-library/user-event';
import { Questionnaire } from 'fhir/r4';

import { q as questionnaireWithEnableWhen, qRepeats, qRepeatsGroup, qBooleanField } from './__data__/enableWhen';
import { selectCheckboxOption } from '../../../test/selectors';
import { renderRefero, renderReferoWithRedux, screen, waitFor } from '../../../test/test-utils';

import { RootState } from '@/reducers';

const generateInputTextFromLabel = (label: string) => {
  return `${label} - input text`;
};

describe('enableWhen', () => {
  describe('enableWhen with repeated nested item', () => {
    it('enableWhen should trigger when correct answer is selected', async () => {
      await createWrapper(qRepeats);
      const confirmbtn = screen.getByLabelText(/Klikk for å åpne/i);
      expect(confirmbtn).toBeInTheDocument();
      await userEvent.click(confirmbtn);
      const nestedMultilineTextField = screen.getByLabelText(/skriv noe/i);
      expect(nestedMultilineTextField).toBeInTheDocument();
      const repeatButton = screen.getByTestId(/-repeat-button/i);
      expect(repeatButton).toBeInTheDocument();
      await userEvent.click(repeatButton);
      expect(screen.getAllByLabelText(/Klikk for å åpne/i).length).toBe(2);
      const secondConfirm = screen.getAllByLabelText(/Klikk for å åpne/i)[1];
      await userEvent.click(secondConfirm);
      expect(screen.getAllByLabelText(/skriv noe/i).length).toBe(2);
    });
    it('enableWhen should not trigger when unrleated item is triggered', async () => {
      await createWrapper(qRepeats);
      await userEvent.type(screen.getByLabelText(/unrelated number/i), '12');
      expect(screen.queryByLabelText(/skriv noe/i)).not.toBeInTheDocument();
    });
  });
  describe('questionnaire with confirmation behind enable', () => {
    it('confirmation should have answer if enabled', async () => {
      const { store } = await renderReferoWithRedux({ questionnaire: qBooleanField, props: { authorized: true } });
      await userEvent.type(screen.getByLabelText(/Skriv navn/i), 'test');
      await userEvent.click(screen.getByLabelText(/Navnet du har skrevet inn er riktig/i));

      await waitFor(async () => {
        expect(
          (store.getState() as RootState).refero.form.FormData.Content?.item?.[0]?.item?.[0]?.answer?.[0]?.item?.[0].answer
        ).toBeDefined();
      });
      await waitFor(async () => {
        expect(
          (store.getState() as RootState).refero.form.FormData.Content?.item?.[0]?.item?.[0]?.answer?.[0]?.item?.[0].answer?.[0]
            ?.valueBoolean
        ).toBe(true);
      });
    });
    it('confirmation should NOT have answer if disabled', async () => {
      const { store } = await renderReferoWithRedux({ questionnaire: qBooleanField, props: { authorized: true } });
      await waitFor(async () => {
        expect((store.getState() as RootState).refero.form.FormData.Content?.item?.[0]?.item?.[0]?.answer).toBeUndefined();
      });
      await waitFor(async () => {
        expect(
          (store.getState() as RootState).refero.form.FormData.Content?.item?.[0]?.item?.[0]?.answer?.[0]?.item?.[0].answer
        ).toBeUndefined();
      });
    });
  });
  describe('enableWhen with repeated nested group with item', () => {
    it('enableWhen should trigger when correct answer is selected', async () => {
      const skrivNoeInput1 = generateInputTextFromLabel('skriv noe');

      await createWrapper(qRepeatsGroup);
      await userEvent.click(screen.getByLabelText(/Klikk for å åpne/i));
      expect(screen.getByLabelText(/skriv noe/i)).toBeInTheDocument();
      await userEvent.click(screen.getByTestId(/-repeat-button/i));
      expect(screen.getAllByLabelText(/Klikk for å åpne/i).length).toBe(2);
      await userEvent.click(screen.getAllByLabelText(/Klikk for å åpne/i)[1]);
      expect(screen.getAllByLabelText(/skriv noe/i).length).toBe(2);
      await userEvent.type(screen.getAllByLabelText(/skriv noe/i)[1], skrivNoeInput1);
      expect(screen.getAllByLabelText(/skriv noe/i)[1]).toHaveValue(skrivNoeInput1);

      await waitFor(async () => {
        await userEvent.type(screen.getByLabelText(/nested enable when/i), 'test');
      });
      expect(screen.getByLabelText(/nested enable when/i)).toHaveValue('test');
      expect(await screen.findByLabelText(/turtles all the way down/i)).toBeInTheDocument();
    });
    it('enableWhen should not trigger when unrleated item is triggered', async () => {
      await createWrapper(qRepeatsGroup);
      await userEvent.type(screen.getByLabelText(/unrelated number/i), '12');
      expect(screen.queryByLabelText(/skriv noe/i)).not.toBeInTheDocument();
    });
    it('Answers should be removed when enableWhen is not met', async () => {
      const skrivNoeInput1 = generateInputTextFromLabel('skriv noe');

      await createWrapper(qRepeatsGroup);
      await userEvent.click(screen.getByLabelText(/Klikk for å åpne/i));
      expect(screen.getByLabelText(/skriv noe/i)).toBeInTheDocument();
      await userEvent.click(screen.getByTestId(/-repeat-button/i));
      expect(screen.getAllByLabelText(/Klikk for å åpne/i).length).toBe(2);
      await userEvent.click(screen.getAllByLabelText(/Klikk for å åpne/i)[1]);
      expect(screen.getAllByLabelText(/skriv noe/i).length).toBe(2);
      await userEvent.type(screen.getAllByLabelText(/skriv noe/i)[1], skrivNoeInput1);
      expect(screen.getAllByLabelText(/skriv noe/i)[1]).toHaveValue(skrivNoeInput1);

      await waitFor(async () => {
        await userEvent.type(screen.getByLabelText(/nested enable when/i), 'test');
      });
      expect(screen.getByLabelText(/nested enable when/i)).toHaveValue('test');
      expect(await screen.findByLabelText(/turtles all the way down/i)).toBeInTheDocument();
      await userEvent.click(screen.getByText(/Ja/i));
      expect(screen.getAllByLabelText(/skriv noe/i).length).toBe(2);
      await userEvent.click(screen.getAllByLabelText(/Klikk for å åpne/i)[1]);
      expect(screen.getAllByLabelText(/skriv noe/i).length).toBe(1);
      await userEvent.click(screen.getAllByLabelText(/Klikk for å åpne/i)[1]);
      expect(screen.getAllByLabelText(/skriv noe/i).length).toBe(2);
      expect(screen.getAllByLabelText(/skriv noe/i)[1]).toHaveValue('');
    });
  });

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
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function createWrapper(questionnaire: Questionnaire) {
  return await waitFor(async () => await renderRefero({ questionnaire, props: { authorized: true } }));
}
