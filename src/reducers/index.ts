import { configureStore, combineReducers, ThunkDispatch, UnknownAction, ThunkAction } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import formReducer, { Form } from './form'; // Importing the `Form` type for explicit typing

// Define your ReferoState using the same `Form` type from the old setup
export interface ReferoState {
  form: Form; // Explicitly use the `Form` type from the form reducer
}

// GlobalState still directly uses the ReferoState type as before
export interface GlobalState {
  refero: ReferoState;
}

// Combine the reducers just as you were doing before, but now with configureStore
const rootReducer = combineReducers({
  refero: combineReducers({ form: formReducer }),
});

// Create the store using `configureStore`, as per Redux Toolkit’s recommendation
export const store = configureStore({
  reducer: rootReducer, // Using the combined reducer
});

// You can directly infer AppDispatch and RootState from the store itself
export type AppDispatch = ThunkDispatch<GlobalState, unknown, UnknownAction>;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, GlobalState, unknown, UnknownAction>;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
// Default export for store
export default rootReducer;
