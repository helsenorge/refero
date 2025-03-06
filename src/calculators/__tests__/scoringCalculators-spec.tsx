import { renderRefero, screen, waitFor, within } from '@test/test-utils';
import userEvent from '@testing-library/user-event';
import { Questionnaire } from 'fhir/r4';

import q from './__data__';

import { ReferoProps } from '@/types/referoProps';

describe('scoring calculations', () => {
  describe('Input scoring and calculation and copying of scoringvalue', () => {
    it('should render', async () => {
      await createWrapper(q);
      expect(screen.getByTestId('item_Gjennomsnitt')).toBeInTheDocument();
    });
    it('should calculate the based on the input values', async () => {
      await createWrapper(q);
      const input1 = screen.getByTestId('item_verdi1-0-radio-choice');
      const input2 = screen.getByTestId('item_verdi2-0-radio-choice');
      const input3 = screen.getByTestId('item_verdi3-1-radio-choice');
      const input4 = screen.getByTestId('item_verdi4-0-radio-choice');

      const delsum = screen.getByTestId('item_Delsum-readonly');
      const totalsum = screen.getByTestId('item_Totalsum-readonly');
      const aritmetisk_gjennomsnitt = screen.getByTestId('item_aritmetisk_gjennomsnitt-readonly');
      const Kopi = screen.getByTestId('item_aritmetisk_gjennomsnitt_kopi-readonly');
      expect(delsum).toHaveTextContent('DelsumIkke besvart');
      expect(totalsum).toHaveTextContent('TotalsumIkke besvart');
      expect(aritmetisk_gjennomsnitt).toHaveTextContent('Aritmetisk gjennomsnitt basert på totalsum.Ikke besvar');
      expect(Kopi).toHaveTextContent('Aritmetisk gjennomsnitt basert på kopiert feltIkke besvart');

      await waitFor(async () => await userEvent.click(within(input1).getByLabelText('Ja')));
      await waitFor(async () => await userEvent.click(within(input2).getByLabelText('Ja')));
      await waitFor(async () => await userEvent.click(within(input3).getByLabelText('Nei')));
      await waitFor(async () => await userEvent.click(within(input4).getByLabelText('Ja')));
      const kopiertFelt = screen.getByTestId('item_kopiert_felt-readonly');

      expect(delsum).toHaveTextContent('Delsum500');

      expect(totalsum).toHaveTextContent('Totalsum500');
      expect(aritmetisk_gjennomsnitt).toHaveTextContent('Aritmetisk gjennomsnitt basert på totalsum.125');
      expect(kopiertFelt).toHaveTextContent('Kopi500');
      expect(Kopi).toHaveTextContent('Aritmetisk gjennomsnitt basert på kopiert felt125');
    });
  });
  describe('only scoring', () => {
    it('should calculate the based on the input values', async () => {
      await createWrapper(q);
      const tall1 = screen.getByLabelText('Tall 1');
      const tall2 = screen.getByLabelText('Tall 2');

      const delsum = screen.getByLabelText('Sum');
      const average = screen.getByLabelText('Gjennomsnitt');

      expect(delsum).not.toHaveValue();
      expect(average).not.toHaveValue();

      await waitFor(async () => await userEvent.type(tall1, '10'));
      await waitFor(async () => await userEvent.type(tall2, '20'));

      expect(tall1).toHaveValue(10);
      expect(tall2).toHaveValue(20);

      expect(delsum).toHaveValue(30);
      expect(average).toHaveValue(15);
    });
  });
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function createWrapper(q: Questionnaire, props?: Partial<ReferoProps>) {
  return renderRefero({ questionnaire: q, props });
}
