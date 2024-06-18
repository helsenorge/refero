import { CombinedState, combineReducers, Reducer } from 'redux';
import { FormAction } from 'src/actions/form';
import { NewValueAction } from 'src/actions/newValue';

import form, { Form } from '../reducers/form';

export interface GlobalState {
  refero: ReferoState;
}

export interface ReferoState {
  form: Form;
}
// Benyttes kun for tester eller hvis Refero kjøres utenfor helsenorge
const rootReducer: Reducer<
  CombinedState<{
    refero: CombinedState<{
      form: Form | undefined;
    }>;
  }>,
  NewValueAction | FormAction
> = combineReducers({
  refero: combineReducers({ form }),
});

export default rootReducer;
