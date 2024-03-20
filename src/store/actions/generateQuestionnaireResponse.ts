import {
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
  Questionnaire,
} from 'fhir/r4';

import Constants from '../constants/index';
import itemType from '../constants/itemType';
import StatusConstants from '../constants/status';
import { createQuestionnaireResponseAnswer } from '../util/createQuestionnaireResponseAnswer';
import { getMinOccursExtensionValue } from '../util/extension';

export function generateQuestionnaireResponse(questionnaire: Questionnaire): QuestionnaireResponse | undefined {
  if (!questionnaire || !questionnaire.item || questionnaire.item.length === 0) {
    return {
      resourceType: Constants.QUESTIONNAIRE_RESPONSE_RESOURCE_TYPE,
      status: StatusConstants.questionnaireResponse.IN_PROGRESS,
    };
  }

  const responseItems = questionnaire.item.reduce<QuestionnaireResponseItem[]>((acc, item) => {
    const minOccursItems = Array.from({ length: getMinOccurs(item) }, () => {
      const responseItem = createQuestionnaireResponseItem(item);
      addChildrenItemsToResponseItem(item, responseItem);
      return responseItem;
    });
    return acc.concat(minOccursItems);
  }, []);

  const response: QuestionnaireResponse = {
    resourceType: Constants.QUESTIONNAIRE_RESPONSE_RESOURCE_TYPE,
    status: StatusConstants.questionnaireResponse.IN_PROGRESS,
    questionnaire: questionnaire.url,
    item: responseItems,
  };

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
    responseItemForQuestionnaire.item = responseItemForQuestionnaire.item || [];
    responseItemForQuestionnaire.item.push(itemToAdd);
  } else {
    const answer = (responseItemForQuestionnaire.answer = responseItemForQuestionnaire.answer || [{} as QuestionnaireResponseItemAnswer]);
    answer[0].item = answer[0].item || [];
    answer[0].item.push(itemToAdd);
  }
}

export function createQuestionnaireResponseItem(item: QuestionnaireItem): QuestionnaireResponseItem {
  const responseItem: QuestionnaireResponseItem = {
    linkId: item.linkId,
  };

  if (item.text) {
    responseItem.text = item.text;
  }

  const answer = createQuestionnaireResponseAnswer(item);
  if (answer) {
    responseItem.answer = [answer];
  }

  return responseItem;
}
