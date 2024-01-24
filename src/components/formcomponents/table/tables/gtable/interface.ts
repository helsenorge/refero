export interface IGTable {
  id: string;
  headerRow: IGTableHeaderItem[];
  rows: IGTableRow[];
}
export interface IGTableHeaderItem {
  id: string;
  value: string;
}

export interface IGTableRow {
  id: string;
  index: number;
  columns: IGTableColumn[];
}

export interface IGTableColumn {
  id: string;
  index: number;
  value: string;
}
