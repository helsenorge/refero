import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';

import RepeatButton from './RepeatButton';

import ItemType from '@/constants/itemType';
import { shouldRenderRepeatButton } from '@/util';
import { Path } from '@/util/refero-core';
import { Resources } from '@/util/resources';

import { GlobalState } from '@/reducers';
import { useSelector } from 'react-redux';
import { getFlatMapResponseItemsForItemSelector } from '@/reducers/selectors';
import { useGetAnswer } from '@/hooks/useGetAnswer';
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
  const responseItems = useSelector<GlobalState, QuestionnaireResponseItem[] | undefined>(state =>
    getFlatMapResponseItemsForItemSelector(state, item?.linkId, path)
  );
  const answer = useGetAnswer;
  if (!item?.repeats || !shouldRenderRepeatButton(item, responseItems, index)) {
    return null;
  }
  return (
    <div className="page_refero__repeatbutton-wrapper">
      <RepeatButton
        key={`item_${item?.linkId}_add_repeat_item`}
        item={item}
        responseItems={responseItems}
        parentPath={path}
        disabled={item?.type !== ItemType.GROUP && !answer}
      />
    </div>
  );
});

export default RenderRepeatButton;
