import React from 'react';

import { FieldValues, UseFormReturn, useFormContext } from 'react-hook-form';

import { WithCommonFunctionsProps } from '../components/with-common-functions';

export type FormProps = UseFormReturn<FieldValues, unknown, undefined>;

function ReactHookFormHoc<T extends Partial<WithCommonFunctionsProps>>(Comp: React.ComponentType<T>): React.ComponentType<T & FormProps> {
  const EnhancedComponent: React.FC<T & FormProps> = props => {
    const form = useFormContext();
    return <Comp {...props} {...form} />;
  };

  EnhancedComponent.displayName = 'ReactHookFormHoc';

  return EnhancedComponent;
}

ReactHookFormHoc.displayName = 'ReactHookFormHoc';

export default ReactHookFormHoc;
