import { QuestionnaireItem } from 'fhir/r4';
import { ZodBoolean, ZodTypeAny, z } from 'zod';

import { Resources } from '../types/resources';

import { booleanValidation } from './booleanValidation';
import { createChoiceSchema } from './choiceValidation';
import { numberValidation } from './numberValidation';
import { quantityValidation } from './quantityVaidation';
import { stringValidation } from './stringValidation';
import { textValidation } from './textValidation';
import ItemType from '../constants/itemType';

type ZodSchemaType =
  | z.ZodString
  | z.ZodNumber
  | z.ZodBoolean
  | z.ZodObject<z.ZodRawShape>
  | z.ZodNumber
  | z.ZodUnknown
  | z.ZodDate
  | z.ZodArray<z.ZodTypeAny, 'many'>
  | z.ZodEffects<ZodBoolean, boolean, boolean>;

const mapFhirTypeToZod = (item: QuestionnaireItem, resources?: Resources): ZodSchemaType | undefined => {
  switch (item.type) {
    case ItemType.STRING:
      return stringValidation(item, resources);
    case ItemType.TEXT:
      return textValidation(item, resources);
    case ItemType.INTEGER:
      return numberValidation(item, resources);
    case ItemType.DECIMAL:
      return numberValidation(item, resources, true);
    case ItemType.BOOLEAN:
      return booleanValidation(item, resources);
    case ItemType.DATE:
    case ItemType.DATETIME:
    case ItemType.TIME:
      return z.date();
    case ItemType.CHOICE:
      return createChoiceSchema(item, resources);
    case ItemType.OPENCHOICE:
      return createChoiceSchema(item, resources); // Adjust as needed for open choice types
    case ItemType.QUANTITY:
      return quantityValidation(item, resources);
    case ItemType.ATTATCHMENT:
      return z.object({
        contentType: z.string(),
        data: z.string(),
      });
    case ItemType.URL:
      return z.string().url();
    case ItemType.REFERENCE:
      return z.string(); // Adjust as needed for reference types
    case ItemType.DISPLAY:
    case ItemType.GROUP:
      return undefined;
    default:
      return z.unknown(); // Adjust as needed for unsupported or complex types
  }
};

export const generateZodSchemaFromItems = (items: QuestionnaireItem[], resources?: Resources): Record<string, ZodSchemaType> => {
  return items.reduce<Record<string, ZodSchemaType>>((acc, item) => {
    const validator = mapFhirTypeToZod(item, resources);

    if (validator !== undefined) {
      if (item.repeats) {
        acc[item.linkId] = z.array(validator);
      } else {
        acc[item.linkId] = validator;
      }
    }

    if (item.item) {
      const nestedValidators = generateZodSchemaFromItems(item.item, resources);
      Object.keys(nestedValidators).forEach(key => {
        acc[key] = nestedValidators[key];
      });
    }

    return acc;
  }, {});
};

export const createZodSchemaFromQuestionnaireItems = (
  items: QuestionnaireItem[],
  resources?: Resources
): z.ZodObject<Record<string, ZodSchemaType>> => {
  const schemaObject = generateZodSchemaFromItems(items, resources);
  return z.object(schemaObject).strict();
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function inspectZodSchema(schema: ZodTypeAny): any {
  // This is a very basic and not comprehensive way to inspect the schema.
  // Zod schemas can be complex, and a more thorough approach might be necessary for complete inspection.
  if ('_def' in schema) {
    const def = schema._def;

    if (def.typeName === 'ZodObject') {
      const shape = def.shape();
      return Object.keys(shape).reduce((acc, key) => {
        acc[key] = inspectZodSchema(shape[key]);
        return acc;
      }, {});
    } else if (def.typeName === 'ZodArray') {
      return [inspectZodSchema(def.type)];
    } else {
      return def.typeName;
    }
  }
  return 'Unknown Type';
}

export const getResourcevalueByKey = (resourceKey: keyof Resources, resources: Resources): string => {
  return resources[resourceKey] ?? '';
};
