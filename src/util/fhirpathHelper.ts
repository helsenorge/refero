import { QuestionnaireItem } from '../types/fhir';

import r4 from './fhirpathLoaderHelper';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fhirpath = require('fhirpath');

export function evaluateFhirpathExpressionToGetDate(item: QuestionnaireItem, fhirExpression: string): Date | undefined {
  const result = fhirpath.evaluate(item, fhirExpression, null, r4);
  if (result.length > 0) {
    return new Date(result[0].asStr);
  }

  return;
}
