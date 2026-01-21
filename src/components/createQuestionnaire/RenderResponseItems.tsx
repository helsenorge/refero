import { memo, useRef } from 'react';

import type { QuestionnaireComponentItemProps } from './GenerateQuestionnaireComponents';
import type { Path } from '@/util/refero-core';
import type { RenderContext } from '@/util/renderContext';
import type { Resource, QuestionnaireItem } from 'fhir/r4';

import ResponseItem from './ResponseItem';

type RenderResponseItemsProps = {
  item: QuestionnaireItem;
  responseItems: string[];
  path?: Path[];
  ItemComponent: React.ComponentType<QuestionnaireComponentItemProps>;
  language?: string;
  containedResources?: Resource[];
  renderContext: RenderContext;
  pdf?: boolean;
  isNavigatorEnabled: boolean;
  headerTag?: number;
};

export const RenderResponseItems = memo(function RenderResponseItems({
  item,
  responseItems,
  path,
  ItemComponent,
  language,
  containedResources,
  renderContext,
  pdf,
  isNavigatorEnabled,
  headerTag,
}: RenderResponseItemsProps): React.JSX.Element[] | null {
  const isNavigatorBlindzoneInitiatedRef = useRef(false);

  return responseItems
    .map((linkId, index) => (
      <ResponseItem
        key={`${linkId}-${index}`}
        linkId={linkId}
        index={index}
        item={item}
        path={path}
        ItemComponent={ItemComponent}
        language={language}
        containedResources={containedResources}
        renderContext={renderContext}
        pdf={pdf}
        isNavigatorEnabled={isNavigatorEnabled}
        headerTag={headerTag}
        isNavigatorBlindzoneInitiatedRef={isNavigatorBlindzoneInitiatedRef}
      />
    ))
    .filter(component => component !== null);
});
