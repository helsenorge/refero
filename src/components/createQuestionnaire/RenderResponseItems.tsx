import { createIdSuffix, createPathForItem, Path } from '@/util/refero-core';
import GenerateQuestionnaireComponents, { QuestionnaireComponentItemProps } from './GenerateQuestionnaireComponents';
import { getChildHeaderTag, isRepeat } from '@/util';
import { QuestionnaireItem, QuestionnaireResponseItem, Resource } from 'fhir/r4';
import { RenderContext } from '@/util/renderContext';

import ItemType from '@/constants/itemType';
import constants, { NAVIGATOR_BLINDZONE_ID } from '@/constants';

type RenderResponseItemsProps = {
  item: QuestionnaireItem;
  responseItems: QuestionnaireResponseItem[];
  path?: Path[];
  ItemComponent: React.ComponentType<QuestionnaireComponentItemProps>;
  language?: string;
  containedResources?: Resource[];
  renderContext: RenderContext;
  pdf?: boolean;
  isNavigatorEnabled: boolean;
  headerTag?: number;
  checkIfEnabled: (item?: QuestionnaireItem, path?: Path[]) => boolean;
};

export const RenderResponseItems = ({
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
  checkIfEnabled,
}: RenderResponseItemsProps): JSX.Element[] | null => {
  let isNavigatorBlindzoneInitiated = false;

  return responseItems
    .map((responseItem, index) => {
      const newPath = createPathForItem(path, item, index);

      if (!checkIfEnabled(item, newPath)) {
        return null;
      }
      const idWithLinkIdAndItemIndex = `${item.linkId}${createIdSuffix(newPath, index, isRepeat(item))}`;
      const id = `item_${responseItem.linkId}${createIdSuffix(newPath, index, isRepeat(item))}`;

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

      if (isNavigatorEnabled && !isNavigatorBlindzoneInitiated) {
        isNavigatorBlindzoneInitiated = true;
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
          linkId={item.linkId}
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
    })
    .filter(component => component !== null);
};
