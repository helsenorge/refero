import { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

import { WorkerResponse } from './fhir-path-worker';
import { WorkaroundWorker } from './WorkaroundWorker';

import { AnswerPad, FhirPathExtensions } from '@/util/FhirPathExtensions';

interface QueuedTask {
  questionnaire: Questionnaire;
  questionnaireResponse: QuestionnaireResponse;
  resolve: (result: { fhirScores: AnswerPad }) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reject: (reason?: any) => void;
}

let fhirPathWorker: Worker | null = null;
let isWorkerBusy = false;
const taskQueue: QueuedTask[] = [];
let currentTask: QueuedTask | null = null;
let workerDisabled = false;

function computeOnMainThread(qr: QuestionnaireResponse, q: Questionnaire): { fhirScores: AnswerPad } {
  const fhirPathUpdater = new FhirPathExtensions(q);
  const updatedResponse = fhirPathUpdater.evaluateAllExpressions(qr);
  const fhirScores = fhirPathUpdater.calculateFhirScore(updatedResponse);
  return { fhirScores };
}

function processQueue(): void {
  if (isWorkerBusy || taskQueue.length === 0) {
    return;
  }

  isWorkerBusy = true;
  currentTask = taskQueue.shift()!;

  if (workerDisabled) {
    try {
      const result = computeOnMainThread(currentTask.questionnaireResponse, currentTask.questionnaire);
      currentTask.resolve(result);
    } catch (e) {
      currentTask.reject(e);
    } finally {
      finishCurrentTaskAndContinue();
    }
    return;
  }
  const w = getWorkerOrNull();
  if (!w) {
    workerDisabled = true;
    try {
      const result = computeOnMainThread(currentTask.questionnaireResponse, currentTask.questionnaire);
      currentTask.resolve(result);
    } catch (e) {
      currentTask.reject(e);
    } finally {
      finishCurrentTaskAndContinue();
    }
    return;
  }
  w.postMessage({
    questionnaire: currentTask.questionnaire,
    questionnaireResponse: currentTask.questionnaireResponse,
  });
}

function finishCurrentTaskAndContinue(): void {
  currentTask = null;
  isWorkerBusy = false;
  processQueue();
}

function createWorkerOrDisable(): Worker | null {
  try {
    const worker = WorkaroundWorker({ name: 'fhir-path.worker' });

    worker.onmessage = (event: MessageEvent<WorkerResponse>): void => {
      if (!currentTask) return;

      try {
        const { type, payload } = event.data;
        if (type === 'success') {
          currentTask.resolve(payload);
        } else {
          const error = new Error(payload.message ?? 'An unknown worker error occurred');
          error.stack = payload.stack;
          workerDisabled = true;
          currentTask.reject(error);
        }
      } catch (e) {
        workerDisabled = true;
        currentTask.reject(e);
      } finally {
        finishCurrentTaskAndContinue();
      }
    };

    worker.onerror = (event: ErrorEvent): void => {
      workerDisabled = true;

      if (currentTask) {
        try {
          const result = computeOnMainThread(currentTask.questionnaireResponse, currentTask.questionnaire);
          currentTask.resolve(result);
        } catch (e) {
          currentTask.reject(event.error || e || event);
        } finally {
          finishCurrentTaskAndContinue();
        }
      }

      try {
        worker.terminate();
      } catch {
        /* ignore */
      }
      fhirPathWorker = null;
    };

    return worker;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_e) {
    workerDisabled = true;
    return null;
  }
}
function getWorkerOrNull(): Worker | null {
  if (workerDisabled) return null;
  if (!fhirPathWorker) {
    fhirPathWorker = createWorkerOrDisable();
  }
  return fhirPathWorker;
}

export function postTaskToFhirPathWorker(
  questionnaireResponse: QuestionnaireResponse,
  questionnaire: Questionnaire
): Promise<{ fhirScores: AnswerPad }> {
  return new Promise((resolve, reject) => {
    taskQueue.push({ questionnaire, questionnaireResponse, resolve, reject });
    processQueue();
  });
}
