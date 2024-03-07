import { QuestionnaireItem } from 'fhir/r4';
import { z } from 'zod';

import { Options } from '../types/formTypes/radioGroupOptions';
import { Resources } from '../types/resources';

import ItemControl from '../constants/itemcontrol';
import ItemType from '../constants/itemType';
import { isRequired } from '../util';
import { getItemControlValue, getOptions } from '../util/choice';
import { getValidationTextExtension } from '../util/extension';

function transformOptionsToEnum(options: Options[] | undefined): [string, ...string[]] | undefined {
  if (!options || options.length === 0) return undefined;

  const optionValues = options.map(option => option.type);

  if (optionValues.length > 0) {
    return [optionValues[0], ...optionValues.slice(1)];
  }

  return undefined;
}
export const createChoiceSchema = (item: QuestionnaireItem, resource?: Resources): z.ZodTypeAny | undefined => {
  const controlType = getItemControlValue(item);
  const options = getOptions(resource, item);
  const optionValues = transformOptionsToEnum(options);

  if (!optionValues) {
    // Handle the case where no options are available or defined
    return undefined;
  }

  let schema: z.ZodTypeAny;

  // Define the base schema depending on the control type
  if (item.type === ItemType.CHOICE) {
    schema = z.array(z.enum(optionValues), {
      errorMap: (issue, ctx) => {
        if (ctx.data === null || ctx.data === undefined || issue.code === 'invalid_enum_value') {
          const message = getValidationTextExtension(item);
          return { message: message || ctx.defaultError };
        }
        return { message: ctx.defaultError };
      },
    });
  } else if (item.type === ItemType.OPENCHOICE) {
    schema = z.union([z.enum(optionValues), z.string()]);
  } else {
    schema = z.any();
  }

  // Add custom error message and required validation
  if (isRequired(item)) {
    const errorMessage = 'Required field'; // Custom error message

    if (controlType === ItemControl.CHECKBOX) {
      // For checkboxes, ensure the array is not empty
      schema = schema.refine(val => Array.isArray(val) && val.length > 0, { message: errorMessage });
    } else {
      // For radio buttons (and similar controls), ensure the value is not null or undefined
      schema = schema.refine(val => val !== null && val !== undefined, { message: errorMessage });
    }
  } else {
    // Make the schema optional and nullable for non-required fields
    schema = schema.optional().nullable();
  }

  return schema;
};
