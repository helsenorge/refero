import * as React from 'react';
import { connect } from 'react-redux';
import { Path } from '../../../util/skjemautfyller-core';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { QuestionnaireItem } from '../../../types/fhir';
import { Resources } from '../../../util/resources';
import { ThunkDispatch } from 'redux-thunk';
import { GlobalState } from '../../../reducers';
import { NewValueAction } from '../../../actions/newValue';
import { ConfirmBox } from '@helsenorge/toolkit/components/molecules/confirmbox';
import { FunctionButton } from '@helsenorge/toolkit/components/atoms/buttons/function-button';
import * as classNames from 'classnames';
import { deleteRepeatItem } from '../../../actions/newValue';
interface Props {
  item: QuestionnaireItem;
  path: Array<Path>;
  resources?: Resources;
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  mustShowConfirm: boolean;
  className?: string;
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
    if (this.props.dispatch && this.props.item) {
      this.props.dispatch(deleteRepeatItem(this.props.path, this.props.item));
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
            energize
            onConfirm={this.onDeleteRepeatItemConfirmed}
            confirmText={resources.confirmDeleteButtonText}
            onClose={this.onConfirmCancel}
            closeText={resources.confirmDeleteCancelButtonText}
            onCancel={this.onConfirmCancel}
            small
          >
            <h3 tabIndex={0}>{resources.confirmDeleteHeading}</h3>
            <p>{resources.confirmDeleteDescription}</p>
          </ConfirmBox>
        ) : null}
      </React.Fragment>
    );
  }
}
const connectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(DeleteButton);
export default connectedComponent;
