import { useState } from 'react';

import type { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';

import AsPdf from './AsPdf';
import ContextTypeGrid from './ContextTypeGrid';
import ContextTypeGridRow from './ContextTypeGridRow';
import DefaultGroup from './DefaultGroup';
import GTableRowView from './GTableRowView';
import GTableView from './GTableView';
import { getLocalRenderContextType, isDirectChildOfRenderContextOwner } from './helpers';
import TableContainer from './table/TableContainer';

import { RenderContextType } from '@/constants/renderContextType';
import { useAppSelector } from '@/reducers';
import { findQuestionnaireItem, getResponseItemWithPathSelector } from '@/reducers/selectors';
import { isTableCode } from '@/util';
import { getCodingTextTableValues, isGTableView } from '@/util/extension';
import { isTableRowOf } from '@/util/renderContext';

export type Props = QuestionnaireComponentItemProps;

export const Group = (props: Props): React.JSX.Element | null => {
  const { pdf, renderContext, path, linkId } = props;
  const item = useAppSelector(state => findQuestionnaireItem(state, linkId));
  const responseItem = useAppSelector(state => getResponseItemWithPathSelector(state, path));
  const [isHelpVisible, setIsHelpVisible] = useState(false);

  const isLocalRenderContextTypeGrid = getLocalRenderContextType(item) === RenderContextType.Grid;
  const isRenderContextTypeGrid = renderContext.RenderContextType === RenderContextType.Grid;
  const isTableComponent = isTableCode(getCodingTextTableValues(item));

  // An occurrence of the group that owns a gtable is one of its rows. Not wrapped by AsPdf: a row must stay in <tbody>.
  if (isTableRowOf(renderContext, item?.linkId)) {
    return <GTableRowView {...props} />;
  }

  function renderContent(): React.JSX.Element | null {
    // gtable as a view of the group itself; old gtables (no row source on the group) go to the table components.
    if (isGTableView(item)) {
      return <GTableView {...props} isHelpVisible={isHelpVisible} setIsHelpVisible={setIsHelpVisible} />;
    }
    if (isTableComponent) {
      return <TableContainer {...props} isHelpVisible={isHelpVisible} setIsHelpVisible={setIsHelpVisible} />;
    }

    if (isLocalRenderContextTypeGrid) {
      return <ContextTypeGrid {...props} item={item} responseItem={responseItem} />;
    }

    if (isRenderContextTypeGrid) {
      if (isDirectChildOfRenderContextOwner(path ?? [], item, renderContext)) {
        return <ContextTypeGridRow {...props} isHelpVisible={isHelpVisible} setIsHelpVisible={setIsHelpVisible} />;
      }
      return <DefaultGroup {...props} isHelpVisible={isHelpVisible} setIsHelpVisible={setIsHelpVisible} />;
    }

    return <DefaultGroup {...props} isHelpVisible={isHelpVisible} setIsHelpVisible={setIsHelpVisible} />;
  }

  return <AsPdf pdf={!!pdf}>{renderContent()}</AsPdf>;
};

export default Group;
