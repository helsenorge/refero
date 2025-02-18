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

const GTable = ({ items, questionnaireResponse, tableCodesCoding }: Props): React.JSX.Element | null => {
  const linkIdToSortBy = getLinkIdToSortBy(tableCodesCoding);
  const SORT_DIRECTION = transformCodingToSortDirection(tableCodesCoding) || SortDirection.asc;
  const [sortDir, setSortDir] = useState<SortDirection>(SORT_DIRECTION);

  const gTable = getGtablebodyObject(items, questionnaireResponse, sortDir, linkIdToSortBy);
  return gTable && gTable.rows.length > 0 ? (
    <HnTable className="page_refero__table__gtable" testId="gtable">
      <GTableHeader headerRow={gTable.headerRow} sortDir={sortDir} setSortDir={setSortDir} linkIdToSortBy={linkIdToSortBy} />
      <TableBody className="page_refero__table__gtable__body">
        {gTable.rows.map((item, index) => {
          return (
            <TableRow key={item.id} className="page_refero__table__gtable__body__row">
              {item.columns.map(column => (
                <TableCell
                  testId={column.id}
                  key={column.id}
                  dataLabel={gTable.headerRow[index]?.value ?? column.value}
                  className="page_refero__table__gtable__body__row__cell"
                >
                  {column.value}
                </TableCell>
              ))}
            </TableRow>
          );
        })}
      </TableBody>
    </HnTable>
  ) : null;
};

export default GTable;
