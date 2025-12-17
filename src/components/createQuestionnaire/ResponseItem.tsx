import React, { useMemo } from 'react';

import type { RenderContext } from '@/util/renderContext';
import type { Resource, QuestionnaireItem } from 'fhir/r4';

import GenerateQuestionnaireComponents, { type QuestionnaireComponentItemProps } from './GenerateQuestionnaireComponents';
import { createIdFormComponentIds } from './utils';

import constants, { NAVIGATOR_BLINDZONE_ID } from '@/constants';
import ItemType from '@/constants/itemType';
import { useCheckIfEnabled } from '@/hooks/useIsEnabled';
import { getChildHeaderTag } from '@/util';
import { createPathForItem, type Path } from '@/util/refero-core';

type ResponseItemProps = {
  linkId: string;
  index: number;
  item: QuestionnaireItem;
  path?: Path[];
  ItemComponent: React.ComponentType<QuestionnaireComponentItemProps>;
  language?: string;
  containedResources?: Resource[];
  renderContext: RenderContext;
  pdf?: boolean;
  isNavigatorEnabled: boolean;
  headerTag?: number;
  isNavigatorBlindzoneInitiatedRef: React.MutableRefObject<boolean>;
};

const ResponseItem = React.memo(function ResponseItem({
  linkId,
  index,
  item,
  path,
  ItemComponent,
  language,
  containedResources,
  renderContext,
  pdf,
  isNavigatorEnabled,
  headerTag,
  isNavigatorBlindzoneInitiatedRef,
}: ResponseItemProps) {
  const checkIfEnabled = useCheckIfEnabled();

  // Memoize newPath
  const newPath = useMemo(() => createPathForItem(path, item, index), [path, item, index]);

  if (!checkIfEnabled(item, newPath)) {
    return null;
  }

  const idWithLinkIdAndItemIndex = createIdFormComponentIds(item, path, index);
  const id = `item_${idWithLinkIdAndItemIndex}`;

  let blindzone: JSX.Element | null = null;
  let includeSkipLink = false;
  let newHeaderTag = headerTag;

  if (item.type === ItemType.GROUP) {
    if (headerTag !== undefined) {
      newHeaderTag = getChildHeaderTag(item, headerTag);
    } else {
      newHeaderTag = constants.DEFAULT_HEADER_TAG;
    }
  }

  if (isNavigatorEnabled && !isNavigatorBlindzoneInitiatedRef.current) {
    isNavigatorBlindzoneInitiatedRef.current = true;
    blindzone = <section id={NAVIGATOR_BLINDZONE_ID} tabIndex={-1} />;
    includeSkipLink = item.type === ItemType.GROUP;
  }

  return (
    <ItemComponent
      key={id}
      idWithLinkIdAndItemIndex={idWithLinkIdAndItemIndex}
      language={language}
      includeSkipLink={includeSkipLink}
      containedResources={containedResources}
      id={id}
      linkId={linkId}
      path={newPath}
      headerTag={newHeaderTag}
      index={index}
      renderContext={renderContext}
      pdf={pdf}
      blindzone={blindzone}
    >
      {item.item && (
        <GenerateQuestionnaireComponents
          items={item.item}
          path={newPath}
          pdf={pdf}
          renderContext={renderContext}
          headerTag={newHeaderTag}
        />
      )}
    </ItemComponent>
  );
});

export default ResponseItem;
