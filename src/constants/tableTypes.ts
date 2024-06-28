export const TableCodes = {
  gtable: 'gtable',
  table: 'table',
  tableHn1: 'table-hn1',
  tableHn2: 'table-hn2',
} as const;

export type TABLE_CODES_KEYS = keyof typeof TableCodes;
export type TABLE_CODES_VALUES = (typeof TableCodes)[TABLE_CODES_KEYS];
