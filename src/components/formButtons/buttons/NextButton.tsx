import Button from '@helsenorge/designsystem-react/components/Button';

type Props = {
  text: string;
  onNextButtonClicked: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
};

export const NextButton = ({ text, onNextButtonClicked, disabled, children }: Props): React.JSX.Element => {
  return (
    <>
      <Button disabled={disabled} variant="borderless" onClick={onNextButtonClicked} testId="refero-cancel-button">
        {text}
      </Button>
      {children}
    </>
  );
};
export default NextButton;
