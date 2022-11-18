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

export function evaluateFhirpathExpressionToGetString(
  questionnare: QuestionnaireResponse | null | undefined,
  fhirExtension: Extension
): any {
  return fhirpath.evaluate(questionnare, fhirExtension.valueString, null, fhirpath_r4_model);
}
