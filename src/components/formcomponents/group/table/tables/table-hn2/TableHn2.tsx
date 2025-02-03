import { useEffect, useState } from 'react';

import { Coding, QuestionnaireItem, QuestionnaireResponse } from 'fhir/r4';

import { Table as HnTable, SortDirection, TableBody, TableCell, TableRow } from '@helsenorge/designsystem-react/components/Table';

import { ITableH2Row } from './interface';
import TableHeadHn2 from './TableHeadHn2';
import { getHeaderColumns, getTableHN2bodyObject } from './utils';
import { getIndexToSortBy } from './utils';
import { transformCodingToSortDirection } from '../utils';

interface Props {
  tableCodesCoding: Coding[];
  items: QuestionnaireItem[];
  questionnaireResponse?: QuestionnaireResponse | null;
}
const TableHn2 = ({ tableCodesCoding, items, questionnaireResponse }: Props): React.JSX.Element | null => {
  const sortIndex = getIndexToSortBy(tableCodesCoding);
  const tableHeader = getHeaderColumns(tableCodesCoding);

  const [sortDir, setSortDir] = useState<SortDirection | undefined>(transformCodingToSortDirection(tableCodesCoding));
  const [rows, setRows] = useState<ITableH2Row[]>(getTableHN2bodyObject(items, questionnaireResponse, sortIndex, sortDir));

  useEffect(() => {
    setRows(getTableHN2bodyObject(items, questionnaireResponse, sortIndex, sortDir));
  }, [sortDir, items, questionnaireResponse, sortIndex]);

  return rows.length ? (
    <HnTable className="page_refero__table_hn2">
      <TableHeadHn2 sortable={sortIndex !== undefined} setSortDir={setSortDir} sortDir={sortDir} tableCodesCoding={tableCodesCoding} />
      <TableBody className='className="page_refero__table_hn2__body'>
        {rows.map((item, index) => {
          return (
            <TableRow key={item.id} className='className="page_refero__table_hn2__body__row'>
              {item.columns.map(column => (
                <TableCell
                  key={column.id}
                  dataLabel={tableHeader[index]?.display ?? column.text}
                  className='className="page_refero__table_hn2__body__cell'
                >
                  {column.text}
                </TableCell>
              ))}
            </TableRow>
          );
        })}
      </TableBody>
    </HnTable>
  ) : null;
};

export default TableHn2;
