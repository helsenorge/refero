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

import { findCodeForColumnToSortBy, getColumnNames, getTableHN1bodyObject, getValueIfDataReceiver } from './helpers';

interface Props {
  tableCodes: Coding[];
  items: QuestionnaireItem[];
  questionnaireResponse?: QuestionnaireResponse | null;
}
const TableHn1 = ({ tableCodes, items, questionnaireResponse }: Props): JSX.Element => {
  const res = getValueIfDataReceiver(items[2], questionnaireResponse);
  const codeForColumnToSortBy = findCodeForColumnToSortBy(tableCodes);
  // console.log('questionnaireResponse', questionnaireResponse);
  // console.log('tableCodes', tableCodes);
  console.log('getValueIfDataReceiver', res);
  // console.log('item', items[2]);
  const answerValues = getTableHN1bodyObject(items);
  console.log('answerValues', answerValues);
  return (
    <HnTable>
      <TableHead category={!!codeForColumnToSortBy ? HeaderCategory.sortable : HeaderCategory.normal}>
        <TableRow>
          {getColumnNames(tableCodes).map(column => (
            <TableHeadCell sortable={codeForColumnToSortBy?.display === column} sortDir={SortDirection.asc} key={column}>
              {`here ${column}`}
            </TableHeadCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map(item => (
          <TableRow key={item.linkId}>
            <TableCell dataLabel="Navn">{item.linkId}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </HnTable>
  );
};

export default TableHn1;
