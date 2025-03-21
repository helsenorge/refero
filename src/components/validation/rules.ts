import { QuestionnaireItem } from 'fhir/r4';
import { FieldError, ValidationRule, ValidationValue } from 'react-hook-form';

import { getDecimalPattern, getMaxLength, isRequired, scriptInjectionValidation } from '@/util';
import {
  getMaxValueExtensionValue,
  getMinValueExtensionValue,
  getRegexExtension,
  getValidationTextExtension,
  getMinLengthExtensionValue,
} from '@/util/extension';
import { Resources } from '@/util/resources';

type ValidationRuleInput = {
  item?: QuestionnaireItem;
  resources?: Resources;
  message?: string;
};
type ValidationRuleReturnValue<T extends ValidationValue = ValidationValue> = string | ValidationRule<T> | undefined;

export const isNumber = (input: unknown): input is number => {
  if (typeof input === 'number' && Number.isFinite(input)) {
    return true;
  }

  if (typeof input === 'string' && input.trim() !== '' && !isNaN(Number(input))) {
    return true;
  }

  return false;
};
export const isInteger = (input: unknown): input is number => {
  if (typeof input === 'number' && Number.isFinite(input) && Number.isInteger(input)) {
    return true;
  }

  if (typeof input === 'string' && input.trim() !== '') {
    const num = Number(input);
    if (!isNaN(num) && Number.isInteger(num)) {
      return true;
    }
  }

  return false;
};
export const getErrorMessage = (item: QuestionnaireItem | undefined, error: FieldError | undefined): string | undefined => {
  if (error) {
    const validationTextExtension = getValidationTextExtension(item);
    if (validationTextExtension) {
      return validationTextExtension;
    }
    return error.message;
  }
};

export const required = ({ item, resources, message }: ValidationRuleInput): ValidationRuleReturnValue<boolean> => {
  return {
    value: isRequired(item),
    message: message ?? resources?.formRequiredErrorMessage ?? 'Feltet er påkrevd',
  };
};

export const maxValue = ({ item, resources, message }: ValidationRuleInput): ValidationRuleReturnValue<number> => {
  const maxValue = getMaxValueExtensionValue(item);
  const customErrorMessage = getValidationTextExtension(item);
  return maxValue
    ? {
        value: maxValue,
        message: message ?? customErrorMessage ?? resources?.oppgiGyldigVerdi ?? 'Verdien er for høy',
      }
    : undefined;
};

export const minValue = ({ item, resources, message }: ValidationRuleInput): ValidationRuleReturnValue<number> => {
  const minValue = getMinValueExtensionValue(item);
  const customErrorMessage = getValidationTextExtension(item);
  return isNumber(minValue)
    ? {
        value: minValue,
        message: message ?? customErrorMessage ?? resources?.oppgiGyldigVerdi ?? 'Verdien er for lav',
      }
    : undefined;
};

export const decimalPattern = ({ item, resources, message }: ValidationRuleInput): ValidationRule<RegExp> | undefined => {
  const pattern = getDecimalPattern(item);
  const customErrorMessage = getValidationTextExtension(item);

  return pattern
    ? {
        value: new RegExp(pattern),
        message: message ?? customErrorMessage ?? resources?.oppgiGyldigVerdi ?? 'Verdien er ikke et gyldig tall',
      }
    : undefined;
};

export const regexpPattern = ({ item, resources, message }: ValidationRuleInput): ValidationRule<RegExp> | undefined => {
  const pattern = getRegexExtension(item);
  const customErrorMessage = getValidationTextExtension(item);

  return pattern
    ? {
        value: new RegExp(pattern),
        message: message ?? customErrorMessage ?? resources?.oppgiGyldigVerdi ?? 'Verdien er for lav',
      }
    : undefined;
};

export const maxLength = ({ item, resources, message }: ValidationRuleInput): ValidationRule<number> | undefined => {
  const maxLength = getMaxLength(item);
  const customErrorMessage = getValidationTextExtension(item);

  return isNumber(maxLength)
    ? {
        value: maxLength,
        message: message ?? customErrorMessage ?? resources?.stringOverMaxLengthError ?? 'Verdien er for lang',
      }
    : undefined;
};

export const minLength = ({ item, resources, message }: ValidationRuleInput): ValidationRule<number> | undefined => {
  const minLength = getMinLengthExtensionValue(item);
  const customErrorMessage = getValidationTextExtension(item);
  return isNumber(minLength)
    ? {
        value: minLength,
        message: message ?? customErrorMessage ?? resources?.stringOverMaxLengthError ?? 'Verdien er for kort',
      }
    : undefined;
};

type ValidateInput = {
  value: string;
  shouldValidate: boolean;
  resources?: Resources;
};

export const scriptInjection = ({ value, resources, shouldValidate }: ValidateInput): string | true | undefined => {
  return shouldValidate ? scriptInjectionValidation(value, resources) : undefined;
};

export const getInputWidth = (maxCharacters: number | undefined, allowDecimals?: boolean, maxDecimals?: number | undefined): number => {
  if (!maxCharacters) {
    const defaultLength = 20;
    return defaultLength;
  }

  let width = maxCharacters;

  if (allowDecimals) {
    const puncationLength = 1;
    const defaultDecimalLength = 2;
    const decimalLength = maxDecimals ? maxDecimals : defaultDecimalLength;
    width = width + puncationLength + decimalLength;
  }

  //Adding extra width because of the increment arrows in the input field
  const extraWidth = 2;

  return width + extraWidth;
};
