import React, { useState } from 'react';

import { Coding, QuestionnaireItem, QuestionnaireResponse } from 'fhir/r4';

import { TableBody, Table as HnTable, TableRow, TableCell, SortDirection } from '@helsenorge/designsystem-react/components/Table';

import { GTableHeader } from './GTableHeader';
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

  const gTable = getGtablebodyObject(items, questionnaireResponse, sortDir, linkIdToSortBy);

  return gTable && gTable.rows.length > 0 ? (
    <HnTable className="page_refero__table__gtable">
      <GTableHeader headerRow={gTable.headerRow} sortDir={sortDir} setSortDir={setSortDir} linkIdToSortBy={linkIdToSortBy} />
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
