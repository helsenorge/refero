import { QuestionnaireItem } from 'fhir/r4';
import { UseFormRegisterReturn } from 'react-hook-form';

import { getDecimalPattern, isRequired } from '../../../util';
import { getMaxValueExtensionValue, getMinValueExtensionValue, getValidationTextExtension } from '../../../util/extension';
import { Resources } from '../../../util/resources';
import { FormProps } from '../../../validation/ReactHookFormHoc';

export const decimalFormRegister = (
  register: FormProps['register'],
  item: QuestionnaireItem,
  resources?: Resources,
  value?: string | number | number[] | undefined,
  onChange?: (event: React.FormEvent<Element>) => void
): UseFormRegisterReturn => {
  const decimalPattern = getDecimalPattern(item);
  return register(item.linkId, {
    required: {
      value: isRequired(item),
      message: getValidationTextExtension(item) ?? resources?.formRequiredErrorMessage ?? 'Feltet er påkrevd',
    },
    max: {
      value: Number(getMaxValueExtensionValue(item)),
      message: getValidationTextExtension(item) ?? resources?.oppgiGyldigVerdi ?? 'Verdien er for høy',
    },
    min: {
      value: Number(getMinValueExtensionValue(item)),
      message: getValidationTextExtension(item) ?? resources?.oppgiGyldigVerdi ?? 'Verdien er for lav',
    },
    ...(decimalPattern && { pattern: new RegExp(decimalPattern) }),
    value,
    onChange,
  });
};
