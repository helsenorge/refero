import { useMemo } from 'react';

import { TableCell, TableRow } from '@helsenorge/designsystem-react/components/Table';

import RenderDeleteButton from '../repeat/RenderDeleteButton';

import styles from './gtable.module.css';

import GenerateQuestionnaireComponents, {
  type QuestionnaireComponentItemProps,
} from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { useExternalRenderContext } from '@/context/externalRender/useExternalRender';
import { useAppSelector } from '@/reducers';
import { findQuestionnaireItem } from '@/reducers/selectors';
import { withTableRow } from '@/util/renderContext';

/**
 * One occurrence of a group shown as a gtable, as a table row: each column's question is rendered by its own
 * component in the row's context, which says it is in a table (no title, read-only when the table is). Hidden and
 * enableWhen are decided by the components, so a question that is turned off in this row leaves its cell empty.
 */
const GTableRowView = ({ linkId, path, index, pdf, renderContext }: QuestionnaireComponentItemProps): React.JSX.Element => {
  const item = useAppSelector(state => findQuestionnaireItem(state, linkId));
  const { resources } = useExternalRenderContext();
  // One context per row, kept between renders so the memoized item components do not re-render because of it.
  const rowContext = useMemo(() => withTableRow(renderContext, index + 1), [renderContext, index]);
  const rowLabel = `${resources?.tableRow ?? 'rad'} ${index + 1}`;

  return (
    <TableRow className="page_refero__table__gtable__body__row">
      {renderContext.Columns.map(columnLinkId => {
        const question = item?.item?.find(child => child.linkId === columnLinkId);
        return (
          <TableCell key={columnLinkId} testId={`${columnLinkId}-${index}`} className={styles.cell}>
            {question && <GenerateQuestionnaireComponents items={[question]} path={path} pdf={pdf} renderContext={rowContext} />}
          </TableCell>
        );
      })}
      {renderContext.Deletable && (
        <TableCell className={styles.rowButtons}>
          <RenderDeleteButton item={item} path={path} index={index} screenReaderSuffix={rowLabel} />
        </TableCell>
      )}
    </TableRow>
  );
};

export default GTableRowView;
