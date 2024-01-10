import React from 'react';

import { Coding, QuestionnaireItem, QuestionnaireResponse } from '../../../../../types/fhir';

import { getGtablebodyObject } from './utils';

interface Props {
  items: QuestionnaireItem[];
  questionnaireResponse?: QuestionnaireResponse | null;
  tableCodesCoding: Coding[];
}

const GTable = ({ items, questionnaireResponse, tableCodesCoding }: Props): JSX.Element => {
  const itemsToShow = getGtablebodyObject(items, questionnaireResponse);
  console.log(itemsToShow);
  return <>{questionnaireResponse?.item?.map(x => x.text + ' ')}</>;
};

export default GTable;
