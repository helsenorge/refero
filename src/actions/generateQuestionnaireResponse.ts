import {
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
  Questionnaire,
} from '../types/fhir';

import Constants from '../constants/index';
import itemType from '../constants/itemType';
import StatusConstants from '../constants/status';
import { createQuestionnaireResponseAnswer } from '../util/createQuestionnaireResponseAnswer';
import { getMinOccursExtensionValue } from '../util/extension';

export function generateQuestionnaireResponse(questionnaire: Questionnaire): QuestionnaireResponse | undefined {
  const response: QuestionnaireResponse = {
    resourceType: Constants.QUESTIONNAIRE_RESPONSE_RESOURCE_TYPE,
    status: StatusConstants.questionnaireResponse.IN_PROGRESS,
  } as QuestionnaireResponse;
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
      const responseItem = createQuestionnaireResponseItem(i);
      addChildrenItemsToResponseItem(i, responseItem);

      response.item.push(responseItem);
    }
  });
  return response;
}

function addChildrenItemsToResponseItem(item: QuestionnaireItem, response: QuestionnaireResponseItem): void {
  if (!item.item || item.item.length === 0) {
    return;
  }

  item.item.forEach((i: QuestionnaireItem) => {
    for (let j = 0; j < getMinOccurs(i); j++) {
      const responseItem = createQuestionnaireResponseItem(i);
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
      responseItemForQuestionnaire.answer.push({} as QuestionnaireResponseItemAnswer);
    }
    const answer = responseItemForQuestionnaire.answer[0];
    if (!answer.item) {
      answer.item = [];
    }
    answer.item.push(itemToAdd);
  }
}

export function createQuestionnaireResponseItem(item: QuestionnaireItem): QuestionnaireResponseItem {
  const responseItem = {
    linkId: item.linkId,
    ...(item.text && { text: item.text }),
  } as QuestionnaireResponseItem;

  const answer = createQuestionnaireResponseAnswer(item);
  if (answer) {
    responseItem.answer = [answer];
  }

  return responseItem;
}
