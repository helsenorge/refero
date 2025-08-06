import { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

import { WorkerResponse } from './fhir-path-worker';
import { WorkaroundWorker } from './WorkaroundWorker';

import { AnswerPad } from '@/util/FhirPathExtensions';

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

function processQueue(): void {
  if (isWorkerBusy || taskQueue.length === 0) {
    return;
  }

  isWorkerBusy = true;
  currentTask = taskQueue.shift()!;

  getWorker().postMessage({
    questionnaire: currentTask.questionnaire,
    questionnaireResponse: currentTask.questionnaireResponse,
  });
}

function finishCurrentTaskAndContinue(): void {
  currentTask = null;
  isWorkerBusy = false;
  processQueue();
}

function createWorker(): Worker {
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
        currentTask.reject(error);
      }
    } catch (e) {
      currentTask.reject(e);
    } finally {
      finishCurrentTaskAndContinue();
    }
  };

  worker.onerror = (event: ErrorEvent): void => {
    if (!currentTask) return;

    currentTask.reject(event.error || event);
    finishCurrentTaskAndContinue();
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
    taskQueue.push({ questionnaire, questionnaireResponse, resolve, reject });
    processQueue();
  });
}
