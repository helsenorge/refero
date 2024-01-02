import React, { useEffect, useState } from 'react';

import { Coding, QuestionnaireItem, QuestionnaireResponse } from '../../../../types/fhir';

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

import { ITableH2, findCodeForColumnToSortBy, getColumnNames, getTableHN2bodyObject } from './helpers';

interface Props {
  tableCodesCoding: Coding[];
  items: QuestionnaireItem[];
  questionnaireResponse?: QuestionnaireResponse | null;
}
const TableHn2 = ({ tableCodesCoding, items, questionnaireResponse }: Props): JSX.Element => {
  const [sortDir, setSortDir] = useState<SortDirection>(SortDirection.asc);
  const codeForColumnToSortBy = findCodeForColumnToSortBy(tableCodesCoding);
  //TODO: find index to sort by
  const [responseItems, setResponseItems] = useState<ITableH2[]>(getTableHN2bodyObject(items, questionnaireResponse, 1, sortDir));
  const handleSort = (): void => {
    setSortDir(prevState => (prevState === SortDirection.asc ? SortDirection.desc : SortDirection.asc));
  };

  useEffect(() => {
    setResponseItems(getTableHN2bodyObject(items, questionnaireResponse, 1, sortDir));
  }, [sortDir, items, questionnaireResponse]);

  return (
    <HnTable>
      <TableHead category={!!codeForColumnToSortBy ? HeaderCategory.sortable : HeaderCategory.normal}>
        <TableRow>
          {getColumnNames(tableCodesCoding).map(column => (
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
        {responseItems.map(item => {
          return (
            <TableRow key={item.id}>
              {item.row.map(row => (
                <TableCell key={row.id} dataLabel={row.text}>
                  {row.text}
                </TableCell>
              ))}
            </TableRow>
          );
        })}
      </TableBody>
    </HnTable>
  );
};

export default TableHn2;
