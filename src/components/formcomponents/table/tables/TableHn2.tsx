import React, { useState } from 'react';
import ItemType from '../../../../constants/itemType';
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

import { findCodeForColumnToSortBy, getColumnNames, getValueIfDataReceiver } from './helpers';

interface Props {
  tableCodes: Coding[];
  items: QuestionnaireItem[];
  questionnaireResponse?: QuestionnaireResponse | null;
}
const TableHn2 = ({ tableCodes, items, questionnaireResponse }: Props): JSX.Element => {
  const [sortDir, setSortDir] = useState<SortDirection>(SortDirection.asc);
  const res = getValueIfDataReceiver(items[2], questionnaireResponse);
  const codeForColumnToSortBy = findCodeForColumnToSortBy(tableCodes);
  console.log('questionnaireResponse', questionnaireResponse);
  console.log('tableCodes', tableCodes);
  console.log('getValueIfDataReceiver', res);
  console.log('item', items[2]);
  console.log('items', items);

  const handleSort = (): void => {
    setSortDir(prevState => (prevState === SortDirection.asc ? SortDirection.desc : SortDirection.asc));
  };
  return (
    <HnTable>
      <TableHead category={!!codeForColumnToSortBy ? HeaderCategory.sortable : HeaderCategory.normal}>
        <TableRow>
          {getColumnNames(tableCodes).map(column => (
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
        {items.map(item => {
          return item.type === ItemType.DISPLAY ? (
            <TableRow key={item.linkId}>
              <TableCell dataLabel={item.text ?? ''}>{item.text}</TableCell>
            </TableRow>
          ) : (
            <TableCell key={item.linkId} dataLabel={item.text ?? ''}>
              {item.text}
            </TableCell>
          );
        })}
      </TableBody>
    </HnTable>
  );
};

export default TableHn2;
