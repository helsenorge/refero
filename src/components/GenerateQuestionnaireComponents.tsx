import {
  Path,
  createIdSuffix,
  createPathForItem,
  getItemWithIdFromResponseItemArray,
  getRootQuestionnaireResponseItemFromData,
} from '@/util/refero-core';
import { RenderContext } from '@/util/renderContext';
import { getChildHeaderTag, getComponentForItem, isHiddenItem, isRepeat } from '@/util/index';
import { Resources } from '@/util/resources';
import { QuestionnaireItem, QuestionnaireResponseItem, Resource } from 'fhir/r4';
import { GlobalState } from '@/reducers';
import { getCodingTextTableValues, getNavigatorExtension } from '@/util/extension';
import { FormData, FormDefinition, getFormData, getFormDefinition } from '@/reducers/form';
import ItemType from '@/constants/itemType';
import { useSelector } from 'react-redux';
import { isHelpItem } from '@/util/help';
import constants, { NAVIGATOR_BLINDZONE_ID } from '@/constants';
import { useExternalRenderContext } from '@/context/externalRenderContext';

export type QuestionnaireComponentItemProps = {
  resources?: Resources;
  responseItem: QuestionnaireResponseItem;
  containedResources?: Resource[];
  item: QuestionnaireItem;
  headerTag?: number;
  pdf?: boolean;
  language?: string;
  includeSkipLink?: boolean;
  blindzone: JSX.Element | null;
  path?: Path[];
  id?: string;
  index?: number;
  renderContext: RenderContext;
  responseItems?: QuestionnaireResponseItem[];
  idWithLinkIdAndItemIndex: string;
  children?: React.ReactNode;
};

export type QuestionnaireItemsProps = {
  items: QuestionnaireItem[] | undefined;
  responseItem?: QuestionnaireResponseItem;
  path?: Path[];
  pdf?: boolean;
  renderContext?: RenderContext;
};

const GenerateQuestionnaireComponents = (props: QuestionnaireItemsProps): JSX.Element | null => {
  const { items, path = [], pdf = false, renderContext = new RenderContext(), responseItem } = props;
  const { resources } = useExternalRenderContext();
  const formDefinition = useSelector<GlobalState, FormDefinition | null>((state: GlobalState) => getFormDefinition(state));
  const formData = useSelector<GlobalState, FormData | null>((state: GlobalState) => getFormData(state));
  const questionnaire = formDefinition?.Content;
  const containedResources = formDefinition?.Content?.contained;
  const language = formData?.Content?.language;
  if (!items || !questionnaire || questionnaire.item?.length === 0) {
    return null;
  }
  return (
    <>
      {items.map(item => {
        let blindzone: JSX.Element | null = null;
        let includeSkipLink: boolean = false;
        let headerTag: number | undefined = undefined;
        if (isHelpItem(item) || isHiddenItem(item)) return null;
        const Comp = getComponentForItem(item.type, getCodingTextTableValues(item));

        if (!Comp) return null;
        let responseItems: QuestionnaireResponseItem[] | undefined;

        responseItems = getRootQuestionnaireResponseItemFromData(item.linkId, formData);

        const isNavigatorEnabled = !!getNavigatorExtension(questionnaire);
        let isNavigatorBlindzoneInitiated = false;
        if (!responseItems && responseItem) {
          const { item: childItems, answer: childAnswers } = responseItem;
          headerTag = getChildHeaderTag(item, headerTag);

          if (childItems) {
            responseItems = getItemWithIdFromResponseItemArray(item.linkId, childItems);
          } else if (childAnswers) {
            responseItems = getItemWithIdFromResponseItemArray(item.linkId, childAnswers[0].item);
          } else {
            responseItems = [];
          }
        } else if (responseItems && responseItems.length > 0 && isNavigatorEnabled && !isNavigatorBlindzoneInitiated) {
          isNavigatorBlindzoneInitiated = true;
          blindzone = <section id={NAVIGATOR_BLINDZONE_ID} tabIndex={-1} />;
          includeSkipLink = isNavigatorEnabled && item.type === ItemType.GROUP;
        } else if (responseItems && responseItems.length > 0) {
          headerTag = constants.DEFAULT_HEADER_TAG;
        }

        if (responseItems && responseItems.length > 0) {
          return responseItems.map((responseItem, index) => {
            const newPath = createPathForItem(path, item, index);
            const idWithLinkIdAndItemIndex = `${item.linkId}${createIdSuffix(newPath, index, isRepeat(item))}`;
            const key = `item_${responseItem.linkId}_${index}_${responseItems.length}`;
            const id = `item_${responseItem.linkId}${createIdSuffix(newPath, index, isRepeat(item))}`;

            return (
              <Comp
                {...props}
                blindzone={blindzone}
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
                headerTag={headerTag}
                index={index}
                responseItems={responseItems}
                renderContext={renderContext}
              >
                {item.item && <GenerateQuestionnaireComponents items={item.item} path={newPath} pdf={pdf} responseItem={responseItem} />}
              </Comp>
            );
          });
        }
        return null;
      })}
    </>
  );
};

export default GenerateQuestionnaireComponents;
