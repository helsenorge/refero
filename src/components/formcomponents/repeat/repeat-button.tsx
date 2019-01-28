import * as React from 'react';
import { connect } from 'react-redux';
import { Path } from '../../../util/skjemautfyller-core';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { QuestionnaireItem, QuestionnaireResponseItem } from '../../../types/fhir';
import { getRepeatsTextExtension } from '../../../util/extension';
import { Resources } from '../../../util/resources';
import { Dispatch } from 'redux';
import { InlineButton } from '@helsenorge/toolkit/components/atoms/buttons/inline-button';
import { addRepeatItem } from '../../../actions/newValue';

interface Props {
  item: QuestionnaireItem;
  parentPath?: Array<Path>;
  responseItems?: Array<QuestionnaireResponseItem>;
  resources?: Resources;
  dispatch?: Dispatch<{}>;
}

const RepeatButton: React.SFC<Props> = ({ item, resources, dispatch, parentPath, responseItems }) => {
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
    <InlineButton type="add" className=" page_skjemautfyller__repeatbutton" onClick={onAddRepeatItem}>
      {text}
    </InlineButton>
  );
};

const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(RepeatButton);
export default connectedComponent;
