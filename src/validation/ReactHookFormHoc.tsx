import React from 'react';

import { FieldError, FieldValues, UseFormReturn, useFormContext } from 'react-hook-form';

import { WithCommonFunctionsProps } from '../components/with-common-functions';

export type FormProps = UseFormReturn<FieldValues, unknown, undefined> & {
  invalid: boolean;
  isDirty: boolean;
  isTouched: boolean;
  isValidating: boolean;
  error?: FieldError | undefined;
};

function ReactHookFormHoc<T extends Partial<WithCommonFunctionsProps>>(Comp: React.ComponentType<T>): React.ComponentType<T & FormProps> {
  const EnhancedComponent: React.FC<T & FormProps> = props => {
    const { formState, getFieldState, ...rest } = useFormContext();
    const { error, invalid, isDirty, isTouched, isValidating } = getFieldState(props.item?.linkId || '', formState);

    return (
      <Comp
        {...props}
        {...rest}
        formState={formState}
        error={error}
        invalid={invalid}
        isDirty={isDirty}
        isTouched={isTouched}
        isValidating={isValidating}
      />
    );
  };

  EnhancedComponent.displayName = 'ReactHookFormHoc';

  return EnhancedComponent;
}

ReactHookFormHoc.displayName = 'ReactHookFormHoc';

export default ReactHookFormHoc;
