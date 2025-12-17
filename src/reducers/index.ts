import { configureStore, combineReducers, type ThunkDispatch, type UnknownAction, type ThunkAction } from '@reduxjs/toolkit';
import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import formReducer, { type Form } from './form';

export interface ReferoState {
  form: Form;
}

export interface GlobalState {
  refero: ReferoState;
}

const rootReducer = combineReducers({
  refero: combineReducers({ form: formReducer }),
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const store = (preloadedState?: Form) =>
  configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware => getDefaultMiddleware(),
    ...(preloadedState && {
      preloadedState: {
        refero: { form: preloadedState },
      },
    }),
  });
export type AppStore = ReturnType<typeof store>;

export type AppDispatch = ThunkDispatch<GlobalState, unknown, UnknownAction>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, GlobalState, unknown, UnknownAction>;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

export default rootReducer;
