import Button from '@helsenorge/designsystem-react/components/Button';

import styles from './formButtons.module.css';

type Props = {
  onCancelButtonClicked?: () => void;
  cancelButtonText: string;
};

export const CancelFormButton = ({ cancelButtonText, onCancelButtonClicked }: Props): JSX.Element | null => {
  return (
    <div className={styles.cancelButtonStyle}>
      <Button variant="borderless" onClick={onCancelButtonClicked} testId="refero-cancel-button">
        {cancelButtonText}
      </Button>
    </div>
  );
};
