import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';

import Button from '@helsenorge/designsystem-react/components/Button';
import Icon from '@helsenorge/designsystem-react/components/Icon';
import PlusLarge from '@helsenorge/designsystem-react/components/Icons/PlusLarge';

import { addRepeatItemAsync } from '../../../actions/newValue';
import { useAppDispatch } from '../../../reducers';
import { getRepeatsTextExtension } from '../../../util/extension';
import { Path } from '../../../util/refero-core';

import { useExternalRenderContext } from '@/context/externalRender/useExternalRender';
import useOnAnswerChange from '@/hooks/useOnAnswerChange';

interface Props {
  item?: QuestionnaireItem;
  parentPath?: Path[];
  responseItems?: QuestionnaireResponseItem[];
  disabled: boolean;
}

export const RepeatButton = ({ item, parentPath, responseItems, disabled }: Props): JSX.Element => {
  const dispatch = useAppDispatch();
  const { resources } = useExternalRenderContext();
  const onAnswerChange = useOnAnswerChange();
  const onAddRepeatItem = (): void => {
    if (dispatch && item) {
      dispatch(addRepeatItemAsync(parentPath, item, responseItems))?.then(newState => {
        return onAnswerChange && onAnswerChange(newState, item);
      });
    }
  };
  const text = getRepeatsTextExtension(item);
  return (
    <Button
      onClick={onAddRepeatItem}
      variant="borderless"
      disabled={disabled}
      testId={`${item?.linkId}-repeat-button`}
      ariaLabel={`${text || 'Copy'}`}
    >
      <Icon svgIcon={PlusLarge} />
      {text || resources?.repeatButtonText || 'Copy'}
    </Button>
  );
};
export default RepeatButton;
