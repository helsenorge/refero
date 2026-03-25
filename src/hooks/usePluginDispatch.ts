import { useCallback } from 'react';

import type { Path } from '@/util/refero-core';
import type { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';

import useOnAnswerChange from './useOnAnswerChange';

import { useExternalRenderContext } from '@/context/externalRender/useExternalRender';
import { type GlobalState, useAppDispatch } from '@/reducers';

type AsyncThunkAction = (
  path: Path[],
  value: unknown,
  item: QuestionnaireItem,
  multipleAnswers?: boolean
) => (dispatch: unknown) => Promise<GlobalState>;

/**
 * Hook that simplifies the dispatch + onAnswerChange pattern for plugin authors.
 *
 * Instead of:
 * ```tsx
 * dispatch(newIntegerValueAsync(path, value, item))?.then(newState =>
 *   onAnswerChange(newState, item, { valueInteger: value })
 * );
 * ```
 *
 * Plugin authors can write:
 * ```tsx
 * const pluginDispatch = usePluginDispatch();
 * pluginDispatch(newIntegerValueAsync, path, value, item, { valueInteger: value });
 * ```
 */
export const usePluginDispatch = (): ((
  action: AsyncThunkAction,
  path: Path[],
  value: unknown,
  item: QuestionnaireItem,
  answer: QuestionnaireResponseItemAnswer,
  multipleAnswers?: boolean
) => void) => {
  const dispatch = useAppDispatch();
  const { globalOnChange } = useExternalRenderContext();
  const onAnswerChange = useOnAnswerChange(globalOnChange);

  return useCallback(
    (
      action: AsyncThunkAction,
      path: Path[],
      value: unknown,
      item: QuestionnaireItem,
      answer: QuestionnaireResponseItemAnswer,
      multipleAnswers?: boolean
    ): void => {
      dispatch(action(path, value, item, multipleAnswers))?.then((newState: GlobalState) => onAnswerChange(newState, item, answer));
    },
    [dispatch, onAnswerChange]
  );
};
