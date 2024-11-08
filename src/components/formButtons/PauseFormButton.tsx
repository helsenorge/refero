import { Breakpoint, useBreakpoint } from '@helsenorge/designsystem-react';
import Button from '@helsenorge/designsystem-react/components/Button';
import Icon from '@helsenorge/designsystem-react/components/Icon';
import Save from '@helsenorge/designsystem-react/components/Icons/Save';

type Props = {
  onPauseButtonClicked?: () => void;
  pauseButtonText: string;
  pauseButtonDisabled?: boolean;
  isStepView?: boolean;
};

export const PauseFormButton = ({ pauseButtonText, onPauseButtonClicked, pauseButtonDisabled, isStepView }: Props): JSX.Element | null => {
  if (!onPauseButtonClicked) {
    return null;
  }

  const breakpoint = useBreakpoint();

  const displaySaveIcon = breakpoint > Breakpoint.xxs && !isStepView;

  useBreakpoint;
  return (
    <div>
      <Button variant="outline" disabled={pauseButtonDisabled} onClick={onPauseButtonClicked} testId="refero-pause-button">
        {displaySaveIcon && <Icon svgIcon={Save} />}
        {pauseButtonText}
      </Button>
    </div>
  );
};
