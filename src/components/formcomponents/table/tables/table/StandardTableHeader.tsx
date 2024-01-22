import React from 'react';

import { HeaderCategory, SortDirection, TableHead, TableHeadCell, TableRow } from '@helsenorge/designsystem-react/components/Table';

import { IStandardTableColumn } from './interface';

type Props = {
  headerRow: IStandardTableColumn[];
  setSortDir: React.Dispatch<React.SetStateAction<SortDirection>>;
  sortDir?: SortDirection;
  displayToSortBy?: string;
};

export const StandardTableHeader = ({ headerRow, setSortDir, sortDir, displayToSortBy }: Props): JSX.Element => {
  const handleSort = (): void => {
    setSortDir(prevState => (prevState === SortDirection.asc ? SortDirection.desc : SortDirection.asc));
  };
  const sortable = displayToSortBy !== undefined ? true : false;

  return (
    <TableHead category={sortable ? HeaderCategory.sortable : HeaderCategory.normal} className="page_refero__standard-table__header">
      <TableRow className="page_refero__standard-table__header__row">
        {headerRow.map(column => (
          <TableHeadCell
            onClick={handleSort}
            sortable={sortable && column.value === displayToSortBy}
            sortDir={sortable ? sortDir : undefined}
            className="page_refero__standard-table__header__row__cell"
            key={column.id}
          >
            <span className="page_refero__standard-table__header__row__cell">{column.value}</span>
          </TableHeadCell>
        ))}
      </TableRow>
    </TableHead>
  );
};
