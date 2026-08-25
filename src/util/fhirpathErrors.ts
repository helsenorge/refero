/**
 * Errors thrown while compiling or evaluating a FHIRPath expression used to be
 * swallowed silently, which made an invalid expression indistinguishable from
 * an expression that legitimately evaluated to nothing: the form just rendered
 * an empty answer. Evaluation still resolves to an empty result so rendering
 * never breaks, but the failure is now reported so form authors and host
 * applications can act on it.
 */
export interface FhirPathEvaluationError {
  /** The refero function that evaluated the expression. */
  source: string;
  /** The FHIRPath expression that failed, when known. */
  expression?: string;
  /** linkId of the questionnaire item the expression belongs to, when known. */
  linkId?: string;
  /** The error thrown by fhirpath.js. */
  error: unknown;
}

export type FhirPathErrorHandler = (evaluationError: FhirPathEvaluationError) => void;

let fhirPathErrorHandler: FhirPathErrorHandler | undefined = undefined;

/**
 * Registers a handler that is called whenever a FHIRPath expression fails to
 * compile or evaluate. Pass undefined to go back to logging on the console.
 *
 * Note that the fhirpath web worker runs in its own module scope, so a handler
 * registered on the main thread is not invoked for expressions evaluated inside
 * the worker - those still end up on the console.
 */
export function setFhirPathErrorHandler(handler?: FhirPathErrorHandler): void {
  fhirPathErrorHandler = handler;
}

export function getFhirPathErrorHandler(): FhirPathErrorHandler | undefined {
  return fhirPathErrorHandler;
}

/**
 * Reports a failed FHIRPath evaluation to the registered handler, falling back
 * to the console. A handler that throws must never break form rendering, so its
 * error is logged and the report falls back to the console as well.
 */
export function reportFhirPathError(evaluationError: FhirPathEvaluationError): void {
  if (fhirPathErrorHandler) {
    try {
      fhirPathErrorHandler(evaluationError);
      return;
    } catch (handlerError) {
      // eslint-disable-next-line no-console
      console.error('Refero: the registered FHIRPath error handler threw an error', handlerError);
    }
  }
  const { source, expression, linkId, error } = evaluationError;
  const itemInfo = linkId ? ` for linkId "${linkId}"` : '';
  // eslint-disable-next-line no-console
  console.error(`Refero: FHIRPath evaluation failed in ${source}${itemInfo}: ${expression ?? '<no expression>'}`, error);
}
