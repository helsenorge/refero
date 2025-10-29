import React from 'react';

import { TableCell } from '@helsenorge/designsystem-react/components/Table';

import { Column } from './utils';

interface Props {
  value?: string;
  col: Column;
  rowIndex: number;
}

/**
 * Dumb cell:
 * - gets pre-computed value
 * - optionally render it using your renderer if needed
 */
export const GTableCell: React.FC<Props> = ({ value, col, rowIndex }) => {
  const testId = `${col.summaryLinkId}-${rowIndex}`;
  return (
    <TableCell testId={testId} className="page_refero__table__gtable__body__row__cell">
      {value ?? ''}
      {/* If you later want to render as real "FHIR answers":
         <RenderQuestionnaireResponseItemAnswer valueString={value} /> */}
    </TableCell>
  );
};
