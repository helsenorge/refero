import r4 from './fhirpathLoaderHelper';
import { QuestionnaireItem } from '../types/fhir';
const fhirpath = require('fhirpath');

export function evaluateFhirpathExpressionToGetDate(item: QuestionnaireItem, fhirExpression: string): Date | undefined {
  let result = fhirpath.evaluate(item, fhirExpression, null, r4);
  if (result.length > 0) {
    return new Date(result[0].asStr);
  }

  return;
}
