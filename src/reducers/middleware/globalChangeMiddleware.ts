// listenerMiddleware.ts
import { createListenerMiddleware } from '@reduxjs/toolkit';

import type { GlobalState } from '@/reducers';

import { newValue } from '@/actions/newValue';
import { runCalculatorsAction } from '@/actions/thunks';

export const listenerMiddleware = createListenerMiddleware<GlobalState>();

listenerMiddleware.startListening({
  actionCreator: newValue,
  effect: async (action, listenerApi) => {
    // At this point the state has been updated by the reducers.
    const updatedState = listenerApi.getState();

    // listenerApi.dispatch(runCalculatorsAction());
  },
  // Call the global callback if defined. You may want to filter by action.payload if necessary.
});
