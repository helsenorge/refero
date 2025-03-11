import { FormEvent, KeyboardEvent, MouseEvent } from 'react';

import Button from '@helsenorge/designsystem-react/components/Button';

type Props = {
  submitButtonDisabled?: boolean;
  onSubmitButtonClicked?:
    | (() => void)
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    | ((e: MouseEvent<HTMLElement, MouseEvent> | FormEvent<{}> | KeyboardEvent<HTMLUListElement> | null | undefined) => void);
  submitButtonText: string;
  children?: React.ReactNode;
};

export const SubmitFormButton = ({
  submitButtonText,
  submitButtonDisabled,
  onSubmitButtonClicked,
  children,
}: Props): JSX.Element | null => {
  const handleSubmit = (
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    e?: MouseEvent<HTMLElement, MouseEvent> | FormEvent<{}> | KeyboardEvent<HTMLUListElement> | null | undefined
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
      {children}
    </div>
  );
};
