import React, { useState } from 'react';

import { Coding, QuestionnaireItem, QuestionnaireResponse } from '../../../../../types/fhir';

import {
  TableBody,
  Table as HnTable,
  TableRow,
  TableCell,
  TableHead,
  HeaderCategory,
  TableHeadCell,
  SortDirection,
} from '@helsenorge/designsystem-react/components/Table';

import { getGtablebodyObject, getLinkIdToSortBy } from './utils';
import { transformCodingToSortDirection } from '../utils';

interface Props {
  items: QuestionnaireItem[];
  questionnaireResponse?: QuestionnaireResponse | null;
  tableCodesCoding: Coding[];
}

const GTable = ({ items, questionnaireResponse, tableCodesCoding }: Props): JSX.Element => {
  const linkIdToSortBy = getLinkIdToSortBy(tableCodesCoding);
  const [sortDir, setSortDir] = useState<SortDirection | undefined>(transformCodingToSortDirection(tableCodesCoding));
  const sortable = linkIdToSortBy !== undefined ? true : false;

  const handleSort = (): void => {
    setSortDir(prevState => (prevState === SortDirection.asc ? SortDirection.desc : SortDirection.asc));
  };

  const gTable = getGtablebodyObject(items, questionnaireResponse, sortDir, linkIdToSortBy);

  return gTable.rows.length > 0 ? (
    <HnTable className="page_refero__table__gtable">
      <TableHead category={sortable ? HeaderCategory.sortable : HeaderCategory.normal} className="page_refero__table__gtable__header">
        <TableRow className="page_refero__table__gtable__header__row">
          {gTable?.headerRow?.map(column => (
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
      <TableBody className="page_refero__table__gtable__body">
        {gTable.rows.map(item => {
          return (
            <TableRow key={item.id} className="page_refero__table__gtable__body__row">
              {item.columns.map(column => (
                <TableCell key={column.id} dataLabel={column.value} className="page_refero__table__gtable__body__row__cell">
                  {column.value}
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

export default GTable;
