import { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

import { WorkerResponse } from './fhir-path-worker';
// import InlineWorker from './fhir-path.worker.ts?worker&inline';

import { AnswerPad } from '@/util/FhirPathExtensions';

let fhirPathWorker: Worker | null = null;
let onGoingCalculation: ((result: { fhirScores: AnswerPad }) => void) | null = null;
let onGoingError: ((reason?: Error | ErrorEvent) => void) | null = null;

function createWorker(): Worker {
  const worker = new Worker(new URL('./fhir-path.worker.ts?worker', import.meta.url), {
    type: 'module',
    name: 'fhirPathWorker',
  });

  worker.onmessage = (event: MessageEvent<WorkerResponse>): void => {
    if (!onGoingCalculation) {
      return;
    }
    try {
      const { type, payload } = event.data;
      if (type === 'success') {
        onGoingCalculation(payload);
      } else if (type === 'error' && onGoingError) {
        const error = new Error(payload.message);
        error.stack = payload.stack;
        onGoingError(error);
      }
    } catch (error) {
      if (onGoingError) {
        onGoingError(error as Error);
      }
    }
    onGoingCalculation = null;
    onGoingError = null;
  };

  worker.onerror = (event): void => {
    // Log the specific error message and stack if they exist on the event
    if (onGoingError) {
      onGoingError(event.error || event);
    }

    onGoingCalculation = null;
    onGoingError = null;
  };

  return worker;
}

function getWorker(): Worker {
  if (!fhirPathWorker) {
    fhirPathWorker = createWorker();
  }
  return fhirPathWorker;
}

export function postTaskToFhirPathWorker(
  questionnaireResponse: QuestionnaireResponse,
  questionnaire: Questionnaire
): Promise<{ fhirScores: AnswerPad }> {
  return new Promise((resolve, reject) => {
    const worker = getWorker();

    if (onGoingCalculation) {
      return reject(new Error('FhirPathWorker is busy. A calculation is already in progress.'));
    }

    onGoingCalculation = resolve;
    onGoingError = reject;

    worker.postMessage({ questionnaire, questionnaireResponse });
  });
}
