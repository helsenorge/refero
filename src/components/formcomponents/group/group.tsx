import { QuestionnaireItem } from 'fhir/r4';

import AsPdf from './AsPdf';
import { getLocalRenderContextType, isDirectChildOfRenderContextOwner } from './helpers';
import { RenderContextType } from '@/constants/renderContextType';
import { Path } from '@/util/refero-core';
import { RenderContext } from '@/util/renderContext';
import { Resources } from '@/util/resources';
import withCommonFunctions, { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';
import { useIsEnabled } from '@/hooks/useIsEnabled';
import { useState } from 'react';

import ContextTypeGrid from './ContextTypeGrid';
import ContextTypeGridRow from './ContextTypeGridRow';
import DefaultGroup from './DefaultGroup';

export interface Props extends WithCommonFunctionsAndEnhancedProps {
  item: QuestionnaireItem;
  path: Path[];
  includeSkipLink?: boolean;
  className?: string;
  resources?: Resources;
  headerTag?: number;
  attachmentErrorMessage?: string;
  renderChildrenItems: (renderContext: RenderContext) => JSX.Element[] | null;
  id?: string;
}

export const Group = ({
  pdf,
  renderContext,
  id,
  includeSkipLink,
  path,
  item,
  questionnaire,
  resources,
  renderChildrenItems,
  headerTag,
  index,
  responseItem,
  responseItems,
  onAnswerChange,
}: Props): JSX.Element | null => {
  const enable = useIsEnabled(item, path);
  const [isHelpVisible, setIsHelpVisible] = useState(false);

  if (!enable) {
    return null;
  }
  const localRenderContextType = getLocalRenderContextType(item);
  const isLocalRenderContextTypeGrid = localRenderContextType === RenderContextType.Grid;
  const isRenderContextTypeGrid = renderContext.RenderContextType === RenderContextType.Grid;
  return (
    <AsPdf pdf={!!pdf}>
      {isLocalRenderContextTypeGrid && (
        <ContextTypeGrid
          item={item}
          path={path}
          renderChildrenItems={renderChildrenItems}
          responseItem={responseItem}
          id={id}
          index={index}
          onAnswerChange={onAnswerChange}
          resources={resources}
          responseItems={responseItems}
        />
      )}
      {isRenderContextTypeGrid ? (
        isDirectChildOfRenderContextOwner(path, item, renderContext) ? (
          <ContextTypeGridRow
            isHelpVisible={isHelpVisible}
            item={item}
            renderChildrenItems={renderChildrenItems}
            renderContext={renderContext}
            setIsHelpVisible={setIsHelpVisible}
            headerTag={headerTag}
            questionnaire={questionnaire}
            resources={resources}
          />
        ) : (
          <DefaultGroup
            id={id}
            isHelpVisible={isHelpVisible}
            item={item}
            path={path}
            renderChildrenItems={renderChildrenItems}
            responseItem={responseItem}
            setIsHelpVisible={setIsHelpVisible}
            headerTag={headerTag}
            includeSkipLink={includeSkipLink}
            index={index}
            onAnswerChange={onAnswerChange}
            questionnaire={questionnaire}
            resources={resources}
            responseItems={responseItems}
          />
        )
      ) : (
        <DefaultGroup
          id={id}
          isHelpVisible={isHelpVisible}
          item={item}
          path={path}
          renderChildrenItems={renderChildrenItems}
          responseItem={responseItem}
          setIsHelpVisible={setIsHelpVisible}
          headerTag={headerTag}
          includeSkipLink={includeSkipLink}
          index={index}
          onAnswerChange={onAnswerChange}
          questionnaire={questionnaire}
          resources={resources}
          responseItems={responseItems}
        />
      )}
    </AsPdf>
  );
};

const withCommonFunctionsComponent = withCommonFunctions(Group);
export default withCommonFunctionsComponent;
