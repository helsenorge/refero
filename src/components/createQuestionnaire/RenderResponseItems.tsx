import { memo } from 'react';

import type { QuestionnaireComponentItemProps } from './GenerateQuestionnaireComponents';
import type { Path } from '@/util/refero-core';
import type { Resource, QuestionnaireItem } from 'fhir/r4';

import ResponseItem from './ResponseItem';

import { isTableRowOf, type RenderContext } from '@/util/renderContext';

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
  // The rows of a sorted table: the owner's occurrences in the table's order. Indexes stay the occurrence's own.
  const order = isTableRowOf(renderContext, item.linkId) ? renderContext.Order : undefined;
  const indexes = order ?? responseItems.map((_, index) => index);
  return indexes
    .filter(index => index < responseItems.length)
    .map(index => [responseItems[index], index] as const)
    .map(([linkId, index]) => (
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
        isFirstItem={index === 0}
      />
    ))
    .filter(component => component !== null);
});
