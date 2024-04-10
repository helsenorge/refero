import { QuestionnaireItem, Resource } from 'fhir/r4';
import { z } from 'zod';

import { Options } from '../../types/formTypes/radioGroupOptions';

import ItemControl from '../../constants/itemcontrol';
import ItemType from '../../constants/itemType';
import { isRequired } from '../../util';
import { getItemControlValue, getOptions } from '../../util/choice';
import { Resources } from '../../util/resources';

function transformOptionsToEnum(options: Options[] | undefined): [string, ...string[]] | undefined {
  if (!options || options.length === 0) return undefined;
  const optionValues = options.map(option => option.type);

  if (optionValues.length > 0) {
    return [optionValues[0], ...optionValues.slice(1)];
  }

  return undefined;
}

export const createChoiceSchema = (item: QuestionnaireItem, resource?: Resources, contained?: Resource[]): z.ZodTypeAny => {
  const controlType = getItemControlValue(item);
  const options = getOptions(resource, item, contained);
  const optionValues = transformOptionsToEnum(options);
  const errorMessage = resource?.oppgiVerdi || '';

  if (!optionValues) {
    return z.any();
  }

  let schema: z.ZodTypeAny;

  if (item.type === ItemType.CHOICE) {
    switch (controlType) {
      case ItemControl.DROPDOWN:
        schema = z.enum(optionValues);
        break;
      case ItemControl.RADIOBUTTON:
        schema = z.enum(optionValues);
        break;
      case ItemControl.SLIDER:
        schema = z.enum(optionValues);
        break;
      default:
        schema = z.array(z.enum(optionValues));
        break;
    }
  } else if (item.type === ItemType.OPENCHOICE) {
    schema = z.union([z.enum(optionValues), z.string()]);
  } else {
    schema = z.any();
  }

  if (isRequired(item)) {
    if (controlType === ItemControl.CHECKBOX) {
      schema = schema.refine(val => Array.isArray(val) && val.length > 0, { message: errorMessage });
    } else {
      schema = schema.refine(val => val !== null && val !== undefined, { message: errorMessage });
    }
  } else {
    schema = schema.optional().nullable();
  }

  return schema;
};
