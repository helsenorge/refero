import { renderRefero, screen, waitFor, within } from '@test/test-utils';
import userEvent from '@testing-library/user-event';
import { Questionnaire } from 'fhir/r4';

import q from './__data__';

import { ReferoProps } from '@/types/referoProps';

describe('scoring calculations', () => {
  describe('Input scoring and calculation and copying of scoringvalue', () => {
    it('should render', async () => {
      await createWrapper(q);
      expect(screen.getByTestId('test-integer-item_Gjennomsnitt')).toBeInTheDocument();
    });
    it('should calculate the based on the input values', async () => {
      await createWrapper(q);
      const input1 = screen.getByTestId('test-choice-radio-item_verdi1-0');
      const input2 = screen.getByTestId('test-choice-radio-item_verdi2-0');
      const input3 = screen.getByTestId('test-choice-radio-item_verdi3-1');
      const input4 = screen.getByTestId('test-choice-radio-item_verdi4-0');

      const delsum = screen.getByTestId('item_Delsum-readonly');
      const totalsum = screen.getByTestId('item_Totalsum-readonly');
      const aritmetisk_gjennomsnitt = screen.getByTestId('item_aritmetisk_gjennomsnitt-readonly');
      const Kopi = screen.getByTestId('item_aritmetisk_gjennomsnitt_kopi-readonly');
      expect(delsum).toHaveTextContent('DelsumIkke besvart');
      expect(totalsum).toHaveTextContent('TotalsumIkke besvart');
      expect(aritmetisk_gjennomsnitt).toHaveTextContent('Aritmetisk gjennomsnitt basert på totalsum.Ikke besvar');
      expect(Kopi).toHaveTextContent('Aritmetisk gjennomsnitt basert på kopiert feltIkke besvart');

      await userEvent.click(within(input1).getByLabelText('Ja'));
      await userEvent.click(within(input2).getByLabelText('Ja'));
      await userEvent.click(within(input3).getByLabelText('Nei'));
      await userEvent.click(within(input4).getByLabelText('Ja'));

      expect(delsum).toHaveTextContent('Delsum500');

      expect(screen.getByTestId('item_Totalsum-readonly')).toHaveTextContent('Totalsum500');

      await waitFor(async () => {
        expect(await screen.findByTestId('item_aritmetisk_gjennomsnitt-readonly')).toHaveTextContent(
          'Aritmetisk gjennomsnitt basert på totalsum.125'
        );
      });
      expect(screen.getByTestId('item_kopiert_felt-readonly')).toHaveTextContent('Kopi500');
      await waitFor(async () => {
        expect(await screen.findByTestId('item_aritmetisk_gjennomsnitt_kopi-readonly')).toHaveTextContent(
          'Aritmetisk gjennomsnitt basert på kopiert felt125'
        );
      });
    });
  });
  describe('only scoring', () => {
    it('should calculate the based on the input values', async () => {
      await createWrapper(q);

      // Get the elements once at the start

      // Assert initial state
      expect(screen.getByLabelText('Sum')).not.toHaveValue();
      expect(screen.getByLabelText('Gjennomsnitt')).not.toHaveValue();

      // --- FIX: Perform actions one by one, without waitFor ---

      // ACT on the first input
      await userEvent.type(screen.getByLabelText('Tall 1'), '10');

      // You can assert the intermediate state if you want, but it's not always necessary
      expect(screen.getByLabelText('Tall 1')).toHaveValue(10);

      // ACT on the second input
      await userEvent.type(screen.getByLabelText('Tall 2'), '20');

      expect(screen.getByLabelText('Tall 2')).toHaveValue(20);

      await waitFor(() => {
        expect(screen.getByLabelText('Sum')).toHaveValue(30);
      });

      await waitFor(() => {
        expect(screen.getByLabelText('Gjennomsnitt')).toHaveValue(15);
      });
    });
  });
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function createWrapper(q: Questionnaire, props?: Partial<ReferoProps>) {
  return renderRefero({ questionnaire: q, props });
}
