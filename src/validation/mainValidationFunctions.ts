import { Questionnaire, QuestionnaireItem, Resource } from 'fhir/r4';
import { ZodNaN, ZodNumber, ZodOptional, ZodUnion, z } from 'zod';

import { Resources } from '../types/resources';

import { booleanValidation } from './booleanValidation';
import { createChoiceSchema } from './choiceValidation';
import { decimalValidation } from './decimalValidation';
import { integerValidation, numberValidation } from './integerValidation';
import { quantityValidation } from './quantityVaidation';
import { stringValidation } from './stringValidation';
import { textValidation } from './textValidation';
import ItemType from '../constants/itemType';
import { isRequired } from '../util';

type ZodSchemaType =
  | z.ZodString
  | z.ZodNumber
  | z.ZodBoolean
  | z.ZodObject<z.ZodRawShape>
  | z.ZodNumber
  | z.ZodUnknown
  | z.ZodDate
  | z.ZodArray<z.ZodTypeAny, 'many'>
  | z.ZodType<boolean, z.ZodTypeDef, boolean>
  | ZodOptional<ZodUnion<[ZodNumber, ZodNaN]>>;

const mapFhirTypeToZod = (item: QuestionnaireItem, resources?: Resources, contained?: Resource[]): ZodSchemaType | undefined => {
  switch (item.type) {
    case ItemType.STRING:
      return stringValidation(item, resources);
    case ItemType.TEXT:
      return textValidation(item, resources);
    case ItemType.INTEGER:
      return integerValidation(item, resources);
    case ItemType.DECIMAL:
      return decimalValidation(item, resources);
    case ItemType.BOOLEAN:
      return booleanValidation(item, resources);
    case ItemType.DATE:
    case ItemType.DATETIME:
    case ItemType.TIME:
      return z.date();
    case ItemType.CHOICE:
      return createChoiceSchema(item, resources, contained);
    case ItemType.OPENCHOICE:
      return createChoiceSchema(item, resources, contained); // Adjust as needed for open choice types
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
      return z.string();
    default:
      return undefined;
  }
};

const generateZodSchemaFromItems = (
  items: QuestionnaireItem[],
  resources?: Resources,
  contained?: Resource[],
  parentPath: string[] = []
): Record<string, ZodSchemaType> => {
  return items.reduce<Record<string, ZodSchemaType>>((acc, item) => {
    const validator = mapFhirTypeToZod(item, resources, contained);

    //TODO:Add id logic for repeating items
    const currentPath = [...parentPath, item.linkId];
    const key = currentPath.join('.');
    if (validator !== undefined) {
      console.log('validator key: ', key);
      if (item.repeats) {
        acc[item.linkId] = z.array(validator);
      } else {
        acc[item.linkId] = validator;
      }
    }

    if (item.item) {
      const nestedValidators = generateZodSchemaFromItems(item.item, resources, contained, currentPath);
      Object.keys(nestedValidators).forEach(nestedKey => {
        acc[nestedKey] = nestedValidators[nestedKey];
      });
    }

    return acc;
  }, {});
};

export const createZodSchemaFromQuestionnaireItems = (
  items?: QuestionnaireItem[],
  resources?: Resources,
  contained?: Resource[]
): z.ZodObject<Record<string, ZodSchemaType>> => {
  const schemaObject = generateZodSchemaFromItems(items || [], resources, contained);
  return z.object(schemaObject).strict();
};
export const createZodSchemaFromQuestionnaire = (
  questionnaire?: Questionnaire | null,
  resources?: Resources,
  contained?: Resource[]
): z.ZodObject<Record<string, ZodSchemaType>> => {
  return createZodSchemaFromQuestionnaireItems(questionnaire?.item, resources, contained);
};
export const getResourcevalueByKey = (resourceKey: keyof Resources, resources: Resources): string => {
  return resources[resourceKey] ?? '';
};

export const createDefaultFormValuesFromQuestionnaire = (questionnaire?: Questionnaire | null): Record<string, unknown> => {
  return createDefaultFormValues(questionnaire?.item || []);
};
export const createDefaultFormValues = (items?: QuestionnaireItem[]): Record<string, unknown> => {
  if (!items) {
    return {};
  }
  return items.reduce<Record<string, unknown>>((acc, item) => {
    if (item.type === ItemType.GROUP) {
      return { ...acc, ...createDefaultFormValues(item.item) };
    }

    if (item.repeats) {
      acc[item.linkId] = [];
    } else {
      acc[item.linkId] = getDefaultFormValue(item);
    }

    return acc;
  }, {});
};

const getDefaultFormValue = (item: QuestionnaireItem): unknown => {
  // Check if the item is required
  const isFieldRequired = isRequired(item);

  switch (item.type) {
    case ItemType.STRING:
    case ItemType.TEXT:
      return isFieldRequired ? '' : undefined; // Use undefined or null for optional text fields
    case ItemType.INTEGER:
    case ItemType.DECIMAL:
      return isFieldRequired ? 0 : undefined; // Use undefined or null for optional number fields
    case ItemType.BOOLEAN:
      return false;
    case ItemType.DATE:
    case ItemType.DATETIME:
    case ItemType.TIME:
      return isFieldRequired ? '' : undefined;
    case ItemType.CHOICE:
      return isFieldRequired ? [] : undefined;
    case ItemType.OPENCHOICE:
      return isFieldRequired ? '' : undefined;
    case ItemType.QUANTITY:
      return isFieldRequired ? 0 : undefined;
    case ItemType.ATTATCHMENT:
      return isFieldRequired ? { contentType: '', data: '' } : undefined;
    case ItemType.URL:
      return isFieldRequired ? '' : undefined;
    default:
      return undefined;
  }
};
export const getRequiredErrorMessage = (item: QuestionnaireItem, resources: Resources): string | undefined => {
  return isRequired(item) ? resources?.formRequiredErrorMessage : undefined;
};
