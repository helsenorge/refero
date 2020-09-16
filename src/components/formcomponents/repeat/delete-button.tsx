import * as React from 'react';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import classNames from 'classnames';
import { ConfirmBox } from '@helsenorge/toolkit/components/molecules/confirmbox';
import { FunctionButton } from '@helsenorge/toolkit/components/atoms/buttons/function-button';

import { Path } from '../../../util/skjemautfyller-core';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { QuestionnaireItem, QuestionnaireResponseItemAnswer } from '../../../types/fhir';
import { Resources } from '../../../util/resources';
import { GlobalState } from '../../../reducers';
import { NewValueAction, deleteRepeatItemAsync } from '../../../actions/newValue';
import { RenderContext } from '../../../util/renderContext';

interface Props {
  item: QuestionnaireItem;
  path: Array<Path>;
  resources?: Resources;
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  mustShowConfirm: boolean;
  className?: string;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  renderContext: RenderContext;
}

interface State {
  showConfirm: boolean;
}

class DeleteButton extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { showConfirm: false };
  }

  onDeleteRepeatItemConfirmed = () => {
    if (this.props.dispatch && this.props.item && this.props.path) {
      this.props
        .dispatch(deleteRepeatItemAsync(this.props.path, this.props.item))
        ?.then(newState => this.props.onAnswerChange(newState, this.props.path, this.props.item, {} as QuestionnaireResponseItemAnswer));
    }
    this.setState({ showConfirm: false });
  };

  onDeleteRepeatItem = () => {
    if (this.props.mustShowConfirm) {
      this.setState({ showConfirm: true });
    } else {
      this.onDeleteRepeatItemConfirmed();
    }
  };

  onConfirmCancel = () => {
    this.setState({ showConfirm: false });
  };

  render(): JSX.Element {
    const { resources } = this.props;

    return (
      <React.Fragment>
        <FunctionButton
          iconType="delete"
          onClick={this.onDeleteRepeatItem}
          className={classNames('page_skjemautfyller__deletebutton', this.props.className)}
        >
          {resources && resources.deleteButtonText ? resources.deleteButtonText : ''}
        </FunctionButton>
        {this.state.showConfirm && resources ? (
          <ConfirmBox
            onConfirm={this.onDeleteRepeatItemConfirmed}
            confirmText={resources.confirmDeleteButtonText}
            onClose={this.onConfirmCancel}
            closeText={resources.confirmDeleteCancelButtonText}
            onCancel={this.onConfirmCancel}
            small
          >
            <h3>{resources.confirmDeleteHeading}</h3>
            <p>{resources.confirmDeleteDescription}</p>
          </ConfirmBox>
        ) : null}
      </React.Fragment>
    );
  }
}
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(DeleteButton);
export default connectedComponent;
