import { createSelector } from 'reselect';

import type { GlobalState } from '@/reducers';
import type { QuestionnaireItem } from 'fhir/r4';

import LanguageLocales from '@helsenorge/core-utils/constants/languages';

import { findQuestionnaireItem, questionnaireSelector } from '@/reducers/selectors';
import { getCodingTextTableValues } from '@/util/extension';

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
