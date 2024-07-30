import { QuestionnaireItem, QuestionnaireResponseItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';

import DeleteButton from './DeleteButton';

import { GlobalState } from '@/reducers';
import { Path } from '@/util/refero-core';
import { RenderContext } from '@/util/renderContext';
import { Resources } from '@/util/resources';

type Props = {
  className?: string;
  visibleDeleteButton: boolean;
  answer?: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[];
  item: QuestionnaireItem;
  path: Path[];
  responseItem: QuestionnaireResponseItem;
  resources?: Resources;
  onAnswerChange: (newState: GlobalState, path: Path[], item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  renderContext: RenderContext;
};

export const RenderDeleteButton = ({
  resources,
  visibleDeleteButton,
  answer,
  className,
  responseItem,
  item,
  path,
  onAnswerChange,
}: Props): JSX.Element | null => {
  if (!visibleDeleteButton) {
    return null;
  }

  const hasAnwer = (answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[] | undefined): boolean => {
    return !!answer && Object.keys(answer).length > 0;
  };

  let mustShowConfirm: boolean = hasAnwer(answer);

  if (!mustShowConfirm && responseItem && responseItem.item) {
    mustShowConfirm = responseItem.item.some(item => (item ? hasAnwer(item.answer) : false));
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
