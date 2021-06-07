import * as React from 'react';

import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { FunctionButton } from '@helsenorge/toolkit/components/atoms/buttons/function-button';
import Add from '@helsenorge/toolkit/components/icons/Add';

import { NewValueAction } from '../../../actions/newValue';
import { addRepeatItem } from '../../../actions/newValue';
import { GlobalState } from '../../../reducers';
import { QuestionnaireItem, QuestionnaireResponseItem } from '../../../types/fhir';
import { getRepeatsTextExtension } from '../../../util/extension';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { RenderContext } from '../../../util/renderContext';
import { Resources } from '../../../util/resources';
import { Path } from '../../../util/skjemautfyller-core';

interface Props {
  item: QuestionnaireItem;
  parentPath?: Array<Path>;
  responseItems?: Array<QuestionnaireResponseItem>;
  resources?: Resources;
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  renderContext: RenderContext;
}

export const RepeatButton: React.SFC<Props> = ({ item, resources, dispatch, parentPath, responseItems }) => {
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
    <FunctionButton svgIcon={<Add />} className=" page_skjemautfyller__repeatbutton" onClick={onAddRepeatItem}>
      {text}
    </FunctionButton>
  );
};

const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(RepeatButton);
export default connectedComponent;
