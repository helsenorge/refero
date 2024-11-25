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
  return (
    <AsPdf pdf={!!pdf}>
      {isLocalRenderContextTypeGrid ? (
        <ContextTypeGrid {...props} item={item} responseItem={responseItem} />
      ) : isRenderContextTypeGrid ? (
        isDirectChildOfRenderContextOwner(path || [], item, renderContext) ? (
          <ContextTypeGridRow {...props} isHelpVisible={isHelpVisible} setIsHelpVisible={setIsHelpVisible} />
        ) : (
          <DefaultGroup {...props} isHelpVisible={isHelpVisible} setIsHelpVisible={setIsHelpVisible} />
        )
      ) : (
        <DefaultGroup {...props} isHelpVisible={isHelpVisible} setIsHelpVisible={setIsHelpVisible} />
      )}
    </AsPdf>
  );
};

export default Group;
