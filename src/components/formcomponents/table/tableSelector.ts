// import { GlobalState, useAppDispatch } from '@/reducers';
// import { findQuestionnaireItem } from '@/reducers/selectors';
// import { QuestionnaireItem } from 'fhir/r4';
// import { useSelector } from 'react-redux';
// import { createSelector } from 'reselect';

import { GlobalState, useAppDispatch } from '@/reducers';
import { findQuestionnaireItem, questionnaireSelector } from '@/reducers/selectors';
import { getCodingTextTableValues } from '@/util/extension';
import LanguageLocales from '@helsenorge/core-utils/constants/languages';
import { QuestionnaireItem } from 'fhir/r4';
import { createSelector } from 'reselect';

export const childItemsSelector = createSelector(
  [(state: GlobalState, linkId: string): QuestionnaireItem | undefined | null => findQuestionnaireItem(state, linkId)],
  item => {
    return item?.item ?? [];
  }
);
export const tableTypeSelector = createSelector(
  [(state: GlobalState, linkId: string): QuestionnaireItem | undefined | null => findQuestionnaireItem(state, linkId)],
  item => {
    return getCodingTextTableValues(item ?? undefined)[0];
  }
);
export const languageSelector = createSelector(
  [(state: GlobalState): string => state.refero.form.Language],
  language => (language as LanguageLocales) || LanguageLocales.NORWEGIAN
);
export const containedResourceSelector = createSelector([questionnaireSelector], questionnaire => questionnaire?.contained);
