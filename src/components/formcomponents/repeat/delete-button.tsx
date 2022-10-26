import * as React from 'react';

import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer } from '../../../types/fhir';

import Button from '@helsenorge/designsystem-react/components/Button';
import Icon from '@helsenorge/designsystem-react/components/Icons';
import TrashCan from '@helsenorge/designsystem-react/components/Icons/TrashCan';
import Modal from '@helsenorge/designsystem-react/components/Modal';

import { NewValueAction, deleteRepeatItemAsync } from '../../../actions/newValue';
import { GlobalState } from '../../../reducers';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { RenderContext } from '../../../util/renderContext';
import { Resources } from '../../../util/resources';
import { Path } from '../../../util/refero-core';

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

  onDeleteRepeatItemConfirmed = (): void => {
    if (this.props.dispatch && this.props.item && this.props.path) {
      this.props
        .dispatch(deleteRepeatItemAsync(this.props.path, this.props.item))
        ?.then(newState => this.props.onAnswerChange(newState, this.props.path, this.props.item, {} as QuestionnaireResponseItemAnswer));
    }
    this.setState({ showConfirm: false });
  };

  onDeleteRepeatItem = (): void => {
    if (this.props.mustShowConfirm) {
      this.setState({ showConfirm: true });
    } else {
      this.onDeleteRepeatItemConfirmed();
    }
  };

  onConfirmCancel = (): void => {
    this.setState({ showConfirm: false });
  };

  render(): JSX.Element {
    const { resources } = this.props;

    return (
      <React.Fragment>
        <Button variant="outline" concept="destructive" onClick={this.onDeleteRepeatItem}>
          <Icon svgIcon={TrashCan} />
          {resources && resources.deleteButtonText ? resources.deleteButtonText : ''}
        </Button>
        {this.state.showConfirm && resources ? (
          <Modal
            onClose={this.onConfirmCancel}
            title={resources.confirmDeleteHeading}
            description={resources.confirmDeleteDescription}
            onSuccess={this.onDeleteRepeatItemConfirmed}
            primaryButtonText={resources.confirmDeleteButtonText}
            secondaryButtonText={resources.confirmDeleteCancelButtonText}
          />
        ) : null}
      </React.Fragment>
    );
  }
}
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(DeleteButton);
export default connectedComponent;
