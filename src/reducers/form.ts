import {
  NEW_VALUE,
  REMOVE_CODING_VALUE,
  ADD_REPEAT_ITEM,
  DELETE_REPEAT_ITEM,
  NewValueAction,
  NEW_CODINGSTRING_VALUE,
  REMOVE_CODINGSTRING_VALUE,
  REMOVE_ATTACHMENT_VALUE,
} from '../actions/newValue';
import { GlobalState } from '../reducers/index';
import { isStringEmpty, removeLinkIdSuffix } from '../util/index';

import {
  Questionnaire,
  QuestionnaireResponseItem,
  QuestionnaireResponseAnswer,
  QuestionnaireItem,
  QuestionnaireEnableWhen,
  QuestionnaireResponse,
  Coding,
  Attachment,
} from '../types/fhir';
import {
  getResponseItemWithPath,
  getQuestionnaireDefinitionItem,
  getQuestionnaireResponseItemWithLinkid,
  getAllResponseItemsWithLinkid,
  getResponseItems,
  getDefinitionItems,
  enableWhenMatchesAnswer,
} from '../util/skjemautfyller-core';
import { getMinOccursExtensionValue } from '../util/extension';
import { Languages } from '@helsenorge/toolkit/constants';
import { FormAction, SET_SKJEMA_DEFINITION } from '../actions/form';
import { generateQuestionnaireResponse } from '../actions/generateQuestionnaireResponse';
import { createQuestionnaireResponseAnswer } from '../util/createQuestionnaireResponseAnswer';

export interface FormData {
  Content: QuestionnaireResponse | null | undefined;
}

export interface FormDefinition {
  Content: Questionnaire | null | undefined;
}

export interface Form {
  FormData: FormData;
  InitialFormData: FormData;
  FormDefinition: FormDefinition;
  Language: string;
}

const initialState: Form = {
  FormData: {
    Content: null,
  },
  InitialFormData: {
    Content: null,
  },
  FormDefinition: {
    Content: null,
  },
  Language: Languages.NORWEGIAN.toLowerCase(),
};

export default function reducer(state: Form = initialState, action: NewValueAction | FormAction): Form | undefined {
  switch (action.type) {
    case NEW_VALUE:
      return processNewValueAction(action, state);

    case REMOVE_ATTACHMENT_VALUE:
      return processRemoveAttachmentValueAction(action, state);

    case REMOVE_CODING_VALUE:
      return processRemoveCodingValueAction(action, state);

    case NEW_CODINGSTRING_VALUE:
      return processNewCodingStringValueAction(action, state);

    case REMOVE_CODINGSTRING_VALUE:
      return processRemoveCodingStringValueAction(action, state);

    case ADD_REPEAT_ITEM:
      return processAddRepeatItemAction(action, state);

    case DELETE_REPEAT_ITEM:
      return processDeleteRepeatItemAction(action, state);

    case SET_SKJEMA_DEFINITION:
      return processSetSkjemaDefinition(action as FormAction, state);
    default:
      return state;
  }
}

export function getFormData(state: GlobalState): FormData | null {
  if (!state.skjemautfyller.form.FormData) {
    return null;
  }
  return state.skjemautfyller.form.FormData;
}

export function getInitialFormData(state: GlobalState): FormData | null {
  if (!state.skjemautfyller.form.InitialFormData) {
    return null;
  }
  return state.skjemautfyller.form.InitialFormData;
}

export function copyObject(object: Object): Object {
  return JSON.parse(JSON.stringify(object));
}

function getArrayToAddGroupTo(itemToAddTo: QuestionnaireResponseItem | undefined): Array<QuestionnaireResponseItem> | undefined {
  if (!itemToAddTo) {
    return undefined;
  }
  if (itemToAddTo.answer) {
    return itemToAddTo.answer[0].item;
  } else if (itemToAddTo.item) {
    return itemToAddTo.item;
  }
}

function processAddRepeatItemAction(action: NewValueAction, state: Form): Form {
  if (!action.parentPath) {
    return state;
  }
  const newState: Form = copyObject(state) as Form;

  let arrayToAddItemTo: Array<QuestionnaireResponseItem> | undefined = [];
  if (action.parentPath.length === 0 && newState.FormData.Content) {
    arrayToAddItemTo = newState.FormData.Content.item;
  } else if (action.parentPath.length > 0) {
    // length >1 means group wrapped in group
    const itemToAddTo = getResponseItemWithPath(action.parentPath, newState.FormData);
    arrayToAddItemTo = getArrayToAddGroupTo(itemToAddTo);
  }

  if (!arrayToAddItemTo || arrayToAddItemTo.length === 0) {
    return newState;
  }

  if (!action.responseItems || action.responseItems.length === 0) {
    return newState;
  }

  const repeatSuffix = '^' + action.responseItems.length.toString();

  const newItem = copyItem(action.responseItems[0], undefined, repeatSuffix);
  if (!newItem) {
    return newState;
  }

  arrayToAddItemTo.push(newItem);
  return newState;
}

function processDeleteRepeatItemAction(action: NewValueAction, state: Form): Form {
  if (!action.itemPath) {
    return state;
  }
  const newState: Form = copyObject(state) as Form;

  let arrayToDeleteItem: Array<QuestionnaireResponseItem> | undefined = [];
  if (action.itemPath.length === 1 && newState.FormData.Content) {
    arrayToDeleteItem = newState.FormData.Content.item;
  } else if (action.itemPath.length > 0) {
    // length >1 means group wrapped in group
    let parentPath = action.itemPath.slice(0, -1);
    const itemToAddTo = getResponseItemWithPath(parentPath, newState.FormData);
    arrayToDeleteItem = getArrayToAddGroupTo(itemToAddTo);
  }

  if (!arrayToDeleteItem || arrayToDeleteItem.length === 0) {
    return newState;
  }
  let responseItemLinkId = action.itemPath[action.itemPath.length - 1].linkId;

  if (!action.item) {
    return newState;
  }
  let definitionLinkId = action.item.linkId;

  for (let i = arrayToDeleteItem.length - 1; i >= 0; i--) {
    if (arrayToDeleteItem[i].linkId.includes(definitionLinkId)) {
      if (arrayToDeleteItem[i].linkId === responseItemLinkId) {
        arrayToDeleteItem.splice(i, 1);
        break;
      } else {
        minusRepeatId(arrayToDeleteItem[i]);
      }
    }
  }
  return newState;
}

function minusRepeatId(responseItem?: QuestionnaireResponseItem): void {
  if (!responseItem) {
    return;
  }
  let repeatSuffix = 0;
  repeatSuffix = parseInt(responseItem.linkId.split('^')[1], 10);
  responseItem.linkId = responseItem.linkId.split('^')[0] + '^' + (repeatSuffix - 1).toString();

  if (responseItem.answer && responseItem.answer.length > 0) {
    responseItem.answer.forEach(answer => {
      if (answer.item && answer.item.length > 0) {
        answer.item.forEach(element => {
          minusRepeatId(element);
        });
      }
    });
  }

  const hasItems = responseItem.item && responseItem.item.length > 0;
  if (!hasItems) {
    return;
  }

  for (let i = 0; responseItem.item && i < responseItem.item.length; i++) {
    minusRepeatId(responseItem.item[i]);
  }
}

function copyItem(
  source: QuestionnaireResponseItem,
  target: QuestionnaireResponseItem | undefined,
  repeatedId = ''
): QuestionnaireResponseItem {
  if (!target) {
    target = { linkId: removeLinkIdSuffix(source.linkId, '^') + repeatedId } as QuestionnaireResponseItem;
  }

  for (let i = 0; source.item && i < source.item.length; i++) {
    if (!target.item) {
      target.item = [];
    }
    const newResponseItem = {
      linkId: removeLinkIdSuffix(source.item[i].linkId, '^') + repeatedId,
    } as QuestionnaireResponseItem;
    target.item.push(newResponseItem);
    copyItem(source.item[i], newResponseItem, repeatedId);
  }

  for (let i = 0; source.answer && i < source.answer.length; i++) {
    if (!target.answer) {
      target.answer = [];
    }
    const answer = source.answer[i];
    for (let j = 0; answer && answer.item && j < answer.item.length; j++) {
      const newResponseItem = {
        linkId: removeLinkIdSuffix(answer.item[j].linkId, '^') + repeatedId,
      } as QuestionnaireResponseItem;
      target.answer.push({
        item: [newResponseItem],
      } as QuestionnaireResponseAnswer);
      copyItem(answer.item[j], newResponseItem, repeatedId);
    }
  }

  return target;
}

function processRemoveCodingValueAction(action: NewValueAction, state: Form) {
  let newState: Form = copyObject(state) as Form;
  let responseItem = getResponseItemWithPath(action.itemPath, newState.FormData);
  if (!responseItem || !responseItem.answer || !responseItem.answer.length) {
    return newState;
  }
  if (action.valueCoding) {
    responseItem.answer = responseItem.answer.filter(el => {
      if (el && el.valueCoding && el.valueCoding.code && action.valueCoding) {
        return el.valueCoding.code !== action.valueCoding.code;
      }
      return true;
    });
  }

  return newState;
}

function processRemoveCodingStringValueAction(action: NewValueAction, state: Form) {
  let newState: Form = copyObject(state) as Form;
  let responseItem = getResponseItemWithPath(action.itemPath, newState.FormData);
  if (!responseItem || !responseItem.answer || !responseItem.answer.length) {
    return newState;
  }

  responseItem.answer = responseItem.answer.filter(el => {
    if (el && el.valueString) {
      return false;
    }
    return true;
  });

  return newState;
}

function processRemoveAttachmentValueAction(action: NewValueAction, state: Form) {
  let newstate: Form = copyObject(state) as Form;
  let responseItem = getResponseItemWithPath(action.itemPath, newstate.FormData);
  if (!responseItem || !responseItem.answer || !responseItem.answer.length) {
    return newstate;
  }

  if (action.valueAttachment) {
    var attachmentToRemove = action.valueAttachment.url;
    responseItem.answer = responseItem.answer.filter(el => el && el.valueAttachment && el.valueAttachment.url !== attachmentToRemove);
  }

  return newstate;
}

function processNewValueAction(action: NewValueAction, state: Form): Form {
  let newState: Form = copyObject(state) as Form;
  let responseItem = getResponseItemWithPath(action.itemPath, newState.FormData);
  if (!responseItem) {
    return newState;
  }

  if (!responseItem.answer) {
    responseItem.answer = [<QuestionnaireResponseAnswer>{}];
  }

  if (!responseItem.answer) {
    responseItem.answer = [];
  }
  if (responseItem.answer.length === 0) {
    responseItem.answer[0] = {} as QuestionnaireResponseAnswer;
  }
  let hasAnswer = false;
  let answer = responseItem.answer[0];

  if (action.valueBoolean !== undefined) {
    hasAnswer = true;
    answer.valueBoolean = action.valueBoolean;
  }

  if (action.valueDecimal !== undefined && !isNaN(action.valueDecimal)) {
    hasAnswer = true;
    answer.valueDecimal = action.valueDecimal;
  }
  if (action.valueInteger !== undefined && !isNaN(action.valueInteger)) {
    hasAnswer = true;
    answer.valueInteger = action.valueInteger;
  }
  if (!isStringEmpty(action.valueDate)) {
    hasAnswer = true;
    answer.valueDate = action.valueDate;
  }
  if (!isStringEmpty(action.valueDateTime)) {
    hasAnswer = true;
    answer.valueDateTime = action.valueDateTime;
  }
  if (!isStringEmpty(action.valueTime)) {
    hasAnswer = true;
    answer.valueTime = action.valueTime;
  }
  if (!isStringEmpty(action.valueString)) {
    hasAnswer = true;
    answer.valueString = action.valueString;
  }
  if (action.valueCoding) {
    hasAnswer = true;

    if (action.multipleAnswers) {
      // Coding with checkbox view can have multiple answers
      let newAnswer = {} as QuestionnaireResponseAnswer;
      newAnswer.valueCoding = <Coding>{
        system: action.valueCoding.system,
        code: action.valueCoding.code,
        display: action.valueCoding.display,
      };
      if (Object.keys(responseItem.answer[0]).length === 0) {
        responseItem.answer[0] = newAnswer;
      } else if (responseItem.answer.indexOf(newAnswer) < 0) {
        responseItem.answer.push(newAnswer);
      }
    } else {
      answer.valueCoding = <Coding>{
        system: action.valueCoding.system,
        code: action.valueCoding.code,
        display: action.valueCoding.display,
      };
    }
  }
  if (action.valueAttachment && Object.keys(action.valueAttachment).length > 0) {
    hasAnswer = true;

    var attachment = <Attachment>{
      url: action.valueAttachment.url,
      title: action.valueAttachment.title,
      data: action.valueAttachment.data,
      contentType: action.valueAttachment.contentType,
      creation: action.valueAttachment.creation,
      hash: action.valueAttachment.hash,
      size: action.valueAttachment.size,
      language: action.valueAttachment.language,
    };

    if (action.multipleAnswers) {
      let newAnswer = {} as QuestionnaireResponseAnswer;
      newAnswer.valueAttachment = attachment;
      if (Object.keys(responseItem.answer[0]).length === 0) {
        responseItem.answer[0] = newAnswer;
      } else if (responseItem.answer.indexOf(newAnswer) < 0) {
        responseItem.answer.push(newAnswer);
      }
    } else {
      answer.valueAttachment = attachment;
    }
  }
  if (action.valueQuantity) {
    hasAnswer = true;
    answer.valueQuantity = action.valueQuantity;
  }
  if (!hasAnswer) {
    if (action.valueAttachment !== undefined && Object.keys(action.valueAttachment).length === 0) {
      delete responseItem.answer; // Bare støtte for ett vedlegg og ingen initial value
    } else {
      nullAnswerValue(answer);
    }
  }
  if (action.item) {
    updateEnableWhenItemsIteration([action.item], newState.FormData, newState.FormDefinition);
  }

  return newState;
}

function processNewCodingStringValueAction(action: NewValueAction, state: Form): Form {
  let newState: Form = copyObject(state) as Form;
  let responseItem = getResponseItemWithPath(action.itemPath, newState.FormData);
  if (!responseItem) {
    return newState;
  }

  if (!responseItem.answer) {
    responseItem.answer = [];
  }
  if (responseItem.answer.length === 0) {
    responseItem.answer[0] = {} as QuestionnaireResponseAnswer;
  }

  let hasAnswer = false;
  let answer = responseItem.answer[0];

  if (!isStringEmpty(action.valueString)) {
    hasAnswer = true;
    //answer.valueString = action.valueString;

    let found = -1;
    for (let i = 0; i < responseItem.answer.length; i++) {
      if (!isStringEmpty(responseItem.answer[i].valueString)) {
        found = i;
        break;
      }
    }

    let newAnswer = {
      valueString: action.valueString,
    } as QuestionnaireResponseAnswer;
    if (found >= 0) {
      responseItem.answer[found] = newAnswer;
    } else {
      responseItem.answer.push(newAnswer);
    }
  }

  return newState;
}

function updateEnableWhenItemsIteration(items: QuestionnaireItem[], formData: FormData, formDefinition: FormDefinition): void {
  if (!items) {
    return;
  }

  let enableWhenRelatedItemArray: QuestionnaireItem[] = [];
  let definitionItems = getDefinitionItems(formDefinition);

  for (let i = 0; i < items.length; i++) {
    if (definitionItems) {
      let enableWhenRelatedItems = getItemWithEnableWhen(items[i].linkId, definitionItems);
      if (enableWhenRelatedItems) {
        enableWhenRelatedItems.forEach(i => {
          enableWhenRelatedItemArray.push(i);
        });
      }
    }
  }
  if (!enableWhenRelatedItemArray || enableWhenRelatedItemArray.length === 0) {
    return;
  }

  for (let x = 0; x < enableWhenRelatedItemArray.length; x++) {
    let enableWhen = enableWhenRelatedItemArray[x].enableWhen;
    if (!enableWhen) {
      continue;
    }
    const responseItems = getResponseItems(formData);
    let enable = false;
    enableWhen.forEach((enableWhen: QuestionnaireEnableWhen) => {
      const enableWhenQuestionItem = getQuestionnaireDefinitionItem(enableWhen.question, definitionItems);
      for (let j = 0; responseItems && j < responseItems.length; j++) {
        let responseItem: QuestionnaireResponseItem | undefined = responseItems[j];
        if (responseItem.linkId !== enableWhen.question) {
          responseItem = getQuestionnaireResponseItemWithLinkid(enableWhen.question, responseItems[j], true);
        }
        if (!responseItem) {
          continue;
        }
        let deactivated = enableWhenQuestionItem ? enableWhenQuestionItem.deactivated : false;
        enable = enable || (enableWhenMatchesAnswer(enableWhen, responseItem.answer) && !deactivated);

        // This should remove repeated items, but not the original, so remove linkId 4.1^1, 4.1^2 etc.,
        // but not 4.1^0 as it is the original. (So if you click add on a repeated item in an enableWhen,
        // collapse the enableWhen and exapnd it again, the added items should be gone)
        // Go through the array backwards and delete, so not to screw up the indices we're looping over.
        if (!enable && enableWhenRelatedItemArray[x].repeats) {
          let minOccurs = getMinOccursExtensionValue(enableWhenRelatedItemArray[x]);
          let arrayToDeleteItem = getArrayToAddGroupTo(responseItem);
          if (arrayToDeleteItem) {
            let keepThreshold = minOccurs ? minOccurs : 1;
            let prefix = enableWhenRelatedItemArray[x].linkId + '^';
            for (let i = arrayToDeleteItem.length - 1; i >= 0; i--) {
              let e = arrayToDeleteItem[i];
              if (e.linkId.startsWith(prefix) && Number(e.linkId.replace(prefix, '')) >= keepThreshold) {
                arrayToDeleteItem.splice(i, 1);
              }
            }
          }
        }
      }
    });

    if (!enable) {
      // relatedResponseItems skal være array siden det kan være flere responseItems med samme linkid
      let relatedResponseItems: QuestionnaireResponseItem[] = [];

      relatedResponseItems = getAllResponseItemsWithLinkid(enableWhenRelatedItemArray[x].linkId, responseItems, true);
      relatedResponseItems.forEach(i => {
        wipeAnswerItems(i, enableWhenRelatedItemArray[x]);
      });

      enableWhenRelatedItemArray[x].deactivated = true;
    } else {
      enableWhenRelatedItemArray[x].deactivated = false;
    }
  }
  updateEnableWhenItemsIteration(enableWhenRelatedItemArray, formData, formDefinition);
}

export function getFormDefinition(state: GlobalState): FormDefinition | null {
  if (!state.skjemautfyller.form.FormDefinition) {
    return null;
  }
  return state.skjemautfyller.form.FormDefinition;
}

function wipeAnswerItems(answerItem: QuestionnaireResponseItem | undefined, item: QuestionnaireItem | undefined): undefined {
  if (!answerItem || !item) {
    return undefined;
  }

  if (answerItem.answer) {
    answerItem.answer.forEach(answer => {
      resetAnswerValue(answer, item);
    });
  }

  const hasItems = answerItem.item && answerItem.item.length > 0;
  if (!hasItems) {
    return undefined;
  }

  for (let i = 0; answerItem.item && item.item && i < answerItem.item.length; i++) {
    wipeAnswerItems(answerItem.item[i], item.item[i]);
  }
}

function resetAnswerValue(answer: QuestionnaireResponseAnswer, item: QuestionnaireItem) {
  let initialAnswer = createQuestionnaireResponseAnswer(item);
  nullAnswerValue(answer, initialAnswer);
}

export function nullAnswerValue(
  answer: QuestionnaireResponseAnswer,
  initialAnswer: QuestionnaireResponseAnswer | undefined = undefined
): undefined {
  if (!answer) {
    return undefined;
  }

  if (answer.valueBoolean !== undefined) {
    initialAnswer ? (answer.valueBoolean = initialAnswer.valueBoolean) : (answer.valueBoolean = false);
  } else if (answer.valueCoding !== undefined) {
    initialAnswer ? (answer.valueCoding = initialAnswer.valueCoding) : delete answer.valueCoding;
  } else if (answer.valueDate !== undefined) {
    initialAnswer ? (answer.valueDate = initialAnswer.valueDate) : delete answer.valueDate;
  } else if (answer.valueDateTime !== undefined) {
    initialAnswer ? (answer.valueDateTime = initialAnswer.valueDateTime) : delete answer.valueDateTime;
  } else if (answer.valueDecimal !== undefined) {
    initialAnswer ? (answer.valueDecimal = initialAnswer.valueDecimal) : delete answer.valueDecimal;
  } else if (answer.valueInteger !== undefined) {
    initialAnswer ? (answer.valueInteger = initialAnswer.valueInteger) : delete answer.valueInteger;
  } else if (answer.valueString !== undefined) {
    initialAnswer ? (answer.valueString = initialAnswer.valueString) : delete answer.valueString;
  } else if (answer.valueTime !== undefined) {
    initialAnswer ? (answer.valueTime = initialAnswer.valueTime) : delete answer.valueTime;
  }
}

function getItemWithEnableWhen(linkId: string, definitionItems: QuestionnaireItem[]): QuestionnaireItem[] {
  let relatedItems: QuestionnaireItem[] = [];
  var getQuestionnaireItemHasEnableWhenLinkid = function (linkId: string, definitionItem: QuestionnaireItem | undefined): void {
    if (!definitionItem) {
      return undefined;
    }
    const hasItems = definitionItem.item && definitionItem.item.length > 0;
    if (!hasItems) {
      return undefined;
    }

    const itemsEnableWhenMatchLinkId: QuestionnaireItem[] | undefined = getItemEnableWhenQuestionMatchIdFromArray(
      linkId,
      definitionItem.item
    );
    if (itemsEnableWhenMatchLinkId && itemsEnableWhenMatchLinkId.length >= 0) {
      itemsEnableWhenMatchLinkId.forEach(i => {
        relatedItems.push(i);
      });
    }

    for (let i = 0; definitionItem.item && i < definitionItem.item.length; i++) {
      getQuestionnaireItemHasEnableWhenLinkid(linkId, definitionItem.item[i]);
    }
  };

  for (let k = 0; k < definitionItems.length; k++) {
    let enableWhen = definitionItems[k].enableWhen;
    if (enableWhen) {
      for (let n = 0; n < enableWhen.length; n++) {
        if (enableWhen[n].question === linkId) {
          relatedItems.push(definitionItems[k]);
        }
      }
    }
    getQuestionnaireItemHasEnableWhenLinkid(linkId, definitionItems[k]);
  }

  return relatedItems;
}

function getItemEnableWhenQuestionMatchIdFromArray(linkId: string, definitionItems: QuestionnaireItem[] | undefined) {
  if (!definitionItems) {
    return [];
  }
  let matchedItems: QuestionnaireItem[] = [];
  for (let i = 0; i < definitionItems.length; i++) {
    let enableWhen = definitionItems[i].enableWhen;
    if (!enableWhen) {
      continue;
    }
    for (let j = 0; j < enableWhen.length; j++) {
      if (enableWhen[j].question === linkId) {
        matchedItems.push(definitionItems[i]);
      }
    }
  }
  return matchedItems;
}

function processSetSkjemaDefinition(action: FormAction, state: Form): Form {
  if (!action.questionnaire) {
    return state;
  }

  const formDefinition: FormDefinition = {
    Content: action.questionnaire,
  };

  let formData: FormData;
  if (action.questionnaireResponse) {
    formData = { Content: action.questionnaireResponse };
  } else if (state.FormData === initialState.FormData) {
    formData = { Content: generateQuestionnaireResponse(action.questionnaire) };
  } else {
    formData = state.FormData;
  }

  let initialFormData: FormData;
  if (state.InitialFormData === initialState.InitialFormData) {
    initialFormData = formData;
  } else {
    initialFormData = state.InitialFormData;
  }
  return {
    ...state,
    FormDefinition: formDefinition,
    FormData: formData,
    Language: action.language || state.Language,
    InitialFormData: initialFormData,
  };
}
