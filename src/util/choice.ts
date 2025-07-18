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
} from 'fhir/r4';
import { v4 as uuid } from 'uuid';

import { Options } from '../types/formTypes/radioGroupOptions';

import { getItemControlExtensionValue, getValidationTextExtension } from './extension';
import { Resources } from './resources';
import { isItemControlValue } from './typeguards';

import { isReadOnly, isRequired } from './index';

import { Extensions } from '@/constants/extensions';
import Constants, { OPEN_CHOICE_ID } from '@/constants/index';
import itemControlConstants, { ItemControlValue } from '@/constants/itemcontrol';
import ItemType from '@/constants/itemType';

export function hasCanonicalValueSet(item?: QuestionnaireItem): boolean {
  return !!item?.answerValueSet && item.answerValueSet.substr(0, 4) === 'http';
}

export function hasOptions(resources: Resources | undefined, item?: QuestionnaireItem, containedResources?: Resource[]): boolean {
  const options = getOptions(resources, item, containedResources);
  return !!options && options.length > 0;
}

const generateOptionsWithIds = (options: Options[] | undefined): Options[] | undefined => {
  const seenIds = new Set<string>();

  return options?.map(option => {
    let newId = option.id || `${option.label}-${option.type}`;
    while (seenIds.has(newId)) {
      newId = `${option.id || ''}-${seenIds.size + 1}`;
    }
    seenIds.add(newId);
    return { ...option, id: newId };
  });
};

export function getOptions(
  resources: Resources | undefined,
  item?: QuestionnaireItem,
  containedResources?: Resource[]
): Array<Options> | undefined {
  if (!item) {
    return undefined;
  }

  let options: Options[] | undefined;
  if (item.answerValueSet) {
    if (item.answerValueSet.startsWith('#')) {
      options = getContainedOptions(item, containedResources);
    }
  } else if (item.answerOption) {
    options = getInlineOptions(item, isReadOnly(item));
  } else if (hasExtensionOptions(item)) {
    options = getExtensionOptions(item, isReadOnly(item));
  }

  if (item.type === ItemType.OPENCHOICE) {
    if (!options) {
      options = [];
    }
    options.push({
      id: uuid(),
      label: resources?.openChoiceOption || '',
      type: OPEN_CHOICE_ID,
    });
    return options;
  }
  const optionsWithIds = generateOptionsWithIds(options);
  return optionsWithIds;
}

function getValueSet(answerValueSet: QuestionnaireItem['answerValueSet'], containedResources?: Resource[]): string | undefined {
  const id = answerValueSet?.replace('#', '');
  const resource = getContainedResource(id, containedResources);

  if (resource && resource.compose) {
    return resource.compose.include[0].system;
  }
}

export function getSystem(item?: QuestionnaireItem, code?: string, containedResources?: Resource[]): string | undefined {
  if (item?.answerValueSet && item?.answerValueSet.startsWith('#')) {
    return getValueSet(item?.answerValueSet, containedResources);
  } else if (item?.answerOption && code) {
    const matchingCode = item?.answerOption.filter(x => x.valueCoding && x.valueCoding.code === code);
    return matchingCode.length > 0 ? matchingCode[0].valueCoding?.system : undefined;
  }
  return undefined;
}

export function getSystemForItem(item: QuestionnaireItem, containedResources?: Resource[]): string | undefined {
  if (item.answerValueSet && item.answerValueSet.startsWith('#')) {
    return getValueSet(item.answerValueSet, containedResources);
  } else if (item.answerOption) {
    const foundOption = item.answerOption.find(option => option.valueCoding?.system);
    return foundOption?.valueCoding?.system;
  }
  return undefined;
}

export function getDisplay(options?: Options[], value?: string): string | undefined {
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
  renderRadio: (o: Array<Options> | undefined) => JSX.Element,
  renderCheckbox: (o: Array<Options> | undefined) => JSX.Element,
  renderDropdown: (o: Array<Options> | undefined) => JSX.Element,
  renderSlider: () => JSX.Element,
  resources: Resources | undefined,
  renderAutosuggest: () => JSX.Element,
  renderReceiverComponent?: () => JSX.Element
): JSX.Element | null {
  const itemControlValue = getItemControlValue(item);
  const options = getOptions(resources, item, containedResources);
  if (hasOptions(resources, item, containedResources) && !hasCanonicalValueSet(item)) {
    if (itemControlValue) {
      switch (itemControlValue) {
        case itemControlConstants.DROPDOWN:
          return renderDropdown(options);
        case itemControlConstants.CHECKBOX:
          return renderCheckbox(options);
        case itemControlConstants.RADIOBUTTON:
          return renderRadio(options);
        case itemControlConstants.SLIDER:
          return renderSlider();
        default:
          break;
      }
    } else if (isAboveDropdownThreshold(options)) {
      return renderDropdown(options);
    }
    return renderRadio(options);
  } else if (hasCanonicalValueSet(item) && itemControlValue === itemControlConstants.AUTOCOMPLETE) {
    return renderAutosuggest();
  } else if (renderReceiverComponent && itemControlValue === itemControlConstants.RECEIVERCOMPONENT) {
    return renderReceiverComponent();
  }
  return null;
}

export function isAboveDropdownThreshold(options: Array<Options> | undefined): boolean {
  if (!options) {
    return false;
  }
  return options.length > Constants.CHOICE_DROPDOWN_TRESHOLD;
}

export function getItemControlValue(item?: QuestionnaireItem): ItemControlValue | undefined {
  const itemControl = getItemControlExtensionValue(item);
  if (itemControl) {
    for (const control of itemControl) {
      const code = control?.code;
      if (code && isItemControlValue(code)) {
        return code;
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
  if (!isAllowedValue(item, value, containedResources, resources)) {
    return resources.oppgiGyldigVerdi;
  }
  return '';
}

export function isAllowedValue(
  item: QuestionnaireItem,
  value: string | undefined,
  containedResources: Resource[] | undefined,
  resources: Resources | undefined
): boolean {
  if (!item) {
    return true;
  }

  if (item.answerValueSet || item.answerValueSet) {
    const allowedValues: Array<Options> | undefined = getOptions(resources, item, containedResources);
    if (!allowedValues || allowedValues.length === 0) {
      return true;
    }

    const matches = allowedValues.filter((a: Options) => a.type === value);
    return matches.length > 0;
  }

  return true;
}

export function validateInput(
  item: QuestionnaireItem,
  value: string | undefined,
  containedResources: Resource[] | undefined,
  resources: Resources | undefined
): boolean {
  if (isRequired(item) && !value) {
    return false;
  }
  if (!isAllowedValue(item, value, containedResources, resources)) {
    return false;
  }
  return true;
}

export function getIndexOfAnswer(code: string, answer?: Array<QuestionnaireResponseItemAnswer> | QuestionnaireResponseItemAnswer): number {
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

export function shouldShowExtraChoice(answer?: Array<QuestionnaireResponseItemAnswer> | QuestionnaireResponseItemAnswer): boolean {
  if (!answer) {
    return false;
  }

  if (Array.isArray(answer)) {
    for (let i = 0; i < answer.length; i++) {
      const el = answer[i];
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
    return item.extension.filter((it: Extension) => it.url === Extensions.OPTION_REFERENCE_URL).length > 0;
  }

  return false;
}

function getExtensionOptions(item: QuestionnaireItem, readOnly: boolean): Options[] | undefined {
  if (!item || !item.extension) {
    return undefined;
  }

  return item.extension
    .filter((it: Extension) => it.url === Extensions.OPTION_REFERENCE_URL)
    .map((it: Extension) => createRadiogroupOptionFromQuestionnaireExtension(it, readOnly))
    .filter((it): it is Options => it !== undefined);
}

function getInlineOptions(item: QuestionnaireItem, readOnly: boolean): Options[] | undefined {
  if (!item || !item.answerOption) {
    return undefined;
  }

  return item.answerOption
    .map((it: QuestionnaireItemAnswerOption): Options | undefined => createRadiogroupOptionFromQuestionnaireOption(it, readOnly))
    .filter((it): it is Options => it !== undefined);
}

function createRadiogroupOptionFromQuestionnaireExtension(extension: Extension, readOnly: boolean): Options | undefined {
  if (extension.valueReference) {
    return createRadiogroupOptionFromValueReference(extension.valueReference, readOnly);
  }

  return undefined;
}

function createRadiogroupOptionFromQuestionnaireOption(option: QuestionnaireItemAnswerOption, readOnly: boolean): Options | undefined {
  if (option.valueString) {
    return createRadiogroupOptionFromValueString(option.valueString, readOnly, option.extension);
  } else if (option.valueInteger) {
    return createRadiogroupOptionFromValueInteger(option.valueInteger, readOnly, option.extension);
  } else if (option.valueTime) {
    return createRadiogroupOptionFromValueTime(option.valueTime, readOnly, option.extension);
  } else if (option.valueDate) {
    return createRadiogroupOptionFromValueDate(option.valueDate, readOnly, option.extension);
  } else if (option.valueReference) {
    return createRadiogroupOptionFromValueReference(option.valueReference, readOnly, option.valueReference.extension);
  } else if (option.valueCoding) {
    return createRadiogroupOptionFromValueCoding({ coding: option.valueCoding, readOnly, extensions: option.valueCoding.extension });
  }

  return undefined;
}

function createRadiogroupOptionFromValueCoding({
  coding,
  readOnly,
  extensions,
}: {
  coding: Coding;
  readOnly: boolean;
  extensions?: Extension[];
}): Options {
  return createRadiogroupOption(String(coding.code), String(coding.display), readOnly, extensions);
}

function createRadiogroupOptionFromValueReference(reference: Reference, readOnly: boolean, extensions?: Extension[]): Options {
  return createRadiogroupOption(String(reference.reference), String(reference.display), readOnly, extensions);
}

function createRadiogroupOptionFromValueDate(value: string, readOnly: boolean, extensions?: Extension[]): Options {
  return createRadiogroupOption(String(value), String(value), readOnly, extensions);
}

function createRadiogroupOptionFromValueTime(value: string, readOnly: boolean, extensions?: Extension[]): Options {
  return createRadiogroupOption(String(value), String(value), readOnly, extensions);
}

function createRadiogroupOptionFromValueInteger(value: number, readOnly: boolean, extensions?: Extension[]): Options {
  return createRadiogroupOption(String(value), String(value), readOnly, extensions);
}

function createRadiogroupOptionFromValueString(value: string, readOnly: boolean, extensions?: Extension[]): Options {
  return createRadiogroupOption(value, value, readOnly, extensions);
}

export function getContainedOptions(item: QuestionnaireItem, containedResources?: Resource[]): Array<Options> | undefined {
  if (!item || !item.answerValueSet) {
    return undefined;
  }
  const id: string = item.answerValueSet.replace('#', '');
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
      options.push(createRadiogroupOption(String(r.code), String(r.display), disabled, r.extension));
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
    options.push(createRadiogroupOption(String(r.code), String(r.display), disabled, r.extension));
  });
  return options;
}

function createRadiogroupOption(type: string, label: string, disabled: boolean, extensions?: Extension[]): Options {
  return {
    type: type,
    label: label,
    disabled,
    extensions: extensions || [],
  };
}

function getContainedResource(id?: string, containedResources?: Resource[]): ValueSet | undefined {
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
