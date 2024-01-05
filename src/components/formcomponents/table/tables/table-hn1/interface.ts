export const TABLE_HN1_TABLE_TYPES = { HEADER: 'HEADER', VALUE: 'VALUE' };
type TableHn1ColumnTypesKey = keyof typeof TABLE_HN1_TABLE_TYPES;
type TableHn1ColumnTypesValue = typeof TABLE_HN1_TABLE_TYPES[TableHn1ColumnTypesKey];
export interface ITableH1Column {
  value?: string;
  type: TableHn1ColumnTypesValue;
  id: string;
}
export interface ITableH1Row {
  id: string;
  columns: ITableH1Column[];
}
export type ITableH1 = ITableH1Row[];
