import { describe, it, expect } from 'vitest';

import { SortDirection } from '@helsenorge/designsystem-react/components/Table';

import { sortRowsByKey } from '../sorting';

describe('sortRowsByKey', () => {
  it('numbers ascending/descending', () => {
    const rows = [
      { id: 'r1', k: '10' },
      { id: 'r2', k: '2' },
      { id: 'r3', k: '' }, // empty to bottom in asc
    ];
    const asc = sortRowsByKey(rows, 'k', SortDirection.asc).map(r => r.id);
    const desc = sortRowsByKey(rows, 'k', SortDirection.desc).map(r => r.id);
    expect(asc).toEqual(['r2', 'r1', 'r3']);
    expect(desc).toEqual(['r3', 'r1', 'r2']);
  });

  it('time aware', () => {
    const rows = [{ k: '08:15' }, { k: '12:30' }, { k: '' }];
    // function compares HH:mm only when both parse as time
    const asc = sortRowsByKey(rows, 'k', SortDirection.asc).map(r => r.k);
    expect(asc).toEqual(['08:15', '12:30', '']);
  });

  it('date aware', () => {
    const rows = [{ k: '2024-01-01' }, { k: '2023-12-31' }, { k: '' }];
    const asc = sortRowsByKey(rows, 'k', SortDirection.asc).map(r => r.k);
    expect(asc).toEqual(['2023-12-31', '2024-01-01', '']);
  });

  it('string fallback is natural (localeCompare numeric)', () => {
    const rows = [{ k: 'item9' }, { k: 'item10' }, { k: 'item2' }];
    const asc = sortRowsByKey(rows, 'k', SortDirection.asc).map(r => r.k);
    expect(asc).toEqual(['item2', 'item9', 'item10']);
  });

  it('multi-value cells sort by first token', () => {
    const rows = [{ k: 'B; C' }, { k: 'A; Z' }];
    const asc = sortRowsByKey(rows, 'k', SortDirection.asc).map(r => r.k);
    expect(asc).toEqual(['A; Z', 'B; C']);
  });
});
