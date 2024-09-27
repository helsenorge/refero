import { memo, useMemo } from 'react';
import { QuestionnaireItem, Resource } from 'fhir/r4';
import { RenderContext } from '@/util/renderContext';
import { isHiddenItem } from '@/util/index';
import { getCodingTextTableValues } from '@/util/extension';
import { isHelpItem } from '@/util/help';
import { createPathForItem, Path } from '@/util/refero-core';
import { getComponentForItem } from './utils';
import { RenderResponseItems } from './RenderResponseItems';

import { FormData } from '@/reducers/form';
import { getFlatMapResponseItemsForItemSelector } from '@/reducers/selectors';
import { createSelector } from 'reselect';
import { useSelector } from 'react-redux';
import { GlobalState } from '@/reducers';
import { useIsEnabled } from '@/hooks/useIsEnabled';

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

  if (isHelpItem(item) || isHiddenItem(item)) {
    return null;
  }

  const ItemComponent = getComponentForItem(item.type, getCodingTextTableValues(item));
  if (!ItemComponent) {
    return null;
  }

  const responseItems = useSelector((state: GlobalState) => responseItemsSelector(state, item.linkId, path));

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
