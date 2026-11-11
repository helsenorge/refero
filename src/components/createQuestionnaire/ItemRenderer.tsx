import { memo, useMemo } from 'react';

import { createSelector } from 'reselect';

import type { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import type { FormData } from '@/reducers/form';
import type { Path } from '@/util/refero-core';
import type { RenderContext } from '@/util/renderContext';
import type { QuestionnaireItem, Resource } from 'fhir/r4';

import { RenderResponseItems } from './RenderResponseItems';
import { getComponentForItem } from './utils';

import { PluginComponentWrapper } from '@/components/formcomponents/plugin/PluginComponentWrapper';
import { useComponentPluginRegistry } from '@/context/componentPlugin';
import { useCheckIfShown } from '@/hooks/useIsEnabled';
import { useAppSelector } from '@/reducers';
import { getFlatMapResponseItemsForItemSelector } from '@/reducers/selectors';
import { resolvePluginComponent } from '@/util/componentPluginResolver';
import { isHelpItem } from '@/util/help';

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
  const checkIfShown = useCheckIfShown();
  // Not hidden, and enabled at the first index. ResponseItem checks each repetition at its own index.
  const isShown = checkIfShown(item, path);
  const responseItems = useAppSelector(state => responseItemsSelector(state, item.linkId, path));
  const pluginRegistry = useComponentPluginRegistry();

  const pluginResolution = resolvePluginComponent(item, pluginRegistry);
  const pluginComponent = pluginResolution?.component;
  const matchedCode = pluginResolution?.matchedCode;

  const PluginWrapperComponent = useMemo(() => {
    if (!pluginComponent) return null;

    return Object.assign(
      (props: QuestionnaireComponentItemProps): React.JSX.Element | null => {
        return <PluginComponentWrapper {...props} PluginComponent={pluginComponent} />;
      },
      { displayName: `PluginWrapper(${matchedCode})` }
    );
  }, [pluginComponent, matchedCode]);

  if (isHelpItem(item) || !isShown) {
    return null;
  }

  // Use plugin component if available, otherwise fall back to built-in component
  const ItemComponent = PluginWrapperComponent ?? getComponentForItem(item.type);
  if (!ItemComponent) {
    return null;
  }

  if (!responseItems || responseItems.length === 0) {
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
