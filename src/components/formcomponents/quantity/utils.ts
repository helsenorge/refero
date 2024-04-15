import { QuestionnaireItem } from 'fhir/r4';
import { UseFormRegisterReturn } from 'react-hook-form';

import { getDecimalPattern, isRequired } from '../../../util';
import { getMaxValueExtensionValue, getMinValueExtensionValue, getValidationTextExtension } from '../../../util/extension';
import { Resources } from '../../../util/resources';
import { FormProps } from '../../../validation/ReactHookFormHoc';

export const quantityFormRegister = (
  register: FormProps['register'],
  item: QuestionnaireItem,
  resources?: Resources,
  value?: string | number | number[] | undefined,
  onChange?: (event: React.FormEvent<HTMLInputElement>) => void
): UseFormRegisterReturn => {
  const decimalPattern = getDecimalPattern(item);
  const minValue = getMinValueExtensionValue(item);
  const maxValue = getMaxValueExtensionValue(item);

  return register(item.linkId, {
    required: {
      value: isRequired(item),
      message: resources?.formRequiredErrorMessage ?? 'Feltet er påkrevd',
    },

    ...(maxValue && {
      max: {
        value: maxValue,
        message: getValidationTextExtension(item) ?? resources?.oppgiGyldigVerdi ?? 'Verdien er for høy',
      },
    }),
    ...(minValue && {
      min: {
        value: minValue,
        message: getValidationTextExtension(item) ?? resources?.oppgiGyldigVerdi ?? 'Verdien er for lav',
      },
    }),
    ...(decimalPattern && { pattern: new RegExp(decimalPattern), message: 'Verdien er ikke tilatt' }),
    value,
    onChange,
  });
};
