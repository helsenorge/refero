import Button from '@helsenorge/designsystem-react/components/Button';

type Props = {
  onCancelButtonClicked?: () => void;
  cancelButtonText: string;
};

export const CancelFormButton = ({ cancelButtonText, onCancelButtonClicked }: Props): JSX.Element | null => {
  return (
    <div>
      <Button variant="borderless" onClick={onCancelButtonClicked} testId="refero-cancel-button">
        {cancelButtonText}
      </Button>
    </div>
  );
};
