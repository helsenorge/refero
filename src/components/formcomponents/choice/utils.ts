import { QuestionnaireItem } from 'fhir/r4';
import { UseFormRegisterReturn } from 'react-hook-form';

import { isRequired } from '../../../util';
import { getValidationTextExtension } from '../../../util/extension';
import { Resources } from '../../../util/resources';
import { FormProps } from '../../../validation/ReactHookFormHoc';

export const selectFormRegister = (
  register: FormProps['register'],
  item: QuestionnaireItem,
  resources?: Resources,
  value?: string,
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void,
  disabled?: boolean
): UseFormRegisterReturn => {
  return register(item.linkId, {
    value,
    onChange,
    required: {
      message: getValidationTextExtension(item) ?? resources?.formRequiredErrorMessage ?? '',
      value: isRequired(item),
    },
    disabled,
  });
};
