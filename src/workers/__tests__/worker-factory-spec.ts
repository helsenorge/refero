// src/workers/worker-factory.spec.ts

import { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// We will import the factory dynamically inside tests.
import InlineWorker from '@/workers/fhir-path.worker.ts?worker&inline';

// --- Mock the Worker ---
vi.mock('@/workers/fhir-path.worker.ts?worker&inline', () => {
  const MockWorker = vi.fn(() => ({
    postMessage: vi.fn(),
    terminate: vi.fn(),
    onmessage: null,
    onerror: null,
  }));
  return { default: MockWorker };
});

describe('worker-factory', () => {
  const MockedInlineWorker = vi.mocked(InlineWorker);
  const mockQuestionnaire = {} as Questionnaire;
  const mockQuestionnaireResponse = {} as QuestionnaireResponse;

  // This is a key part of the fix. We need a reference to the mock instance
  // to simulate messages, but we only get it after the factory is imported.
  let mockWorkerInstance: {
    postMessage: vi.Mock;
    terminate: vi.Mock;
    onmessage: any;
    onerror: any;
  };

  beforeEach(() => {
    // This hook runs AFTER vi.resetModules() from the previous test's afterEach.
    // It's a good place to set up for the upcoming test.
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Resetting modules is the correct way to test singletons.
    vi.resetModules();
  });

  it('should create only one worker instance on multiple calls', async () => {
    // Dynamically import to get a fresh instance due to resetModules
    const factory1 = await import('../worker-factory');
    const factory2 = await import('../worker-factory');

    // Start a task with the first import, but don't resolve it.
    factory1.postTaskToFhirPathWorker(mockQuestionnaireResponse, mockQuestionnaire);

    // Now, start a task with the second import.
    // This call should use the SAME underlying worker instance.
    const promiseFromSecondCall = factory2.postTaskToFhirPathWorker(mockQuestionnaireResponse, mockQuestionnaire);

    // Assert
    // The constructor should have only been called once, proving it's a singleton.
    expect(MockedInlineWorker).toHaveBeenCalledTimes(1);
    // The second call should be rejected because the first one is still "in progress".
    // This handles the "unhandled rejection" error correctly.
    await expect(promiseFromSecondCall).rejects.toThrow('FhirPathWorker is busy');
  });

  it('should post a task and resolve with the success payload', async () => {
    const { postTaskToFhirPathWorker } = await import('../worker-factory');
    const mockScores = { fhirScores: { 'item-1': 100 } };

    // Act
    const promise = postTaskToFhirPathWorker(mockQuestionnaireResponse, mockQuestionnaire);

    // Get the created worker instance from the mock
    mockWorkerInstance = MockedInlineWorker.mock.results[0].value;

    // Assert: Check that a message was posted
    expect(mockWorkerInstance.postMessage).toHaveBeenCalledWith({
      questionnaire: mockQuestionnaire,
      questionnaireResponse: mockQuestionnaireResponse,
    });

    // Simulate the worker sending a "success" message back
    mockWorkerInstance.onmessage({
      data: { type: 'success', payload: mockScores },
    });

    // Assert: The promise should resolve with the correct data
    await expect(promise).resolves.toEqual(mockScores);
  });

  it('should reject the promise if the worker sends an error message', async () => {
    const { postTaskToFhirPathWorker } = await import('../worker-factory');
    const errorMessage = 'Something went wrong';

    // Act
    const promise = postTaskToFhirPathWorker(mockQuestionnaireResponse, mockQuestionnaire);

    // Get the created worker instance
    mockWorkerInstance = MockedInlineWorker.mock.results[0].value;

    // Simulate the worker sending an "error" message back
    mockWorkerInstance.onmessage({
      data: { type: 'error', payload: { message: errorMessage, stack: '...stack trace...' } },
    });

    // Assert: The promise should be rejected with the correct error.
    await expect(promise).rejects.toThrow(errorMessage);
  });
});
