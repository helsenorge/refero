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
import { Path } from '../../../util/refero-core';
import { RenderContext } from '../../../util/renderContext';
import { Resources } from '../../../util/resources';

interface DeleteButtonProps {
  item: QuestionnaireItem;
  path: Array<Path>;
  resources?: Resources;
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  mustShowConfirm: boolean;
  className?: string;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  renderContext: RenderContext;
}

const DeleteButton: React.FC<DeleteButtonProps> = props => {
  const [showConfirm, setShowConfirm] = React.useState<boolean>(false);

  const onDeleteRepeatItemConfirmed = (): void => {
    if (props.dispatch && props.item && props.path) {
      props
        .dispatch(deleteRepeatItemAsync(props.path, props.item))
        ?.then(newState => props.onAnswerChange(newState, props.path, props.item, {} as QuestionnaireResponseItemAnswer));
    }
    setShowConfirm(false);
  };

  const onDeleteRepeatItem = (): void => {
    if (props.mustShowConfirm) {
      setShowConfirm(true);
    } else {
      onDeleteRepeatItemConfirmed();
    }
  };

  const onConfirmCancel = (): void => {
    setShowConfirm(false);
  };

  const { resources } = props;

  return (
    <React.Fragment>
      <Button variant="outline" concept="destructive" onClick={onDeleteRepeatItem}>
        <Icon svgIcon={TrashCan} />
        {resources && resources.deleteButtonText ? resources.deleteButtonText : ''}
      </Button>
      {showConfirm && resources ? (
        <Modal
          onClose={onConfirmCancel}
          title={resources.confirmDeleteHeading}
          description={resources.confirmDeleteDescription}
          onSuccess={onDeleteRepeatItemConfirmed}
          primaryButtonText={resources.confirmDeleteButtonText}
          secondaryButtonText={resources.confirmDeleteCancelButtonText}
        />
      ) : null}
    </React.Fragment>
  );
};
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(DeleteButton);
export default connectedComponent;
