import React, { useState } from 'react';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

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
import { WithCommonFunctionsProps } from '../../with-common-functions';

interface Props extends WithCommonFunctionsProps {
  className?: string;
  item: QuestionnaireItem;
  path: Array<Path>;
  resources?: Resources;
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  mustShowConfirm?: boolean;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  renderContext: RenderContext;
}

const DeleteButton = ({ resources, dispatch, item, path, onAnswerChange, mustShowConfirm }: Props): JSX.Element => {
  const [showConfirm, setShowConfirm] = useState(false);
  const onDeleteRepeatItemConfirmed = (): void => {
    if (dispatch && item && path) {
      dispatch(deleteRepeatItemAsync(path, item))?.then(newState =>
        onAnswerChange(newState, path, item, {} as QuestionnaireResponseItemAnswer)
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
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(DeleteButton);
export default connectedComponent;
