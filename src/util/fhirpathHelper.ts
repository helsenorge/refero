/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { QuestionnaireItem, Extension, QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';
import fhirpath, { Context } from 'fhirpath';
import fhirpath_r4_model from 'fhirpath/fhir-context/r4';

export async function evaluateFhirpathExpressionToGetDate(item?: QuestionnaireItem, fhirExpression?: string): Promise<Date | undefined> {
  if (!item || !fhirExpression) {
    return undefined;
  }
  const iCopy = structuredClone(item);
  const result = await fhirpath.evaluate(iCopy, fhirExpression, undefined, fhirpath_r4_model);

  if (Array.isArray(result)) {
    return new Date(result[0]);
  }

  return undefined;
}
export async function getAnswerFromResponseItem(responseItem?: QuestionnaireResponseItem): Promise<any> {
  try {
    return await fhirpath.evaluate(responseItem, 'answer');
  } catch (e) {
    console.log(e);
  }
}

export async function getResonseItem(linkId: string, response: QuestionnaireResponse): Promise<any[] | undefined> {
  if (!linkId || !response) {
    return undefined;
  }
  try {
    const compiledExpression = fhirpath.compile(
      `item.descendants().where(linkId='${linkId}') | answer.item.descendants().where(linkId='${linkId}')`,
      fhirpath_r4_model
    );
    return compiledExpression(response);
  } catch (e) {
    console.log(e);
    return undefined;
  }
}

export const descendantsHasAnswer = (questionnaire?: QuestionnaireResponseItem[] | null): boolean => {
  if (!questionnaire || !questionnaire.length) {
    return false; // Return false if the questionnaire is null, undefined, or has no items.
  }
  try {
    const result = fhirpath.evaluate({ item: questionnaire }, 'item.descendants().where(answer.exists()).exists()');
    return Array.isArray(result) ? result[0] === true : false;
  } catch (e) {
    console.log(e);
  }
  return false;
};
export const hasDescendants = (questionnaire?: QuestionnaireResponseItem[] | null): boolean => {
  if (!questionnaire || !questionnaire.length) {
    return false; // Return false if the questionnaire is null, undefined, or has no items.
  }
  try {
    const result = fhirpath.evaluate({ item: questionnaire }, 'item.descendants().exists()');
    console.log(result);
    return Array.isArray(result) ? result[0] === true : false;
  } catch (e) {
    console.log(e);
  }
  return false;
};

export function evaluateFhirpathExpressionToGetString(fhirExtension: Extension, questionnare?: QuestionnaireResponse | null): any {
  const qCopy = structuredClone(questionnare);
  const qExt = structuredClone(fhirExtension);
  try {
    if (qExt.valueString) {
      const compiledExpression = fhirpath.compile(qExt.valueString, fhirpath_r4_model);

      return compiledExpression(qCopy);
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
}
export async function evaluateFhirpathExpression(expression: string, context: any): Promise<any[]> {
  try {
    const compiledExpression = fhirpath.compile(expression, fhirpath_r4_model);
    return compiledExpression(context);
  } catch (error) {
    console.error(`Error evaluating FHIRPath expression "${expression}":`, error);
    return [];
  }
}
export function evaluateExtension(path: string | fhirpath.Path, questionnare?: QuestionnaireResponse | null, context?: Context): unknown {
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
  return fhirpath.evaluate(qCopy, path, context, fhirpath_r4_model);
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
    const result: any[] = await fhirpath.evaluate(resource, 'descendants().answer.exists()', undefined, fhirpath_r4_model);

    const hasAnswer = result[0] === true;
    return hasAnswer;
  } catch (e) {
    console.log('error', e);
    return false;
  }
};
export async function getResponseItem(linkId: string, response: QuestionnaireResponse): Promise<any[] | undefined> {
  if (!linkId || !response) return undefined;
  const compiled = fhirpath.compile(
    `item.descendants().where(linkId='${linkId}') | answer.item.descendants().where(linkId='${linkId}')`,
    fhirpath_r4_model
  );
  return compiled(response);
}
