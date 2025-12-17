// GTableHeader.tsx
import type React from 'react';

import type { Column } from './utils';

import { HeaderCategory, type SortDirection, TableHead, TableHeadCell, TableRow } from '@helsenorge/designsystem-react/components/Table';

type Props = {
  columns: Column[];
  activeSortKey?: string;
  sortDir?: SortDirection;
  onSort?: (summaryLinkId: string) => void;
};

export const GTableHeader: React.FC<Props> = ({ columns, activeSortKey, sortDir, onSort }) => {
  const isSortable = !!onSort;

  return (
    <TableHead category={isSortable ? HeaderCategory.sortable : HeaderCategory.normal} className="page_refero__table__gtable__header">
      <TableRow className="page_refero__table__gtable__header__row">
        {columns.map(col => {
          const isActive = col.summaryLinkId === activeSortKey;
          return (
            <TableHeadCell
              key={col.summaryLinkId}
              sortable={isSortable}
              sortDir={isActive ? sortDir : undefined}
              onClick={isSortable ? (): void => onSort?.(col.summaryLinkId) : undefined}
              className="page_refero__table__gtable__header__row__cell"
            >
              {col.header}
            </TableHeadCell>
          );
        })}
      </TableRow>
    </TableHead>
  );
};
