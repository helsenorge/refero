import { Resource, QuestionnaireResponseItem, QuestionnaireItem, QuestionnaireResponseItemAnswer, Attachment } from 'fhir/r4';
import itemType from '@/constants/itemType';
import { getCodingTextTableValues } from '@/util/extension';
import { isHelpItem } from '@/util/help';
import { getComponentForItem, getChildHeaderTag, isHiddenItem } from '@/util/index';
import { Path, getItemWithIdFromResponseItemArray, createPathForItem, createIdSuffix } from '@/util/refero-core';
import { RenderContext } from '@/util/renderContext';
import { Resources } from '@/util/resources';
import { GlobalState } from '@/reducers';
import { AutoSuggestProps } from '@/types/autoSuggestProps';

export type RenderItemProps = {
  resources?: Resources;
  responseItem: QuestionnaireResponseItem;
  containedResources?: Resource[];
  item: QuestionnaireItem;
  headerTag?: number;
  pdf?: boolean;
  language?: string;
  includeSkipLink?: boolean;
  promptLoginMessage?: () => void;
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
};

const RenderItem = (props: RenderItemProps): JSX.Element | null => {
  const { item, responseItem, path, headerTag } = props;
  if (isHelpItem(item) || isHiddenItem(item)) return null;
  const Comp = getComponentForItem(item.type, getCodingTextTableValues(item));
  if (!Comp) return null;

  let response: QuestionnaireResponseItem[] | undefined;

  if (responseItem) {
    const childItem = responseItem.item;
    const childAnswer = responseItem.answer;

    if (childItem) {
      response = getItemWithIdFromResponseItemArray(item.linkId, childItem);
    } else if (childAnswer) {
      response = getItemWithIdFromResponseItemArray(item.linkId, childAnswer[0].item);
    }
  }

  return (
    <>
      {response &&
        response.map((responseItem, index) => {
          const idWithLinkIdAndItemIndex = `${item.linkId}${createIdSuffix(path, index, item.repeats)}`;
          return (
            <Comp
              {...props}
              index={index}
              responseItem={responseItem}
              responseItems={response}
              key={`item_${responseItem.linkId}${createIdSuffix(path, index, item.repeats)}`}
              idWithLinkIdAndItemIndex={idWithLinkIdAndItemIndex}
              id={`item_${responseItem.linkId}${createIdSuffix(path, index, item.repeats)}`}
              path={createPathForItem(path, item, responseItem, index)}
              headerTag={getChildHeaderTag(item, headerTag)}
            />
          );
        })}
    </>
  );
};
interface RenderChildrenItemsProps {
  otherProps: RenderItemProps;
}
export const RenderChildrenItems = ({ otherProps }: RenderChildrenItemsProps): JSX.Element | null => {
  if (!otherProps.item || !otherProps.item.item) {
    return null;
  }

  if (otherProps.item.type === itemType.GROUP && otherProps.renderContext.RenderChildren) {
    return (
      <>
        {otherProps.renderContext.RenderChildren(
          otherProps.item.item,
          (childItem: QuestionnaireItem, context: RenderContext): JSX.Element => (
            <RenderItem key={childItem.linkId} {...otherProps} item={childItem} renderContext={context} />
          )
        )}
      </>
    );
  }

  return (
    <>
      {otherProps.item.item.map(childItem => {
        return <RenderItem key={childItem.linkId} {...otherProps} item={childItem} renderContext={otherProps.renderContext} />;
      })}
    </>
  );
};
