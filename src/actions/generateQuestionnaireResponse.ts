import { QuestionnaireItem, QuestionnaireResponse, QuestionnaireResponseItem, Questionnaire } from 'fhir/r4';

import Constants from '../constants/index';
import itemType from '../constants/itemType';
import ItemType from '../constants/itemType';
import StatusConstants from '../constants/status';
import { createQuestionnaireResponseAnswer } from '../util/createQuestionnaireResponseAnswer';
import { getCalculatedExpressionExtension, getCopyExtension, getMinOccursExtensionValue } from '../util/extension';

import { evaluateFhirpathExpressionToGetString } from '@/util/fhirpathHelper';
import { isHelpItem } from '@/util/help';

const shouldNotAddItemToResponse = (item: QuestionnaireItem): boolean => {
  return isHelpItem(item);
};

export function generateQuestionnaireResponse(questionnaire: Questionnaire): QuestionnaireResponse | undefined {
  const response: QuestionnaireResponse = {
    resourceType: Constants.QUESTIONNAIRE_RESPONSE_RESOURCE_TYPE,
    status: StatusConstants.questionnaireResponse.IN_PROGRESS,
  };
  if (!questionnaire || !questionnaire.item || questionnaire.item.length === 0) {
    return response;
  }

  if (questionnaire.url) {
    response.questionnaire = questionnaire.url;
  }

  questionnaire.item.forEach(i => {
    if (!response.item) {
      response.item = [];
    }

    for (let j = 0; j < getMinOccurs(i); j++) {
      if (shouldNotAddItemToResponse(i)) {
        continue;
      }
      const responseItem = createQuestionnaireResponseItem(i);
      addChildrenItemsToResponseItem(i, responseItem);

      response.item.push(responseItem);
    }
  });
  return evaluateCalculatedExpressions(questionnaire, response);
}

function addChildrenItemsToResponseItem(item: QuestionnaireItem, response: QuestionnaireResponseItem): void {
  if (!item.item || item.item.length === 0) {
    return;
  }

  item.item.forEach((i: QuestionnaireItem) => {
    for (let j = 0; j < getMinOccurs(i); j++) {
      const responseItem = createQuestionnaireResponseItem(i);
      if (shouldNotAddItemToResponse(i)) {
        continue;
      }
      addChildrenItemsToResponseItem(i, responseItem);
      addResponseItemtoResponse(item, response, responseItem);
    }
  });
}

function getMinOccurs(i: QuestionnaireItem): number {
  // Attachment handles "repeats" itself
  if (i.type === itemType.ATTATCHMENT) {
    return 1;
  }

  const minoccurs = getMinOccursExtensionValue(i);
  if (minoccurs && i.repeats) {
    return minoccurs;
  }
  return 1;
}

function addResponseItemtoResponse(
  questionnaireItem: QuestionnaireItem,
  responseItemForQuestionnaire: QuestionnaireResponseItem,
  itemToAdd: QuestionnaireResponseItem
): void {
  if (questionnaireItem.type === 'group') {
    if (!responseItemForQuestionnaire.item) {
      responseItemForQuestionnaire.item = [];
    }
    responseItemForQuestionnaire.item.push(itemToAdd);
  } else {
    if (!responseItemForQuestionnaire.answer) {
      responseItemForQuestionnaire.answer = [];
    }
    if (responseItemForQuestionnaire.answer.length === 0) {
      responseItemForQuestionnaire.answer.push({});
    }
    const answer = responseItemForQuestionnaire.answer[0];
    if (!answer.item) {
      answer.item = [];
    }
    answer.item.push(itemToAdd);
  }
}

export function createQuestionnaireResponseItem(item: QuestionnaireItem): QuestionnaireResponseItem {
  const responseItem: QuestionnaireResponseItem = {
    linkId: item.linkId,
    ...(item.text && { text: item.text }),
  };

  const answer = createQuestionnaireResponseAnswer(item);
  if (answer) {
    responseItem.answer = [answer];
  }

  return responseItem;
}
export function evaluateCalculatedExpressions(questionnaire: Questionnaire, response: QuestionnaireResponse): QuestionnaireResponse {
  function traverseItems(qItems: QuestionnaireItem[], qrItems: QuestionnaireResponseItem[]): void {
    qItems.forEach((qItem, index) => {
      const qrItem = qrItems[index];
      const expressionToEvaluate = getCopyExtension(qItem) ?? getCalculatedExpressionExtension(qItem);
      if (expressionToEvaluate && expressionToEvaluate.valueString) {
        const result = evaluateFhirpathExpressionToGetString(expressionToEvaluate, response);
        if (result.length > 0) {
          const calculatedValue = result[0];
          const answer = qrItem.answer ? qrItem.answer[0] : {};
          switch (qItem.type) {
            case ItemType.BOOLEAN:
              answer.valueBoolean = Boolean(calculatedValue);
              break;
            case ItemType.DECIMAL:
              answer.valueDecimal = Number(calculatedValue);
              break;
            case ItemType.INTEGER:
              answer.valueInteger = Number(calculatedValue);
              break;
            case ItemType.QUANTITY:
              answer.valueQuantity = calculatedValue;
              break;
            case ItemType.DATE:
              answer.valueDate = String(calculatedValue);
              break;
            case ItemType.DATETIME:
              answer.valueDateTime = String(calculatedValue);
              break;
            case ItemType.TIME:
              answer.valueTime = String(calculatedValue);
              break;
            case ItemType.TEXT:
            case ItemType.STRING:
              answer.valueString = String(calculatedValue);
              break;
            case ItemType.ATTATCHMENT:
              answer.valueAttachment = calculatedValue;
              break;
            case ItemType.CHOICE:
            case ItemType.OPENCHOICE:
              answer.valueCoding = calculatedValue;
              break;
            default:
              if (typeof answer === 'string') {
                (answer as { valueString: string }).valueString = calculatedValue;
              } else {
                answer.valueCoding = calculatedValue;
              }
              break;
          }
          qrItem.answer = [answer];
        }
      }

      // Recursively process child items
      if (qItem.item && qrItem.item) {
        traverseItems(qItem.item, qrItem.item);
      }
    });
  }

  if (questionnaire.item && response.item) {
    traverseItems(questionnaire.item, response.item);
  }

  return response; // Return the updated response
}
