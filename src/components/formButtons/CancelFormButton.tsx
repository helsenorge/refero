import Button from '@helsenorge/designsystem-react/components/Button';

type Props = {
  onCancelButtonClicked?: () => void;
  cancelButtonText: string;
  isMicroweb?: boolean;
  avbryturl?: string;
};

export const CancelFormButton = ({ cancelButtonText, onCancelButtonClicked, isMicroweb, avbryturl }: Props): JSX.Element | null => {
  if (isMicroweb && avbryturl) {
    return (
      <div>
        <Button variant="borderless" href={avbryturl} htmlMarkup="a" testId="refero-cancel-button">
          {cancelButtonText}
        </Button>
      </div>
    );
  } else {
    return (
      <div>
        <Button variant="borderless" onClick={onCancelButtonClicked} testId="refero-cancel-button">
          {cancelButtonText}
        </Button>
      </div>
    );
  }
};
