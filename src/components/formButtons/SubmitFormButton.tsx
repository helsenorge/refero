import { FormEvent, KeyboardEvent, MouseEvent } from 'react';

import Button from '@helsenorge/designsystem-react/components/Button';

type Props = {
  submitButtonDisabled?: boolean;
  onSubmitButtonClicked?:
    | (() => void)
    | ((e?: KeyboardEvent<HTMLUListElement> | MouseEvent<HTMLElement, MouseEvent> | FormEvent<unknown> | null | undefined) => void);
  submitButtonText: string;
};

export const SubmitFormButton = ({ submitButtonText, submitButtonDisabled, onSubmitButtonClicked }: Props): JSX.Element | null => {
  const handleSubmit = (
    e?: KeyboardEvent<HTMLUListElement> | MouseEvent<HTMLElement, MouseEvent> | FormEvent<unknown> | null | undefined
  ): void => {
    if (e) {
      e.preventDefault();
      onSubmitButtonClicked?.(e);
    }
  };
  return (
    <div>
      <Button type="submit" disabled={submitButtonDisabled} onClick={handleSubmit} testId="refero-submit-button">
        {submitButtonText}
      </Button>
    </div>
  );
};
