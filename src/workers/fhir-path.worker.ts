/// <reference lib="webworker" />

import { FhirPathExtensions } from '../util/FhirPathExtensions'; // Assuming path is correct
import { WorkerInput, WorkerResponse } from './fhir-path-worker';

// Define the shape of messages we expect from the main thread
// Listen for messages from the main thread
self.addEventListener('message', (event: MessageEvent<WorkerInput>) => {
  const { questionnaire, questionnaireResponse } = event.data;

  try {
    // console.log('Worker: Received task. Starting computation...');

    const fhirPathUpdater = new FhirPathExtensions(questionnaire);

    const updatedResponse = fhirPathUpdater.evaluateAllExpressions(questionnaireResponse);

    const fhirScores = fhirPathUpdater.calculateFhirScore(updatedResponse);

    self.postMessage({ type: 'success', payload: { fhirScores } } as WorkerResponse);
  } catch (error) {
    console.error('WORKER THREW AN UNCAUGHT ERROR:', error);
    self.postMessage({
      type: 'error',
      payload: {
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        stack: error instanceof Error ? error.stack : undefined,
      },
    } as WorkerResponse);
  }
});
