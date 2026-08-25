/* eslint-disable @typescript-eslint/no-explicit-any */
import { compile, evaluate, type Context, type Path } from 'fhirpath';
import fhirpath_r4_model from 'fhirpath/fhir-context/r4';

import type { QuestionnaireItem, Extension, QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';

import { reportFhirPathError } from './fhirpathErrors';

/**
 * Environment variables (the %-variables of FHIRPath) made available to an
 * expression, for example %questionnaire and %resource.
 */
export type FhirPathEnvVars = Record<string, unknown>;

type CompiledFhirPathExpression = (resource: any, envVars?: FhirPathEnvVars) => any[];

/**
 * The expressions in a questionnaire are static, but compiling them is the
 * expensive part of fhirpath.js and every keystroke re-evaluates every
 * expression, so compiled expressions are reused. The cache is bounded so a
 * long lived application that loads many questionnaires cannot grow it without
 * limit, and expressions that fail to compile are never cached.
 */
const MAX_CACHED_COMPILED_EXPRESSIONS = 500;
const compiledExpressionCache = new Map<string, CompiledFhirPathExpression>();

export function getCompiledFhirPathExpression(expression: string): CompiledFhirPathExpression {
  const cachedExpression = compiledExpressionCache.get(expression);
  if (cachedExpression) {
    return cachedExpression;
  }
  const compiledExpression = compile(expression, fhirpath_r4_model) as CompiledFhirPathExpression;
  if (compiledExpressionCache.size >= MAX_CACHED_COMPILED_EXPRESSIONS) {
    const oldestExpression = compiledExpressionCache.keys().next().value;
    if (oldestExpression !== undefined) {
      compiledExpressionCache.delete(oldestExpression);
    }
  }
  compiledExpressionCache.set(expression, compiledExpression);
  return compiledExpression;
}

export function clearCompiledFhirPathExpressionCache(): void {
  compiledExpressionCache.clear();
}

export async function evaluateFhirpathExpressionToGetDate(item?: QuestionnaireItem, fhirExpression?: string): Promise<Date | undefined> {
  if (!item || !fhirExpression) {
    return undefined;
  }
  const iCopy = structuredClone(item);
  const result = await evaluate(iCopy, fhirExpression, undefined, fhirpath_r4_model);

  if (Array.isArray(result)) {
    return new Date(result[0]);
  }

  return undefined;
}
export async function getAnswerFromResponseItem(responseItem?: QuestionnaireResponseItem): Promise<any> {
  try {
    return await evaluate(responseItem, 'answer');
  } catch (e) {
    reportFhirPathError({ source: 'getAnswerFromResponseItem', expression: 'answer', error: e });
  }
}

export async function getResonseItem(linkId: string, response: QuestionnaireResponse): Promise<any[] | undefined> {
  if (!linkId || !response) {
    return undefined;
  }
  const expression = `item.descendants().where(linkId='${linkId}') | answer.item.descendants().where(linkId='${linkId}')`;
  try {
    const compiledExpression = getCompiledFhirPathExpression(expression);
    return compiledExpression(response);
  } catch (e) {
    reportFhirPathError({ source: 'getResonseItem', expression, linkId, error: e });
    return undefined;
  }
}

export const descendantsHasAnswer = (questionnaire?: QuestionnaireResponseItem[] | null): boolean => {
  if (!questionnaire || !questionnaire.length) {
    return false; // Return false if the questionnaire is null, undefined, or has no items.
  }
  try {
    const result = evaluate({ item: questionnaire }, 'item.descendants().where(answer.exists()).exists()');
    return Array.isArray(result) ? result[0] === true : false;
  } catch (e) {
    reportFhirPathError({ source: 'descendantsHasAnswer', expression: 'item.descendants().where(answer.exists()).exists()', error: e });
  }
  return false;
};
export const hasDescendants = (questionnaire?: QuestionnaireResponseItem[] | null): boolean => {
  if (!questionnaire || !questionnaire.length) {
    return false; // Return false if the questionnaire is null, undefined, or has no items.
  }
  try {
    const result = evaluate({ item: questionnaire }, 'item.descendants().exists()');
    return Array.isArray(result) ? result[0] === true : false;
  } catch (e) {
    reportFhirPathError({ source: 'hasDescendants', expression: 'item.descendants().exists()', error: e });
  }
  return false;
};

/**
 * Evaluates the expression of an extension against a QuestionnaireResponse.
 *
 * %resource is bound to the QuestionnaireResponse being evaluated. Callers that
 * know more about the evaluation context - the FhirPathExtensions engine knows
 * the Questionnaire, for instance - pass the remaining variables in envVars,
 * where they take precedence over the defaults.
 */
export function evaluateFhirpathExpressionToGetString(
  fhirExtension: Extension,
  questionnare?: QuestionnaireResponse | null,
  useLegacyValueString: boolean = true,
  envVars?: FhirPathEnvVars
): any {
  const qCopy = structuredClone(questionnare);
  const expression = useLegacyValueString ? fhirExtension.valueString : fhirExtension.valueExpression?.expression;
  if (!expression) {
    return [];
  }
  try {
    const compiledExpression = getCompiledFhirPathExpression(expression);

    return compiledExpression(qCopy, { resource: qCopy, ...envVars });
  } catch (error) {
    reportFhirPathError({ source: 'evaluateFhirpathExpressionToGetString', expression, error });
    return [];
  }
}
export async function evaluateFhirpathExpression(expression: string, context: any): Promise<any[]> {
  try {
    const compiledExpression = getCompiledFhirPathExpression(expression);
    return compiledExpression(context);
  } catch (error) {
    reportFhirPathError({ source: 'evaluateFhirpathExpression', expression, error });
    return [];
  }
}
export function evaluateExtension(path: string | Path, questionnare?: QuestionnaireResponse | null, context?: Context): unknown {
  const qCopy = structuredClone(questionnare);
  /**
   *  Evaluates the "path" FHIRPath expression on the given resource or part of the resource,
   *  using data from "context" for variables mentioned in the "path" expression.
   * @param {(object|object[])} fhirData -  FHIR resource, part of a resource (in this case
   *  path.base should be provided), bundle as js object or array of resources.
   *  This object/array will be modified by this function to add type information.
   * @param {string|object} path - string with fhirpath expression, sample 'Patient.name.given',
   *  or object, if fhirData represents the part of the FHIR resource:
   * @param {string} path.base - base path in resource from which fhirData was extracted
   * @param {string} path.expression - fhirpath expression relative to path.base
   * @param {object} context - a hash of variable name/value pairs.
   * @param {object} model - The "model" data object specific to a domain, e.g. R4.
   *  For example, you could pass in the result of require("fhirpath/fhir-context/r4");
   */
  return evaluate(qCopy, path, context, fhirpath_r4_model);
}
export const isGroupAndDescendantsHasAnswer = async (responseItem?: QuestionnaireResponseItem): Promise<boolean> => {
  if (!responseItem) {
    return false;
  }
  try {
    const resource = {
      resourceType: 'QuestionnaireResponse',
      item: [responseItem],
    };

    const result: any[] = await evaluate(resource, 'descendants().answer.exists()', undefined, fhirpath_r4_model);

    const hasAnswer = result[0] === true;
    return hasAnswer;
  } catch (e) {
    reportFhirPathError({ source: 'isGroupAndDescendantsHasAnswer', expression: 'descendants().answer.exists()', error: e });
    return false;
  }
};
export async function getResponseItem(linkId: string, response: QuestionnaireResponse): Promise<any[] | undefined> {
  if (!linkId || !response) return undefined;
  const compiled = getCompiledFhirPathExpression(
    `item.descendants().where(linkId='${linkId}') | answer.item.descendants().where(linkId='${linkId}')`
  );
  return compiled(response);
}
