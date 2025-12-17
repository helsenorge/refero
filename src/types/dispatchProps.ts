import type { AppDispatch } from '../reducers';
import type { Path } from '../util/refero-core';

export interface DispatchProps {
  dispatch: AppDispatch;
  mount: () => void;

  path: Array<Path>;
}
