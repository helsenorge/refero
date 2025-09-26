/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference lib="webworker" />
export {};

import {
  DescendantsHasAnswerParams,
  DescendantsHasAnswerResult,
  EvaluateExtensionParams,
  EvaluateExtensionResult,
  EvaluateFhirpathExpressionParams,
  EvaluateFhirpathExpressionResult,
  EvaluateFhirpathExpressionToGetDateParams,
  EvaluateFhirpathExpressionToGetDateResult,
  EvaluateFhirpathExpressionToGetStringParams,
  EvaluateFhirpathExpressionToGetStringResult,
  GetAnswerFromResponseItemParams,
  GetAnswerFromResponseItemResult,
  GetResponseItemParams,
  GetResponseItemResult,
  HasDescendantsParams,
  HasDescendantsResult,
  IsGroupAndDescendantsHasAnswerParams,
  IsGroupAndDescendantsHasAnswerResult,
  Methods,
  RpcRequest,
  RpcResponse,
  RunCalculatorsParams,
  RunCalculatorsResult,
} from './fhirpath-rpc-worker';
import { runCalculators } from './helpers';
import {
  evaluateFhirpathExpressionToGetDate,
  getAnswerFromResponseItem,
  getResponseItem,
  descendantsHasAnswer,
  hasDescendants,
  evaluateFhirpathExpressionToGetString,
  evaluateFhirpathExpression,
  evaluateExtension,
  isGroupAndDescendantsHasAnswer,
} from '../util/fhirpathHelper';

import { RunEnableWhenParams, runEnableWhenPure, RunEnableWhenResult } from '@/calculators/runEnableWhen_pure';

// ---- dispatcher -------------------

const handlers = {
  evaluateFhirpathExpressionToGetDate: (p: EvaluateFhirpathExpressionToGetDateParams): EvaluateFhirpathExpressionToGetDateResult =>
    evaluateFhirpathExpressionToGetDate(p.item, p.fhirExpression),
  getAnswerFromResponseItem: (p: GetAnswerFromResponseItemParams): GetAnswerFromResponseItemResult =>
    getAnswerFromResponseItem(p.responseItem),
  getResponseItem: (p: GetResponseItemParams): GetResponseItemResult => getResponseItem(p.linkId, p.response),
  descendantsHasAnswer: (p: DescendantsHasAnswerParams): DescendantsHasAnswerResult => descendantsHasAnswer(p.questionnaire),
  hasDescendants: (p: HasDescendantsParams): HasDescendantsResult => hasDescendants(p.questionnaire),
  evaluateFhirpathExpressionToGetString: (p: EvaluateFhirpathExpressionToGetStringParams): EvaluateFhirpathExpressionToGetStringResult =>
    evaluateFhirpathExpressionToGetString(p.fhirExtension, p.questionnaire),
  evaluateFhirpathExpression: (p: EvaluateFhirpathExpressionParams): EvaluateFhirpathExpressionResult =>
    evaluateFhirpathExpression(p.expression, p.context),
  evaluateExtension: (p: EvaluateExtensionParams): EvaluateExtensionResult => evaluateExtension(p.path, p.questionnaire, p.context),
  isGroupAndDescendantsHasAnswer: (p: IsGroupAndDescendantsHasAnswerParams): IsGroupAndDescendantsHasAnswerResult =>
    isGroupAndDescendantsHasAnswer(p.responseItem),
  runCalculators: (p: RunCalculatorsParams): RunCalculatorsResult =>
    runCalculators({ questionnaireResponse: p.questionnaireResponse, questionnaire: p.questionnaire }),
  runEnableWhen: (p: RunEnableWhenParams): RunEnableWhenResult => runEnableWhenPure(p),
} satisfies { [K in keyof Methods]: (p: Methods[K]['params']) => Promise<Methods[K]['result']> | Methods[K]['result'] };

// ---- Runtime ---------------------------------------------------------------

const ctx = self as unknown as DedicatedWorkerGlobalScope;

const onMessage = async (ev: MessageEvent<RpcRequest>): Promise<void> => {
  const { id, method, params } = ev.data;
  try {
    const fn = handlers[method as keyof Methods] as (p: unknown) => Promise<unknown>;
    if (!fn) throw new Error(`Unknown method: ${String(method)}`);
    const result = await fn(params);
    post<RpcResponse>({ id, ok: true, result } as RpcResponse);
  } catch (err: any) {
    post<RpcResponse>({
      id,
      ok: false,
      error: { message: err?.message ?? String(err), stack: err?.stack },
    });
  }
};

ctx.addEventListener('messageerror', (e: MessageEvent) => {
  post<RpcResponse>({
    id: -1,
    ok: false,
    message: undefined as never,
    error: {
      message: 'messageerror: structured clone failed',
      stack: safeInspect(e.data),
    },
  } as any);
});

ctx.addEventListener('error', (e: ErrorEvent) => {
  post<RpcResponse>({
    id: -1,
    ok: false,
    error: { message: e.message, stack: e.error?.stack },
  });
});

ctx.addEventListener('error', _e => {
  // Uncaught error inside worker — surface something meaningful
});
ctx.addEventListener('message', onMessage);
// ---- Helpers ---------------------------------------------------------------

function safeInspect(x: unknown): string {
  try {
    return typeof x === 'string' ? x : JSON.stringify(x);
  } catch {
    return Object.prototype.toString.call(x);
  }
}

function post<T extends RpcResponse>(msg: T, transfer?: Transferable[]): void {
  ctx.postMessage(msg, transfer ?? []);
}
