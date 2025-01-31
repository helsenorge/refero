import AsPdf from './AsPdf';
import { getLocalRenderContextType, isDirectChildOfRenderContextOwner } from './helpers';
import { RenderContextType } from '@/constants/renderContextType';

import { useState } from 'react';

import ContextTypeGrid from './ContextTypeGrid';
import ContextTypeGridRow from './ContextTypeGridRow';
import DefaultGroup from './DefaultGroup';
import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { useSelector } from 'react-redux';
import { GlobalState } from '@/reducers';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { findQuestionnaireItem, getResponseItemWithPathSelector } from '@/reducers/selectors';
import { isTableCode } from '@/util';
import { getCodingTextTableValues } from '@/util/extension';
import TableContainer from './table/TableContainer';

export type Props = QuestionnaireComponentItemProps;

export const Group = (props: Props): JSX.Element | null => {
  const { pdf, renderContext, path, linkId } = props;
  const item = useSelector<GlobalState, QuestionnaireItem | undefined>(state => findQuestionnaireItem(state, linkId));
  const responseItem = useSelector<GlobalState, QuestionnaireResponseItem | undefined>(state =>
    getResponseItemWithPathSelector(state, path)
  );
  const [isHelpVisible, setIsHelpVisible] = useState(false);

  const isLocalRenderContextTypeGrid = getLocalRenderContextType(item) === RenderContextType.Grid;
  const isRenderContextTypeGrid = renderContext.RenderContextType === RenderContextType.Grid;
  const isTableComponent = isTableCode(getCodingTextTableValues(item));
  function renderContent(): JSX.Element | null {
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
