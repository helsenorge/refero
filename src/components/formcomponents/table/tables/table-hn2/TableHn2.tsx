import React, { useEffect, useState } from 'react';

import { Coding, QuestionnaireItem, QuestionnaireResponse } from '../../../../../types/fhir';

import {
  HeaderCategory,
  Table as HnTable,
  SortDirection,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from '@helsenorge/designsystem-react/components/Table';

import { ITableH2Row } from './interface';
import { findCodeForColumnToSortBy, getColumnNames, getTableHN2bodyObject } from './utils';

interface Props {
  tableCodesCoding: Coding[];
  items: QuestionnaireItem[];
  questionnaireResponse?: QuestionnaireResponse | null;
}
const TableHn2 = ({ tableCodesCoding, items, questionnaireResponse }: Props): JSX.Element => {
  const [sortDir, setSortDir] = useState<SortDirection>(SortDirection.asc);
  const codeForColumnToSortBy = findCodeForColumnToSortBy(tableCodesCoding);
  const tableHeader = getColumnNames(tableCodesCoding);

  //TODO: find index to sort by
  const [rows, setRows] = useState<ITableH2Row[]>(getTableHN2bodyObject(items, questionnaireResponse, 1, sortDir));
  const handleSort = (): void => {
    setSortDir(prevState => (prevState === SortDirection.asc ? SortDirection.desc : SortDirection.asc));
  };
  useEffect(() => {
    setRows(getTableHN2bodyObject(items, questionnaireResponse, 1, sortDir));
  }, [sortDir, items, questionnaireResponse, tableHeader.length]);
  return rows.length ? (
    <HnTable className="page_refero__table_hn2">
      <TableHead category={!!codeForColumnToSortBy ? HeaderCategory.sortable : HeaderCategory.normal}>
        <TableRow>
          {tableHeader.map(column => (
            <TableHeadCell
              onClick={codeForColumnToSortBy?.display === column ? handleSort : undefined}
              sortable={codeForColumnToSortBy?.display === column}
              sortDir={sortDir}
              key={column}
            >
              {column}
            </TableHeadCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map(item => {
          return (
            <TableRow key={item.id}>
              {item.columns.map(column => (
                <TableCell key={column.id} dataLabel={column.text}>
                  {column.text}
                </TableCell>
              ))}
            </TableRow>
          );
        })}
      </TableBody>
    </HnTable>
  ) : (
    <></>
  );
};

export default TableHn2;
