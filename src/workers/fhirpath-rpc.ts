/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import type { QuestionnaireItem, Extension, QuestionnaireResponse, QuestionnaireResponseItem, Questionnaire } from 'fhir/r4';
import type { Path } from 'fhirpath';

import { AnyRpcResponse, Methods } from './fhirpath-rpc-worker';
import { runCalculators } from './helpers';
import { WorkaroundWorkerRpc } from './WorkaroundWorkerRpc';

import { RunEnableWhenParams, runEnableWhenPure } from '@/calculators/runEnableWhen_pure';
import {
  evaluateFhirpathExpressionToGetDate as evaluateFhirpathExpressionToGetDateCore,
  getAnswerFromResponseItem as getAnswerFromResponseItemCore,
  descendantsHasAnswer as descendantsHasAnswerCore,
  hasDescendants as hasDescendantsCore,
  evaluateFhirpathExpressionToGetString as evaluateFhirpathExpressionToGetStringCore,
  evaluateFhirpathExpression as evaluateFhirpathExpressionCore,
  evaluateExtension as evaluateExtensionCore,
  isGroupAndDescendantsHasAnswer as isGroupAndDescendantsHasAnswerCore,
  getResonseItem as getResponseItemCore,
} from '@/util/fhirpathHelper';

function isStructuredCloneable(o: unknown): { ok: boolean; error?: unknown } {
  try {
    if (typeof (globalThis as any).structuredClone === 'function') {
      (globalThis as any).structuredClone(o);
    } else {
      JSON.stringify(o);
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e };
  }
}

type Awaitable<T> = T | Promise<T>;
type AwaitedResult<M extends keyof Methods> = Awaited<Methods[M]['result']>;

type Pending<M extends keyof Methods = keyof Methods> = {
  id: number;
  method: M;
  params: Methods[M]['params'];
  resolve: (v: AwaitedResult<M>) => void;
  reject: (e: unknown) => void;
  timeoutId?: ReturnType<typeof setTimeout>;
  enqueuedAt: number;
  startedAt?: number;
};

let worker: Worker | null = null;
let disabled = false;
let seq = 1;

const taskQueue: Pending[] = [];
let currentTask: Pending | null = null;

const REQUEST_TIMEOUT_MS = 10_000;
const OVERALL_TIMEOUT_MS = 20_000;

// ------------------------ Worker lifecycle ----------------------------------

function safeCreateWorker(): Worker | null {
  if (typeof Worker === 'undefined') {
    return null;
  }
  try {
    const w = WorkaroundWorkerRpc({ name: 'fhirpath-rpc' });

    w.onmessage = (ev: MessageEvent<AnyRpcResponse>) => {
      const data = ev.data || {};
      const p = currentTask;
      if (!p || data.id !== p.id) {
        return;
      }

      clearTimeoutIfAny(p);
      const inFlightTimer = (p as any).__inFlightTimer as ReturnType<typeof setTimeout> | undefined;
      if (inFlightTimer) clearTimeout(inFlightTimer);

      currentTask = null;

      if (data.ok) {
        (p.resolve as (v: unknown) => void)(data.result);
      } else {
        disabled = true;
        try {
          worker?.terminate();
        } catch (e) {
          // ignores;
        }
        worker = null;
        callOnMain(p.method as never, p.params as never).then(p.resolve, p.reject);
      }

      processQueue();
    };

    w.onerror = (evt: ErrorEvent) => {
      disableWorkerAndFallbackAll(evt.error ?? evt.message);
    };

    w.onmessageerror = (_evt: MessageEvent) => {
      disableWorkerAndFallbackAll('onmessageerror');
    };

    return w;
  } catch (e) {
    return null;
  }
}

function getWorker(): Worker | null {
  if (disabled) {
    return null;
  }
  if (!worker) {
    worker = safeCreateWorker();
    if (!worker) {
      disabled = true;
    }
  }
  return worker;
}

function disableWorkerAndFallbackAll(_reason: unknown) {
  disabled = true;

  const inFlight = currentTask;
  currentTask = null;
  if (inFlight) {
    clearTimeoutIfAny(inFlight);
    const inFlightTimer = (inFlight as any).__inFlightTimer as ReturnType<typeof setTimeout> | undefined;
    if (inFlightTimer) clearTimeout(inFlightTimer);

    callOnMain(inFlight.method as never, inFlight.params as never).then(inFlight.resolve, inFlight.reject);
  }

  while (taskQueue.length) {
    const t = taskQueue.shift()!;
    clearTimeoutIfAny(t);
    const inflightTimer = (t as any).__inFlightTimer as ReturnType<typeof setTimeout> | undefined;
    if (inflightTimer) clearTimeout(inflightTimer);

    callOnMain(t.method as never, t.params as never).then(t.resolve, t.reject);
  }

  try {
    worker?.terminate();
  } catch (e) {
    // ignores;
  }
  worker = null;
}

function clearTimeoutIfAny(p: Pending) {
  if (p.timeoutId) clearTimeout(p.timeoutId);
}

// ------------------------ Strongly-typed handlers ---------------------------

const handlers = {
  evaluateFhirpathExpressionToGetDate: ({ item, fhirExpression }) => evaluateFhirpathExpressionToGetDateCore(item, fhirExpression),
  getAnswerFromResponseItem: ({ responseItem }) => getAnswerFromResponseItemCore(responseItem),
  getResponseItem: ({ linkId, response }) => getResponseItemCore(linkId, response),
  descendantsHasAnswer: ({ questionnaire }) => descendantsHasAnswerCore(questionnaire),
  hasDescendants: ({ questionnaire }) => hasDescendantsCore(questionnaire),
  evaluateFhirpathExpressionToGetString: ({ fhirExtension, questionnaire }) =>
    evaluateFhirpathExpressionToGetStringCore(fhirExtension, questionnaire),
  evaluateFhirpathExpression: ({ expression, context }) => evaluateFhirpathExpressionCore(expression, context),
  evaluateExtension: ({ path, questionnaire, context }) => evaluateExtensionCore(path, questionnaire, context),
  isGroupAndDescendantsHasAnswer: ({ responseItem }) => isGroupAndDescendantsHasAnswerCore(responseItem),
  runCalculators: ({ questionnaireResponse, questionnaire }) => runCalculators({ questionnaireResponse, questionnaire }),
  runEnableWhen: p => runEnableWhenPure(p),
} satisfies {
  [K in keyof Methods]: (params: Methods[K]['params']) => Awaitable<Methods[K]['result']>;
};

// ------------------------ Fallback executor (main) --------------------------

function callOnMain<M extends keyof Methods>(method: M, params: Methods[M]['params']): Promise<AwaitedResult<M>> {
  const fn = handlers[method] as (p: Methods[M]['params']) => Awaitable<Methods[M]['result']>;
  return Promise.resolve(fn(params)) as Promise<AwaitedResult<M>>;
}

// ------------------------ Timeouts ------------------------------------------

function armOverallTimeout(p: Pending) {
  if (p.timeoutId) return;
  p.timeoutId = setTimeout(() => {
    // If it's the current task, in-flight timeout will handle it
    if (currentTask && currentTask.id === p.id) return;

    const idx = taskQueue.findIndex(t => t.id === p.id);
    if (idx >= 0) {
      const [timedOut] = taskQueue.splice(idx, 1);
      clearTimeoutIfAny(timedOut);

      // Policy: disable worker on overall timeout to avoid more stuck tasks
      disabled = true;
      try {
        worker?.terminate();
      } catch (e) {
        // ignores;
      }
      worker = null;

      callOnMain(timedOut.method as never, timedOut.params as never)
        .then(timedOut.resolve, timedOut.reject)
        .finally(processQueue);
    }
  }, OVERALL_TIMEOUT_MS);
}

// ------------------------ Queue + Call --------------------------------------

function processQueue(): void {
  if (currentTask) {
    return;
  }
  if (taskQueue.length === 0) {
    return;
  }

  currentTask = taskQueue.shift()!;
  currentTask.startedAt = Date.now();

  const w = getWorker();
  if (!w) {
    disableWorkerAndFallbackAll('create-worker-failed');
    processQueue();
    return;
  }
  if (disabled) {
    clearTimeoutIfAny(currentTask);
    const inflightTimer = (currentTask as any).__inFlightTimer as ReturnType<typeof setTimeout> | undefined;
    if (inflightTimer) clearTimeout(inflightTimer);
    callOnMain(currentTask.method as never, currentTask.params as never)
      .then(currentTask.resolve, currentTask.reject)
      .finally(() => {
        currentTask = null;
        processQueue();
      });
    return;
  }

  const inFlightTimer = setTimeout(() => {
    if (!currentTask) return;
    if (currentTask.id !== (currentTask as any).id) return;

    disabled = true;
    try {
      worker?.terminate();
    } catch (e) {
      // ignores;
    }
    worker = null;

    const done = currentTask;
    currentTask = null;

    clearTimeoutIfAny(done);
    callOnMain(done.method as never, done.params as never)
      .then(done.resolve, done.reject)
      .finally(processQueue);
  }, REQUEST_TIMEOUT_MS);
  (currentTask as any).__inFlightTimer = inFlightTimer;

  const cloneCheck = isStructuredCloneable({ id: currentTask.id, method: currentTask.method, params: currentTask.params });
  if (!cloneCheck.ok) {
    disabled = true;
    try {
      worker?.terminate();
    } catch (e) {
      // ignores;
    }
    worker = null;

    const failed = currentTask;
    currentTask = null;
    clearTimeout(inFlightTimer);
    clearTimeoutIfAny(failed);

    callOnMain(failed.method as never, failed.params as never)
      .then(failed.resolve, failed.reject)
      .finally(processQueue);
    return;
  }

  try {
    w.postMessage({ id: currentTask.id, method: currentTask.method, params: currentTask.params });
  } catch (_e) {
    console.log(_e);
    const failed = currentTask;
    if (!failed) return;

    clearTimeoutIfAny(failed);
    clearTimeout(inFlightTimer);
    currentTask = null;

    disabled = true;
    try {
      worker?.terminate();
    } catch (e) {
      // ignores;
    }
    worker = null;

    callOnMain(failed.method as never, failed.params as never)
      .then(failed.resolve, failed.reject)
      .finally(processQueue);
  }
}

function call<M extends keyof Methods>(method: M, params: Methods[M]['params']): Promise<AwaitedResult<M>> {
  return new Promise<AwaitedResult<M>>((resolve, reject) => {
    const id = seq++;
    const p: Pending<M> = { id, method, params, resolve, reject, enqueuedAt: Date.now() };

    taskQueue.push(p as unknown as Pending);

    armOverallTimeout(p as unknown as Pending);
    processQueue();
  });
}

// ------------------------ Public API (typed) --------------------------------

export const evaluateFhirpathExpressionToGetDate = (item?: QuestionnaireItem, fhirExpression?: string) =>
  call('evaluateFhirpathExpressionToGetDate', { item, fhirExpression });

export const getAnswerFromResponseItem = (responseItem?: QuestionnaireResponseItem) => call('getAnswerFromResponseItem', { responseItem });

export const getResonseItem = (linkId: string, response: QuestionnaireResponse) => call('getResponseItem', { linkId, response });

export const descendantsHasAnswer = (questionnaire?: QuestionnaireResponseItem[] | null) => call('descendantsHasAnswer', { questionnaire });

export const hasDescendants = (questionnaire?: QuestionnaireResponseItem[] | null) => call('hasDescendants', { questionnaire });

export const evaluateFhirpathExpressionToGetString = (fhirExtension: Extension, questionnaire?: QuestionnaireResponse | null) =>
  call('evaluateFhirpathExpressionToGetString', { fhirExtension, questionnaire });

export const evaluateFhirpathExpression = (expression: string, context: unknown) =>
  call('evaluateFhirpathExpression', { expression, context });

export const evaluateExtension = (path: string | Path, questionnaire?: QuestionnaireResponse | null, context?: unknown) =>
  call('evaluateExtension', { path, questionnaire, context });

export const isGroupAndDescendantsHasAnswer = (responseItem?: QuestionnaireResponseItem) =>
  call('isGroupAndDescendantsHasAnswer', { responseItem });

export const postTaskToFhirPathWorker = ({
  questionnaire,
  questionnaireResponse,
}: {
  questionnaire: Questionnaire;
  questionnaireResponse: QuestionnaireResponse;
}) => call('runCalculators', { questionnaire, questionnaireResponse });
export const postRunEnableWhenToWorker = (params: RunEnableWhenParams) => call('runEnableWhen', params);

export function __disableFhirpathWorkerForSession() {
  disableWorkerAndFallbackAll('manual-disable');
}

export function __resetFhirpathWorkerForTests() {
  try {
    worker?.terminate();
  } catch (e) {
    // ignores;
  }
  worker = null;
  disabled = false;
  seq = 1;
}
