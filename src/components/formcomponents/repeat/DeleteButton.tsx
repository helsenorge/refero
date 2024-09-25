import { useState } from 'react';

import { QuestionnaireItem } from 'fhir/r4';
import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import Button from '@helsenorge/designsystem-react/components/Button';
import Icon from '@helsenorge/designsystem-react/components/Icon';
import TrashCan from '@helsenorge/designsystem-react/components/Icons/TrashCan';
import Modal from '@helsenorge/designsystem-react/components/Modal';

import { NewValueAction, deleteRepeatItemAsync } from '../../../actions/newValue';
import { GlobalState } from '../../../reducers';
import { Path } from '../../../util/refero-core';
import { useExternalRenderContext } from '@/context/externalRenderContext';

type Props = {
  className?: string;
  item?: QuestionnaireItem;
  path?: Array<Path>;
  mustShowConfirm?: boolean;
};

const DeleteButton = ({ item, path, mustShowConfirm }: Props): JSX.Element => {
  const dispatch = useDispatch<ThunkDispatch<GlobalState, void, NewValueAction>>();
  const { onAnswerChange, resources } = useExternalRenderContext();
  const [showConfirm, setShowConfirm] = useState(false);

  const onDeleteRepeatItemConfirmed = (): void => {
    if (dispatch && item && path) {
      dispatch(deleteRepeatItemAsync(path, item))?.then(newState => onAnswerChange(newState, item, {}));
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
  const pathItem = path?.filter(p => p.linkId === item?.linkId);
  const testId = `${pathItem?.[0].linkId ?? item?.linkId}-${pathItem?.[0].index ?? 0}`;
  return (
    <>
      <br />
      <Button variant="outline" concept="destructive" onClick={onDeleteRepeatItem} testId={`${testId}-delete-button`} ariaLabel="slett">
        <Icon svgIcon={TrashCan} />
        {resources && resources.deleteButtonText ? resources.deleteButtonText : ''}
      </Button>
      {showConfirm && !!resources ? (
        <Modal
          testId={`${testId}-delete-confirm-modal`}
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
