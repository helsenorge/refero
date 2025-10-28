import React from 'react';

import { QuestionnaireResponseItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';

import { answerToStrings } from './utils';

type Props = {
  item?: QuestionnaireResponseItem;
  answers?: QuestionnaireResponseItemAnswer[] | QuestionnaireResponseItemAnswer | undefined;
  joinWith?: string;
  showEmpty?: boolean;
  className?: string;
};

const RenderQuestionnaireResponseItemAnswer = ({
  item,
  answers,
  joinWith = ', ',
  showEmpty = true,
  className,
}: Props): React.JSX.Element => {
  const normalizedAnswers = (): QuestionnaireResponseItemAnswer[] => {
    if (answers == null && item?.answer == null) return [];
    if (Array.isArray(answers)) return answers;
    if (answers) return [answers];
    return item?.answer ?? [];
  };

  const parts = normalizedAnswers()
    .flatMap(a => answerToStrings(a))
    .map(s => (s ?? '').toString().trim())
    .filter(s => s.length > 0);

  if (parts.length === 0) return showEmpty ? <>{''}</> : <></>;

  return <span className={className}>{parts.join(joinWith)}</span>;
};

export default RenderQuestionnaireResponseItemAnswer;
