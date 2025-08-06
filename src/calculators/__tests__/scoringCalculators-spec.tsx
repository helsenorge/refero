// vi.unmock('@/workers/fhir-path.worker.ts?worker&inline');
// import '@vitest/web-worker';
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

      expect(await screen.findByTestId('item_Delsum-readonly')).toHaveTextContent('DelsumIkke besvart');
      expect(await screen.findByTestId('item_Totalsum-readonly')).toHaveTextContent('TotalsumIkke besvart');
      await waitFor(async () => {
        expect(await screen.findByTestId('item_aritmetisk_gjennomsnitt-readonly')).toHaveTextContent(
          'Aritmetisk gjennomsnitt basert på totalsum.Ikke besvar'
        );
      });
      await waitFor(async () => {
        expect(await screen.findByTestId('item_aritmetisk_gjennomsnitt_kopi-readonly')).toHaveTextContent(
          'Aritmetisk gjennomsnitt basert på kopiert feltIkke besvart'
        );
      });
      await waitFor(async () => {
        await userEvent.click(within(await screen.findByTestId('item_verdi1-0-radio-choice')).getByLabelText('Ja'));
      });
      await waitFor(async () => {
        expect(await screen.findByTestId('item_Delsum-readonly')).toHaveTextContent('Delsum100');
      });
      await waitFor(async () => {
        expect(await screen.findByTestId('item_Totalsum-readonly')).toHaveTextContent('Totalsum100');
      });
      await waitFor(async () => {
        expect(await screen.findByTestId('item_kopiert_felt-readonly')).toHaveTextContent('Kopi100');
      });
      await waitFor(async () => {
        expect(await screen.findByTestId('item_aritmetisk_gjennomsnitt-readonly')).toHaveTextContent(
          'Aritmetisk gjennomsnitt basert på totalsum.25'
        );
      });
      await waitFor(async () => {
        await userEvent.click(within(await screen.findByTestId('item_verdi2-0-radio-choice')).getByLabelText('Ja'));
      });
      await waitFor(async () => {
        expect(await screen.findByTestId('item_Delsum-readonly')).toHaveTextContent('Delsum200');
      });
      await waitFor(async () => {
        expect(await screen.findByTestId('item_kopiert_felt-readonly')).toHaveTextContent('Kopi200');
      });
      await waitFor(async () => {
        await userEvent.click(within(await screen.findByTestId('item_verdi3-1-radio-choice')).getByLabelText('Nei'));
      });
      await waitFor(async () => {
        expect(await screen.findByTestId('item_Delsum-readonly')).toHaveTextContent('Delsum400');
      });
      await waitFor(async () => {
        expect(await screen.findByTestId('item_kopiert_felt-readonly')).toHaveTextContent('Kopi400');
      });
      await waitFor(async () => {
        await userEvent.click(within(await screen.findByTestId('item_verdi4-0-radio-choice')).getByLabelText('Ja'));
      });
      await waitFor(async () => {
        expect(await screen.findByTestId('item_Delsum-readonly')).toHaveTextContent('Delsum500');
      });
      await waitFor(async () => {
        expect(await screen.findByTestId('item_Totalsum-readonly')).toHaveTextContent('Totalsum500');
      });
      // await waitFor(async () => {
      //   expect(await screen.findByTestId('item_aritmetisk_gjennomsnitt-readonly')).toHaveTextContent(
      //     'Aritmetisk gjennomsnitt basert på totalsum.125'
      //   );
      // });
      await waitFor(async () => {
        expect(await screen.findByTestId('item_kopiert_felt-readonly')).toHaveTextContent('Kopi500');
      });
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
      const tall1Input = screen.getByLabelText('Tall 1');
      const tall2Input = screen.getByLabelText('Tall 2');
      const sumInput = screen.getByLabelText('Sum');
      const avgInput = screen.getByLabelText('Gjennomsnitt');

      // Assert initial state
      expect(sumInput).not.toHaveValue();
      expect(avgInput).not.toHaveValue();

      // --- FIX: Perform actions one by one, without waitFor ---

      // ACT on the first input
      await userEvent.type(tall1Input, '10');

      // You can assert the intermediate state if you want, but it's not always necessary
      expect(tall1Input).toHaveValue(10);

      // ACT on the second input
      await userEvent.type(tall2Input, '20');

      expect(tall2Input).toHaveValue(20);

      await waitFor(() => {
        expect(sumInput).toHaveValue(30);
      });

      await waitFor(() => {
        expect(avgInput).toHaveValue(15);
      });
    });
  });
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function createWrapper(q: Questionnaire, props?: Partial<ReferoProps>) {
  return renderRefero({ questionnaire: q, props });
}
