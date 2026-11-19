import type { QuestionnaireItem, QuestionnaireResponse, QuestionnaireResponseItem, Questionnaire, Bundle } from 'fhir/r4';

import { createQuestionnaireResponseAnswers } from '../util/createQuestionnaireResponseAnswer';
import { getMinOccursExtensionValue } from '../util/extension';

import { applyCalculatedAnswers } from '@/calculators/calculatedAnswers';
import Constants from '@/constants/';
import ItemType from '@/constants/itemType';
import StatusConstants from '@/constants/status';
import { isHelpItem } from '@/util/help';

const shouldNotAddItemToResponse = (item: QuestionnaireItem): boolean => {
  return isHelpItem(item);
};

export function generateQuestionnaireResponse(questionnaire: Questionnaire | undefined | null): QuestionnaireResponse | undefined {
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

      addChildrenItemsToResponseItem(i, responseItem);
      if (shouldNotAddItemToResponse(i)) {
        continue;
      }
      addResponseItemtoResponse(item, response, responseItem);
    }
  });
}

function getMinOccurs(i: QuestionnaireItem): number {
  // Attachment handles "repeats" itself
  if (i.type === ItemType.ATTATCHMENT) {
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

  const answer = createQuestionnaireResponseAnswers(item);
  if (answer) {
    responseItem.answer = answer;
  }

  return responseItem;
}
/**
 * Calculates every copy and calculated expression in the response and writes the answers, the same way the form does
 * after the user changes an answer. Changes and returns the given response.
 */
export function evaluateCalculatedExpressions(
  questionnaire: Questionnaire | Bundle,
  response: QuestionnaireResponse,
  bundleIndex?: number
): QuestionnaireResponse {
  const q =
    questionnaire.resourceType === 'Bundle'
      ? (questionnaire?.entry?.[bundleIndex ?? 0].resource as Questionnaire | undefined)
      : questionnaire;
  return q ? applyCalculatedAnswers(q, response) : response;
}
