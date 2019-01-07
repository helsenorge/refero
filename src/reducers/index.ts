import { combineReducers, Reducer } from 'redux';
import form, { Form } from '../reducers/form';

export interface GlobalState {
  skjemautfyller: SkjemautfyllerState;
}

export interface SkjemautfyllerState {
  form: Form;
}
// Benyttes kun for tester eller hvis skjemautfyller kjøres utenfor helsenorge
const rootReducer: Reducer<{}> = combineReducers({
  skjemautfyller: combineReducers({ form }),
});

export default rootReducer;
