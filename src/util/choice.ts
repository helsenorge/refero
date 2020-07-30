import {
  QuestionnaireItem,
  QuestionnaireItemAnswerOption,
  Reference,
  Coding,
  Extension,
  QuestionnaireResponseItemAnswer,
  ValueSetExpansionContains,
  ValueSet,
  Resource,
  ValueSetComposeIncludeConcept,
  ValueSetComposeInclude,
} from '../types/fhir';
import { Options } from '@helsenorge/toolkit/components/atoms/radio-group';
import { isReadOnly, isRequired } from './index';
import ExtensionConstants from '../constants/extensions';
import Constants, { OPEN_CHOICE_ID, OPEN_CHOICE_LABEL } from '../constants/index';
import { getItemControlExtensionValue, getValidationTextExtension } from './extension';
import itemControlConstants from '../constants/itemcontrol';
import { Resources } from './resources';
import ItemType from '../constants/itemType';

export function hasOptions(item: QuestionnaireItem, containedResources?: Resource[]): boolean {
  const options = getOptions(item, containedResources);
  if (!options) {
    return false;
  }
  return options !== null && options.length > 0;
}

export function getOptions(item: QuestionnaireItem, containedResources?: Resource[]): Array<Options> | undefined {
  if (!item) {
    return undefined;
  }

  let options;
  if (item.options && item.options.reference) {
    if (item.options.reference.startsWith('#')) {
      options = getContainedOptions(item, containedResources);
    }
  } else if (item.option) {
    options = getInlineOptions(item, isReadOnly(item));
  } else if (hasExtensionOptions(item)) {
    options = getExtensionOptions(item, isReadOnly(item));
  }

  if (item.type === ItemType.OPENCHOICE) {
    if (!options) {
      options = [] as Options[];
    }
    options.push({
      label: OPEN_CHOICE_LABEL,
      type: OPEN_CHOICE_ID,
    } as Options);
  }

  return options;
}

export function getSystem(item: QuestionnaireItem, containedResources?: Resource[]) {
  if (!item || !item.options || !item.options.reference) {
    return undefined;
  }
  if (item.options.reference.startsWith('#')) {
    const id: string = item.options.reference.replace('#', '');
    const resource = getContainedResource(id, containedResources);
    if (resource && resource.compose) {
      return resource.compose.include[0].system;
    }
  }
  return undefined;
}

export function getDisplay(options: Array<Options> | undefined, value: string | undefined): string | undefined {
  if (!options || options.length === 0) {
    return undefined;
  }
  let display;
  options.forEach(o => {
    if (o.type === value) {
      display = o.label;
      return;
    }
  });
  return display;
}

export function renderOptions(
  item: QuestionnaireItem,
  containedResources: Resource[] | undefined,
  options: Array<Options> | undefined,
  renderRadio: (o: Array<Options> | undefined) => JSX.Element,
  renderCheckbox: (o: Array<Options> | undefined) => JSX.Element,
  renderDropdown: (o: Array<Options> | undefined) => JSX.Element
): JSX.Element {
  const itemControlValue = getItemControlValue(item);
  if (itemControlValue) {
    switch (itemControlValue) {
      case itemControlConstants.DROPDOWN:
        return renderDropdown(options);
      case itemControlConstants.CHECKBOX:
        return renderCheckbox(options);
      case itemControlConstants.RADIOBUTTON:
        return renderRadio(options);
      default:
        break;
    }
  } else if (isAboveDropdownThreshold(item, containedResources)) {
    return renderDropdown(options);
  }
  return renderRadio(options);
}

export function isAboveDropdownThreshold(item: QuestionnaireItem, containedResources?: Resource[]): boolean {
  const options = getOptions(item, containedResources);
  if (!options) {
    return false;
  }
  return options.length > Constants.CHOICE_DROPDOWN_TRESHOLD;
}

export function getItemControlValue(item: QuestionnaireItem) {
  const itemControl = getItemControlExtensionValue(item);
  if (itemControl) {
    for (let i = 0; i < itemControl.length; i++) {
      if (itemControl[i] && itemControl[i].code) {
        if (itemControl[i].code === itemControlConstants.CHECKBOX) {
          return itemControlConstants.CHECKBOX;
        }
        if (itemControl[i].code === itemControlConstants.DROPDOWN) {
          return itemControlConstants.DROPDOWN;
        }
        if (itemControl[i].code === itemControlConstants.RADIOBUTTON) {
          return itemControlConstants.RADIOBUTTON;
        }
      }
    }
  }
  return undefined;
}

export function getErrorMessage(
  item: QuestionnaireItem,
  value: string,
  resources: Resources | undefined,
  containedResources: Resource[] | undefined
): string {
  if (!resources || !item) {
    return '';
  }
  const extensionText = getValidationTextExtension(item);
  if (extensionText) {
    return extensionText;
  }
  if (!value && isRequired(item) && resources) {
    return resources.oppgiVerdi;
  }
  if (!isAllowedValue(item, value, containedResources)) {
    return resources.oppgiGyldigVerdi;
  }
  return '';
}

export function isAllowedValue(item: QuestionnaireItem, value: string | undefined, containedResources: Resource[] | undefined): boolean {
  if (!item) {
    return true;
  }

  if (item.options || item.options) {
    const allowedValues: Array<Options> | undefined = getOptions(item, containedResources);
    if (!allowedValues || allowedValues.length === 0) {
      return true;
    }

    const matches = allowedValues.filter((a: Options) => a.type === value);
    return matches.length > 0;
  }

  return true;
}

export function validateInput(item: QuestionnaireItem, value: string | undefined, containedResources: Resource[] | undefined) {
  if (isRequired(item) && !value) {
    return false;
  }
  if (!isAllowedValue(item, value, containedResources)) {
    return false;
  }
  return true;
}

export function getIndexOfAnswer(code: string, answer: Array<QuestionnaireResponseItemAnswer> | QuestionnaireResponseItemAnswer) {
  if (answer && Array.isArray(answer)) {
    return answer.findIndex(el => {
      if (el && el.valueCoding && el.valueCoding.code) {
        return el.valueCoding.code === code;
      }
      return false;
    });
  } else if (answer && !Array.isArray(answer) && answer.valueCoding && answer.valueCoding.code === code) {
    return 0;
  }
  return -1;
}

export function shouldShowExtraChoice(answer: Array<QuestionnaireResponseItemAnswer> | QuestionnaireResponseItemAnswer): boolean {
  if (!answer) {
    return false;
  }

  if (Array.isArray(answer)) {
    for (let i = 0; i < answer.length; i++) {
      const el = answer[i] as QuestionnaireResponseItemAnswer;
      if (el.valueCoding && el.valueCoding.code === OPEN_CHOICE_ID) {
        return true;
      }
    }
    return false;
  }

  return !!answer.valueCoding && !!answer.valueCoding.code && answer.valueCoding.code === OPEN_CHOICE_ID;
}

function hasExtensionOptions(item: QuestionnaireItem): boolean {
  if (item.extension) {
    return item.extension.filter((it: Extension) => it.url === ExtensionConstants.OPTION_REFERENCE).length > 0;
  }

  return false;
}

function getExtensionOptions(item: QuestionnaireItem, readOnly: boolean): Array<Options> | undefined {
  if (!item || !item.extension) {
    return undefined;
  }

  return item.extension
    .filter((it: Extension) => it.url === ExtensionConstants.OPTION_REFERENCE)
    .map((it: Extension) => createRadiogroupOptionFromQuestionnaireExtension(it, readOnly))
    .filter((it: Options | undefined) => it !== undefined) as Options[];
}

function getInlineOptions(item: QuestionnaireItem, readOnly: boolean): Array<Options> | undefined {
  if (!item || !item.option) {
    return undefined;
  }

  return item.option
    .map((it: QuestionnaireItemAnswerOption) => createRadiogroupOptionFromQuestionnaireOption(it, readOnly))
    .filter((it: Options | undefined) => it !== undefined) as Options[];
}

function createRadiogroupOptionFromQuestionnaireExtension(extension: Extension, readOnly: boolean): Options | undefined {
  if (extension.valueReference) {
    return createRadiogroupOptionFromValueReference(extension.valueReference, readOnly);
  }

  return undefined;
}

function createRadiogroupOptionFromQuestionnaireOption(option: QuestionnaireItemAnswerOption, readOnly: boolean): Options | undefined {
  if (option.valueString) {
    return createRadiogroupOptionFromValueString(option.valueString, readOnly);
  } else if (option.valueInteger) {
    return createRadiogroupOptionFromValueInteger(option.valueInteger, readOnly);
  } else if (option.valueTime) {
    return createRadiogroupOptionFromValueTime(option.valueTime, readOnly);
  } else if (option.valueDate) {
    return createRadiogroupOptionFromValueDate(option.valueDate, readOnly);
  } else if (option.valueReference) {
    return createRadiogroupOptionFromValueReference(option.valueReference, readOnly);
  } else if (option.valueCoding) {
    return createRadiogroupOptionFromValueCoding(option.valueCoding, readOnly);
  }

  return undefined;
}

function createRadiogroupOptionFromValueCoding(coding: Coding, readOnly: boolean) {
  return createRadiogroupOption(String(coding.code), String(coding.display), readOnly);
}

function createRadiogroupOptionFromValueReference(reference: Reference, readOnly: boolean) {
  return createRadiogroupOption(String(reference.reference), String(reference.display), readOnly);
}

function createRadiogroupOptionFromValueDate(value: string, readOnly: boolean) {
  return createRadiogroupOption(String(value), String(value), readOnly);
}

function createRadiogroupOptionFromValueTime(value: string, readOnly: boolean) {
  return createRadiogroupOption(String(value), String(value), readOnly);
}

function createRadiogroupOptionFromValueInteger(value: number, readOnly: boolean) {
  return createRadiogroupOption(String(value), String(value), readOnly);
}

function createRadiogroupOptionFromValueString(value: string, readOnly: boolean) {
  return createRadiogroupOption(value, value, readOnly);
}

function getContainedOptions(item: QuestionnaireItem, containedResources?: Resource[]): Array<Options> | undefined {
  if (!item || !item.options || !item.options.reference) {
    return undefined;
  }
  const id: string = item.options.reference.replace('#', '');
  const resource = getContainedResource(id, containedResources);
  if (!resource) {
    return undefined;
  } else if (resource.compose && resource.compose.include) {
    return getComposedOptions(resource, isReadOnly(item));
  } else if (resource.expansion) {
    return getExpansionOptions(resource, isReadOnly(item));
  }
  return undefined;
}

function getComposedOptions(valueSet: ValueSet, disabled: boolean): Array<Options> | undefined {
  if (!valueSet.compose || !valueSet.compose.include) {
    return undefined;
  }
  const include = valueSet.compose.include;
  if (!include || include.length === 0) {
    return undefined;
  }
  const options: Array<Options> = [];
  include.map((i: ValueSetComposeInclude) => {
    if (!i.concept || i.concept.length === 0) {
      return;
    }
    i.concept.map((r: ValueSetComposeIncludeConcept) => {
      options.push(createRadiogroupOption(String(r.code), String(r.display), disabled));
    });
  });
  return options;
}

function getExpansionOptions(valueSet: ValueSet, disabled: boolean): Array<Options> | undefined {
  if (!valueSet.expansion) {
    return undefined;
  }
  if (!valueSet.expansion.contains) {
    return undefined;
  }
  const options: Array<Options> = [];
  valueSet.expansion.contains.map((r: ValueSetExpansionContains) => {
    options.push(createRadiogroupOption(String(r.code), String(r.display), disabled));
  });
  return options;
}

function createRadiogroupOption(type: string, label: string, disabled: boolean): Options {
  return {
    type: type,
    label: label,
    disabled,
  };
}

function getContainedResource(id: string, containedResources?: Resource[]): ValueSet | undefined {
  if (!containedResources) {
    return undefined;
  }
  const resource = containedResources.filter((r: Resource) => {
    const valueSet: ValueSet = r as ValueSet;
    return String(valueSet.id) === id;
  });
  if (!resource || resource.length === 0) {
    return undefined;
  }
  return resource[0] as ValueSet;
}
