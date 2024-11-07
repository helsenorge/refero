import { useAppSelector } from '@/reducers';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

export const useResetFormField = <T>(id: string, defaultValue?: T): void => {
  const { resetField } = useFormContext();
  const isExternal = useAppSelector(state => state.refero.form.FormData.isExternalUpdate);
  const [isExternalUpdateLocal, setIsExternalUpdateLocal] = useState(false);

  useEffect(() => {
    if ((Array.isArray(defaultValue) && defaultValue.length === 0) || defaultValue === undefined || defaultValue === null) {
      return;
    }
    if (!isExternalUpdateLocal && isExternal) {
      resetField(id, { defaultValue, keepDirty: true, keepError: true, keepTouched: true });
      setIsExternalUpdateLocal(true);
    } else if (!isExternal) {
      setIsExternalUpdateLocal(false);
    }
  }, [isExternal, isExternalUpdateLocal, resetField, defaultValue]);
};
