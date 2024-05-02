import { QuestionnaireItem } from 'fhir/r4';
import { UseFormRegisterReturn } from 'react-hook-form';

import { isRequired } from '../../../util';
import { getMaxValueExtensionValue, getMinValueExtensionValue, getValidationTextExtension } from '../../../util/extension';
import { Resources } from '../../../util/resources';
import { FormProps } from '../../../validation/ReactHookFormHoc';

export const integerFormRegister = (
  register: FormProps['register'],
  item: QuestionnaireItem,
  resources?: Resources,
  value?: string | number | number[] | undefined,
  onChange?: (event: React.FormEvent<HTMLInputElement>) => void
): UseFormRegisterReturn => {
  return register(item.linkId, {
    required: {
      value: isRequired(item),
      message: resources?.formRequiredErrorMessage ?? 'Feltet er påkrevd',
    },
    max: {
      value: Number(getMaxValueExtensionValue(item)),
      message: getValidationTextExtension(item) ?? resources?.oppgiGyldigVerdi ?? 'Verdien er for høy',
    },
    min: {
      value: Number(getMinValueExtensionValue(item)),
      message: getValidationTextExtension(item) ?? resources?.oppgiGyldigVerdi ?? 'Verdien er for lav',
    },
    value,
    onChange,
  });
};
