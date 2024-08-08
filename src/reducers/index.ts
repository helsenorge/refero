import { combineReducers, Reducer } from 'redux';

import form, { Form } from './form';
import { FormAction } from '@/actions/form';
import { NewValueAction } from '@/actions/newValue';

export interface GlobalState {
  refero: ReferoState;
}

export interface ReferoState {
  form: Form;
}
// Benyttes kun for tester eller hvis Refero kjøres utenfor helsenorge
const rootReducer: Reducer<GlobalState, NewValueAction | FormAction> = combineReducers({
  refero: combineReducers({ form }),
});

export default rootReducer;
