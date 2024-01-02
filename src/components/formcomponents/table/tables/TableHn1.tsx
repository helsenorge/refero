import React from 'react';

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

import { TABLE_HN1_TABLE_TYPES, findCodeForColumnToSortBy, getColumnNames, getTableHN1bodyObject } from './helpers';

interface Props {
  tableCodesCoding: Coding[];
  items: QuestionnaireItem[];
  questionnaireResponse?: QuestionnaireResponse | null;
}
const TableHn1 = ({ tableCodesCoding, items, questionnaireResponse }: Props): JSX.Element => {
  const codeForColumnToSortBy = findCodeForColumnToSortBy(tableCodesCoding);
  const answerValues = getTableHN1bodyObject(items, questionnaireResponse);
  return (
    <HnTable>
      {/* <TableHead category={!!codeForColumnToSortBy ? HeaderCategory.sortable : HeaderCategory.normal}>
        <TableRow>
          {getColumnNames(tableCodesCoding).map(column => (
            <TableHeadCell sortable={codeForColumnToSortBy?.display === column} sortDir={SortDirection.asc} key={column}>
              {`here ${column}`}
            </TableHeadCell>
          ))}
        </TableRow>
      </TableHead> */}
      <TableBody>
        {answerValues.map(item => (
          <TableRow key={item.id}>
            {item.columns.map(({ value, id, type }) => (
              <React.Fragment key={id}>
                <TableCell dataLabel="Navn">
                  <span style={type === TABLE_HN1_TABLE_TYPES.HEADER ? { fontWeight: 'bold' } : undefined}>{value}</span>
                </TableCell>
              </React.Fragment>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </HnTable>
  );
};

export default TableHn1;
