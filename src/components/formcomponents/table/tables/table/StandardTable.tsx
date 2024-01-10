import React from 'react';

import { QuestionnaireItem, QuestionnaireResponse } from '../../../../../types/fhir';

interface Props {
  items: QuestionnaireItem[];
  questionnaireResponse?: QuestionnaireResponse | null;
}

export const StandardTable = ({ items }: Props): JSX.Element => {
  return <>{items.map(item => item.linkId)}</>;
};
