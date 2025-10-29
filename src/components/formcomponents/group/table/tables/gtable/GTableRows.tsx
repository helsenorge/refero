import React from 'react';

import type { Column } from './utils';

import { GTableRow } from './GTableRow';

type Row = Record<string, string | undefined> & { _rowIndex?: string };

interface Props {
  rows: Row[];
  columns: Column[];
}

export const GTableRows: React.FC<Props> = ({ rows, columns }) => {
  if (!rows?.length) return null;

  return (
    <>
      {rows.map((row, idx) => (
        <GTableRow key={row._rowIndex ?? idx} rowIndex={idx} row={row} columns={columns} />
      ))}
    </>
  );
};
