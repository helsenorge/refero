import React from 'react';

import { HeaderCategory, SortDirection, TableHead, TableHeadCell, TableRow } from '@helsenorge/designsystem-react/components/Table';

import { IGTableHeaderItem } from './interface';

type Props = {
  headerRow: IGTableHeaderItem[];
  setSortDir?: React.Dispatch<React.SetStateAction<SortDirection | undefined>>;
  sortDir?: SortDirection;
  linkIdToSortBy?: string;
};

export const GTableHeader = ({ headerRow, sortDir, setSortDir, linkIdToSortBy }: Props): JSX.Element => {
  const sortable = linkIdToSortBy !== undefined ? true : false;

  const handleSort = (): void => {
    setSortDir?.(prevState => (prevState === SortDirection.asc ? SortDirection.desc : SortDirection.asc));
  };
  return (
    <TableHead category={sortable ? HeaderCategory.sortable : HeaderCategory.normal} className="page_refero__table__gtable__header">
      <TableRow className="page_refero__table__gtable__header__row">
        {headerRow?.map(column => (
          <TableHeadCell
            sortDir={sortDir}
            sortable={column.id === linkIdToSortBy}
            onClick={column.id === linkIdToSortBy ? handleSort : undefined}
            key={column.id}
            className="page_refero__table__gtable__header__row__cell"
          >
            {column.value}
          </TableHeadCell>
        ))}
      </TableRow>
    </TableHead>
  );
};
