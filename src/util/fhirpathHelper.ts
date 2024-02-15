import { QuestionnaireItem, Extension, QuestionnaireResponse } from '../types/fhir';

import r4 from './fhirpathLoaderHelper';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fhirpath = require('fhirpath');
const fhirpath_r4_model = require('fhirpath/fhir-context/r4');

export function evaluateFhirpathExpressionToGetDate(item: QuestionnaireItem, fhirExpression: string): Date | undefined {
  const result = fhirpath.evaluate(item, fhirExpression, null, r4);
  if (result.length > 0) {
    return new Date(result[0].asStr);
  }

  return;
}

export function evaluateFhirpathExpressionToGetString(fhirExtension: Extension, questionnare?: QuestionnaireResponse | null): any {
  const qCopy = structuredClone(questionnare);
  const qExt = structuredClone(fhirExtension);
  try {
    return fhirpath.evaluate(qCopy, qExt.valueString, null, fhirpath_r4_model);
  } catch (error) {
    return [];
  }
}

export function evaluateExtension(path: string | object, questionnare?: QuestionnaireResponse | null, context?: 'object' | null): unknown {
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
