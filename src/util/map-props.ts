
import { WithFormComponentsProps } from '../components/with-common-functions';
import { GlobalState } from '../store/reducers/index';
import { getValueIfDataReceiver, isEnableWhenEnabledForItem } from '../store/selectors';

export function mapStateToProps(state: GlobalState, { item, path }: WithFormComponentsProps): { enable: boolean; answer?: unknown} {
  const newAnswer = item && getValueIfDataReceiver(state, item);
  const enable = item && item.enableWhen ? isEnableWhenEnabledForItem(state, item, path || []) : true;

  return {
    enable: enable,
    ...(newAnswer !== undefined && { answer: newAnswer }),
  };
}
