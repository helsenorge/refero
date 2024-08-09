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
import { Attachment, QuestionnaireItem, QuestionnaireResponseItem, QuestionnaireResponseItemAnswer, Resource } from 'fhir/r4';
import { GlobalState } from '@/reducers';
import { getCodingTextTableValues, getNavigatorExtension } from '@/util/extension';
import { FormData, FormDefinition, getFormData, getFormDefinition } from '@/reducers/form';
import ItemType from '@/constants/itemType';
import { useSelector } from 'react-redux';
import { isHelpItem } from '@/util/help';
import { AutoSuggestProps } from '@/types/autoSuggestProps';
import constants, { NAVIGATOR_BLINDZONE_ID } from '@/constants';

export type RenderItemProps = {
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
  validateScriptInjection?: boolean;
  index?: number;
  attachmentErrorMessage?: string;
  attachmentMaxFileSize?: number;
  attachmentValidTypes?: string[];
  onRequestAttachmentLink?: (file: string) => string;
  onOpenAttachment?: (fileId: string) => void;
  onDeleteAttachment?: (fileId: string, onSuccess: () => void) => void;
  uploadAttachment?: (files: File[], onSuccess: (attachment: Attachment) => void) => void;
  onAnswerChange?: (newState: GlobalState, path: Path[], item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  renderContext: RenderContext;
  autoSuggestProps?: AutoSuggestProps;
  responseItems?: QuestionnaireResponseItem[];
  idWithLinkIdAndItemIndex: string;
  children?: React.ReactNode;
};

type QuestionnaireItemsProps = {
  items: QuestionnaireItem[] | undefined;
  responseItem?: QuestionnaireResponseItem;
  resources?: Resources;
  path?: Path[];
  pdf?: boolean;
  renderContext?: RenderContext;
  onAnswerChange?: (newState: GlobalState, path: Path[], item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  attachmentErrorMessage?: string;
  attachmentMaxFileSize?: number;
  attachmentValidTypes?: string[];
  onRequestAttachmentLink?: (file: string) => string;
  onOpenAttachment?: (fileId: string) => void;
  onDeleteAttachment?: (fileId: string, onSuccess: () => void) => void;
  uploadAttachment?: (files: File[], onSuccess: (attachment: Attachment) => void) => void;
  validateScriptInjection?: boolean;
  autoSuggestProps?: AutoSuggestProps;
};

const QuestionnaireItems = (props: QuestionnaireItemsProps): JSX.Element | null => {
  const { items, resources, path = [], pdf = false, renderContext = new RenderContext(), onAnswerChange, responseItem } = props;
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
        } else if (responseItems && responseItems.length > 0 && isNavigatorEnabled) {
          blindzone = <div id={NAVIGATOR_BLINDZONE_ID} tabIndex={-1} />;
          includeSkipLink = isNavigatorEnabled && item.type === ItemType.GROUP;
        } else if (responseItems && responseItems.length > 0) {
          headerTag = constants.DEFAULT_HEADER_TAG;
        }

        if (responseItems && responseItems.length > 0) {
          return responseItems.map((responseItem, index) => {
            const newPath = createPathForItem(path, item, responseItem, index);
            const idWithLinkIdAndItemIndex = `${item.linkId}${createIdSuffix(newPath, index, isRepeat(item))}`;
            const key = `item_${responseItem.linkId}_${index}`;
            const id = `item_${responseItem.linkId}${createIdSuffix(newPath, index, isRepeat(item))}`;

            return (
              <Comp
                {...props}
                blindzone={blindzone}
                key={key}
                idWithLinkIdAndItemIndex={idWithLinkIdAndItemIndex}
                language={language}
                pdf={pdf}
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
                onAnswerChange={onAnswerChange}
                renderContext={renderContext}
              >
                {item.item && (
                  <QuestionnaireItems
                    items={item.item}
                    resources={resources}
                    path={newPath}
                    pdf={pdf}
                    onAnswerChange={onAnswerChange}
                    responseItem={responseItem}
                  />
                )}
              </Comp>
            );
          });
        }
        return null;
      })}
    </>
  );
};

export default QuestionnaireItems;
