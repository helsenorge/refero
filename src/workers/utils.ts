/* eslint-disable @typescript-eslint/no-explicit-any */
import { Extension, Resource } from 'fhir/r4';
import fhirpath from 'fhirpath';
import fhirpath_r4_model from 'fhirpath/fhir-context/r4';

const expressionCache = new Map<string, (resource: any, context?: any) => any[] | Promise<any[]>>();

function getCompiledExpression(expression: string): (resource: any, context?: any) => any[] | Promise<any[]> {
  if (expressionCache.has(expression)) {
    return expressionCache.get(expression)!;
  }

  const compiled = fhirpath.compile(expression, fhirpath_r4_model);
  expressionCache.set(expression, compiled);
  return compiled;
}

export async function evaluateFhirpathExpression<T = any>(
  fhirExtension: Extension,
  resource: Resource | null | undefined,
  context: Record<string, any> = {}
): Promise<T[]> {
  if (!resource) {
    return [];
  }

  const expressionString = fhirExtension.valueExpression?.expression || fhirExtension.valueString;

  if (!expressionString) {
    return [];
  }

  try {
    const compiledExpression = getCompiledExpression(expressionString);

    const result = await compiledExpression(resource, context);

    return result as T[];
  } catch (error) {
    const errorMessage = `FHIRPath evaluation failed for expression: "${expressionString}". Reason: ${error instanceof Error ? error.message : String(error)}`;

    throw new Error(errorMessage);
  }
}
