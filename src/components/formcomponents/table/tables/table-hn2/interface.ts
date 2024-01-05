export interface ITableH2Column {
  id: string;
  text: string;
  index: number;
}

export interface ITableH2Row {
  id: string;
  columns: ITableH2Column[];
}

export interface ITableH2 {
  rows: ITableH2Row;
}
