import React, { useEffect, useState } from 'react';

import { Coding, QuestionnaireItem, QuestionnaireResponse, Resource } from 'fhir/r4';

import { Table as HnTable, ModeType, SortDirection, TableBody, TableCell, TableRow } from '@helsenorge/designsystem-react/components/Table';

import { IStandardTable } from './interface';
import { StandardTableHeader } from './StandardTableHeader';
import { getDisplayToSortBy, getStandardTableObject } from './utils';
import { transformCodingToSortDirection } from '../utils';

interface Props {
  items: QuestionnaireItem[];
  tableCodesCoding: Coding[];
  questionnaireResponse?: QuestionnaireResponse | null;
  resource?: Resource[];
}

export const StandardTable = ({ items, questionnaireResponse, resource, tableCodesCoding }: Props): JSX.Element => {
  const displayToSortBy = getDisplayToSortBy(tableCodesCoding);
  const [sortDir, setSortDir] = useState<SortDirection | undefined>(transformCodingToSortDirection(tableCodesCoding));
  const [table, setTable] = useState<IStandardTable>(
    getStandardTableObject(items, questionnaireResponse, resource, sortDir, displayToSortBy)
  );
  useEffect(() => {
    setTable(getStandardTableObject(items, questionnaireResponse, resource, sortDir, displayToSortBy));
  }, [sortDir, items, questionnaireResponse, resource, displayToSortBy]);

  return table.rows.length > 0 ? (
    <HnTable mode={ModeType.normal} className="page_refero__standard-table">
      <StandardTableHeader headerRow={table.headerRow} setSortDir={setSortDir} displayToSortBy={displayToSortBy} sortDir={sortDir} />
      <TableBody className="page_refero__standard-table__body">
        {table.rows.map(item => (
          <TableRow key={item.id} className="page_refero__standard-table__body__row">
            {item.columns.map(({ value, id }) => (
              <React.Fragment key={id}>
                <TableCell className="page_refero__standard-table__body__row__cell" dataLabel="Navn">
                  <span className="page_refero__standard-table__body__row__cell__value">{value}</span>
                </TableCell>
              </React.Fragment>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </HnTable>
  ) : (
    <></>
  );
};
