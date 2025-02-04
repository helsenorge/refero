import { memo } from 'react';

import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { useSelector } from 'react-redux';

import RepeatButton from './RepeatButton';

import { GlobalState } from '@/reducers';
import { getFlatMapResponseItemsForItemSelector } from '@/reducers/selectors';
import { shouldRenderRepeatButton } from '@/util';
import { descendantsHasPrimitiveAnswer, Path } from '@/util/refero-core';
import { Resources } from '@/util/resources';


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
