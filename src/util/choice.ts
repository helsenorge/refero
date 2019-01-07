import { QuestionnaireItem, QuestionnaireOption, integer, time, date, Reference, Coding, Extension } from '../types/fhir';
import { ValueSetContains, ValueSet, Resource, ValueSetConcept, ValueSetInclude } from '../types/fhir';
import { Options } from '@helsenorge/toolkit/components/atoms/radio-group';
import { isReadOnly } from './index';
import ExtensionConstants from '../constants/extensions';

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

  if (item.options && item.options.reference) {
    if (item.options.reference.startsWith('#')) {
      return getContainedOptions(item, containedResources);
    }
  }

  if (item.option) {
    return getInlineOptions(item, isReadOnly(item));
  }

  if (hasExtensionOptions(item)) {
    return getExtensionOptions(item, isReadOnly(item));
  }

  return undefined;
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
    .map((it: QuestionnaireOption) => createRadiogroupOptionFromQuestionnaireOption(it, readOnly))
    .filter((it: Options | undefined) => it !== undefined) as Options[];
}

function createRadiogroupOptionFromQuestionnaireExtension(extension: Extension, readOnly: boolean): Options | undefined {
  if (extension.valueReference) {
    return createRadiogroupOptionFromValueReference(extension.valueReference, readOnly);
  }

  return undefined;
}

function createRadiogroupOptionFromQuestionnaireOption(option: QuestionnaireOption, readOnly: boolean): Options | undefined {
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

function createRadiogroupOptionFromValueDate(value: date, readOnly: boolean) {
  return createRadiogroupOption(String(value), String(value), readOnly);
}

function createRadiogroupOptionFromValueTime(value: time, readOnly: boolean) {
  return createRadiogroupOption(String(value), String(value), readOnly);
}

function createRadiogroupOptionFromValueInteger(value: integer, readOnly: boolean) {
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
  include.map((i: ValueSetInclude) => {
    if (!i.concept || i.concept.length === 0) {
      return;
    }
    i.concept.map((r: ValueSetConcept) => {
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
  valueSet.expansion.contains.map((r: ValueSetContains) => {
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
