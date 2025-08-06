import { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

import { WorkerResponse } from './fhir-path-worker';
import { WorkaroundWorker } from './WorkaroundWorker';

import { AnswerPad } from '@/util/FhirPathExtensions';

/**
 * Defines the structure of a task object that is placed in the queue.
 * It includes the data for the worker and the promise handlers to be called upon completion.
 */
interface QueuedTask {
  questionnaire: Questionnaire;
  questionnaireResponse: QuestionnaireResponse;
  resolve: (result: { fhirScores: AnswerPad }) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reject: (reason?: any) => void;
}

// --- Module-level state for managing the singleton worker and queue ---

let fhirPathWorker: Worker | null = null;
let isWorkerBusy = false;
const taskQueue: QueuedTask[] = [];
let currentTask: QueuedTask | null = null;

/**
 * The main dispatcher. It checks if the worker is available and if there are tasks
 * waiting, then starts the next one. This function is the heart of the queueing system.
 */
function processQueue(): void {
  // Do not start a new task if the worker is already busy or if the queue is empty.
  if (isWorkerBusy || taskQueue.length === 0) {
    return;
  }

  isWorkerBusy = true;
  // Get the next task from the front of the queue (FIFO).
  // The non-null assertion (!) is safe because we just checked taskQueue.length.
  currentTask = taskQueue.shift()!;

  // Send the task data to the worker.
  getWorker().postMessage({
    questionnaire: currentTask.questionnaire,
    questionnaireResponse: currentTask.questionnaireResponse,
  });
}

/**
 * A cleanup helper called after a task completes (either successfully or with an error).
 * It resets the state and triggers the processing of the next item in the queue.
 */
function finishCurrentTaskAndContinue(): void {
  currentTask = null;
  isWorkerBusy = false;
  // Important: Immediately try to process the next task in the queue.
  processQueue();
}

/**
 * Creates the worker instance and sets up its message and error listeners.
 * This is only called once.
 */
function createWorker(): Worker {
  const worker = WorkaroundWorker({ name: 'fhir-path.worker' });

  worker.onmessage = (event: MessageEvent<WorkerResponse>): void => {
    if (!currentTask) return; // Safety check

    try {
      const { type, payload } = event.data;
      if (type === 'success') {
        currentTask.resolve(payload);
      } else {
        // Handle the 'error' type from the worker
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
    if (!currentTask) return; // Safety check

    // Reject the promise of the task that caused the error.
    currentTask.reject(event.error || event);
    finishCurrentTaskAndContinue();
  };

  return worker;
}

/**
 * Lazily initializes and returns the singleton worker instance.
 */
function getWorker(): Worker {
  if (!fhirPathWorker) {
    fhirPathWorker = createWorker();
  }
  return fhirPathWorker;
}

/**
 * Public function to add a new calculation task to the queue.
 * This implements a sequential (FIFO) queue to ensure every update is processed in order.
 *
 * @param questionnaireResponse The QuestionnaireResponse to be evaluated.
 * @param questionnaire The Questionnaire containing the expressions.
 * @returns A promise that resolves with the calculation results or rejects with an error.
 */
export function postTaskToFhirPathWorker(
  questionnaireResponse: QuestionnaireResponse,
  questionnaire: Questionnaire
): Promise<{ fhirScores: AnswerPad }> {
  return new Promise((resolve, reject) => {
    // Add the new task to the end of the queue.
    taskQueue.push({ questionnaire, questionnaireResponse, resolve, reject });

    // Attempt to start processing the queue. If the worker is idle, this will
    // immediately start the task we just added.
    processQueue();
  });
}
