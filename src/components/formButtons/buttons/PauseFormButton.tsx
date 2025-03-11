import Button from '@helsenorge/designsystem-react/components/Button';
import Icon from '@helsenorge/designsystem-react/components/Icon';
import Save from '@helsenorge/designsystem-react/components/Icons/Save';

import { Breakpoint, useBreakpoint } from '@helsenorge/designsystem-react';

type Props = {
  onPauseButtonClicked?: () => void;
  pauseButtonText: string;
  pauseButtonDisabled?: boolean;
  isStepView?: boolean;
  children?: React.ReactNode;
};

export const PauseFormButton = ({
  pauseButtonText,
  onPauseButtonClicked,
  pauseButtonDisabled,
  isStepView,
  children,
}: Props): JSX.Element | null => {
  const breakpoint = useBreakpoint();

  if (!onPauseButtonClicked) {
    return null;
  }

  const displaySaveIcon = breakpoint > Breakpoint.xxs && !isStepView;

  return (
    <div>
      <Button variant="outline" disabled={pauseButtonDisabled} onClick={onPauseButtonClicked} testId="refero-pause-button">
        {displaySaveIcon && <Icon svgIcon={Save} />}
        {pauseButtonText}
      </Button>
      {children}
    </div>
  );
};
