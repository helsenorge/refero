import React, { useEffect, useState } from 'react';

import { Coding, QuestionnaireItem, QuestionnaireResponse } from '../../../../../types/fhir';

import { Table as HnTable, SortDirection, TableBody, TableCell, TableRow } from '@helsenorge/designsystem-react/components/Table';

import { ITableH2Row } from './interface';
import TableHeadHn2 from './TableHeadHn2';
import { getIndexToSortBy, getTableHN2bodyObject, transformCodingToSortDirection } from './utils';

interface Props {
  tableCodesCoding: Coding[];
  items: QuestionnaireItem[];
  questionnaireResponse?: QuestionnaireResponse | null;
}
const TableHn2 = ({ tableCodesCoding, items, questionnaireResponse }: Props): JSX.Element => {
  const sortIndex = getIndexToSortBy(tableCodesCoding);
  const [sortDir, setSortDir] = useState<SortDirection | undefined>(transformCodingToSortDirection(tableCodesCoding));
  const [rows, setRows] = useState<ITableH2Row[]>(getTableHN2bodyObject(items, questionnaireResponse, sortIndex, sortDir));

  useEffect(() => {
    setRows(getTableHN2bodyObject(items, questionnaireResponse, sortIndex, sortDir));
  }, [sortDir, items, questionnaireResponse]);
  return rows.length ? (
    <HnTable className="page_refero__table_hn2">
      <TableHeadHn2 sortable={!!sortIndex} setSortDir={setSortDir} sortDir={sortDir} tableCodesCoding={tableCodesCoding} />
      <TableBody className='className="page_refero__table_hn2__body'>
        {rows.map(item => {
          return (
            <TableRow key={item.id} className='className="page_refero__table_hn2__body__row'>
              {item.columns.map(column => (
                <TableCell key={column.id} dataLabel={column.text} className='className="page_refero__table_hn2__body__cell'>
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
