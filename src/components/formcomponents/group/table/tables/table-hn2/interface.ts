import { IItemType } from '@/constants/itemType';

export interface ITableH2Column {
  id: string;
  text: string;
  type?: IItemType;
  index: number;
}

export interface ITableH2Row {
  id: string;
  columns: ITableH2Column[];
}

export interface ITableH2 {
  rows: ITableH2Row;
}
export type HeaderColumn = { display: string; code?: string };
