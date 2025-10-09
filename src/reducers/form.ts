/* eslint-disable @typescript-eslint/no-unused-expressions */
import { createSlice, current, PayloadAction } from '@reduxjs/toolkit';
import {
  Questionnaire,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
  QuestionnaireResponse,
  Coding,
  Attachment,
} from 'fhir/r4';

import { LanguageLocales } from '@helsenorge/core-utils/constants/languages';

import { getResponseItemWithPath, getQuestionnaireDefinitionItem, getQuestionnaireDefinitionItemWithLinkid } from '../util/refero-core';

import { SetFormDefinitionAction, setSkjemaDefinitionAction } from '@/actions/form';
import { generateQuestionnaireResponse } from '@/actions/generateQuestionnaireResponse';
import {
  addRepeatItemAction,
  newCodingStringValueAction,
  newValue,
  NewValuePayload,
  removeCodingStringValueAction,
  removeCodingValueAction,
  removeAttachmentAction,
  DeleteRepeatItemPayload,
  RepeatItemPayload,
  deleteRepeatItemAction,
  RemoveAttachmentPayload,
  CodingStringPayload,
  AnswerValueItemPayload,
  RemoveCodingStringPayload,
  RemoveCodingValuePayload,
  newAnswerValueAction,
  newAnswerValuesAction,
  AnswerValuesItemPayload,
  ResetAnswerValuePayload,
  resetAnswerValueAction,
} from '@/actions/newValue';
import { syncQuestionnaireResponse } from '@/actions/syncQuestionnaireResponse';
// import { runEnableWhen } from '@/calculators/runEnableWhen';
import { resetAnswerValuePure } from '@/calculators/runEnableWhen_new';
import itemType from '@/constants/itemType';
import { GlobalState } from '@/reducers/index';
import { createQuestionnaireResponseAnswer } from '@/util/createQuestionnaireResponseAnswer';
import { getMinOccursExtensionValue } from '@/util/extension';
import { isStringEmpty } from '@/util/index';

export interface FormData {
  Content: QuestionnaireResponse | null | undefined;
  isExternalUpdate?: boolean;
}

export interface FormDefinition {
  Content: Questionnaire | null | undefined;
  isExternalUpdate?: boolean;
}

export interface Form {
  FormData: FormData;
  FormDefinition: FormDefinition;
  Language: string;
}

export const initialState: Form = {
  FormData: {
    Content: null,
  },
  FormDefinition: {
    Content: null,
    isExternalUpdate: false,
  },
  Language: LanguageLocales.NORWEGIAN.toLowerCase(),
};
const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    setIsExternalUpdateAction(state, action: PayloadAction<boolean>) {
      state.FormData.isExternalUpdate = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(setSkjemaDefinitionAction, (state, action: PayloadAction<SetFormDefinitionAction>) => {
        processSetSkjemaDefinition(action.payload, state);
      })
      .addCase(newValue, (state, action: PayloadAction<NewValuePayload>) => {
        processNewValueAction(action.payload, state);
      })
      .addCase(newAnswerValueAction, (state, action: PayloadAction<AnswerValueItemPayload>) => {
        processNewAnswerValueAction(action.payload, state);
      })
      .addCase(newAnswerValuesAction, (state, action: PayloadAction<AnswerValuesItemPayload>) => {
        processNewAnswerValuesAction(action.payload, state);
      })
      .addCase(newCodingStringValueAction, (state, action: PayloadAction<CodingStringPayload>) => {
        processNewCodingStringValueAction(action.payload, state);
      })
      .addCase(removeCodingStringValueAction, (state, action: PayloadAction<RemoveCodingStringPayload>) => {
        processRemoveCodingStringValueAction(action.payload, state);
      })
      .addCase(removeCodingValueAction, (state, action: PayloadAction<RemoveCodingValuePayload>) => {
        processRemoveCodingValueAction(action.payload, state);
      })
      .addCase(removeAttachmentAction, (state, action: PayloadAction<RemoveAttachmentPayload>) => {
        processRemoveAttachmentValueAction(action.payload, state);
      })
      .addCase(addRepeatItemAction, (state, action: PayloadAction<RepeatItemPayload>) => {
        processAddRepeatItemAction(action.payload, state);
      })
      .addCase(deleteRepeatItemAction, (state, action: PayloadAction<DeleteRepeatItemPayload>) => {
        processDeleteRepeatItemAction(action.payload, state);
      })
      .addCase(resetAnswerValueAction, (state, action: PayloadAction<ResetAnswerValuePayload>) => {
        processResetAnswerValue(action.payload, state);
      });
  },
});
export default formSlice.reducer;
export const actions = formSlice.actions;

export function getFormData(state: GlobalState): FormData | null {
  if (!state.refero?.form?.FormData) {
    return null;
  }
  return state.refero.form.FormData;
}

function processResetAnswerValue(action: ResetAnswerValuePayload, state: Form): Form {
  const { itemPath, qItem, rItem, index } = action;
  const responseItem = getResponseItemWithPath(itemPath || [], state.FormData);
  const newAnswer = rItem.answer?.map((a, i) => (i === index ? { ...resetAnswerValuePure({ answer: a, item: qItem }) } : a)) || [];
  if (!responseItem) {
    return state;
  }

  responseItem.answer = newAnswer;
  return state;
}

function getArrayToAddGroupTo(itemToAddTo: QuestionnaireResponseItem | undefined): Array<QuestionnaireResponseItem> | undefined {
  if (!itemToAddTo) {
    return undefined;
  }
  if (itemToAddTo?.answer && itemToAddTo.answer.length > 0) {
    return itemToAddTo.answer[0]?.item;
  } else if (itemToAddTo?.item) {
    return itemToAddTo.item;
  }
}

function processAddRepeatItemAction(action: NewValuePayload, state: Form): Form {
  const { parentPath, responseItems, item } = action;
  if (!parentPath) return state;

  let arrayToAddItemTo: QuestionnaireResponseItem[] | undefined = [];
  if (parentPath.length === 0 && state.FormData.Content) {
    arrayToAddItemTo = state.FormData.Content.item;
  } else if (parentPath.length > 0) {
    const itemToAddTo = getResponseItemWithPath(parentPath, state.FormData);

    arrayToAddItemTo = getArrayToAddGroupTo(itemToAddTo);
  }

  if (!arrayToAddItemTo || arrayToAddItemTo.length === 0) {
    return state;
  }

  if (!responseItems || responseItems.length === 0) {
    return state;
  }
  if (state.FormDefinition.Content === undefined || state.FormDefinition.Content === null) {
    return state;
  }
  if (state.FormDefinition.Content === undefined || state.FormDefinition.Content === null) {
    return state;
  }

  const newItem = copyItem(responseItems[0], undefined, state.FormDefinition.Content, state.FormDefinition.Content);
  if (!newItem) {
    return state;
  }
  if (item?.type === itemType.BOOLEAN) {
    if (item.initial && item.initial.length > 0 && item.initial[0].valueBoolean !== undefined) {
      newItem.answer = [{ valueBoolean: item.initial[0]?.valueBoolean }];
    } else {
      newItem.answer = [{ valueBoolean: false }];
    }
  }
  const indexToInsert = arrayToAddItemTo.map(o => o.linkId).lastIndexOf(newItem.linkId);
  arrayToAddItemTo.splice(indexToInsert + 1, 0, newItem);

  return state;
}

function processDeleteRepeatItemAction(action: NewValuePayload, state: Form): Form {
  if (!action.itemPath) {
    return state;
  }

  let arrayToDeleteItem: QuestionnaireResponseItem[] | undefined = [];

  if (action.itemPath.length === 1 && state.FormData.Content) {
    arrayToDeleteItem = state.FormData.Content.item;
  } else if (action.itemPath.length > 1) {
    const parentPath = action.itemPath.slice(0, -1);
    const itemToAddTo = getResponseItemWithPath(parentPath, state.FormData);
    arrayToDeleteItem = getArrayToAddGroupTo(itemToAddTo);
  }

  if (!arrayToDeleteItem || arrayToDeleteItem.length === 0 || !action.item) {
    return state;
  }

  const definitionLinkId = action.item.linkId;
  const index = action.itemPath[action.itemPath.length - 1].index;

  let itemIndexInArray = 0;

  for (let i = 0; i < arrayToDeleteItem.length; i++) {
    if (arrayToDeleteItem[i].linkId === definitionLinkId) {
      if (itemIndexInArray === index) {
        arrayToDeleteItem.splice(i, 1);
        break;
      }
      itemIndexInArray++;
    }
  }

  return state;
}

function copyItem(
  source: QuestionnaireResponseItem,
  target: QuestionnaireResponseItem | undefined,
  questionnairestate: Questionnaire,
  questionnaire: Questionnaire
): QuestionnaireResponseItem {
  if (!target) {
    target = { linkId: source.linkId };

    if (source.text) {
      target.text = source.text;
    }
  }

  for (let i = 0; source.item && i < source.item.length; i++) {
    if (!target.item) {
      target.item = [];
    }
    const newResponseItem: QuestionnaireResponseItem = {
      linkId: source.item[i].linkId,
    };
    if (source.item[i].text) {
      newResponseItem.text = source.item[i].text;
    }

    const numberOfItemsWithSameLinkId = target.item.filter(item => item.linkId === newResponseItem.linkId).length;

    if (numberOfItemsWithSameLinkId > 0) {
      const defItem = getQuestionnaireDefinitionItem(newResponseItem.linkId, questionnairestate.item);

      const minOccurs = defItem ? getMinOccursExtensionValue(defItem) || 1 : 1;
      if (numberOfItemsWithSameLinkId >= minOccurs) {
        continue;
      }
    }

    target.item.push(newResponseItem);
    copyItem(source.item[i], newResponseItem, questionnairestate, questionnaire);
  }
  const defItem = getQuestionnaireDefinitionItem(source.linkId, questionnairestate.item);
  if (defItem?.type === itemType.BOOLEAN) {
    const answer = createQuestionnaireResponseAnswer(defItem);
    if (answer) {
      target.answer = [answer];
    }
  }
  if (defItem && defItem.type !== itemType.ATTATCHMENT) {
    for (let i = 0; source.answer && i < source.answer.length; i++) {
      if (defItem.initial && defItem.initial.length > 0) {
        if (!target.answer) {
          target.answer = [];
        }
        target.answer.push(...defItem.initial);
      }
      if (!source.answer[i].item || source.answer[i].item?.length === 0) {
        continue;
      }
      if (!target.answer) {
        target.answer = [];
      }
      const answer = source.answer[i];
      const targetAnswer: QuestionnaireResponseItemAnswer = {
        item: [],
      };

      for (let j = 0; answer && answer.item && j < answer.item.length; j++) {
        const newResponseItem: QuestionnaireResponseItem = {
          linkId: answer.item[j].linkId,
          answer: getInitialAnswerForCopyItem(source, questionnaire, answer.item[j]),
          text: answer.item[j]?.text,
        };
        targetAnswer.item?.push(newResponseItem);
        target.text = source.text;
        copyItem(answer.item[j], newResponseItem, questionnairestate, questionnaire);
      }

      target.answer.push(targetAnswer);
    }
  }

  return target;
}

function getInitialAnswerForCopyItem(
  source: QuestionnaireResponseItem,
  questionnaire: Questionnaire,
  qrItem: QuestionnaireResponseItem
): QuestionnaireResponseItemAnswer[] {
  let initialAnswer = undefined;
  const item = getQuestionnaireDefinitionItem(source.linkId, questionnaire.item);
  if (item) {
    const qitem = getQuestionnaireDefinitionItemWithLinkid(qrItem.linkId, item);
    if (qitem) {
      initialAnswer = createQuestionnaireResponseAnswer(qitem);
    }
  }
  return initialAnswer !== undefined ? [initialAnswer] : [];
}

function processRemoveCodingValueAction(action: NewValuePayload, state: Form): Form {
  const responseItem = getResponseItemWithPath(action.itemPath || [], state.FormData);
  if (!responseItem || !responseItem.answer || !responseItem.answer.length) {
    return state;
  }
  if (action.valueCoding) {
    responseItem.answer = responseItem.answer
      .map(el => {
        if (el && el.item && el.valueCoding && el.valueCoding.code && action.valueCoding) {
          return {
            // fjern valueCoding, men behold item
            item: el.item,
          };
        }
        return el;
      })
      .filter(el => {
        if (el && el.valueCoding && el.valueCoding.code && action.valueCoding) {
          return el.valueCoding.code !== action.valueCoding.code;
        }
        return true;
      });

    if (responseItem.answer.length === 0) {
      delete responseItem.answer;
    }
  }

  // run enableWhen to clear fields
  // runEnableWhen(action, state);
  return state;
}

function processRemoveCodingStringValueAction(action: NewValuePayload, state: Form): Form {
  const responseItem = getResponseItemWithPath(action.itemPath || [], state.FormData);
  if (!responseItem || !responseItem.answer || !responseItem.answer.length) {
    return state;
  }

  responseItem.answer = responseItem.answer.filter(el => {
    return el && el.valueString ? false : true;
  });

  if (responseItem.answer.length === 0) {
    delete responseItem.answer;
  }

  // run enableWhen to clear fields
  // runEnableWhen(action, state);
  return state;
}

function processRemoveAttachmentValueAction(action: NewValuePayload, state: Form): Form {
  const responseItem = getResponseItemWithPath(action.itemPath || [], state.FormData);
  if (!responseItem || !responseItem.answer || !responseItem.answer.length) {
    return state;
  }

  if (action.valueAttachment) {
    const index = responseItem.answer.findIndex(el => el && el.valueAttachment && el.valueAttachment.id === action.valueAttachment?.id);
    if (index > -1) {
      responseItem.answer.splice(index, 1);
    }
  }

  if (responseItem.answer.length === 0) {
    delete responseItem.answer;
  }
  return state;
}
function processNewAnswerValueAction(payload: AnswerValueItemPayload, state: Form): Form {
  const responseItem = getResponseItemWithPath(payload.itemPath || [], state.FormData);
  if (!responseItem) {
    return state;
  }

  const answer = payload.newAnswer;
  responseItem.answer = answer;

  // runEnableWhen(payload, state);

  return state;
}
function processNewAnswerValuesAction(payload: AnswerValuesItemPayload, state: Form): Form {
  for (const item of payload) {
    processNewAnswerValueAction(item, state);
  }
  return state;
}
function processNewValueAction(payload: NewValuePayload, state: Form): Form {
  const responseItem = getResponseItemWithPath(payload.itemPath || [], state.FormData);

  if (!responseItem) {
    return state;
  }

  let hasAnswer = false;

  if (!responseItem.answer) {
    responseItem.answer = [];
  }

  let answer: QuestionnaireResponseItemAnswer = responseItem.answer[0];
  if (!answer) {
    answer = {};
    responseItem.answer.push(answer);
  }

  if (payload.valueBoolean !== undefined) {
    hasAnswer = true;
    answer.valueBoolean = payload.valueBoolean;
  }
  if (payload.valueDecimal !== undefined && !isNaN(payload.valueDecimal)) {
    hasAnswer = true;
    answer.valueDecimal = payload.valueDecimal;
  }
  if (payload.valueInteger !== undefined && !isNaN(payload.valueInteger)) {
    hasAnswer = true;
    answer.valueInteger = payload.valueInteger;
  }
  if (!isStringEmpty(payload.valueDate)) {
    hasAnswer = true;
    answer.valueDate = payload.valueDate;
  }
  if (!isStringEmpty(payload.valueDateTime)) {
    hasAnswer = true;
    answer.valueDateTime = payload.valueDateTime;
  }
  if (!isStringEmpty(payload.valueTime)) {
    hasAnswer = true;
    answer.valueTime = payload.valueTime;
  }
  if (!isStringEmpty(payload.valueString)) {
    hasAnswer = true;
    answer.valueString = payload.valueString;
  }
  if (payload.valueQuantity && payload.valueQuantity.value !== undefined) {
    hasAnswer = true;
    answer.valueQuantity = payload.valueQuantity;
  }
  if (payload.valueCoding) {
    hasAnswer = true;

    const coding: Coding = {
      code: payload.valueCoding.code,
      display: payload.valueCoding.display,
    };

    if (payload.valueCoding.system !== undefined && payload.valueCoding.system !== null) {
      coding.system = payload.valueCoding.system;
    }

    if (payload.multipleAnswers) {
      if (Object.keys(answer).length === 0) {
        answer.valueCoding = coding;
      } else {
        const newAnswer: QuestionnaireResponseItemAnswer = {};
        newAnswer.valueCoding = coding;
        responseItem.answer.push(newAnswer);
      }
    } else {
      answer.valueCoding = coding;
    }
  }
  if (payload.valueAttachment && Object.keys(payload.valueAttachment).length > 0) {
    hasAnswer = true;

    const attachment: Attachment = {
      id: payload.valueAttachment.id,
      url: payload.valueAttachment.url,
      title: payload.valueAttachment.title,
      data: payload.valueAttachment.data,
      contentType: payload.valueAttachment.contentType,
      creation: payload.valueAttachment.creation,
      hash: payload.valueAttachment.hash,
      size: payload.valueAttachment.size,
      language: payload.valueAttachment.language,
    };

    if (payload.multipleAnswers) {
      if (Object.keys(answer).length === 0) {
        answer.valueAttachment = attachment;
      } else {
        const newAnswer: QuestionnaireResponseItemAnswer = {};
        newAnswer.valueAttachment = attachment;
        responseItem.answer.push(newAnswer);
      }
    } else {
      answer.valueAttachment = attachment;
    }
  }
  if (!hasAnswer) {
    nullAnswerValue(answer);
    if (Object.keys(answer).filter(prop => !prop.startsWith('value')).length === 0) {
      if (responseItem.answer && responseItem.answer.length === 1) {
        delete responseItem.answer;
      }
    }
  }
  // runEnableWhen(payload, state);
  return state;
}

function processNewCodingStringValueAction(action: NewValuePayload, state: Form): Form {
  const responseItem = getResponseItemWithPath(action.itemPath || [], state.FormData);
  if (!responseItem) {
    return state;
  }

  if (!responseItem.answer) {
    responseItem.answer = [];
  }

  if (!isStringEmpty(action.valueString)) {
    let found = -1;
    for (let i = 0; i < responseItem.answer.length; i++) {
      if (!isStringEmpty(responseItem.answer[i].valueString)) {
        found = i;
        break;
      }
    }

    const newAnswer: QuestionnaireResponseItemAnswer = {
      valueString: action.valueString,
    };

    if (found >= 0) {
      responseItem.answer[found] = newAnswer;
    } else {
      responseItem.answer.push(newAnswer);
    }
  }
  return state;
}

export function getFormDefinition(state: GlobalState): FormDefinition | null {
  if (!state.refero.form.FormDefinition) {
    return null;
  }
  return state.refero.form.FormDefinition;
}

export function nullAnswerValue(
  answer: QuestionnaireResponseItemAnswer,
  initialAnswer: QuestionnaireResponseItemAnswer | undefined = undefined
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
  } else if (answer.valueQuantity !== undefined) {
    initialAnswer ? (answer.valueQuantity = initialAnswer.valueQuantity) : delete answer.valueQuantity;
  } else if (answer.valueAttachment !== undefined) {
    initialAnswer ? (answer.valueAttachment = initialAnswer.valueAttachment) : delete answer.valueAttachment;
  }
}

function processSetSkjemaDefinition(payload: SetFormDefinitionAction, state: Form): Form {
  if (!payload) {
    return state;
  }

  const formDefinition: FormDefinition = {
    Content: payload.questionnaire,
  };
  const statetest = current(state.FormData);

  let formData: FormData;

  if (payload.questionnaireResponse && payload.syncQuestionnaireResponse) {
    formData = { Content: syncQuestionnaireResponse(payload.questionnaire, payload.questionnaireResponse), isExternalUpdate: true };
  } else if (payload.questionnaireResponse) {
    formData = { Content: payload.questionnaireResponse, isExternalUpdate: true };
  } else if (statetest?.Content === initialState.FormData.Content) {
    formData = { Content: generateQuestionnaireResponse(payload.questionnaire) };
  } else {
    formData = state.FormData;
  }
  state.FormDefinition = formDefinition;

  state.FormData = formData;
  state.Language = payload.language || state.Language;
  return state;
}
