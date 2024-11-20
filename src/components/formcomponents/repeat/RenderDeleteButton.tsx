import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';

import DeleteButton from './DeleteButton';

import { Path, shouldRenderDeleteButton } from '@/util/refero-core';
import { useSelector } from 'react-redux';
import { GlobalState } from '@/reducers';
import { getResponseItemWithPathSelector } from '@/reducers/selectors';
import { memo, useEffect, useState } from 'react';
import { isGroupAndDescendantsHasAnswer } from '@/util/fhirpathHelper';

type Props = {
  className?: string;
  index?: number;
  item?: QuestionnaireItem;
  path?: Path[];
};

export const RenderDeleteButton = memo(function RenderDeleteButton({ className, item, path, index }: Props): JSX.Element | null {
  const [decendentAnswer, setDecendentAnswer] = useState<boolean>(false);
  const responseItem = useSelector<GlobalState, QuestionnaireResponseItem | undefined>(state =>
    getResponseItemWithPathSelector(state, path)
  );
  useEffect(() => {
    const checkDecendentAnswer = async (): Promise<void> => {
      const hasAnswer = await isGroupAndDescendantsHasAnswer(responseItem);
      setDecendentAnswer(hasAnswer);
    };
    checkDecendentAnswer();
  }, [responseItem]);
  if (!shouldRenderDeleteButton(item, index || 0) || !item || !path) {
    return null;
  }

  const mustShowConfirm: boolean = decendentAnswer;

  return (
    <div className="page_refero__deletebutton-wrapper">
      <DeleteButton className={className} item={item} path={path} mustShowConfirm={mustShowConfirm} />
    </div>
  );
});

export default RenderDeleteButton;
