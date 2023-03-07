import produce, { enableES5 } from 'immer';

import {
  Questionnaire,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
  QuestionnaireItem,
  QuestionnaireItemEnableWhen,
  QuestionnaireResponse,
  Coding,
  Attachment,
  QuestionnaireItemEnableBehaviorCodes,
} from '../types/fhir';

import { LanguageLocales } from '@helsenorge/core-utils/constants/languages';

import { FormAction, SET_SKJEMA_DEFINITION } from '../actions/form';
import { generateQuestionnaireResponse } from '../actions/generateQuestionnaireResponse';
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
import { syncQuestionnaireResponse } from '../actions/syncQuestionnaireResponse';
import { GlobalState } from '../reducers/index';
import { createQuestionnaireResponseAnswer } from '../util/createQuestionnaireResponseAnswer';
import { getMinOccursExtensionValue } from '../util/extension';
import { isStringEmpty } from '../util/index';
import {
  getResponseItemWithPath,
  getQuestionnaireDefinitionItem,
  getQuestionnaireResponseItemWithLinkid,
  getResponseItems,
  getDefinitionItems,
  enableWhenMatchesAnswer,
  getArrayContainingResponseItemFromItems,
  Path,
  getResponseItemAndPathWithLinkId,
  getQuestionnaireDefinitionItemWithLinkid,
} from '../util/refero-core';

enableES5();

export interface FormData {
  Content: QuestionnaireResponse | null | undefined;
}

export interface FormDefinition {
  Content: Questionnaire | null | undefined;
}

export interface Form {
  FormData: FormData;
  FormDefinition: FormDefinition;
  Language: string;
}

interface QrItemsToClear {
  qItemWithEnableWhen: QuestionnaireItem;
  linkId: string;
}

const initialState: Form = {
  FormData: {
    Content: null,
  },
  FormDefinition: {
    Content: null,
  },
  Language: LanguageLocales.NORWEGIAN.toLowerCase(),
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
  if (!state.refero.form.FormData) {
    return null;
  }
  return state.refero.form.FormData;
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
  return produce(state, draft => {
    if (!action.parentPath) {
      return state;
    }

    let arrayToAddItemTo: Array<QuestionnaireResponseItem> | undefined = [];
    if (action.parentPath.length === 0 && draft.FormData.Content) {
      arrayToAddItemTo = draft.FormData.Content.item;
    } else if (action.parentPath.length > 0) {
      // length >1 means group wrapped in group
      const itemToAddTo = getResponseItemWithPath(action.parentPath, draft.FormData);
      arrayToAddItemTo = getArrayToAddGroupTo(itemToAddTo);
    }

    if (!arrayToAddItemTo || arrayToAddItemTo.length === 0) {
      return;
    }

    if (!action.responseItems || action.responseItems.length === 0) {
      return;
    }

    const newItem = copyItem(
      action.responseItems[0],
      undefined,
      draft.FormDefinition.Content as Questionnaire,
      state.FormDefinition.Content as Questionnaire
    );
    if (!newItem) {
      return;
    }

    const indexToInsert = arrayToAddItemTo.map(o => o.linkId).lastIndexOf(newItem.linkId);
    arrayToAddItemTo.splice(indexToInsert + 1, 0, newItem);
  });
}

function processDeleteRepeatItemAction(action: NewValueAction, state: Form): Form {
  return produce(state, draft => {
    if (!action.itemPath) {
      return state;
    }

    let arrayToDeleteItem: Array<QuestionnaireResponseItem> | undefined = [];
    if (action.itemPath.length === 1 && draft.FormData.Content) {
      arrayToDeleteItem = draft.FormData.Content.item;
    } else if (action.itemPath.length > 0) {
      // length >1 means group wrapped in group
      const parentPath = action.itemPath.slice(0, -1);
      const itemToAddTo = getResponseItemWithPath(parentPath, draft.FormData);
      arrayToDeleteItem = getArrayToAddGroupTo(itemToAddTo);
    }

    if (!arrayToDeleteItem || arrayToDeleteItem.length === 0) {
      return;
    }

    if (!action.item) {
      return;
    }
    const definitionLinkId = action.item.linkId;
    const index = action.itemPath[action.itemPath.length - 1].index;
    let itemIndexInArray = 0;
    for (let i = 0; i <= arrayToDeleteItem.length - 1; i++) {
      if (arrayToDeleteItem[i].linkId === definitionLinkId) {
        if (itemIndexInArray === index) {
          arrayToDeleteItem.splice(i, 1);
          break;
        }
        itemIndexInArray++;
      }
    }
  });
}

function copyItem(
  source: QuestionnaireResponseItem,
  target: QuestionnaireResponseItem | undefined,
  questionnaireDraft: Questionnaire,
  questionnaire: Questionnaire
): QuestionnaireResponseItem {
  if (!target) {
    target = { linkId: source.linkId } as QuestionnaireResponseItem;

    if (source.text) {
      target.text = source.text;
    }
  }

  for (let i = 0; source.item && i < source.item.length; i++) {
    if (!target.item) {
      target.item = [];
    }
    const newResponseItem = {
      linkId: source.item[i].linkId,
    } as QuestionnaireResponseItem;
    if (source.item[i].text) {
      newResponseItem.text = source.item[i].text;
    }

    const numberOfItemsWithSameLinkId = target.item.filter(item => item.linkId === newResponseItem.linkId).length;

    if (numberOfItemsWithSameLinkId > 0) {
      const defItem = getQuestionnaireDefinitionItem(newResponseItem.linkId, questionnaireDraft.item);

      const minOccurs = defItem ? getMinOccursExtensionValue(defItem) || 1 : 1;
      if (numberOfItemsWithSameLinkId >= minOccurs) {
        continue;
      }
    }

    target.item.push(newResponseItem);
    copyItem(source.item[i], newResponseItem, questionnaireDraft, questionnaire);
  }
  const defItem = getQuestionnaireDefinitionItem(source.linkId, questionnaireDraft.item);

  if (defItem && defItem.type !== 'attachment') {
    for (let i = 0; source.answer && i < source.answer.length; i++) {
      if (!source.answer[i].item || source.answer[i].item?.length === 0) continue;

      if (!target.answer) {
        target.answer = [];
      }
      const answer = source.answer[i];
      const targetAnswer = {
        item: [] as QuestionnaireResponseItem[],
      } as QuestionnaireResponseItemAnswer;

      for (let j = 0; answer && answer.item && j < answer.item.length; j++) {
        const newResponseItem = {
          linkId: answer.item[j].linkId,
          answer: getInitialAnswerForCopyItem(source, questionnaire, answer.item[j]),
          text: answer.item[j]?.text,
        } as QuestionnaireResponseItem;
        (targetAnswer.item as QuestionnaireResponseItem[]).push(newResponseItem);
        target.text = source.text;
        copyItem(answer.item[j], newResponseItem, questionnaireDraft, questionnaire);
      }

      target.answer.push(targetAnswer);
    }
  }

  return target;
}

function getInitialAnswerForCopyItem(source: QuestionnaireResponseItem, questionnaire: Questionnaire, qrItem: QuestionnaireResponseItem): QuestionnaireResponseItemAnswer[] {
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

function runEnableWhen(action: NewValueAction, state: Form, draft: Form): void {
  if (action.item && draft.FormData.Content) {
    const qrItemsToClear: Array<QrItemsToClear> = [];
    /*
     * immer lager javascript proxy-objekt av "draft"-variablen i produce, og dersom man oppretter nye variabler eller utleder
     * noe fra draft, blir disse også proxy-objekter, og denne opprettelsen går tregt. Det beste er å bruke "state"-variablen
     * for beregninger der det lar seg gjøre, for det går raskt. Koden under regner ut hva som må endres ved å bruke state, og
     * så gjøres endringen på draft. På skjema med mange enableWhen kan man da spare flere sekunder når noe fylles ut.
     */
    const responseItems = getResponseItems(draft.FormData);
    // lag en kopi som kan oppdateres underveis, for å beregne multiple dependent enableWhen items
    const calculatedResponseItems = JSON.parse(JSON.stringify(responseItems));
    calculateEnableWhenItemsToClear(
      [action.item],
      state.FormData,
      state.FormDefinition,
      action.itemPath,
      qrItemsToClear,
      calculatedResponseItems
    );

    if (responseItems && responseItems.length > 0) {
      for (let w = 0; w < qrItemsToClear.length; w++) {
        const qrItemWithEnableWhen = getResponseItemWithLinkIdPossiblyContainingRepeat(
          qrItemsToClear[w].linkId,
          responseItems,
          action.itemPath
        );
        if (qrItemWithEnableWhen) {
          // prøv å finne linkId for item som skal cleares i barn først. (for repeterende elementer som må cleare riktig barn).
          removeAddedRepeatingItems(qrItemsToClear[w].qItemWithEnableWhen, qrItemWithEnableWhen, responseItems);
          wipeAnswerItems(qrItemWithEnableWhen, qrItemsToClear[w].qItemWithEnableWhen);
        } else {
          // let gjennom hele skjema, og clear riktig item. Hvis vi havner her er item som skal cleares ikke et barn under action.itemPath
          const qrItemWithEnableWhen = getResponseItemAndPathWithLinkId(qrItemsToClear[w].linkId, draft.FormData.Content);
          for (let r = 0; r < qrItemWithEnableWhen.length; r++) {
            removeAddedRepeatingItems(qrItemsToClear[w].qItemWithEnableWhen, qrItemWithEnableWhen[r].item, responseItems);
            wipeAnswerItems(qrItemWithEnableWhen[r].item, qrItemsToClear[w].qItemWithEnableWhen);
          }
        }
      }
    }
  }
}

function processRemoveCodingValueAction(action: NewValueAction, state: Form): Form {
  return produce(state, draft => {
    const responseItem = getResponseItemWithPath(action.itemPath || [], draft.FormData);
    if (!responseItem || !responseItem.answer || !responseItem.answer.length) {
      return;
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
    runEnableWhen(action, state, draft);
  });
}

function processRemoveCodingStringValueAction(action: NewValueAction, state: Form): Form {
  return produce(state, draft => {
    const responseItem = getResponseItemWithPath(action.itemPath || [], draft.FormData);
    if (!responseItem || !responseItem.answer || !responseItem.answer.length) {
      return;
    }

    responseItem.answer = responseItem.answer.filter(el => {
      return el && el.valueString ? false : true;
    });

    if (responseItem.answer.length === 0) {
      delete responseItem.answer;
    }

    // run enableWhen to clear fields
    runEnableWhen(action, state, draft);
  });
}

function processRemoveAttachmentValueAction(action: NewValueAction, state: Form): Form {
  return produce(state, draft => {
    const responseItem = getResponseItemWithPath(action.itemPath || [], draft.FormData);
    if (!responseItem || !responseItem.answer || !responseItem.answer.length) {
      return;
    }

    if (action.valueAttachment) {
      const attachmentToRemove = action.valueAttachment.url;
      responseItem.answer = responseItem.answer.filter(el => el && el.valueAttachment && el.valueAttachment.url !== attachmentToRemove);
    }

    if (responseItem.answer.length === 0) {
      delete responseItem.answer;
    }
  });
}

function processNewValueAction(action: NewValueAction, state: Form): Form {
  return produce(state, draft => {
    const responseItem = getResponseItemWithPath(action.itemPath || [], draft.FormData);
    if (!responseItem) {
      return;
    }

    let hasAnswer = false;

    if (!responseItem.answer) {
      responseItem.answer = [];
    }

    let answer = responseItem.answer[0];
    if (!answer) {
      answer = {} as QuestionnaireResponseItemAnswer;
      responseItem.answer.push(answer);
    }

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
    if (action.valueQuantity && action.valueQuantity.value !== undefined) {
      hasAnswer = true;
      answer.valueQuantity = action.valueQuantity;
    }
    if (action.valueCoding) {
      hasAnswer = true;

      const coding = {
        code: action.valueCoding.code,
        display: action.valueCoding.display,
      } as Coding;

      if (action.valueCoding.system !== undefined && action.valueCoding.system !== null) {
        coding.system = action.valueCoding.system;
      }

      if (action.multipleAnswers) {
        if (Object.keys(answer).length === 0) {
          answer.valueCoding = coding;
        } else {
          const newAnswer = {} as QuestionnaireResponseItemAnswer;
          newAnswer.valueCoding = coding;
          responseItem.answer.push(newAnswer);
        }
      } else {
        answer.valueCoding = coding;
      }
    }
    if (action.valueAttachment && Object.keys(action.valueAttachment).length > 0) {
      hasAnswer = true;

      const attachment = {
        url: action.valueAttachment.url,
        title: action.valueAttachment.title,
        data: action.valueAttachment.data,
        contentType: action.valueAttachment.contentType,
        creation: action.valueAttachment.creation,
        hash: action.valueAttachment.hash,
        size: action.valueAttachment.size,
        language: action.valueAttachment.language,
      } as Attachment;

      if (action.multipleAnswers) {
        if (Object.keys(answer).length === 0) {
          answer.valueAttachment = attachment;
        } else {
          const newAnswer = {} as QuestionnaireResponseItemAnswer;
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
    runEnableWhen(action, state, draft);
  });
}

function processNewCodingStringValueAction(action: NewValueAction, state: Form): Form {
  return produce(state, draft => {
    const responseItem = getResponseItemWithPath(action.itemPath || [], draft.FormData);
    if (!responseItem) {
      return;
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

      const newAnswer = {
        valueString: action.valueString,
      } as QuestionnaireResponseItemAnswer;

      if (found >= 0) {
        responseItem.answer[found] = newAnswer;
      } else {
        responseItem.answer.push(newAnswer);
      }
    }
  });
}

function getResponseItemWithLinkIdPossiblyContainingRepeat(
  linkId: string,
  items: Array<QuestionnaireResponseItem>,
  path: Array<Path> | undefined
): QuestionnaireResponseItem | undefined {
  const findResponseItem = (linkId: string, items: Array<QuestionnaireResponseItem>): QuestionnaireResponseItem | undefined => {
    for (const item of items) {
      const result = getQuestionnaireResponseItemWithLinkid(linkId, item, path || []);
      if (result) return result;
    }
  };

  return findResponseItem(linkId, items);
}

function calculateEnableWhenItemsToClear(
  items: QuestionnaireItem[],
  formData: FormData,
  formDefinition: FormDefinition,
  path: Array<Path> | undefined,
  qrItemsToClear: Array<QrItemsToClear>,
  responseItems: QuestionnaireResponseItem[] | undefined
): void {
  if (!items || !formData.Content) {
    return;
  }
  const definitionItems = getDefinitionItems(formDefinition);
  if (!responseItems || responseItems.length === 0) {
    return;
  }

  // Find all items with an enableWhen-clause
  const qitemsWithEnableWhen: QuestionnaireItem[] = [];
  for (let i = 0; i < items.length; i++) {
    if (definitionItems) {
      qitemsWithEnableWhen.push(...getItemsWithEnableWhen(items[i].linkId, definitionItems));
    }
  }
  if (!qitemsWithEnableWhen || qitemsWithEnableWhen.length === 0) {
    return;
  }

  for (const qItemWithEnableWhen of qitemsWithEnableWhen) {
    const enableWhenClauses = qItemWithEnableWhen.enableWhen;
    if (!enableWhenClauses) {
      continue;
    }

    // There may be several questionnaireResponseItemsWithEnableWhen corresponding to a questionnaireItemWithEnableWhen.
    // F.ex. if the questionnaireItemWithEnableWhen is repeatable
    const qrItemsWithEnableWhen = getResponseItemAndPathWithLinkId(qItemWithEnableWhen.linkId, formData.Content);
    for (const qrItemWithEnableWhen of qrItemsWithEnableWhen) {
      const enableMatches: Array<boolean> = [];
      const enableBehavior = qItemWithEnableWhen.enableBehavior;

      enableWhenClauses.forEach((enableWhen: QuestionnaireItemEnableWhen) => {
        const enableWhenQuestionItem = getQuestionnaireDefinitionItem(enableWhen.question, definitionItems);
        if (!enableWhenQuestionItem) return;

        // find responseItem corresponding to enableWhen.question. Looks both for X.Y.Z and X.Y.Z^r
        const responseItem = getResponseItemWithLinkIdPossiblyContainingRepeat(enableWhen.question, responseItems, path);

        if (responseItem) {
          const matchesAnswer = enableWhenMatchesAnswer(enableWhen, responseItem.answer);
          enableMatches.push(matchesAnswer);
        }
      });

      const enable =
        enableBehavior === QuestionnaireItemEnableBehaviorCodes.ALL
          ? enableMatches.every(x => x === true)
          : enableMatches.some(x => x === true);

      if (!enable) {
        const item = getResponseItemWithLinkIdPossiblyContainingRepeat(qrItemWithEnableWhen.item.linkId, responseItems, path);
        if (item) {
          // fjern svar i responseItems som brukes for å beregne hvilke felter som skal tømmes til slutt
          removeAddedRepeatingItems(qItemWithEnableWhen, item, responseItems);
          wipeAnswerItems(item, qItemWithEnableWhen);
        }
        qrItemsToClear.push({
          qItemWithEnableWhen: qItemWithEnableWhen,
          linkId: qrItemWithEnableWhen.item.linkId,
        });
      }
    }
  }
  calculateEnableWhenItemsToClear(qitemsWithEnableWhen, formData, formDefinition, path, qrItemsToClear, responseItems);

  qitemsWithEnableWhen.forEach(
    i => i.item && calculateEnableWhenItemsToClear(i.item, formData, formDefinition, path, qrItemsToClear, responseItems)
  );
}

// This should remove repeated items, but not the original, so remove index
// 1 and 2 , but not 0 (remove 4.1^1 and 4.1^2, keep 4.1^0)
// So if you click add on a repeated item in an enableWhen,
// collapse the enableWhen and expand it again, the added items should be gone.
// Go through the array backwards and delete, so not to screw up the indices we're looping over.
function removeAddedRepeatingItems(
  defItem: QuestionnaireItem,
  repeatingItemLinkId: QuestionnaireResponseItem,
  responseItems: QuestionnaireResponseItem[]
): void {
  if (defItem.repeats) {
    const arrayToDeleteItem = getArrayContainingResponseItemFromItems(repeatingItemLinkId.linkId, responseItems);
    const minOccurs = getMinOccursExtensionValue(defItem);
    if (arrayToDeleteItem) {
      const keepThreshold = minOccurs ? minOccurs : 1;
      let repeatingItemIndex = arrayToDeleteItem.filter(item => item.linkId === repeatingItemLinkId.linkId).length;
      for (let i = arrayToDeleteItem.length - 1; i >= 0; i--) {
        const e = arrayToDeleteItem[i];
        if (e.linkId === defItem.linkId) {
          if (repeatingItemIndex > keepThreshold) {
            arrayToDeleteItem.splice(i, 1);
          }
          repeatingItemIndex--;
        }
      }
    }
  }
}

export function getFormDefinition(state: GlobalState): FormDefinition | null {
  if (!state.refero.form.FormDefinition) {
    return null;
  }
  return state.refero.form.FormDefinition;
}

function wipeAnswerItems(answerItem: QuestionnaireResponseItem | undefined, item: QuestionnaireItem | undefined): undefined {
  if (!answerItem || !item) {
    return undefined;
  }

  if (answerItem.answer) {
    answerItem.answer.forEach(answer => {
      resetAnswerValue(answer, item);
    });

    // prune empty answers
    for (let i = answerItem.answer.length - 1; i >= 0; i--) {
      const a = answerItem.answer[i];
      if (Object.keys(a).length === 0) answerItem.answer.splice(i, 1);
    }
  }

  for (let i = 0; answerItem.item && item.item && i < answerItem.item.length; i++) {
    wipeAnswerItems(answerItem.item[i], item.item[i]);
  }

  for (let i = 0; answerItem.answer && item.item && i < answerItem.answer.length; i++) {
    const nestedItems = answerItem.answer[i].item;
    if (nestedItems && nestedItems.length > 0) {
      for (let j = 0; j < nestedItems.length; j++) {
        wipeAnswerItems(nestedItems[j], item.item[i]);
      }
    }
  }
}

function resetAnswerValue(answer: QuestionnaireResponseItemAnswer, item: QuestionnaireItem): void {
  const initialAnswer = createQuestionnaireResponseAnswer(item);
  nullAnswerValue(answer, initialAnswer);
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

function getItemsWithEnableWhen(linkId: string, definitionItems: QuestionnaireItem[]): QuestionnaireItem[] {
  const relatedItems: QuestionnaireItem[] = [];
  const getQuestionnaireItemHasEnableWhenLinkid = function (linkId: string, definitionItem: QuestionnaireItem | undefined): void {
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
    const enableWhen = definitionItems[k].enableWhen;
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

function getItemEnableWhenQuestionMatchIdFromArray(linkId: string, definitionItems: QuestionnaireItem[] | undefined): QuestionnaireItem[] {
  if (!definitionItems) {
    return [];
  }
  const matchedItems: QuestionnaireItem[] = [];
  for (let i = 0; i < definitionItems.length; i++) {
    const enableWhen = definitionItems[i].enableWhen;
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
  if (action.questionnaireResponse && action.syncQuestionnaireResponse) {
    formData = { Content: syncQuestionnaireResponse(action.questionnaire, action.questionnaireResponse) };
  } else if (action.questionnaireResponse) {
    formData = { Content: action.questionnaireResponse };
  } else if (state.FormData === initialState.FormData) {
    formData = { Content: generateQuestionnaireResponse(action.questionnaire) };
  } else {
    formData = state.FormData;
  }

  return {
    ...state,
    FormDefinition: formDefinition,
    FormData: formData,
    Language: action.language || state.Language,
  };
}
