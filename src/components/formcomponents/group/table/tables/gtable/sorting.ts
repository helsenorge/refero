// sorting.ts
import { QuestionnaireItem } from 'fhir/r4';

import type { Column } from './utils';

import { SortDirection } from '@helsenorge/designsystem-react/components/Table';

import { TableOrderingColum, TableOrderingFunctions } from '@/constants/codingsystems';

// CodeSystems you use to configure sorting on the gTable group
export const ORDER_COL_SYSTEM = TableOrderingColum;

export function mapOrderFnToDir(code?: string): SortDirection | undefined {
  if (!code) return undefined;
  const c = code.toUpperCase();
  if (c === 'ASC' || c === 'ASCENDING') return SortDirection.asc;
  if (c === 'DESC' || c === 'DESCENDING') return SortDirection.desc;
  return undefined;
}

export function getDefaultSortFromGTableItem(
  gTableItem: QuestionnaireItem,
  columns: Column[]
): { sortKey?: string; sortDir?: SortDirection } {
  const codes = gTableItem.code ?? [];
  const dirCode = codes.find(c => c.system === TableOrderingFunctions)?.code;
  const sortDir = mapOrderFnToDir(dirCode);

  const colCode = codes.find(c => c.system === TableOrderingColum)?.code;
  const hasColumn = !!columns.find(c => c.summaryLinkId === colCode);

  return {
    sortKey: hasColumn ? colCode : columns[0]?.summaryLinkId,
    sortDir: sortDir ?? SortDirection.asc,
  };
}

export function sortRowsByKey<T extends Record<string, string | undefined>>(rows: T[], key: string, direction: SortDirection): T[] {
  const indexed = rows.map((row, i) => ({ row, i }));

  indexed.sort((a, b) => {
    const av = first(a.row[key]);
    const bv = first(b.row[key]);
    const cmp = compareMixed(av, bv);
    if (cmp !== 0) return direction === 'asc' ? cmp : -cmp;
    return a.i - b.i;
  });

  return indexed.map(x => x.row);
}

function first(v?: string): string {
  if (!v) return '';
  const t = v.split(';')[0]?.trim();
  return t ?? '';
}

function compareMixed(a: string, b: string): number {
  const aE = a === '' || a == null;
  const bE = b === '' || b == null;
  if (aE && bE) return 0;
  if (aE) return 1;
  if (bE) return -1;

  const ad = toDateMs(a),
    bd = toDateMs(b);
  if (ad != null && bd != null) return ad - bd;

  const at = toTimeMs(a),
    bt = toTimeMs(b);
  if (at != null && bt != null) return at - bt;

  const an = toNumber(a),
    bn = toNumber(b);
  if (an != null && bn != null) return an - bn;

  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

function toNumber(s: string): number | null {
  if (!/^[-+]?\d+(\.\d+)?$/.test(s.trim())) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}
function toDateMs(s: string): number | null {
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const t = Date.parse(s);
    return Number.isFinite(t) ? t : null;
  }
  return null;
}
function toTimeMs(s: string): number | null {
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(s.trim());
  if (!m) return null;
  const h = +m[1],
    min = +m[2],
    sec = m[3] ? +m[3] : 0;
  if (h > 23 || min > 59 || sec > 59) return null;
  return h * 3600_000 + min * 60_000 + sec * 1000;
}
