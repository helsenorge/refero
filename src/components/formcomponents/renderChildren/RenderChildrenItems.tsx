import { WithCommonFunctionsProps } from '@/components/with-common-functions';
import ItemType from '@/constants/itemType';
import { getChildHeaderTag, getComponentForItem, isHiddenItem } from '@/util';
import { getCodingTextTableValues } from '@/util/extension';
import { isHelpItem } from '@/util/help';
import { createIdSuffix, createPathForItem, getItemWithIdFromResponseItemArray } from '@/util/refero-core';
import { RenderContext } from '@/util/renderContext';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';

type Props = {
  item?: QuestionnaireItem;
  renderContext: RenderContext;
};
const renderItem = (props: WithCommonFunctionsProps): JSX.Element[] => {
  const { item, resources, containedResources, responseItem, pdf, path, headerTag, promptLoginMessage } = props;
  if (isHelpItem(item)) return [];
  if (isHiddenItem(item)) return [];

  const Comp = getComponentForItem(item.type, getCodingTextTableValues(item));

  if (!Comp) {
    return [];
  }

  let response: QuestionnaireResponseItem[] | undefined;
  const linkId = item.linkId;

  if (responseItem) {
    const childItem = responseItem.item;
    const childAnswer = responseItem.answer;

    if (childItem) {
      response = getItemWithIdFromResponseItemArray(linkId, childItem);
    } else if (childAnswer) {
      response = getItemWithIdFromResponseItemArray(linkId, childAnswer[0].item);
    }
  }
  const renderedItems: Array<JSX.Element> = [];
  if (response && response.length > 0) {
    response.forEach((responseItem, index) => {
      const idWithLinkIdAndItemIndex = `${item.linkId}${createIdSuffix(path, index, item.repeats)}`;

      renderedItems.push(
        <Comp
          {...props}
          idWithLinkIdAndItemIndex={idWithLinkIdAndItemIndex}
          key={'item_' + responseItem.linkId + createIdSuffix(path, index, item.repeats)}
          pdf={pdf}
          promptLoginMessage={promptLoginMessage}
          id={'item_' + responseItem.linkId + createIdSuffix(path, index, item.repeats)}
          resources={resources}
          containedResources={containedResources}
          path={createPathForItem(path, item, responseItem, index)}
          headerTag={getChildHeaderTag(item, headerTag)}
          index={index}
          responseItems={response}
        />
      );
    });
  }
  return renderedItems;
};
const RenderChildrenItems = ({ item, renderContext }: Props): JSX.Element[] | null => {
  if (!item || !item.item) {
    return null;
  }

  if (item.type === ItemType.GROUP && renderContext.RenderChildren) {
    return renderContext.RenderChildren(item.item, renderItem);
  }

  const renderedItems: JSX.Element[] = [];
  item.item.forEach(i => renderedItems.push(...renderItem(i, renderContext)));

  return renderedItems;
};
export default RenderChildrenItems;
