import '@/util/__tests__/defineFetch';
import { renderReferoWithStore, screen, within } from '@test/test-utils.tsx';

import type { Questionnaire, QuestionnaireItem } from 'fhir/r4';

import {
  ALL_MEDISIN,
  MEDICINE_DATA,
  ROW_DOSE,
  ROW_NAVN,
  calculateWithMedisin,
  cqfExpressionString,
  gtableControl,
  kopiGroup,
  medisinItem,
  questionnaireOf,
  repetitionContext,
  sdcCalc,
  sdfCalc,
  stateOf,
  stringItem,
  type MedisinRow,
} from './fixtures';

async function showForm(q: Questionnaire, rows: MedisinRow[] = MEDICINE_DATA): Promise<void> {
  const response = await calculateWithMedisin(q, rows);
  await renderReferoWithStore({ questionnaire: q, initialState: stateOf(q, response) });
}

const tableWithHeader = (header: string): HTMLElement => {
  const tables = screen.getAllByRole('table').filter(t => within(t).queryByText(header));
  expect(tables, `one table with the column ${header}`).toHaveLength(1);
  return tables[0];
};

const bodyRows = (table: HTMLElement): string[][] =>
  within(table)
    .getAllByRole('row')
    .map(row =>
      within(row)
        .queryAllByRole('cell')
        .map(cell => cell.textContent ?? '')
    )
    .filter(cells => cells.length > 0);

const testIdsOf = (elements: HTMLElement[]): string[] => elements.map(e => e.getAttribute('data-testid') ?? '');

const headers = (table: HTMLElement): string[] =>
  within(table)
    .getAllByRole('columnheader')
    .map(h => h.textContent ?? '');

describe('PDR-REFERO-001 K11: no add or delete buttons', () => {
  const k1Form = (): Questionnaire =>
    questionnaireOf(
      medisinItem(),
      kopiGroup({ extension: [repetitionContext(ALL_MEDISIN)], children: [stringItem('kopi.navn', 'Navn (kopi)', [sdcCalc(ROW_NAVN)])] })
    );

  it('K11 (PDR-REFERO-001): the form from K1 shows two kopi with no add button for kopi, while medisin keeps its add button', async () => {
    await showForm(k1Form());

    expect(screen.getAllByText('Navn (kopi)')).toHaveLength(2);
    expect(testIdsOf(screen.queryAllByTestId(/-repeat-button$/))).toEqual(['medisin-repeat-button']);
  });

  it('K11 (PDR-REFERO-001): the form from K1 shows two kopi with no delete button for any kopi, while medisin keeps its delete button', async () => {
    await showForm(k1Form());
    const deleteButtons = testIdsOf(screen.queryAllByTestId(/-delete-button$/));

    expect(screen.getAllByText('Navn (kopi)')).toHaveLength(2);
    expect(deleteButtons.length).toBeGreaterThan(0);
    expect(deleteButtons.filter(id => !id.startsWith('medisin-'))).toEqual([]);
  });
});

describe('PDR-REFERO-001 K13: a gtable goes to the right table', () => {
  const copiedColumn = (linkId: string, text: string, source: string): QuestionnaireItem => ({
    ...stringItem(linkId, text, [cqfExpressionString(`QuestionnaireResponse.descendants().where(linkId='${source}').answer.value`)]),
    repeats: true,
    readOnly: true,
  });

  const twoGtables = (): Questionnaire =>
    questionnaireOf(
      medisinItem(),
      {
        ...kopiGroup({
          extension: [repetitionContext(ALL_MEDISIN)],
          children: [
            stringItem('kopi.navn', 'Navn (kopi)', [sdcCalc(ROW_NAVN)]),
            stringItem('kopi.dose', 'Dose (kopi)', [sdfCalc(ROW_DOSE)]),
          ],
        }),
        extension: [gtableControl, repetitionContext(ALL_MEDISIN)],
      },
      {
        linkId: 'oversikt',
        type: 'group',
        text: 'Oversikt',
        extension: [gtableControl],
        item: [
          copiedColumn('oversikt.navn', 'Navn (oversikt)', 'medisin.navn'),
          copiedColumn('oversikt.dose', 'Dose (oversikt)', 'medisin.dose'),
        ],
      }
    );

  it('K13 (PDR-REFERO-001): the gtable with the extension is a table with one row per kopi occurrence, two for the medicine data', async () => {
    await showForm(twoGtables());

    expect(bodyRows(tableWithHeader('Navn (kopi)'))).toHaveLength(2);
  });

  it('K13 (PDR-REFERO-001): boundary value, three medisin give the gtable with the extension three rows, not a fixed count', async () => {
    await showForm(twoGtables(), [...MEDICINE_DATA, { navn: 'Pinex', dose: '500 mg' }]);

    expect(bodyRows(tableWithHeader('Navn (kopi)'))).toHaveLength(3);
  });

  it('K13 (PDR-REFERO-001): the gtable without the extension is shown as before, columns Navn and Dose with one row per copied element', async () => {
    await showForm(twoGtables());
    const table = tableWithHeader('Navn (oversikt)');

    expect(headers(table)).toEqual(['Navn (oversikt)', 'Dose (oversikt)']);
    expect(bodyRows(table)).toEqual([
      ['Paracet', '1 g'],
      ['Ibux', '400 mg'],
    ]);
  });
});
