import { FhirResource } from 'fhir/r4';

import { WithFormComponentsProps } from '../components/with-common-functions';
import { GlobalState } from '../store/reducers/index';
import { getValueIfDataReceiver, isEnableWhenEnabledForItem } from '../store/selectors';

export function mapStateToProps(state: GlobalState, { item, path }: WithFormComponentsProps): { enable: boolean; answer?: unknown, containedResources?: FhirResource[] } {
  const newAnswer = item && getValueIfDataReceiver(state, item);
  const enable = item && item.enableWhen ? isEnableWhenEnabledForItem(state, item, path || []) : true;

  return {
    enable: enable,
    containedResources: state.refero.form.FormDefinition.Content?.contained,
    ...(newAnswer !== undefined && { answer: newAnswer }),
  };
}
