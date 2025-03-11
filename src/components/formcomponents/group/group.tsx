import { useState } from 'react';

import AsPdf from './AsPdf';
import ContextTypeGrid from './ContextTypeGrid';
import ContextTypeGridRow from './ContextTypeGridRow';
import DefaultGroup from './DefaultGroup';
import { ReferoButtonGroup } from './formButtons/ReferoButtonGroup';
import { getLocalRenderContextType, isDirectChildOfRenderContextOwner } from './helpers';
import TableContainer from './table/TableContainer';

import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { RenderContextType } from '@/constants/renderContextType';
import { useAppSelector } from '@/reducers';
import { findQuestionnaireItem, getResponseItemWithPathSelector } from '@/reducers/selectors';
import { isTableCode } from '@/util';
import { getCodingTextTableValues, isButtonContainerCode } from '@/util/extension';

export type Props = QuestionnaireComponentItemProps;

export const Group = (props: Props): JSX.Element | null => {
  const { pdf, renderContext, path, linkId } = props;
  const item = useAppSelector(state => findQuestionnaireItem(state, linkId));
  const responseItem = useAppSelector(state => getResponseItemWithPathSelector(state, path));
  const [isHelpVisible, setIsHelpVisible] = useState(false);

  const isLocalRenderContextTypeGrid = getLocalRenderContextType(item) === RenderContextType.Grid;
  const isRenderContextTypeGrid = renderContext.RenderContextType === RenderContextType.Grid;
  const isTableComponent = isTableCode(getCodingTextTableValues(item));
  const isButtonGroupComponent = isButtonContainerCode(item);

  function renderContent(): JSX.Element | null {
    if (isButtonGroupComponent) {
      return <ReferoButtonGroup {...props} />;
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
