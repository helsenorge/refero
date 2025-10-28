import React from 'react';

import type { Column } from './utils';

import { TableRow } from '@helsenorge/designsystem-react/components/Table';

import { GTableCell } from './GTableCell';

type Row = Record<string, string | undefined> & { _rowIndex?: string };

interface Props {
  rowIndex: number;
  row: Row;
  columns: Column[];
}

export const GTableRow: React.FC<Props> = ({ rowIndex, row, columns }) => {
  return (
    <TableRow className="page_refero__table__gtable__body__row">
      {columns.map(col => {
        const cellValue = row[col.summaryLinkId]; // ✅ stable key
        return <GTableCell key={`${col.summaryLinkId}-${rowIndex}`} rowIndex={rowIndex} col={col} value={cellValue} />;
      })}
    </TableRow>
  );
};
