import { memo } from 'react';

import { createSelector } from 'reselect';

import type { FormData } from '@/reducers/form';
import type { RenderContext } from '@/util/renderContext';
import type { QuestionnaireItem, Resource } from 'fhir/r4';

import { RenderResponseItems } from './RenderResponseItems';
import { getComponentForItem } from './utils';

import { useIsEnabled } from '@/hooks/useIsEnabled';
import { useAppSelector } from '@/reducers';
import { getFlatMapResponseItemsForItemSelector } from '@/reducers/selectors';
import { isHelpItem } from '@/util/help';
import { isHiddenItem } from '@/util/index';
import { createPathForItem, type Path } from '@/util/refero-core';

type ItemRendererProps = {
  item: QuestionnaireItem;
  formData?: FormData | null;
  path?: Path[];
  renderContextValue: RenderContext;
  language: string | undefined;
  containedResources: Resource[] | undefined;
  pdf: boolean;
  isNavigatorEnabled: boolean;
  headerTag?: number;
};
const responseItemsSelector = createSelector([getFlatMapResponseItemsForItemSelector], responseitems =>
  responseitems?.map(responseItem => responseItem.linkId)
);
const ItemRenderer = memo(function ItemRenderer({
  item,
  path,
  renderContextValue,
  language,
  containedResources,
  pdf,
  isNavigatorEnabled,
  headerTag,
}: ItemRendererProps) {
  const isEnabled = useIsEnabled(item, createPathForItem(path, item, 0));
  const responseItems = useAppSelector(state => responseItemsSelector(state, item.linkId, path));

  if (isHelpItem(item) || isHiddenItem(item)) {
    return null;
  }

  const ItemComponent = getComponentForItem(item.type);
  if (!ItemComponent) {
    return null;
  }

  if (!responseItems || responseItems.length === 0) {
    return null;
  }

  if (!isEnabled) {
    return null;
  }

  return (
    <RenderResponseItems
      key={item.linkId}
      item={item}
      responseItems={responseItems}
      path={path}
      ItemComponent={ItemComponent}
      language={language}
      containedResources={containedResources}
      renderContext={renderContextValue}
      pdf={pdf}
      isNavigatorEnabled={isNavigatorEnabled}
      headerTag={headerTag}
    />
  );
});
export default ItemRenderer;
