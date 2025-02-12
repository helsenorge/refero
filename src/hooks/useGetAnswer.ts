import { QuestionnaireResponseItemAnswer } from 'fhir/r4';

import { useAppSelector } from '@/reducers';
import { getResponseItemWithPathSelector } from '@/reducers/selectors';
import { getAnswerFromResponseItem, Path } from '@/util/refero-core';

export const useGetAnswer = (
  _linkId?: string,
  path?: Path[]
): QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[] | undefined => {
  const responseItem = useAppSelector(state => getResponseItemWithPathSelector(state, path));
  return getAnswerFromResponseItem(responseItem);
};
