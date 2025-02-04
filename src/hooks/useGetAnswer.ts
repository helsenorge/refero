import { QuestionnaireResponseItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { useSelector } from 'react-redux';

import { GlobalState } from '@/reducers';
import { getResponseItemWithPathSelector } from '@/reducers/selectors';
import { getAnswerFromResponseItem, Path } from '@/util/refero-core';


export const useGetAnswer = (
  _linkId?: string,
  path?: Path[]
): QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[] | undefined => {
  const responseItem = useSelector<GlobalState, QuestionnaireResponseItem | undefined>(state =>
    getResponseItemWithPathSelector(state, path)
  );
  return getAnswerFromResponseItem(responseItem);
};
