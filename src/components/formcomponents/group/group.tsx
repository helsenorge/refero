import AsPdf from './AsPdf';
import { getLocalRenderContextType, isDirectChildOfRenderContextOwner } from './helpers';
import { RenderContextType } from '@/constants/renderContextType';

import { useIsEnabled } from '@/hooks/useIsEnabled';
import { useState } from 'react';

import ContextTypeGrid from './ContextTypeGrid';
import ContextTypeGridRow from './ContextTypeGridRow';
import DefaultGroup from './DefaultGroup';
import { RenderItemProps } from '../renderChildren/RenderChildrenItems';

export type Props = RenderItemProps;

export const Group = (props: Props): JSX.Element | null => {
  const { pdf, renderContext, path, item } = props;
  const enable = useIsEnabled(item, path);
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  if (!enable) {
    return null;
  }
  const isLocalRenderContextTypeGrid = getLocalRenderContextType(item) === RenderContextType.Grid;
  const isRenderContextTypeGrid = renderContext.RenderContextType === RenderContextType.Grid;
  return (
    <AsPdf pdf={!!pdf}>
      {isLocalRenderContextTypeGrid ? (
        <ContextTypeGrid {...props} />
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
