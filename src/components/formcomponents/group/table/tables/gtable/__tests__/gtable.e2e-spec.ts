import { describe, it, expect } from 'vitest';

import {
  scenarioA,
  scenarioB,
  scenarioC,
  makeBigQuestionnaire,
  makeOuterOccurrenceAnswers,
  makeQRFromOuterOccurrences,
  A,
} from './test-fixures';
import { getDefaultSortFromGTableItem, sortRowsByKey } from '../sorting';
import { getColumnsFromGTableItem, inferSourceGroupLinkId, buildGTableRows } from '../utils';
vi.mock('@/constants/dateTimeConstants', () => ({
  TIME_SEPARATOR: ':',
}));
vi.mock('../constants', () => ({
  DATEFORMATS: { DATE: 'yyyy-MM-dd', DATETIME: "yyyy-MM-dd'T'HH:mm" },
}));

vi.mock('date-fns', () => {
  return {
    format: (date: string | number | Date): string => (typeof date === 'string' ? date : String(date)),
    isValid: (input: unknown): boolean => !!input,
  };
});
describe('Scenario A: nested repeats + unreferenced siblings + ASC on int', () => {
  it('infers OUTER, builds rows, sorts ascending by INT', () => {
    const { questionnaire, qr, ids, columns, summaryItem } = scenarioA();

    const srcGroup = inferSourceGroupLinkId(questionnaire, columns);
    expect(srcGroup).toBe(ids.OUTER_ID);

    const rows = buildGTableRows(qr, srcGroup, columns);
    expect(rows).toHaveLength(3);
    // Check columns exist (summaryLinkIds)
    expect(Object.keys(rows[0])).toContain('sum-int');
    expect(Object.keys(rows[0])).toContain('sum-dec');

    // Default sort from gTable codes
    const { sortKey, sortDir } = getDefaultSortFromGTableItem(summaryItem, columns);
    expect(sortKey).toBe('sum-int');
    expect(sortDir).toBe('asc');

    const sorted = sortRowsByKey(rows, sortKey!, sortDir!);
    const ints = sorted.map(r => r['sum-int'] ?? '');
    expect(ints).toEqual(['3', '7', '100']);
  });
});

describe('Scenario B: DESC on time, 1 row, nested innerB does not affect gTable', () => {
  it('builds single row and respects time formatting', () => {
    const { questionnaire, qr, ids, columns, summaryItem } = scenarioB();

    const srcGroup = inferSourceGroupLinkId(questionnaire, columns);
    expect(srcGroup).toBe(ids.OUTER_ID);

    const rows = buildGTableRows(qr, srcGroup, columns);
    expect(rows).toHaveLength(1);
    expect(rows[0]['sum-time']).toBe('14:00');

    const { sortKey, sortDir } = getDefaultSortFromGTableItem(summaryItem, columns);
    expect(sortKey).toBe('sum-time');
    expect(sortDir).toBe('desc');

    const sorted = sortRowsByKey(rows, sortKey!, sortDir!);
    expect(sorted).toHaveLength(1);
  });
});

describe('Scenario C: no sorting codes, empty row present', () => {
  it('produces two rows with blanks preserved', () => {
    const { questionnaire, qr, ids, columns } = scenarioC();

    const srcGroup = inferSourceGroupLinkId(questionnaire, columns);
    expect(srcGroup).toBe(ids.OUTER_ID);

    const rows = buildGTableRows(qr, srcGroup, columns);
    expect(rows).toHaveLength(2);

    // Row1 has answers, Row2 is empty
    expect(rows[0]['sum-date']).toBe('2025-12-24');
    expect(rows[0]['sum-time']).toBe('16:00');
    expect(rows[1]['sum-date']).toBeUndefined();
    expect(rows[1]['sum-time']).toBeUndefined();
  });
});

describe('Scenario D: multiple answers per cell (joiner)', () => {
  it('joins multiple values with custom joiner', () => {
    const { questionnaire, ids, summaryItem } = makeBigQuestionnaire({
      includeNestedRepeating: false,
      includeUnreferencedSiblings: true,
      sorting: { dir: 'ASC', bySummaryCell: 'sum-date' },
    });

    const columns = getColumnsFromGTableItem(summaryItem);
    const srcGroup = inferSourceGroupLinkId(questionnaire, columns);
    expect(srcGroup).toBe(ids.OUTER_ID);

    // row has two dates and two times
    const row = makeOuterOccurrenceAnswers({
      [ids.DATE_ID]: [A.date('2025-10-01'), A.date('2025-10-02')],
      [ids.TIME_ID]: [A.time('07:00:00'), A.time('08:15:00')],
    });
    const qr = makeQRFromOuterOccurrences([row]);

    const rows = buildGTableRows(qr, srcGroup, columns, {
      joinMultiple: vals => vals.join(' | '),
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]['sum-date']).toBe('2025-10-01 | 2025-10-02');
    expect(rows[0]['sum-time']).toBe('07:00 | 08:15');
  });
});

describe('Scenario E: booleans, quantity, coding in sources (even if not all columns reference them)', () => {
  it('ignores unreferenced siblings in OUTER and keeps referenced ones only', () => {
    const { questionnaire, ids, summaryItem } = makeBigQuestionnaire({
      includeNestedRepeating: true,
      includeUnreferencedSiblings: true,
    });
    const columns = getColumnsFromGTableItem(summaryItem); // only date/time/int/dec linked
    const srcGroup = inferSourceGroupLinkId(questionnaire, columns);
    expect(srcGroup).toBe(ids.OUTER_ID);

    const row = makeOuterOccurrenceAnswers({
      [ids.BOOL_ID]: [A.bool(true)],
      [ids.QTY_ID]: [A.qty(10, 'ml')],
      [ids.COD_ID]: [A.coding('ja', 'ja')],
      [ids.DATE_ID]: [A.date('2025-01-01')],
      [ids.DEC_ID]: [A.dec(1.5)],
    });
    const qr = makeQRFromOuterOccurrences([row]);
    const rows = buildGTableRows(qr, srcGroup, columns);

    // Only columns that exist in the summary are populated
    expect(rows[0]['sum-date']).toBe('2025-01-01');
    expect(rows[0]['sum-dec']).toBe('1.5');
    // No column for bool/qty/coding -> undefined
    expect(rows[0]['sum-time']).toBeUndefined();
    expect(rows[0]['sum-int']).toBeUndefined();
  });
});
