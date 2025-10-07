/* eslint-disable no-console */
import { createListenerMiddleware, isAnyOf, PayloadAction } from '@reduxjs/toolkit';

import type { AppDispatch, GlobalState } from '@/reducers';
import type { Path } from '@/util/refero-core';
import type { QuestionnaireItem } from 'fhir/r4';

import {
  newValue,
  newAnswerValueAction,
  newAnswerValuesAction,
  removeCodingStringValueAction,
  removeCodingValueAction,
  type NewValuePayload,
  type AnswerValueItemPayload,
  type AnswerValuesItemPayload,
  type RemoveCodingStringPayload,
  type RemoveCodingValuePayload,
  type RemoveAttachmentPayload,
  type RepeatItemPayload,
  type DeleteRepeatItemPayload,
} from '@/actions/newValue';
import { postRunEnableWhenToWorker } from '@/workers/fhirpath-rpc';

/**
 * Middleware for handling enableWhen logic in the questionnaire.
 * THIS IS NOT ENABLED AT THE MOMENT, DO NOT USE AS IS
 */
export const enableWhenListener = createListenerMiddleware();

type EnableWhenPayload =
  | NewValuePayload
  | AnswerValueItemPayload
  | RemoveCodingStringPayload
  | RemoveCodingValuePayload
  | RemoveAttachmentPayload
  | RepeatItemPayload
  | DeleteRepeatItemPayload
  | AnswerValuesItemPayload;

const isArrayPayload = (p: EnableWhenPayload): p is AnswerValuesItemPayload => Array.isArray(p);
const hasItemPath = (p: unknown): p is { itemPath?: Path[]; item?: QuestionnaireItem } => !!p && typeof p === 'object' && 'itemPath' in p;
const hasParentPath = (p: unknown): p is { parentPath?: Path[]; item?: QuestionnaireItem } =>
  !!p && typeof p === 'object' && 'parentPath' in p;

const pickSingle = (p: EnableWhenPayload): { itemPath?: Path[]; item?: QuestionnaireItem } | undefined => {
  if (isArrayPayload(p)) {
    const last = p[p.length - 1];
    return last ? { itemPath: last.itemPath, item: last.item } : undefined;
  }
  if (hasItemPath(p)) return { itemPath: p.itemPath, item: p.item };
  if (hasParentPath(p)) return { itemPath: p.parentPath, item: p.item };
  return undefined;
};
const startTyped = enableWhenListener.startListening.withTypes<GlobalState, AppDispatch>();
startTyped({
  matcher: isAnyOf(newValue, newAnswerValueAction, removeCodingStringValueAction, removeCodingValueAction),
  effect: async (action: PayloadAction<EnableWhenPayload>, api) => {
    api.cancelActiveListeners();
    await api.delay(80);
    const state = api.getState();
    const form = state.refero.form;

    if (!form?.FormData?.Content || !form?.FormDefinition?.Content) {
      return;
    }

    const single = pickSingle(action.payload);

    if (!single) {
      return;
    }

    const req = {
      action: {
        item: single.item,
        itemPath: single.itemPath,
      },
      formData: form.FormData,
      formDefinition: form.FormDefinition,
    };

    let result:
      | {
          answerValues: AnswerValuesItemPayload;
        }
      | undefined;

    try {
      const { answerValues } = await postRunEnableWhenToWorker(req);
      result = { answerValues: answerValues ?? [] };
    } catch (_e) {
      console.log('error', _e);
      // ignore feil fra worker
    }

    if (!result) {
      return;
    }

    const { answerValues } = result;

    // if (repeatRemovals?.length) {
    //   for (const r of repeatRemovals) {
    //     const payload: DeleteRepeatItemPayload = {
    //       itemPath: r.itemPath,
    //       item: r.item,
    //     } as DeleteRepeatItemPayload;

    //     api.dispatch(deleteRepeatItemAction(payload));
    //   }
    // }

    if (!answerValues?.length) {
      return;
    }

    const plainBatch = answerValues.map(av => ({
      itemPath: av.itemPath,
      newAnswer: av.newAnswer,
      item: av.item ? av.item : undefined,
    }));

    let batchOk = false;
    try {
      api.dispatch(newAnswerValuesAction(plainBatch));
      batchOk = true;
    } catch (err) {
      console.error(err);
    }

    if (!batchOk) {
      for (const one of plainBatch) {
        try {
          api.dispatch(newAnswerValueAction(one));
        } catch (singleErr) {
          console.error(singleErr);
        }
      }
    }
  },
});
