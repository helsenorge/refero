import { combineReducers, Reducer } from 'redux';

import form, { Form } from '../reducers/form';

export interface GlobalState {
  refero: ReferoState;
}

export interface ReferoState {
  form: Form;
}
// Benyttes kun for tester eller hvis Refero kjøres utenfor helsenorge
const rootReducer: Reducer<{}> = combineReducers({
  refero: combineReducers({ form }),
});

export default rootReducer;
