import { createContext, useContext, ReactNode, MouseEvent, FormEvent, KeyboardEvent } from 'react';

import { QuestionnaireResponse } from 'fhir/r4';
import { FieldValues, SubmitHandler, UseFormReturn } from 'react-hook-form';

type SubmitButtonProps = {
  onSubmitButtonClicked?:
    | (() => void)
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    | ((e: MouseEvent<HTMLElement, MouseEvent> | FormEvent<{}> | KeyboardEvent<HTMLUListElement> | null | undefined) => void);
};
type SaveButtonProps = {
  onPauseButtonClicked?: (questionnaireResponse?: QuestionnaireResponse) => void;
};
type CancelButtonProps = {
  onCancelButtonClicked?: () => void;
};
type ButtonsType = {
  submitButtonProps?: SubmitButtonProps;
  saveButtonProps: SaveButtonProps;
  cancelButtonProps: CancelButtonProps;
  isStepView?: boolean;
  isAuthorized?: boolean;
  loginButton?: JSX.Element;
  methods?: UseFormReturn<FieldValues, unknown, undefined>;
  onSubmit?: () => void;
  onFieldsNotCorrectlyFilledOut?: () => void;
};

const Buttons = createContext<ButtonsType | undefined>(undefined);

export type ButtonProviderProps = ButtonsType & {
  children: ReactNode;
};
export const ButtonProvider = ({
  children,
  cancelButtonProps,
  isAuthorized,
  isStepView,
  loginButton,
  saveButtonProps,
  submitButtonProps,
  methods,
  onFieldsNotCorrectlyFilledOut,
  onSubmit,
}: ButtonProviderProps): JSX.Element => {
  const onSubmitReactHookForm: SubmitHandler<FieldValues> = (): void => {
    onSubmit?.();
  };
  const onErrorReactHookForm = (errors: FieldValues): void => {
    if (onFieldsNotCorrectlyFilledOut && errors) {
      onFieldsNotCorrectlyFilledOut();
    }
  };
  return (
    <Buttons.Provider
      value={{
        cancelButtonProps,
        isAuthorized,
        isStepView,
        loginButton,
        saveButtonProps,
        submitButtonProps: {
          ...submitButtonProps,
          // Always override or set onSubmitButtonClicked to the handleSubmit result
          onSubmitButtonClicked: methods?.handleSubmit(onSubmitReactHookForm, onErrorReactHookForm),
        },
      }}
    >
      {children}
    </Buttons.Provider>
  );
};

export const useButtonContext = (): ButtonsType => {
  const context = useContext(Buttons);
  if (context === undefined) {
    throw new Error('useButtonContext must be used within a ButtonProvider');
  }
  return context;
};
