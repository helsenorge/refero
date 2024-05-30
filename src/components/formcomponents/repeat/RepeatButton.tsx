import React from 'react';

import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import Button from '@helsenorge/designsystem-react/components/Button';
import Icon from '@helsenorge/designsystem-react/components/Icons';
import PlusLarge from '@helsenorge/designsystem-react/components/Icons/PlusLarge';

import { NewValueAction } from '../../../actions/newValue';
import { addRepeatItem } from '../../../actions/newValue';
import { GlobalState } from '../../../reducers';
import { getRepeatsTextExtension } from '../../../util/extension';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Path } from '../../../util/refero-core';
import { Resources } from '../../../util/resources';
import { WithCommonFunctionsProps } from '../../with-common-functions';

interface Props extends WithCommonFunctionsProps {
  item: QuestionnaireItem;
  parentPath?: Array<Path>;
  responseItems?: Array<QuestionnaireResponseItem>;
  resources?: Resources;
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  disabled: boolean;
}

export const RepeatButton = ({ item, resources, dispatch, parentPath, responseItems, disabled }: Props): JSX.Element => {
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
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(RepeatButton);
export default connectedComponent;
