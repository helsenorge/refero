export interface StandardTableColumn {
  id: string;
  index: number;
  value: string;
}

export interface StandardTableRow {
  id: string;
  index: number;
  columns: StandardTableColumn[];
}

export interface StandardTable {
  id: string;
  headerRow: StandardTableColumn[];
  rows: StandardTableRow[];
}
