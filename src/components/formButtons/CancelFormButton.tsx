import Button from '@helsenorge/designsystem-react/components/Button';

type Props = {
  onCancelButtonClicked?: () => void;
  cancelButtonText: string;
  isMicroweb?: boolean;
  cancelUrl?: string;
};

export const CancelFormButton = ({ cancelButtonText, onCancelButtonClicked, isMicroweb, cancelUrl }: Props): JSX.Element | null => {
  if (isMicroweb && cancelUrl) {
    return (
      <div>
        <Button variant="borderless" href={cancelUrl} htmlMarkup="a" testId="refero-cancel-button">
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
