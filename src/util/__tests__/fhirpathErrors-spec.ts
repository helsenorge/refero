import { describe, it, expect, beforeEach, afterEach, vi, type MockInstance } from 'vitest';

import { getFhirPathErrorHandler, reportFhirPathError, setFhirPathErrorHandler, type FhirPathEvaluationError } from '../fhirpathErrors';

describe('fhirpathErrors', () => {
  let consoleErrorSpy: MockInstance;

  beforeEach(() => {
    setFhirPathErrorHandler(undefined);
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    setFhirPathErrorHandler(undefined);
    vi.restoreAllMocks();
  });

  it('Should log on the console when no handler is registered', () => {
    const error = new Error('boom');

    reportFhirPathError({ source: 'aSource', expression: 'item.where(', linkId: '1.1', error });

    expect(consoleErrorSpy).toHaveBeenCalledWith('Refero: FHIRPath evaluation failed in aSource for linkId "1.1": item.where(', error);
  });

  it('Should log without linkId and expression when they are not known', () => {
    const error = new Error('boom');

    reportFhirPathError({ source: 'aSource', error });

    expect(consoleErrorSpy).toHaveBeenCalledWith('Refero: FHIRPath evaluation failed in aSource: <no expression>', error);
  });

  it('Should call a registered handler instead of logging on the console', () => {
    const handler = vi.fn();
    const error = new Error('boom');
    setFhirPathErrorHandler(handler);

    reportFhirPathError({ source: 'aSource', expression: 'item.where(', linkId: '1.1', error });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith<[FhirPathEvaluationError]>({
      source: 'aSource',
      expression: 'item.where(',
      linkId: '1.1',
      error,
    });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('Should expose the registered handler', () => {
    const handler = vi.fn();

    expect(getFhirPathErrorHandler()).toBeUndefined();

    setFhirPathErrorHandler(handler);
    expect(getFhirPathErrorHandler()).toBe(handler);
  });

  it('Should go back to console logging when the handler is cleared', () => {
    const handler = vi.fn();
    setFhirPathErrorHandler(handler);
    setFhirPathErrorHandler(undefined);

    reportFhirPathError({ source: 'aSource', error: new Error('boom') });

    expect(handler).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
  });

  it('Should fall back to the console, and not throw, when the handler itself throws', () => {
    const handlerError = new Error('handler is broken');
    setFhirPathErrorHandler(() => {
      throw handlerError;
    });

    expect(() => reportFhirPathError({ source: 'aSource', error: new Error('boom') })).not.toThrow();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Refero: the registered FHIRPath error handler threw an error', handlerError);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
  });
});
