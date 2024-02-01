import React, { ReactElement } from 'react';

import { ButtonType } from '../../types/formTypes/formButton';

import Button from '@helsenorge/designsystem-react/components/Button';

import { displayPauseButtonOnSmallScreen, hidePauseButtonOnSmallScreen, pauseButtonStyle } from '../../styles/formButtonStyles';

type Props = {
  onPauseButtonClicked?: () => void;
  pauseButtonText: string;
  isHelsenorgeForm?: boolean;
  pauseButtonDisabled?: boolean;
};

export const PauseFormButton = ({ pauseButtonText, onPauseButtonClicked, pauseButtonDisabled, isHelsenorgeForm }: Props): ReactElement => {
  return (
    <div key={ButtonType.pauseButton} className="pauseButtonStyle">
      <style>{pauseButtonStyle}</style>
      <style>{isHelsenorgeForm ? hidePauseButtonOnSmallScreen : displayPauseButtonOnSmallScreen}</style>
      <Button variant="outline" disabled={pauseButtonDisabled} onClick={onPauseButtonClicked}>
        {pauseButtonText}
      </Button>
    </div>
  );
};
