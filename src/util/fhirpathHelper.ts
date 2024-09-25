import { QuestionnaireItem, Extension, QuestionnaireResponse } from 'fhir/r4';
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

export function evaluateFhirpathExpressionToGetString(fhirExtension: Extension, questionnare?: QuestionnaireResponse | null): any {
  const qCopy = structuredClone(questionnare);
  const qExt = structuredClone(fhirExtension);
  try {
    if (qExt.valueString) {
      return fhirpath.evaluate(qCopy, qExt.valueString, undefined, fhirpath_r4_model);
    } else {
      return [];
    }
  } catch (error) {
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
