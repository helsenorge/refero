import { QuestionnaireItem, QuestionnaireResponseItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';

import DeleteButton from './DeleteButton';

import { Path, shouldRenderDeleteButton } from '@/util/refero-core';
import { useGetAnswer } from '@/hooks/useGetAnswer';

type Props = {
  className?: string;
  index?: number;
  item: QuestionnaireItem;
  path?: Path[];
  responseItem?: QuestionnaireResponseItem;
};

export const RenderDeleteButton = ({ className, responseItem, item, path, index }: Props): JSX.Element | null => {
  if (!shouldRenderDeleteButton(item, index || 0)) {
    return null;
  }
  const answer = useGetAnswer(responseItem, item);

  const hasAnwer = (answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[] | undefined): boolean => {
    return !!answer && Object.keys(answer).length > 0;
  };

  let mustShowConfirm: boolean = hasAnwer(answer);

  if (!mustShowConfirm && responseItem && responseItem.item) {
    mustShowConfirm = responseItem.item.some(item => (item ? hasAnwer(answer) : false));
  }

  return (
    <div className="page_refero__deletebutton-wrapper">
      <DeleteButton className={className} item={item} path={path} mustShowConfirm={mustShowConfirm} />
    </div>
  );
};

export default RenderDeleteButton;
