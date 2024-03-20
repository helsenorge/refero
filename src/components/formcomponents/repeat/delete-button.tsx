import React, { useState } from 'react';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { Resources } from '../../../types/resources';

import Button from '@helsenorge/designsystem-react/components/Button';
import Icon from '@helsenorge/designsystem-react/components/Icon';
import TrashCan from '@helsenorge/designsystem-react/components/Icons/TrashCan';
import Modal from '@helsenorge/designsystem-react/components/Modal';

import { NewValueAction, deleteRepeatItemAsync } from '../../../actions/newValue';
import { GlobalState } from '../../../reducers';
import { Path } from '../../../util/refero-core';

interface DeleteButtonProps {
  item?: QuestionnaireItem;
  path?: Array<Path>;
  resources?: Resources;
  mustShowConfirm: boolean;
  className?: string;
  onAnswerChange?: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
}
const DeleteButton = ({ resources, item, path, onAnswerChange, mustShowConfirm }: DeleteButtonProps): JSX.Element => {
  const [showConfirm, setShowConfirm] = useState(false);
  const dispatch = useDispatch<ThunkDispatch<GlobalState, void, NewValueAction>>();
  const onDeleteRepeatItemConfirmed = (): void => {
    if (dispatch && item && path) {
      dispatch(deleteRepeatItemAsync(path, item))?.then(
        newState => onAnswerChange && onAnswerChange(newState, path, item, {} as QuestionnaireResponseItemAnswer)
      );
    }
    setShowConfirm(false);
  };

  const onDeleteRepeatItem = (): void => {
    if (mustShowConfirm) {
      setShowConfirm(true);
    } else {
      onDeleteRepeatItemConfirmed();
    }
  };

  const onConfirmCancel = (): void => {
    setShowConfirm(false);
  };

  return (
    <>
      <br />
      <Button variant="outline" concept="destructive" onClick={onDeleteRepeatItem}>
        <Icon svgIcon={TrashCan} />
        {resources && resources.deleteButtonText ? resources.deleteButtonText : ''}
      </Button>
      {showConfirm && !!resources ? (
        <Modal
          onClose={onConfirmCancel}
          title={resources.confirmDeleteHeading}
          description={resources.confirmDeleteDescription}
          onSuccess={onDeleteRepeatItemConfirmed}
          primaryButtonText={resources.confirmDeleteButtonText}
          secondaryButtonText={resources.confirmDeleteCancelButtonText}
        />
      ) : null}
    </>
  );
};
export default DeleteButton;
