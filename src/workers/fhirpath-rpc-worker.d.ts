/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Extension, Questionnaire, QuestionnaireItem, QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';
import type { Path } from 'fhirpath';

import { AnswerPad } from '../util/FhirPathExtensions';

import { RunEnableWhenParams, RunEnableWhenResult } from '@/calculators/runEnableWhen_pure';

/**
 * Method names supported by the worker.
 */
export type RpcMethodName =
  | 'evaluateFhirpathExpressionToGetDate'
  | 'getAnswerFromResponseItem'
  | 'getResponseItem'
  | 'descendantsHasAnswer'
  | 'hasDescendants'
  | 'evaluateFhirpathExpressionToGetString'
  | 'evaluateFhirpathExpression'
  | 'evaluateExtension'
  | 'isGroupAndDescendantsHasAnswer'
  | 'runCalculators'
  | 'runEnableWhen';

/**
 * Per-method params/result types
 */

export interface EvaluateFhirpathExpressionToGetDateParams {
  item?: QuestionnaireItem;
  fhirExpression?: string;
}
export type EvaluateFhirpathExpressionToGetDateResult = Promise<Date | undefined>;

export interface GetAnswerFromResponseItemParams {
  responseItem?: QuestionnaireResponseItem;
}
export type GetAnswerFromResponseItemResult = any;

export interface GetResponseItemParams {
  linkId: string;
  response: QuestionnaireResponse;
}
export type GetResponseItemResult = Promise<any[] | undefined>;

export interface DescendantsHasAnswerParams {
  questionnaire?: QuestionnaireResponseItem[] | null;
}
export type DescendantsHasAnswerResult = boolean;

export interface HasDescendantsParams {
  questionnaire?: QuestionnaireResponseItem[] | null;
}
export type HasDescendantsResult = boolean;

export interface EvaluateFhirpathExpressionToGetStringParams {
  fhirExtension: Extension;
  questionnaire?: QuestionnaireResponse | null;
}
export type EvaluateFhirpathExpressionToGetStringResult = any[];

export interface EvaluateFhirpathExpressionParams {
  expression: string;
  context: any;
}
export type EvaluateFhirpathExpressionResult = Promise<any[]>;

export interface EvaluateExtensionParams {
  path: string | Path;
  questionnaire?: QuestionnaireResponse | null;
  context?: any;
}
export type EvaluateExtensionResult = unknown;

export interface IsGroupAndDescendantsHasAnswerParams {
  responseItem?: QuestionnaireResponseItem;
}
export type IsGroupAndDescendantsHasAnswerResult = Promise<boolean>;

export interface RunCalculatorsParams {
  questionnaireResponse: QuestionnaireResponse;
  questionnaire: Questionnaire;
}
export type RunCalculatorsResult = AnswerPad;

/**
 * Mapped method → params/result (for strong typing of the RPC envelope)
 */
export interface RpcParamsByMethod {
  evaluateFhirpathExpressionToGetDate: EvaluateFhirpathExpressionToGetDateParams;
  getAnswerFromResponseItem: GetAnswerFromResponseItemParams;
  getResponseItem: GetResponseItemParams;
  descendantsHasAnswer: DescendantsHasAnswerParams;
  hasDescendants: HasDescendantsParams;
  evaluateFhirpathExpressionToGetString: EvaluateFhirpathExpressionToGetStringParams;
  evaluateFhirpathExpression: EvaluateFhirpathExpressionParams;
  evaluateExtension: EvaluateExtensionParams;
  isGroupAndDescendantsHasAnswer: IsGroupAndDescendantsHasAnswerParams;
  runCalculators: RunCalculatorsParams;
  runEnableWhen: RunEnableWhenParams;
}

export interface RpcResultByMethod {
  evaluateFhirpathExpressionToGetDate: EvaluateFhirpathExpressionToGetDateResult;
  getAnswerFromResponseItem: GetAnswerFromResponseItemResult;
  getResponseItem: GetResponseItemResult;
  descendantsHasAnswer: DescendantsHasAnswerResult;
  hasDescendants: HasDescendantsResult;
  evaluateFhirpathExpressionToGetString: EvaluateFhirpathExpressionToGetStringResult;
  evaluateFhirpathExpression: EvaluateFhirpathExpressionResult;
  evaluateExtension: EvaluateExtensionResult;
  isGroupAndDescendantsHasAnswer: IsGroupAndDescendantsHasAnswerResult;
  runCalculators: RunCalculatorsResult;
  runEnableWhen: RunEnableWhenResult;
}
export type Methods = {
  evaluateFhirpathExpressionToGetDate: {
    params: EvaluateFhirpathExpressionToGetDateParams;
    result: EvaluateFhirpathExpressionToGetDateResult;
  };
  getAnswerFromResponseItem: {
    params: GetAnswerFromResponseItemParams;
    result: GetAnswerFromResponseItemResult;
  };
  getResponseItem: {
    params: GetResponseItemParams;
    result: GetResponseItemResult;
  };
  descendantsHasAnswer: {
    params: DescendantsHasAnswerParams;
    result: DescendantsHasAnswerResult;
  };
  hasDescendants: {
    params: HasDescendantsParams;
    result: HasDescendantsResult;
  };
  evaluateFhirpathExpressionToGetString: {
    params: EvaluateFhirpathExpressionToGetStringParams;
    result: EvaluateFhirpathExpressionToGetStringResult;
  };
  evaluateFhirpathExpression: {
    params: EvaluateFhirpathExpressionParams;
    result: EvaluateFhirpathExpressionResult;
  };
  evaluateExtension: {
    params: EvaluateExtensionParams;
    result: EvaluateExtensionResult;
  };
  isGroupAndDescendantsHasAnswer: {
    params: IsGroupAndDescendantsHasAnswerParams;
    result: IsGroupAndDescendantsHasAnswerResult;
  };
  runCalculators: {
    params: RunCalculatorsParams;
    result: RunCalculatorsResult;
  };
  runEnableWhen: {
    params: RunEnableWhenParams;
    result: RunEnableWhenResult;
  };
};
/**
 * RPC envelope
 */
export interface RpcRequest<M extends RpcMethodName = RpcMethodName> {
  id: number;
  method: M;
  params: RpcParamsByMethod[M];
}

export interface RpcSuccess<M extends RpcMethodName = RpcMethodName> {
  id: number;
  ok: true;
  result: RpcResultByMethod[M];
}

export interface RpcError {
  id: number;
  ok: false;
  error: { message: string; stack?: string };
}

export type RpcResponse<M extends RpcMethodName = RpcMethodName> = RpcSuccess<M> | RpcError;

/**
 * Convenience unions
 */
export type AnyRpcRequest = RpcRequest<RpcMethodName>;
export type AnyRpcResponse = RpcResponse<RpcMethodName>;
