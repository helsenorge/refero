export interface IGTable {
  id: string;
  headerRow?: IGTableHeaderItem[];
  rows: IGTableRow[];
}
export interface IGTableHeaderItem {
  id: string;
  value: string;
}

interface IGTableRow {
  id: string;
  index: number;
  columns: IGTableColumn[];
}

interface IGTableColumn {
  id: string;
  index: number;
  value: string;
}
