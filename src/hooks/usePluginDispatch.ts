import { useCallback } from 'react';

import type { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';

import useOnAnswerChange from './useOnAnswerChange';

import { useExternalRenderContext } from '@/context/externalRender/useExternalRender';
import { type AppDispatch, type GlobalState, useAppDispatch } from '@/reducers';

export type PluginAsyncThunk = (dispatch: AppDispatch, getState: () => GlobalState) => Promise<GlobalState>;

/**
 * Hook that simplifies the dispatch + onAnswerChange pattern for plugin authors.
 *
 * The plugin author builds the thunk by calling any of Refero's async actions
 * (`newIntegerValueAsync`, `removeCodingStringValueAsync`, `toggleCodingValueAsync`,
 * `addRepeatItemAsync`, etc.), then hands it to `pluginDispatch` together with the
 * `item` and the answer payload to broadcast through `onChange`.
 *
 * ```tsx
 * const pluginDispatch = usePluginDispatch();
 *
 * pluginDispatch(newIntegerValueAsync(path, value, item), item, { valueInteger: value });
 * pluginDispatch(removeCodingStringValueAsync(path, item), item);
 * pluginDispatch(toggleCodingValueAsync(path, coding, item, isSelected), item, { valueCoding: coding });
 * ```
 */
export const usePluginDispatch = (): ((
  thunk: PluginAsyncThunk,
  item: QuestionnaireItem,
  answer?: QuestionnaireResponseItemAnswer
) => void) => {
  const dispatch = useAppDispatch();
  const { globalOnChange } = useExternalRenderContext();
  const onAnswerChange = useOnAnswerChange(globalOnChange);

  return useCallback(
    (thunk: PluginAsyncThunk, item: QuestionnaireItem, answer?: QuestionnaireResponseItemAnswer): void => {
      dispatch(thunk)?.then((newState: GlobalState) => onAnswerChange(newState, item, answer));
    },
    [dispatch, onAnswerChange]
  );
};
