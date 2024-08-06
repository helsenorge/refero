import { QuestionnaireItem, QuestionnaireResponseItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';

import DeleteButton from './DeleteButton';

import { GlobalState } from '@/reducers';
import { Path, shouldRenderDeleteButton } from '@/util/refero-core';
import { Resources } from '@/util/resources';
import { useGetAnswer } from '@/hooks/useGetAnswer';

type Props = {
  className?: string;
  index?: number;
  item: QuestionnaireItem;
  path?: Path[];
  responseItem?: QuestionnaireResponseItem;
  resources?: Resources;
  onAnswerChange?: (newState: GlobalState, path: Path[], item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
};

export const RenderDeleteButton = ({
  resources,
  className,
  responseItem,
  item,
  path,
  onAnswerChange,
  index,
}: Props): JSX.Element | null => {
  if (!shouldRenderDeleteButton(item, index || 0)) {
    return null;
  }
  const answer = useGetAnswer(responseItem);
  const hasAnwer = (answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[] | undefined): boolean => {
    return !!answer && Object.keys(answer).length > 0;
  };

  let mustShowConfirm: boolean = hasAnwer(answer);

  if (!mustShowConfirm && responseItem && responseItem.item) {
    mustShowConfirm = responseItem.item.some(item => (item ? hasAnwer(answer) : false));
  }
  return (
    <div className="page_refero__deletebutton-wrapper">
      <DeleteButton
        className={className}
        item={item}
        path={path}
        resources={resources}
        mustShowConfirm={mustShowConfirm}
        onAnswerChange={onAnswerChange}
      />
    </div>
  );
};

export default RenderDeleteButton;
