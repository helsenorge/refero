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
import { Resources } from '../../../util/resources';

interface Props {
  item: QuestionnaireItem;
  parentPath?: Array<Path>;
  responseItems?: Array<QuestionnaireResponseItem>;
  resources?: Resources;
  disabled: boolean;
}

export const RepeatButton = ({ item, resources, parentPath, responseItems, disabled }: Props): JSX.Element => {
  const dispatch = useDispatch<ThunkDispatch<GlobalState, void, NewValueAction>>();
  const onAddRepeatItem = (): void => {
    if (dispatch && item) {
      dispatch(addRepeatItem(parentPath, item, responseItems));
    }
  };
  let text = getRepeatsTextExtension(item);
  if (!text && resources && resources.repeatButtonText) {
    text = resources.repeatButtonText;
  }

  return (
    <Button onClick={onAddRepeatItem} variant="borderless" disabled={disabled} testId={`${item.linkId}-repeat-button`}>
      <Icon svgIcon={PlusLarge} />
      {text}
    </Button>
  );
};
export default RepeatButton;
