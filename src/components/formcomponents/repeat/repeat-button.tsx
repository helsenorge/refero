import * as React from 'react';
import { connect } from 'react-redux';
import { Path } from '../../../util/skjemautfyller-core';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { QuestionnaireItem, QuestionnaireResponseItem } from '../../../types/fhir';
import { getRepeatsTextExtension } from '../../../util/extension';
import { Resources } from '../../../util/resources';
import { ThunkDispatch } from 'redux-thunk';
import { GlobalState } from '../../../reducers';
import { NewValueAction } from '../../../actions/newValue';
import { FunctionButton } from '@helsenorge/toolkit/components/atoms/buttons/function-button';
import { addRepeatItem } from '../../../actions/newValue';

interface Props {
  item: QuestionnaireItem;
  parentPath?: Array<Path>;
  responseItems?: Array<QuestionnaireResponseItem>;
  resources?: Resources;
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
}

export const RepeatButton: React.SFC<Props> = ({ item, resources, dispatch, parentPath, responseItems }) => {
  const onAddRepeatItem = () => {
    if (dispatch && item) {
      dispatch(addRepeatItem(parentPath, item, responseItems));
    }
  };

  let text = getRepeatsTextExtension(item);
  if (!text && (resources && resources.repeatButtonText)) {
    text = resources.repeatButtonText;
  }

  return (
    <FunctionButton iconType="add" className=" page_skjemautfyller__repeatbutton" onClick={onAddRepeatItem}>
      {text}
    </FunctionButton>
  );
};

const connectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(RepeatButton);
export default connectedComponent;
