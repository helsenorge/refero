import React, { ReactElement } from 'react';

import Button from '@helsenorge/designsystem-react/components/Button';

type Props = {
  onPauseButtonClicked?: () => void;
  pauseButtonText: string;
  isHelsenorgeForm?: boolean;
  pauseButtonDisabled?: boolean;
};

export const PauseFormButton = ({ pauseButtonText, onPauseButtonClicked, pauseButtonDisabled, isHelsenorgeForm }: Props): ReactElement => {
  return (
    <div className={`pauseButtonStyle ${isHelsenorgeForm ? 'hideOnSmallScreen' : 'displayOnSmallScreen'}`}>
      <Button variant="outline" disabled={pauseButtonDisabled} onClick={onPauseButtonClicked}>
        {pauseButtonText}
      </Button>
    </div>
  );
};
