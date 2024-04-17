import React from 'react';

import { FieldError, FieldValues, UseFormReturn, useFormContext } from 'react-hook-form';

import { WithCommonFunctionsProps } from '../components/with-common-functions';

export type FormProps = Omit<UseFormReturn<FieldValues, unknown, undefined>, 'getFieldState'> & {
  invalid: boolean;
  isDirty: boolean;
  isTouched: boolean;
  isValidating: boolean;
  error?: FieldError | undefined;
};

function withReactHookFormHoc<T extends WithCommonFunctionsProps>(
  WrappedComponent: React.ComponentType<T & FormProps>
): React.ComponentType<T> {
  const EnhancedComponent: React.FC<T> = props => {
    const { formState, getFieldState, control, register, ...rest } = useFormContext<FieldValues>();
    const { error, invalid, isDirty, isTouched, isValidating } = getFieldState(props.item?.linkId || '', formState);

    return (
      <WrappedComponent
        {...props}
        {...rest}
        control={control}
        register={register}
        error={error}
        invalid={invalid}
        isDirty={isDirty}
        isTouched={isTouched}
        isValidating={isValidating}
        formState={formState}
      />
    );
  };

  EnhancedComponent.displayName = 'ReactHookFormHoc';

  return React.memo(EnhancedComponent);
}

withReactHookFormHoc.displayName = 'ReactHookFormHoc';

export default withReactHookFormHoc;
