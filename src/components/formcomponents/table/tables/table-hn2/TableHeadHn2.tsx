import React from 'react';

import { Coding } from '../../../../../types/fhir';

import { HeaderCategory, SortDirection, TableHead, TableHeadCell, TableRow } from '@helsenorge/designsystem-react/components/Table';

import { findCodeForColumnToSortBy, getHeaderColumns } from './utils';

type Props = {
  tableCodesCoding: Coding[];
  sortDir?: SortDirection;
  setSortDir: React.Dispatch<React.SetStateAction<SortDirection>>;
  sortable: boolean;
};

const TableHeadHn2 = ({ tableCodesCoding, sortDir, setSortDir, sortable }: Props): JSX.Element => {
  const tableHeader = getHeaderColumns(tableCodesCoding);
  const codeForColumnToSortBy = findCodeForColumnToSortBy(tableCodesCoding);
  const handleSort = (): void => {
    setSortDir(prevState => (prevState === SortDirection.asc ? SortDirection.desc : SortDirection.asc));
  };

  return (
    <TableHead category={sortable ? HeaderCategory.sortable : HeaderCategory.normal} className='className="page_refero__table_hn2__header'>
      <TableRow className='className="page_refero__table_hn2__header__row'>
        {tableHeader.map(column => (
          <TableHeadCell
            onClick={sortable && codeForColumnToSortBy?.code === column.code ? handleSort : undefined}
            sortable={sortable && codeForColumnToSortBy?.code === column.code}
            sortDir={sortable ? sortDir : undefined}
            key={column.code}
            className='className="page_refero__table_hn2__header__row__cell'
          >
            {column.display}
          </TableHeadCell>
        ))}
      </TableRow>
    </TableHead>
  );
};
export default TableHeadHn2;
