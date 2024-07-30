import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';

import RepeatButton from './RepeatButton';

import ItemType from '@/constants/itemType';
import { shouldRenderRepeatButton } from '@/util';
import { Path } from '@/util/refero-core';
import { Resources } from '@/util/resources';

const RenderRepeatButton = (
  item: QuestionnaireItem,
  index: number,
  path?: Path[],
  response?: QuestionnaireResponseItem[],
  responseItem?: QuestionnaireResponseItem,
  resources?: Resources
): JSX.Element | undefined => {
  if (!item.repeats || !shouldRenderRepeatButton(item, response, index)) {
    return undefined;
  }

  return (
    <div className="page_refero__repeatbutton-wrapper">
      <RepeatButton
        key={`item_${item.linkId}_add_repeat_item`}
        resources={resources}
        item={item}
        responseItems={response}
        parentPath={path}
        disabled={item.type !== ItemType.GROUP && !responseItem?.answer}
      />
    </div>
  );
};

export default RenderRepeatButton;
