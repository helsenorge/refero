import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';

import RepeatButton from './RepeatButton';

import ItemType from '@/constants/itemType';
import { shouldRenderRepeatButton } from '@/util';
import { Path } from '@/util/refero-core';
import { Resources } from '@/util/resources';

const RenderRepeatButton = ({
  item,
  index,
  path,
  responseItems,
  responseItem,
}: {
  item: QuestionnaireItem;
  index?: number;
  path?: Path[];
  responseItems?: QuestionnaireResponseItem[];
  responseItem?: QuestionnaireResponseItem;
  resources?: Resources;
}): JSX.Element | null => {
  if (!item.repeats || !shouldRenderRepeatButton(item, responseItems, index)) {
    return null;
  }

  return (
    <div className="page_refero__repeatbutton-wrapper">
      <RepeatButton
        key={`item_${item.linkId}_add_repeat_item`}
        item={item}
        responseItems={responseItems}
        parentPath={path}
        disabled={item.type !== ItemType.GROUP && !responseItem?.answer}
      />
    </div>
  );
};

export default RenderRepeatButton;
