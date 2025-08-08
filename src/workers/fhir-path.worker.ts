/// <reference lib="webworker" />

import { FhirPathExtensions } from '@/util/FhirPathExtensions';
import { WorkerInput, WorkerResponse } from '@/workers/fhir-path-worker';

self.addEventListener('message', (event: MessageEvent<WorkerInput>) => {
  const { questionnaire, questionnaireResponse } = event.data;

  try {
    const fhirPathUpdater = new FhirPathExtensions(questionnaire);
    const updatedResponse = fhirPathUpdater.evaluateAllExpressions(questionnaireResponse);
    const fhirScores = fhirPathUpdater.calculateFhirScore(updatedResponse);

    self.postMessage({ type: 'success', payload: { fhirScores } } as WorkerResponse);
  } catch (error) {
    self.postMessage({
      type: 'error',
      payload: {
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        stack: error instanceof Error ? error.stack : undefined,
      },
    } as WorkerResponse);
  }
});
