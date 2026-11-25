import { useMemo, useState, type Dispatch } from 'react';

import { shallowEqual } from 'react-redux';

import { TableBody, Table as HnTable, SortDirection } from '@helsenorge/designsystem-react/components/Table';

import commonStyles from '../common-styles.module.css';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import GroupHeader from './GroupHeader';
import { GTableHeader } from './gtable/GTableHeader';
import { getDefaultSortFromGTableItem } from './gtable/sorting';
import { getSortedOrder, getSortValues, getVisibleColumns } from './gtable/tableModel';

import GenerateQuestionnaireComponents, {
  type QuestionnaireComponentItemProps,
} from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { useExternalRenderContext } from '@/context/externalRender/useExternalRender';
import { useAppSelector } from '@/reducers';
import { findQuestionnaireItem, getFlatMapResponseItemsForItemSelector, getResponseItemsSelector } from '@/reducers/selectors';
import { isItemCopyGroup } from '@/util/extension';
import { shouldRenderDeleteButton, type Path } from '@/util/refero-core';
import { createTableRenderContext } from '@/util/renderContext';

type Props = QuestionnaireComponentItemProps & {
  isHelpVisible: boolean;
  setIsHelpVisible: Dispatch<React.SetStateAction<boolean>>;
};

const NO_VALUES: string[] = [];

/**
 * A group shown as a gtable: one row per occurrence of the group, one column per question. Only the first occurrence
 * renders the table. Like grid, the rows are the normal pipeline rendering the group's occurrences in a table
 * context (see GTableRowView); this component only works out the columns, the order and the frame around them.
 * - Copied occurrences (row source on the group) are read-only and can be sorted.
 * - Occurrences the person fills in are editable, with buttons to add and delete rows, in the order they were added.
 */
const GTableView = ({ linkId, index, path, headerTag, pdf, isHelpVisible, setIsHelpVisible }: Props): React.JSX.Element | null => {
  const item = useAppSelector(state => findQuestionnaireItem(state, linkId));
  const { resources } = useExternalRenderContext();
  const editable = !!item && !isItemCopyGroup(item) && !item.readOnly && !pdf;

  const parentPath = useMemo(() => (path ?? []).slice(0, -1), [path]);
  const firstOccurrencePath = useMemo<Path[]>(() => [...parentPath, { linkId, index: 0 }], [parentPath, linkId]);

  // Narrow selectors: the table only re-renders when its columns, its number of rows or its sort values change.
  const columns = useAppSelector(
    state => (item ? getVisibleColumns(item, firstOccurrencePath, getResponseItemsSelector(state)) : NO_VALUES),
    shallowEqual
  );
  // The group's occurrences under its parent, found the same way as for the rows and the repeat button.
  const rowCount = useAppSelector(state => getFlatMapResponseItemsForItemSelector(state, linkId, parentPath)?.length ?? 0);

  const columnHeaders = useMemo(
    () =>
      columns.map(columnLinkId => ({
        header: item?.item?.find(question => question.linkId === columnLinkId)?.text ?? columnLinkId,
        sourceLinkId: columnLinkId,
        summaryLinkId: columnLinkId,
      })),
    [item, columns]
  );
  const defaultSort = item && !editable ? getDefaultSortFromGTableItem(item, columnHeaders) : {};
  const [sortKey, setSortKey] = useState<string | undefined>(defaultSort.sortKey);
  const [sortDir, setSortDir] = useState<SortDirection>(defaultSort.sortDir ?? SortDirection.asc);
  const sortColumn = !editable && sortKey && columns.includes(sortKey) ? sortKey : undefined;
  const sortValues = useAppSelector(
    state => (sortColumn ? getSortValues(getFlatMapResponseItemsForItemSelector(state, linkId, parentPath) ?? [], sortColumn) : NO_VALUES),
    shallowEqual
  );
  const order = useMemo(() => (sortColumn ? getSortedOrder(sortValues, sortDir) : undefined), [sortColumn, sortValues, sortDir]);

  // The column for the delete buttons is only there when a row can be deleted (never the first row).
  const deletable = !!item && editable && Array.from({ length: rowCount }, (_, i) => i).some(i => shouldRenderDeleteButton(item, i));

  // One context for the table, kept between renders so the memoized rows do not re-render because of it.
  const tableContext = useMemo(
    () => createTableRenderContext({ owner: linkId, columns, readOnly: !editable, order, deletable }),
    [linkId, columns, editable, order, deletable]
  );
  const items = useMemo(() => (item ? [item] : []), [item]);

  // A table without rows or columns is not shown.
  if (!item || index > 0 || columns.length === 0 || rowCount === 0) {
    return null;
  }

  const onSort = (summaryLinkId: string): void => {
    if (sortKey === summaryLinkId) {
      setSortDir(previous => (previous === SortDirection.asc ? SortDirection.desc : SortDirection.asc));
    } else {
      setSortKey(summaryLinkId);
      setSortDir(SortDirection.asc);
    }
  };

  // The table is named after the group, and scrolls sideways in a focusable, named region when it is too wide.
  const tableName = item.text ?? item.linkId;
  const actionsHeader = deletable ? (
    <span className={commonStyles.visuallyHidden}>{resources?.tableActions ?? 'Handlinger'}</span>
  ) : undefined;
  const lastPath: Path[] = [...parentPath, { linkId, index: rowCount - 1 }];

  return (
    <>
      <GroupHeader
        headerTag={headerTag}
        isHelpVisible={isHelpVisible}
        setIsHelpVisible={setIsHelpVisible}
        item={item}
        resources={resources}
      />
      <HnTable
        className={`page_refero__table__gtable${editable ? ' page_refero__table__gtable--editable' : ''}`}
        testId="gtable"
        aria-label={tableName}
        breakpointConfig={{ breakpoint: 'xl', variant: 'horizontalscroll', fallbackVariant: 'horizontalscroll' }}
        scrollAriaLabel={tableName}
      >
        {editable ? (
          <GTableHeader columns={columnHeaders} trailingHeader={actionsHeader} />
        ) : (
          <GTableHeader columns={columnHeaders} activeSortKey={sortKey} sortDir={sortDir} onSort={onSort} />
        )}
        <TableBody className="page_refero__table__gtable__body">
          {/* The group's occurrences, rendered by the normal pipeline as rows (GTableRowView). */}
          <GenerateQuestionnaireComponents items={items} path={parentPath} pdf={pdf} renderContext={tableContext} />
        </TableBody>
      </HnTable>
      {editable && <RenderRepeatButton item={item} index={rowCount - 1} path={lastPath} resources={resources} />}
      <br />
    </>
  );
};

export default GTableView;
