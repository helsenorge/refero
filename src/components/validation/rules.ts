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
/**
 * @param params - An object containing the item, resources and message.
 * @param item - The QuestionnaireItem that may include extensions to derive the decimal pattern.
 * @param resources - the language resources from props.
 * @param message - A custom error message to be used if the validation fails.
 * @returns A Validation Rule that the questionnaireItem for a required field and returns a validation rule with the message.
 */
export const required = ({ item, resources, message }: ValidationRuleInput): ValidationRuleReturnValue<boolean> => {
  const customErrorMessage = getValidationTextExtension(item);
  return {
    value: isRequired(item),
    message: message ?? customErrorMessage ?? resources?.formRequiredErrorMessage ?? 'Feltet er påkrevd',
  };
};
/**
 * @param params - An object containing the item, resources and message.
 * @param item - The QuestionnaireItem that may include extensions to derive the decimal pattern.
 * @param resources - the language resources from props.
 * @param message - A custom error message to be used if the validation fails.
 * @returns A Validation Rule that checks the questionnaireItem for a maxValue and returns a validation rule with the maxValue and message.
 */
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
/**
 * @param params - An object containing the item, resources and message.
 * @param item - The QuestionnaireItem that may include extensions to derive the decimal pattern.
 * @param resources - the language resources from props.
 * @param message - A custom error message to be used if the validation fails.
 * @returns A Validation Rule that checks the questionnaireItem for a minValue and returns a validation rule with the maxValue and message.
 */
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
/**
 * @param params - An object containing the item, resources and message.
 * @param item - The QuestionnaireItem that may include extensions to derive the decimal pattern.
 * @param resources - the language resources from props.
 * @param message - A custom error message to be used if the validation fails.
 * @returns A Validation Rule that checks the questionnaireItem for a regex pattern for decimals and returns a validation rule with the pattern and message.
 */
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
/**
 * @param params - An object containing the item, resources and message.
 * @param item - The QuestionnaireItem that may include extensions to derive the decimal pattern.
 * @param resources - the language resources from props.
 * @param message - A custom error message to be used if the validation fails.
 * @returns A Validation Rule that checks the questionnaireItem for a regex pattern and returns a validation rule with the pattern and message.
 */
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
/**
 * @param params - An object containing the item, resources and an optional custom message.
 * @param item - The QuestionnaireItem that may include extensions to derive the regex pattern.
 * @param resources - The language resources from props.
 * @param message - A custom error message to be used if the validation fails.
 * @returns A validator function which accepts a string value and returns true if valid or an error message if it fails.
 */
export function createRegexpValidator({
  item,
  resources,
  message,
}: {
  item?: QuestionnaireItem;
  resources?: { oppgiGyldigVerdi?: string };
  message?: string;
}): (value: string) => true | string {
  const pattern = getRegexExtension(item);
  const errorMessage = message ?? getValidationTextExtension(item) ?? resources?.oppgiGyldigVerdi ?? 'Verdien er for lav';
  if (!pattern) {
    return () => true;
  }
  const regex = new RegExp(pattern);
  return (value: string): true | string => {
    return regex.test(value) ? true : errorMessage;
  };
}
/**
 * @param params - An object containing the item, resources and message.
 * @param item - The QuestionnaireItem that may include extensions to derive the decimal pattern.
 * @param resources - the language resources from props.
 * @param message - A custom error message to be used if the validation fails.
 * @returns A validator function that takes a numeric value and returns true if valid or an error message string.
 */
export function createMaxDecimalPlacesValidator({
  item,
  resources,
  message,
}: {
  item?: QuestionnaireItem;
  resources?: { oppgiGyldigVerdi?: string };
  message?: string;
}): (value: number) => true | string {
  const patternString = getDecimalPattern(item);
  const errorMessage = message ?? getValidationTextExtension(item) ?? resources?.oppgiGyldigVerdi ?? 'Verdien er ikke et gyldig tall';
  return (value: number): true | string => {
    const stringValue = value?.toString();
    if (!patternString || !stringValue || isNaN(Number(stringValue))) {
      return true;
    }

    return new RegExp(patternString).test(stringValue) ? true : errorMessage;
  };
}
/**
 * @param params - An object containing the item, resources and message.
 * @param item - The QuestionnaireItem that may include extensions to derive the decimal pattern.
 * @param resources - the language resources from props.
 * @param message - A custom error message to be used if the validation fails.
 * @returns A Validaton Rule that checks the questionnaireItem for a minLength and returns a validation rule with the minLength and message.
 */
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

/**
 * @param params - An object containing the item, resources and message.
 * @param item - The QuestionnaireItem that may include extensions to derive the decimal pattern.
 * @param resources - the language resources from props.
 * @param message - A custom error message to be used if the validation fails.
 * @returns A Validation Rule that checks the questionnaireItem for a minLength and returns a validation rule with the minLength and message.
 */
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
