import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';

import RepeatButton from './RepeatButton';

import { shouldRenderRepeatButton } from '@/util';
import { descendantsHasPrimitiveAnswer, Path } from '@/util/refero-core';
import { Resources } from '@/util/resources';

import { GlobalState } from '@/reducers';
import { useSelector } from 'react-redux';
import { getFlatMapResponseItemsForItemSelector } from '@/reducers/selectors';
import { memo } from 'react';

const RenderRepeatButton = memo(function RenderRepeatButton({
  item,
  index,
  path,
}: {
  item?: QuestionnaireItem;
  index?: number;
  path: Path[];
  resources?: Resources;
}): JSX.Element | null {
  const parentPath = path.slice(0, -1);
  const responseItems = useSelector<GlobalState, QuestionnaireResponseItem[] | undefined>(state =>
    getFlatMapResponseItemsForItemSelector(state, item?.linkId, parentPath)
  );

  // console.log('item', item);
  if (!item?.repeats || !shouldRenderRepeatButton(item, responseItems, index)) {
    return null;
  }

  const disabled = !descendantsHasPrimitiveAnswer(responseItems);

  return (
    <div className="page_refero__repeatbutton-wrapper">
      <RepeatButton
        key={`item_${item?.linkId}_add_repeat_item`}
        item={item}
        responseItems={responseItems}
        parentPath={parentPath}
        disabled={disabled}
      />
    </div>
  );
});

export default RenderRepeatButton;
