import { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

import { WorkerResponse } from './fhir-path-worker';

import { AnswerPad } from '@/util/FhirPathExtensions';
import InlineWorker from '@/workers/fhir-path.worker.ts?worker&inline';

let fhirPathWorker: Worker | null = null;
let onGoingCalculation: ((result: { fhirScores: AnswerPad }) => void) | null = null;
let onGoingError: ((reason?: Error | ErrorEvent) => void) | null = null;

function createWorker(): Worker {
  const worker = new InlineWorker();
  worker.onmessage = (event: MessageEvent<WorkerResponse>): void => {
    if (!onGoingCalculation) return;

    const { type, payload } = event.data;
    if (type === 'success') {
      onGoingCalculation(payload);
    } else if (type === 'error' && onGoingError) {
      const error = new Error(payload.message);
      error.stack = payload.stack;
      onGoingError(error);
    }

    onGoingCalculation = null;
    onGoingError = null;
  };

  worker.onerror = (err): void => {
    if (onGoingError) {
      onGoingError(err);
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
