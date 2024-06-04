import { ThunkDispatch } from 'redux-thunk';
import { NewValueAction } from '../actions/newValue';
import { GlobalState } from '../reducers';
import { Path } from '../util/refero-core';

export interface DispatchProps {
  dispatch: ThunkDispatch<GlobalState, void, NewValueAction>;
  mount: () => void;

  path: Array<Path>;
}
