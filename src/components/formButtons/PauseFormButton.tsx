import Button from '@helsenorge/designsystem-react/components/Button';

type Props = {
  onPauseButtonClicked?: () => void;
  pauseButtonText: string;
  isHelsenorgeForm?: boolean;
  pauseButtonDisabled?: boolean;
  isStepView?: boolean;
};

export const PauseFormButton = ({
  pauseButtonText,
  onPauseButtonClicked,
  pauseButtonDisabled,
  isHelsenorgeForm,
}: Props): JSX.Element | null => {
  if (!onPauseButtonClicked) {
    return null;
  }
  return (
    <div className={`pauseButtonStyle ${isHelsenorgeForm ? 'hideOnSmallScreen' : 'displayOnSmallScreen'}`}>
      <Button variant="outline" disabled={pauseButtonDisabled} onClick={onPauseButtonClicked} testId="refero-pause-button">
        {pauseButtonText}
      </Button>
    </div>
  );
};
