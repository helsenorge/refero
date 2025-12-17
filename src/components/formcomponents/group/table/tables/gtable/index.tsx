import React from 'react';

import type { QuestionnaireItem, QuestionnaireResponse } from 'fhir/r4';

import { TableBody, Table as HnTable, SortDirection } from '@helsenorge/designsystem-react/components/Table';

import { GTableHeader } from './GTableHeader';
import { GTableRows } from './GTableRows';
import { getDefaultSortFromGTableItem, sortRowsByKey } from './sorting';
import { getColumnsFromGTableItem, inferSourceGroupLinkId, buildGTableRows } from './utils';

import { useAppSelector } from '@/reducers';
import { getFormDefinition } from '@/reducers/form';

interface Props {
  item: QuestionnaireItem;
  questionnaireResponse?: QuestionnaireResponse | null;
}

const GTable = ({ questionnaireResponse, item }: Props): React.JSX.Element | null => {
  const questionnaire = useAppSelector(getFormDefinition)?.Content;
  const columns = getColumnsFromGTableItem(item);

  const { sortKey: defaultKey, sortDir: defaultDir } = getDefaultSortFromGTableItem(item, columns);

  const [sortKey, setSortKey] = React.useState<string | undefined>(defaultKey);
  const [sortDir, setSortDir] = React.useState<SortDirection>(defaultDir ?? SortDirection.asc);

  if (columns.length === 0) return null;

  const sourceGroupLinkId = inferSourceGroupLinkId(questionnaire, columns);

  const unsortedRows = buildGTableRows(questionnaireResponse, sourceGroupLinkId, columns);

  const onSort = (summaryLinkId: string): void => {
    if (sortKey === summaryLinkId) {
      setSortDir(prev => (prev === SortDirection.asc ? SortDirection.desc : SortDirection.asc));
    } else {
      setSortKey(summaryLinkId);
      setSortDir(SortDirection.asc);
    }
  };

  // 5) Sorted rows
  const rows = sortKey ? sortRowsByKey(unsortedRows, sortKey, sortDir) : unsortedRows;

  return rows.length > 0 ? (
    <HnTable className="page_refero__table__gtable" testId="gtable">
      <GTableHeader columns={columns} activeSortKey={sortKey} sortDir={sortDir} onSort={onSort} />
      <TableBody className="page_refero__table__gtable__body">
        <GTableRows rows={rows} columns={columns} />
      </TableBody>
    </HnTable>
  ) : null;
};

export default GTable;
