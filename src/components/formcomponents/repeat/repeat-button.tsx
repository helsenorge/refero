import * as React from 'react';

import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { QuestionnaireItem, QuestionnaireResponseItem } from '../../../types/fhir';

import Button from '@helsenorge/designsystem-react/components/Button';
import Icon from '@helsenorge/designsystem-react/components/Icons';
import PlusLarge from '@helsenorge/designsystem-react/components/Icons/PlusLarge';

import { NewValueAction } from '../../../actions/newValue';
import { addRepeatItem } from '../../../actions/newValue';
import { GlobalState } from '../../../reducers';
import { getRepeatsTextExtension } from '../../../util/extension';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { RenderContext } from '../../../util/renderContext';
import { Resources } from '../../../util/resources';
import { Path } from '../../../util/refero-core';

interface Props {
  item: QuestionnaireItem;
  parentPath?: Array<Path>;
  responseItems?: Array<QuestionnaireResponseItem>;
  resources?: Resources;
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  renderContext: RenderContext;
  disabled: boolean;
}

export const RepeatButton: React.SFC<Props> = ({ item, resources, dispatch, parentPath, responseItems, disabled }) => {
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
    <Button onClick={onAddRepeatItem} variant="borderless" disabled={disabled}>
      <Icon svgIcon={PlusLarge} />
      {text}
    </Button>
  );
};

const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(RepeatButton);
export default connectedComponent;
