import { QuestionnaireItem } from 'fhir/r4';
import { UseFormRegisterReturn } from 'react-hook-form';

import { getMaxLength, isRequired } from '../../../util';
import { getMinLengthExtensionValue, getRegexExtension, getValidationTextExtension } from '../../../util/extension';
import { Resources } from '../../../util/resources';
import { FormProps } from '../../../validation/ReactHookFormHoc';

export const textFormRegister = (
  register: FormProps['register'],
  item: QuestionnaireItem,
  value: string,
  resources?: Resources,
  onChange?: (event: React.FormEvent<HTMLTextAreaElement>) => void
): UseFormRegisterReturn => {
  const maxLength = getMaxLength(item);
  const minLength = getMinLengthExtensionValue(item);
  const pattern = getRegexExtension(item);
  return register(item.linkId, {
    required: {
      value: isRequired(item),
      message: resources?.formRequiredErrorMessage ?? 'Feltet er påkrevd',
    },
    ...(minLength && {
      minLength: {
        value: minLength || 0,
        message: getValidationTextExtension(item) ?? resources?.stringOverMaxLengthError ?? 'Verdien er for kort',
      },
    }),
    ...(maxLength && {
      maxLength: {
        value: maxLength,
        message: getValidationTextExtension(item) ?? resources?.stringOverMaxLengthError ?? 'Verdien er for lang',
      },
    }),
    ...(pattern && {
      pattern: {
        value: new RegExp(pattern),
        message: getValidationTextExtension(item) ?? resources?.oppgiGyldigVerdi ?? 'Verdien er for lav',
      },
    }),
    value,
    onChange,
  });
};
