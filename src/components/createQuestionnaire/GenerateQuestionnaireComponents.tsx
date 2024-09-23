import React, { useMemo } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { QuestionnaireItem, QuestionnaireResponseItem, Resource } from 'fhir/r4';

import { RenderContext } from '@/util/renderContext';
import { isHiddenItem } from '@/util/index';
import { Resources } from '@/util/resources';
import { getCodingTextTableValues, getNavigatorExtension } from '@/util/extension';
import { getFormData, getFormDefinition } from '@/reducers/form';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import { isHelpItem } from '@/util/help';
import { GlobalState } from '@/reducers';
import { Path } from '@/util/refero-core';
import { getComponentForItem, getResponseItems } from './utils';
import { RenderResponseItems } from './RenderResponseItems';

export type QuestionnaireComponentItemProps = {
  resources?: Resources;
  responseItem: QuestionnaireResponseItem;
  containedResources?: Resource[];
  item: QuestionnaireItem;
  headerTag?: number;
  pdf?: boolean;
  language?: string;
  includeSkipLink?: boolean;
  blindzone?: JSX.Element | null;
  path: Path[];
  id: string;
  index: number;
  renderContext: RenderContext;
  responseItems: QuestionnaireResponseItem[];
  idWithLinkIdAndItemIndex: string;
  children?: React.ReactNode;
};

export type QuestionnaireItemsProps = {
  items: QuestionnaireItem[] | undefined;
  responseItem?: QuestionnaireResponseItem;
  path?: Path[];
  pdf?: boolean;
  renderContext?: RenderContext;
  headerTag?: number;
};

const GenerateQuestionnaireComponents = (props: QuestionnaireItemsProps): JSX.Element | null => {
  const { items, path = [], pdf = false, renderContext = new RenderContext(), responseItem, headerTag } = props;
  const { resources } = useExternalRenderContext();

  const formDefinition = useSelector((state: GlobalState) => getFormDefinition(state), shallowEqual);
  const formData = useSelector((state: GlobalState) => getFormData(state), shallowEqual);

  const questionnaire = useMemo(() => formDefinition?.Content, [formDefinition]);
  const containedResources = useMemo(() => questionnaire?.contained, [questionnaire]);
  const language = useMemo(() => formData?.Content?.language, [formData]);
  const isNavigatorEnabled = useMemo(() => !!getNavigatorExtension(questionnaire), [questionnaire]);

  if (!items || !questionnaire || questionnaire.item?.length === 0) {
    return null;
  }

  return (
    <>
      {items.map(item => {
        if (isHelpItem(item) || isHiddenItem(item)) {
          return null;
        }

        const ItemComponent = getComponentForItem(item.type, getCodingTextTableValues(item));
        if (!ItemComponent) {
          return null;
        }

        const responseItems = getResponseItems(item, formData, responseItem);
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
            resources={resources}
            language={language}
            containedResources={containedResources}
            renderContext={renderContext}
            pdf={pdf}
            isNavigatorEnabled={isNavigatorEnabled}
            headerTag={headerTag}
          />
        );
      })}
    </>
  );
};

export default GenerateQuestionnaireComponents;

// type RenderResponseItemsProps = {
//   item: QuestionnaireItem;
//   responseItems: QuestionnaireResponseItem[];
//   path: Path[];
//   ItemComponent: React.ComponentType<QuestionnaireComponentItemProps>;
//   resources?: Resources;
//   language?: string;
//   containedResources?: Resource[];
//   renderContext: RenderContext;
//   pdf?: boolean;
//   isNavigatorEnabled: boolean;
//   headerTag?: number;
// };

// const RenderResponseItems = ({
//   item,
//   responseItems,
//   path,
//   ItemComponent,
//   resources,
//   language,
//   containedResources,
//   renderContext,
//   pdf,
//   isNavigatorEnabled,
//   headerTag,
// }: RenderResponseItemsProps): JSX.Element[] => {
//   let isNavigatorBlindzoneInitiated = false;

//   return responseItems.map((responseItem, index) => {
//     const newPath = createPathForItem(path, item, index);
//     const idWithLinkIdAndItemIndex = `${item.linkId}${createIdSuffix(newPath, index, isRepeat(item))}`;
//     const key = `item_${responseItem.linkId}_${index}`;
//     const id = `item_${responseItem.linkId}${createIdSuffix(newPath, index, isRepeat(item))}`;

//     let blindzone: JSX.Element | null = null;
//     let includeSkipLink = false;
//     let newHeaderTag = headerTag;

//     if (item.type === ItemType.GROUP) {
//       if (headerTag !== undefined) {
//         newHeaderTag = getChildHeaderTag(item, headerTag);
//       } else {
//         newHeaderTag = constants.DEFAULT_HEADER_TAG;
//       }
//     }

//     if (isNavigatorEnabled && !isNavigatorBlindzoneInitiated) {
//       isNavigatorBlindzoneInitiated = true;
//       blindzone = <section id={NAVIGATOR_BLINDZONE_ID} tabIndex={-1} />;
//       includeSkipLink = item.type === ItemType.GROUP;
//     }

//     return (
//       <ItemComponent
//         key={key}
//         idWithLinkIdAndItemIndex={idWithLinkIdAndItemIndex}
//         language={language}
//         includeSkipLink={includeSkipLink}
//         containedResources={containedResources}
//         id={id}
//         item={item}
//         responseItem={responseItem}
//         resources={resources}
//         path={newPath}
//         headerTag={newHeaderTag}
//         index={index}
//         responseItems={responseItems}
//         renderContext={renderContext}
//         pdf={pdf}
//         blindzone={blindzone}
//       >
//         {item.item && (
//           <GenerateQuestionnaireComponents
//             items={item.item}
//             path={newPath}
//             pdf={pdf}
//             responseItem={responseItem}
//             renderContext={renderContext}
//             headerTag={newHeaderTag}
//           />
//         )}
//       </ItemComponent>
//     );
//   });
// };
