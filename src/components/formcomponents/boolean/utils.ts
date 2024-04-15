import { QuestionnaireItem } from 'fhir/r4';
import { UseFormRegisterReturn } from 'react-hook-form';

import { isRequired } from '../../../util';
import { getValidationTextExtension } from '../../../util/extension';
import { Resources } from '../../../util/resources';
import { FormProps } from '../../../validation/ReactHookFormHoc';

export const booleanFormRegister = (
  register: FormProps['register'],
  item: QuestionnaireItem,
  resources?: Resources,
  value?: boolean,
  onChange?: () => void
): UseFormRegisterReturn => {
  return register(item.linkId, {
    required: {
      value: isRequired(item),
      message: resources?.formRequiredErrorMessage ?? 'Feltet er påkrevd',
    },
    value,
    onChange,
  });
};
