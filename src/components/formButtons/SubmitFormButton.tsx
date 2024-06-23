import { FormEvent, KeyboardEvent, MouseEvent } from 'react';

import Button from '@helsenorge/designsystem-react/components/Button';

import styles from '../../styles/formButtons.module.css';

type Props = {
  submitButtonDisabled?: boolean;
  onSubmitButtonClicked?:
    | (() => void)
    | ((e: MouseEvent<HTMLElement, MouseEvent> | FormEvent<{}> | KeyboardEvent<HTMLUListElement> | null | undefined) => void);
  submitButtonText: string;
};

export const SubmitFormButton = ({ submitButtonText, submitButtonDisabled, onSubmitButtonClicked }: Props): JSX.Element | null => {
  const handleSubmit = (
    e?: MouseEvent<HTMLElement, MouseEvent> | FormEvent<{}> | KeyboardEvent<HTMLUListElement> | null | undefined
  ): void => {
    if (e) {
      e.preventDefault();
      onSubmitButtonClicked && onSubmitButtonClicked(e);
    }
  };
  return (
    <div className={styles.submitButtonStyle}>
      <Button type="submit" disabled={submitButtonDisabled} onClick={handleSubmit} testId="refero-submit-button">
        {submitButtonText}
      </Button>
    </div>
  );
};
