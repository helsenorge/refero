import ItemType, { IItemType } from '@/constants/itemType';
import { isReadOnly, isRepeat } from '@/util';
import { Attachment, Coding, QuestionnaireItem, QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';
import { createIdFormComponentIds } from '@/components/createQuestionnaire/utils';
import { getItemControlExtensionValue } from '@/util/extension';
import { createPathForItem } from '@/util/refero-core';
import fhirpath from 'fhirpath';
import fhirpath_r4_model from 'fhirpath/fhir-context/r4';
import { getInitialFormValueForItemtype } from './defaultFormValues';
import ItemControlConstants from '@/constants/itemcontrol';

export type DefaultValues = Record<string, IItemType | unknown>;
const excludedTypes = ['group', 'display', 'reference', 'url'];

type Path = {
  linkId: string;
  index?: number;
};

const evaluate = async <T>(qr: QuestionnaireResponse | QuestionnaireResponseItem, expression: string): Promise<T[]> => {
  const _qr = structuredClone(qr);
  return (await fhirpath.evaluate(_qr, expression, undefined, fhirpath_r4_model, {
    async: true,
  })) as T[];
};

export const createFormValues = async (items?: QuestionnaireItem[], qr?: QuestionnaireResponse): Promise<DefaultValues> => {
  if (!items || !qr) return {};
  const response = await createFormValuesForItems(items, qr);
  console.log('response', JSON.stringify(response));
  return response;
};

const createFormValuesForItems = async (
  items: QuestionnaireItem[],
  qr: QuestionnaireResponse | QuestionnaireResponseItem,
  path: Path[] = []
): Promise<DefaultValues> => {
  const results = await Promise.all(
    items.map(async item => {
      const linkId = item.linkId;
      const itemType = item.type;

      let updatedAcc: DefaultValues = {};

      // Update path for the current item
      const itemPath = createPathForItem(path, item);

      // Handle nested items regardless of current item type
      if (item.item && item.item.length > 0) {
        const nestedValues = await createFormValuesForItems(item.item, qr, itemPath);
        updatedAcc = { ...updatedAcc, ...nestedValues };
      }

      // Skip processing the current item if it's of an excluded type
      if (excludedTypes.includes(itemType)) return updatedAcc;

      const isItemRepeatable = isRepeat(item);
      const itemControls = getItemControlExtensionValue(item);

      // Build FHIRPath expression to find corresponding response items
      const expression = isItemRepeatable ? `descendants().where(linkId = '${linkId}')` : `descendants().where(linkId = '${linkId}')[0]`;

      const matchingResponseItems = await evaluate<QuestionnaireResponseItem>(qr, expression);

      if (matchingResponseItems && matchingResponseItems.length > 0) {
        const itemResults = await Promise.all(
          matchingResponseItems.map(async (responseItem, index) => {
            // Update the path with the current index
            const responseItemPath = createPathForItem(itemPath, item, index);
            const fullKey = createIdFormComponentIds(item, responseItemPath, index);

            // Extract the value based on item type
            const answerValue = await extractAnswerValueWithFHIRPath(responseItem, itemType, itemControls, fullKey);

            let nestedValues: DefaultValues = {};
            // Handle nested items within the response item
            if (responseItem.item && responseItem.item.length > 0 && item.item && item.item.length > 0) {
              nestedValues = await createFormValuesForItems(item.item, responseItem, responseItemPath);
            }

            return {
              ...(answerValue || {}),
              ...nestedValues,
            };
          })
        );

        updatedAcc = { ...updatedAcc, ...Object.assign({}, ...itemResults) };
      } else {
        // Handle default values
        const fullKey = createIdFormComponentIds(item, itemPath);
        const defaultValue = getInitialFormValueForItemtype(fullKey, item);

        if (!isReadOnly(item) && defaultValue) {
          updatedAcc = { ...updatedAcc, ...defaultValue };
        }
      }

      return updatedAcc;
    })
  );

  return Object.assign({}, ...results);
};

const extractAnswerValueWithFHIRPath = async (
  responseItem: QuestionnaireResponseItem,
  itemType: QuestionnaireItem['type'],
  itemControls: Coding[] | undefined,
  key: string
): Promise<DefaultValues | undefined> => {
  // Build FHIRPath expression to extract the value
  const valueExpression = `
    answer.valueBoolean |
    answer.valueDecimal |
    answer.valueInteger |
    answer.valueDate |
    answer.valueDateTime |
    answer.valueTime |
    answer.valueString |
    answer.valueUri |
    answer.valueAttachment |
    answer.valueCoding |
    answer.valueQuantity |
    answer.valueReference
  `;

  // Evaluate the expression
  const answers = await evaluate<any>(responseItem, valueExpression);
  if (responseItem.linkId === '10.12') {
    // console.log('answers', answers);
    // console.log('itemType', itemType);
    // console.log('itemControls', itemControls);
  }
  // Now handle based on itemType
  switch (itemType) {
    case ItemType.DATE: {
      // Handle date values
      const dateValue = answers[0];
      console.log('DATE', JSON.stringify(answers));

      if (itemControls && itemControls.some(control => control.code === ItemControlConstants.YEARMONTH)) {
        if (dateValue) {
          const date = new Date(dateValue);
          return {
            [`${key}-yearmonth-year`]: date.getFullYear().toString(),
            [`${key}-yearmonth-month`]: (date.getMonth() + 1).toString().padStart(2, '0'),
          };
        }
      } else {
        return { [key]: dateValue || '' };
      }
      break;
    }
    case ItemType.DATETIME: {
      const dateTimeValue = answers[0];
      if (dateTimeValue) {
        console.log('DATETIME', JSON.stringify(answers));

        const date = new Date(dateTimeValue);
        return {
          [`${key}-date`]: date.toISOString().split('T')[0],
          [`${key}-hours`]: date.getHours().toString().padStart(2, '0'),
          [`${key}-minutes`]: date.getMinutes().toString().padStart(2, '0'),
        };
      }
      break;
    }
    case ItemType.TIME: {
      const timeValue = answers[0];
      if (timeValue) {
        console.log('TIME', JSON.stringify(answers));

        const [hours, minutes] = timeValue.split(':');
        return {
          [`${key}-hours`]: hours,
          [`${key}-minutes`]: minutes,
        };
      }
      break;
    }
    case ItemType.ATTATCHMENT: {
      if (answers && answers.length > 0) {
        const attachmentValues = answers as Attachment[];
        console.log('ATTATCHMENT', JSON.stringify(answers));

        return {
          [key]: attachmentValues.length === 1 ? attachmentValues[0].title : '',
        };
      }
      break;
    }
    case ItemType.CHOICE || ItemType.OPENCHOICE: {
      const codingValues = answers as Coding[];
      console.log('CHOICE', JSON.stringify(codingValues[0].code));

      return {
        [key]: codingValues.length === 1 ? codingValues[0].code : codingValues.map((c: Coding) => c.code),
      };
    }
    case ItemType.QUANTITY: {
      console.log('QUANTITY', JSON.stringify(answers));

      return { [key]: answers.length === 1 ? answers[0].value : null };
    }
    default: {
      if (
        itemControls &&
        itemControls.some(
          control =>
            control.code === ItemControlConstants.HIGHLIGHT ||
            control.code === ItemControlConstants.INLINE ||
            control.code === ItemControlConstants.HELP ||
            control.code === ItemControlConstants.HELPLINK
        )
      ) {
        break;
      }
      // console.log('responseItem', JSON.stringify(responseItem));
      // console.log('valueExpression', valueExpression);
      // console.log('values', JSON.stringify(values));
      if (answers && answers.length > 0) {
        // console.log('DEFAULT', JSON.stringify(answers));
        return {
          [key]: answers.length === 1 ? answers[0] : answers,
        };
      }
      break;
    }
  }
};
