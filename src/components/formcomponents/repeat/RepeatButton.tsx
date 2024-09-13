import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import Button from '@helsenorge/designsystem-react/components/Button';
import Icon from '@helsenorge/designsystem-react/components/Icon';
import PlusLarge from '@helsenorge/designsystem-react/components/Icons/PlusLarge';

import { NewValueAction } from '../../../actions/newValue';
import { addRepeatItem } from '../../../actions/newValue';
import { GlobalState } from '../../../reducers';
import { getRepeatsTextExtension } from '../../../util/extension';
import { Path } from '../../../util/refero-core';
import { useExternalRenderContext } from '@/context/externalRenderContext';

interface Props {
  item: QuestionnaireItem;
  parentPath?: Path[];
  responseItems?: QuestionnaireResponseItem[];
  disabled: boolean;
}

export const RepeatButton = ({ item, parentPath, responseItems, disabled }: Props): JSX.Element => {
  const dispatch = useDispatch<ThunkDispatch<GlobalState, void, NewValueAction>>();
  const { resources } = useExternalRenderContext();
  const onAddRepeatItem = (): void => {
    if (dispatch && item) {
      dispatch(addRepeatItem(parentPath, item, responseItems));
    }
  };
  const text = getRepeatsTextExtension(item);
  return (
    <Button
      onClick={onAddRepeatItem}
      variant="borderless"
      disabled={disabled}
      testId={`${item.linkId}-repeat-button`}
      ariaLabel={`${text || 'Copy'}`}
    >
      <Icon svgIcon={PlusLarge} />
      {text || resources?.repeatButtonText || 'Copy'}
    </Button>
  );
};
export default RepeatButton;
