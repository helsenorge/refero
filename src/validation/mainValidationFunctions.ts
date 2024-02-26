import { Questionnaire, QuestionnaireItem } from 'fhir/r4';
import { ZodTypeAny, z } from 'zod';

import { booleanValidation } from './booleanValidation';
import { createChoiceSchema } from './choiceValidation';
import { numberValidation } from './numberValidation';
import { ZodFhirQuantity } from './quantityVaidation';
import { stringValidation } from './stringValidation';
import { textValidation } from './textValidation';
import ItemType from '../constants/itemType';
import { Resources } from '../util/resources';

type ZodSchemaType =
  | z.ZodString
  | z.ZodNumber
  | z.ZodBoolean
  | z.ZodObject<z.ZodRawShape>
  | typeof ZodFhirQuantity
  | z.ZodUnknown
  | z.ZodDate
  | z.ZodArray<z.ZodTypeAny, 'many'>;

const mapFhirTypeToZod = (item: QuestionnaireItem, questionnaire: Questionnaire, resources?: Resources): ZodSchemaType | undefined => {
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
      return createChoiceSchema(item, questionnaire);
    case ItemType.OPENCHOICE:
      return z.string(); // Adjust as needed for open choice types
    case ItemType.QUANTITY:
      return z.object({
        value: z.number(),
        unit: z.string(),
        code: z.string(),
        system: z.string(),
      });
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

export const generateZodSchemaFromItems = (
  items: QuestionnaireItem[],
  questionnair: Questionnaire,
  resources?: Resources
): Record<string, ZodSchemaType> => {
  return items.reduce<Record<string, ZodSchemaType>>((acc, item) => {
    const validator = mapFhirTypeToZod(item, questionnair, resources);

    if (validator !== undefined) {
      if (item.repeats) {
        acc[item.linkId] = z.array(validator);
      } else {
        acc[item.linkId] = validator;
      }
    }

    if (item.item) {
      const nestedValidators = generateZodSchemaFromItems(item.item, questionnair, resources);
      Object.keys(nestedValidators).forEach(key => {
        acc[key] = nestedValidators[key];
      });
    }

    return acc;
  }, {});
};

export const createZodSchemaFromQuestionnaireItems = (
  items: QuestionnaireItem[],
  questionnair?: Questionnaire,
  resources?: Resources
): z.ZodObject<Record<string, ZodSchemaType>> => {
  const schemaObject = questionnair ? generateZodSchemaFromItems(items, questionnair, resources) : {};
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
