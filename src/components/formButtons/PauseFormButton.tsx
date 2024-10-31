import Button from '@helsenorge/designsystem-react/components/Button';

type Props = {
  onPauseButtonClicked?: () => void;
  pauseButtonText: string;
  pauseButtonDisabled?: boolean;
  isStepView?: boolean;
};

export const PauseFormButton = ({ pauseButtonText, onPauseButtonClicked, pauseButtonDisabled }: Props): JSX.Element | null => {
  if (!onPauseButtonClicked) {
    return null;
  }
  return (
    <div>
      <Button variant="outline" disabled={pauseButtonDisabled} onClick={onPauseButtonClicked} testId="refero-pause-button">
        {pauseButtonText}
      </Button>
    </div>
  );
};
