import stu3 from './fhirpathLoaderHelper';
import { QuestionnaireItem } from '../types/fhir';
const fhirpath = require('fhirpath');

export function evaluateFhirpathExpressionToGetDate(item: QuestionnaireItem, fhirExpression: string): Date | undefined {
  let result = fhirpath.evaluate(item, fhirExpression, null, stu3);
  if (result.length > 0) {
    return new Date(result[0].asStr);
  }

  return;
}
