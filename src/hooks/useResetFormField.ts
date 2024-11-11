import ItemControlConstants from '@/constants/itemcontrol';
import { useAppSelector } from '@/reducers';
import { getItemControlExtensionValue } from '@/util/extension';
import { QuestionnaireItem } from 'fhir/r4';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

export const useResetFormField = <T>(id: string, defaultValue?: T, item?: QuestionnaireItem): void => {
  const { setValue } = useFormContext();
  const isExternal = useAppSelector(state => state.refero.form.FormData.isExternalUpdate);
  const [isExternalUpdateLocal, setIsExternalUpdateLocal] = useState(false);

  const EXCLUDED_ITEM_CONTROL_CODES = new Set([
    ItemControlConstants.SIDEBAR,
    ItemControlConstants.HELP,
    ItemControlConstants.HIGHLIGHT,
    ItemControlConstants.INLINE,
    ItemControlConstants.HELPLINK,
  ] as const);
  type ExcludedItemControlCode = typeof EXCLUDED_ITEM_CONTROL_CODES extends Set<infer T> ? T : never;

  const EXCLUDED_ITEM_CODES = new Set(['SOT-1', 'SOT-2', 'SOT-3'] as const);
  type ExcludedItemCode = typeof EXCLUDED_ITEM_CODES extends Set<infer T> ? T : never;
  // Function to check if an item has any excluded item control codes
  const hasExcludedItemControlType = (item?: QuestionnaireItem): boolean => {
    const itemControls = getItemControlExtensionValue(item);
    return (
      itemControls?.some(control => (control.code ? EXCLUDED_ITEM_CONTROL_CODES.has(control.code as ExcludedItemControlCode) : false)) ??
      false
    );
  };

  // Function to check if an item has any excluded item codes
  const hasExcludedCode = (item?: QuestionnaireItem): boolean => {
    if (!item || !item?.code) {
      return false;
    }
    return item?.code?.some(code => (code.code ? EXCLUDED_ITEM_CODES.has(code.code as ExcludedItemCode) : false)) ?? false;
  };

  useEffect(() => {
    if (
      (Array.isArray(defaultValue) && defaultValue.length === 0) ||
      defaultValue === undefined ||
      defaultValue === null ||
      hasExcludedCode(item) ||
      hasExcludedItemControlType(item)
    ) {
      return;
    }
    if (!isExternalUpdateLocal && isExternal) {
      setValue(id, defaultValue);
      setIsExternalUpdateLocal(true);
    } else if (!isExternal) {
      setIsExternalUpdateLocal(false);
    }
  }, [isExternal, isExternalUpdateLocal, setValue, defaultValue]);
};
