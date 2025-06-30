/**
 * @vitest-environment jsdom
 */

// src/workers/worker-factory.spec.ts

import { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import { vi, describe, it, expect, beforeEach, afterEach, Mock } from 'vitest';
const MockInlineWorker = vi.fn();

vi.mock('../fhir-path.worker.ts?worker&inline', () => {
  // This mock factory will be called when the module is imported.
  // It should return an object with a `default` property, which is our mock constructor.
  return {
    default: MockInlineWorker,
  };
});
// --- The New Mocking Strategy ---

describe('worker-factory', () => {
  const mockQuestionnaire = { resourceType: 'Questionnaire' } as Questionnaire;
  const mockQuestionnaireResponse = { resourceType: 'QuestionnaireResponse' } as QuestionnaireResponse;
  type MockWorkerInstance = {
    postMessage: Mock;
    terminate: Mock;
    onmessage: ((event: MessageEvent) => void) | null;
    onerror: ((event: ErrorEvent) => void) | null;
  };

  // This will be our mock Worker constructor
  // This will hold the single instance our mock constructor creates
  let mockWorkerInstance: MockWorkerInstance;

  beforeEach(() => {
    // Reset mocks for a clean slate
    vi.clearAllMocks();

    // Define the mock instance that our constructor will return
    mockWorkerInstance = {
      postMessage: vi.fn(),
      terminate: vi.fn(),
      onmessage: null,
      onerror: null,
    };

    // When `new Worker()` is called in the code, it will run this implementation,
    // which returns our predefined mock instance.
    MockInlineWorker.mockImplementation(() => mockWorkerInstance);

    // Replace the global `Worker` class with our mock constructor.
    vi.stubGlobal('Worker', MockInlineWorker);
  });

  afterEach(() => {
    // Restore the original global `Worker` class
    vi.unstubAllGlobals();
    // Reset modules to test the singleton behavior correctly
    vi.resetModules();
  });

  it('should create only one worker and reject concurrent tasks', async () => {
    const { postTaskToFhirPathWorker } = await import('../worker-factory');

    const firstPromise = postTaskToFhirPathWorker(mockQuestionnaireResponse, mockQuestionnaire);

    await expect(postTaskToFhirPathWorker(mockQuestionnaireResponse, mockQuestionnaire)).rejects.toThrow(
      'FhirPathWorker is busy. A calculation is already in progress.'
    );

    expect(MockInlineWorker).toHaveBeenCalledTimes(1);
    // The first argument to the constructor should be a URL object.
    expect(MockInlineWorker.mock.calls[0][0]).toEqual({ name: 'fhirPathWorker' });

    mockWorkerInstance.onmessage!({ data: { type: 'success', payload: {} } } as MessageEvent);
    await expect(firstPromise).resolves.toEqual({});
  });

  it('should post a task and resolve with the success payload', async () => {
    const { postTaskToFhirPathWorker } = await import('../worker-factory');
    const mockScores = { fhirScores: { 'item-1': 100 } };

    const promise = postTaskToFhirPathWorker(mockQuestionnaireResponse, mockQuestionnaire);

    expect(mockWorkerInstance.postMessage).toHaveBeenCalledTimes(1);
    expect(mockWorkerInstance.postMessage).toHaveBeenCalledWith({
      questionnaire: mockQuestionnaire,
      questionnaireResponse: mockQuestionnaireResponse,
    });

    // Simulate the worker sending a "success" message back
    // The `!` tells TypeScript that `onmessage` will not be null here.
    mockWorkerInstance.onmessage!({
      data: { type: 'success', payload: mockScores },
    } as MessageEvent);

    await expect(promise).resolves.toEqual(mockScores);
  });

  it('should reject the promise if the worker sends an error message', async () => {
    const { postTaskToFhirPathWorker } = await import('../worker-factory');
    const errorMessage = 'Something went wrong';
    const errorStack = '...stack trace...';

    const promise = postTaskToFhirPathWorker(mockQuestionnaireResponse, mockQuestionnaire);

    mockWorkerInstance.onmessage!({
      data: { type: 'error', payload: { message: errorMessage, stack: errorStack } },
    } as MessageEvent);

    await expect(promise).rejects.toThrow(errorMessage);
    await promise.catch(err => {
      expect(err.stack).toBe(errorStack);
    });
  });
  it('should reject the promise if the worker dispatches a generic error event', async () => {
    const { postTaskToFhirPathWorker } = await import('../worker-factory');

    // Create a plain Error object, which is what we now expect to receive.
    const underlyingError = new Error('Generic worker error');

    // Create the ErrorEvent that will wrap our error. This is what we pass to the handler.
    const mockErrorEvent = new ErrorEvent('error', {
      error: underlyingError,
    });

    const promise = postTaskToFhirPathWorker(mockQuestionnaireResponse, mockQuestionnaire);

    // Simulate the worker's onerror handler being called with the event
    mockWorkerInstance.onerror!(mockErrorEvent);

    // ✅ THE FIX: Assert that the promise rejects with the UNDERLYING error,
    // not the event wrapper. `toBe` checks for strict object identity.
    await expect(promise).rejects.toBe(underlyingError);
  });

  it('should allow a new task after the previous one successfully completes', async () => {
    const { postTaskToFhirPathWorker } = await import('../worker-factory');
    const firstScores = { fhirScores: { 'item-1': 100 } };
    const secondScores = { fhirScores: { 'item-2': 200 } };

    // --- First Task ---
    const promise1 = postTaskToFhirPathWorker(mockQuestionnaireResponse, mockQuestionnaire);
    mockWorkerInstance.onmessage!({
      data: { type: 'success', payload: firstScores },
    } as MessageEvent);
    await expect(promise1).resolves.toEqual(firstScores);

    // --- Second Task ---
    const promise2 = postTaskToFhirPathWorker(mockQuestionnaireResponse, mockQuestionnaire);
    mockWorkerInstance.onmessage!({
      data: { type: 'success', payload: secondScores },
    } as MessageEvent);
    await expect(promise2).resolves.toEqual(secondScores);

    // Assert worker is reused, not recreated
    expect(MockInlineWorker).toHaveBeenCalledTimes(1);
    expect(mockWorkerInstance.postMessage).toHaveBeenCalledTimes(2);
  });
});
