import { IItemType } from '@/constants/itemType';

export interface IStandardTableColumn {
  id: string;
  index: number;
  type?: IItemType;
  value: string;
}

export interface IStandardTableRow {
  id: string;
  index: number;
  columns: IStandardTableColumn[];
}

export interface IStandardTable {
  id: string;
  headerRow: IStandardTableColumn[];
  rows: IStandardTableRow[];
}
