import { AppDispatch } from '../reducers';
import { Path } from '../util/refero-core';

export interface DispatchProps {
  dispatch: AppDispatch;
  mount: () => void;

  path: Array<Path>;
}
