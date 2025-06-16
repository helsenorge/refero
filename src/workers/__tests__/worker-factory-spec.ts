/**
 * @vitest-environment jsdom
 */

// src/workers/worker-factory.spec.ts

import { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import { vi, describe, it, expect, beforeEach, afterEach, Mock } from 'vitest';

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
  const MockWorker = vi.fn();
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
    MockWorker.mockImplementation(() => mockWorkerInstance);

    // Replace the global `Worker` class with our mock constructor.
    vi.stubGlobal('Worker', MockWorker);
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
    const secondPromise = postTaskToFhirPathWorker(mockQuestionnaireResponse, mockQuestionnaire);

    // Assert: The Worker constructor should have been called only once.
    expect(MockWorker).toHaveBeenCalledTimes(1);
    // The first argument to the constructor should be a URL object.
    expect(MockWorker.mock.calls[0][0]).toBeInstanceOf(URL);
    expect(MockWorker.mock.calls[0][0].href).toContain('fhir-path.worker.ts');

    await expect(secondPromise).rejects.toThrow('FhirPathWorker is busy. A calculation is already in progress.');

    // Cleanup to prevent unhandled rejection warnings in the test runner
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
    const mockErrorEvent = new ErrorEvent('error', {
      error: new Error('Generic worker error'),
    });

    const promise = postTaskToFhirPathWorker(mockQuestionnaireResponse, mockQuestionnaire);

    // Simulate the worker's onerror handler being called
    mockWorkerInstance.onerror!(mockErrorEvent);

    await expect(promise).rejects.toBe(mockErrorEvent);
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
    expect(MockWorker).toHaveBeenCalledTimes(1);
    expect(mockWorkerInstance.postMessage).toHaveBeenCalledTimes(2);
  });
});
