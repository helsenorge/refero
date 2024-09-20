import { createIdSuffix, createPathForItem, Path } from '@/util/refero-core';
import GenerateQuestionnaireComponents, { QuestionnaireComponentItemProps } from './GenerateQuestionnaireComponents';
import { getChildHeaderTag, isRepeat } from '@/util';
import { QuestionnaireItem, QuestionnaireResponseItem, Resource } from 'fhir/r4';
import { RenderContext } from '@/util/renderContext';
import { Resources } from '@/util/resources';
import ItemType from '@/constants/itemType';
import constants, { NAVIGATOR_BLINDZONE_ID } from '@/constants';

type RenderResponseItemsProps = {
  item: QuestionnaireItem;
  responseItems: QuestionnaireResponseItem[];
  path: Path[];
  ItemComponent: React.ComponentType<QuestionnaireComponentItemProps>;
  resources?: Resources;
  language?: string;
  containedResources?: Resource[];
  renderContext: RenderContext;
  pdf?: boolean;
  isNavigatorEnabled: boolean;
  headerTag?: number;
};

export const RenderResponseItems = ({
  item,
  responseItems,
  path,
  ItemComponent,
  resources,
  language,
  containedResources,
  renderContext,
  pdf,
  isNavigatorEnabled,
  headerTag,
}: RenderResponseItemsProps): JSX.Element[] => {
  let isNavigatorBlindzoneInitiated = false;

  return responseItems.map((responseItem, index) => {
    const newPath = createPathForItem(path, item, index);
    const idWithLinkIdAndItemIndex = `${item.linkId}${createIdSuffix(newPath, index, isRepeat(item))}`;
    const key = `item_${responseItem.linkId}_${index}`;
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
        key={key}
        idWithLinkIdAndItemIndex={idWithLinkIdAndItemIndex}
        language={language}
        includeSkipLink={includeSkipLink}
        containedResources={containedResources}
        id={id}
        item={item}
        responseItem={responseItem}
        resources={resources}
        path={newPath}
        headerTag={newHeaderTag}
        index={index}
        responseItems={responseItems}
        renderContext={renderContext}
        pdf={pdf}
        blindzone={blindzone}
      >
        {item.item && (
          <GenerateQuestionnaireComponents
            items={item.item}
            path={newPath}
            pdf={pdf}
            responseItem={responseItem}
            renderContext={renderContext}
            headerTag={newHeaderTag}
          />
        )}
      </ItemComponent>
    );
  });
};
