import { GlobalState } from '../reducers';
import { FormDefinition } from '../reducers/form';

export function getFormDefinition(state: GlobalState): FormDefinition | null {
  if (!state.refero.form.FormDefinition) {
    return null;
  }
  return state.refero.form.FormDefinition;
}
