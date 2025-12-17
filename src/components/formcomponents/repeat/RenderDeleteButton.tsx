import { memo, useEffect, useState } from 'react';

import type { QuestionnaireItem } from 'fhir/r4';

import DeleteButton from './DeleteButton';

import { useAppSelector } from '@/reducers';
import { getResponseItemWithPathSelector } from '@/reducers/selectors';
import { isGroupAndDescendantsHasAnswer } from '@/util/fhirpathHelper';
import { type Path, shouldRenderDeleteButton } from '@/util/refero-core';

type Props = {
  className?: string;
  index?: number;
  item?: QuestionnaireItem;
  path?: Path[];
};

export const RenderDeleteButton = memo(function RenderDeleteButton({ className, item, path, index }: Props): JSX.Element | null {
  const [decendentAnswer, setDecendentAnswer] = useState<boolean>(false);
  const responseItem = useAppSelector(state => getResponseItemWithPathSelector(state, path));
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
