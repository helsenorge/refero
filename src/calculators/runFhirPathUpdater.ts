import { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

import InlineWorker from '../workers/fhir-path.worker.ts?worker&inline';

import { newAnswerValuesAction } from '@/actions/newValue';
import { AppDispatch } from '@/reducers';
import { ActionRequester } from '@/util/actionRequester';
import { AnswerPad, FhirPathExtensions } from '@/util/FhirPathExtensions';
import { getQuestionnaireDefinitionItem, getResponseItemAndPathWithLinkId } from '@/util/refero-core';
import { isQuestionnaireResponseItemAnswerArray } from '@/util/typeguards';
import { WorkerResponse } from '@/workers/fhir-path-worker';
type InputParams = {
  questionnaire: Questionnaire;
  questionnaireResponse: QuestionnaireResponse;
  dispatch: AppDispatch;
  actionRequester?: ActionRequester;
};

const performHeavyComputationWithWorker = (
  questionnaireResponse: QuestionnaireResponse,
  questionnaire: Questionnaire
): Promise<{ fhirScores: AnswerPad }> => {
  return new Promise((resolve, reject) => {
    // 3. Create the worker from this temporary URL.
    const worker = new InlineWorker();
    const cleanup = (): void => {
      // signal.removeEventListener('abort', handleAbort);
      worker.terminate();
    };

    // const handleAbort = (): void => {
    //   cleanup();
    //   reject(new DOMException('Aborted', 'AbortError'));
    // };

    // if (signal.aborted) {
    //   return handleAbort();
    // }
    // signal.addEventListener('abort', handleAbort);

    worker.onmessage = (event: MessageEvent<WorkerResponse>): void => {
      const { type, payload } = event.data;
      if (type === 'success') {
        resolve(payload);
      } else if (type === 'error') {
        const error = new Error(payload.message);
        error.stack = payload.stack;
        reject(error);
      }
      cleanup();
    };

    worker.onerror = (err): void => {
      reject(err);
      cleanup();
    };

    worker.postMessage({ questionnaire, questionnaireResponse });
  });
};
export const runFhirPathQrUpdater = async ({
  questionnaire,
  questionnaireResponse,
  dispatch,
  actionRequester,
}: InputParams): Promise<void> => {
  if (!questionnaire || !questionnaireResponse) return;
  try {
    let fhirScores: AnswerPad;
    if (typeof window !== 'undefined' && window.Worker) {
      // If yes, use the high-performance worker version
      const { fhirScores: scores } = await performHeavyComputationWithWorker(questionnaireResponse, questionnaire);
      fhirScores = scores;
    } else {
      // eslint-disable-next-line no-console
      console.warn('Web Workers not supported or not available. Running calculations on the main thread.');
      const fhirPathUpdater = new FhirPathExtensions(questionnaire);
      const updatedResponse = fhirPathUpdater.evaluateAllExpressions(questionnaireResponse);
      fhirScores = fhirPathUpdater.calculateFhirScore(updatedResponse);
    }
    const answerValues = [];
    for (const linkId in fhirScores) {
      const item = getQuestionnaireDefinitionItem(linkId, questionnaire.item);
      if (!item) continue;
      const itemsAndPaths = getResponseItemAndPathWithLinkId(linkId, questionnaireResponse);
      const value = fhirScores[linkId];
      const newAnswer = isQuestionnaireResponseItemAnswerArray(value) ? value : [];
      for (const itemAndPath of itemsAndPaths) {
        if (JSON.stringify(itemAndPath.item.answer) === JSON.stringify(newAnswer)) {
          continue;
        }
        if (actionRequester) {
          actionRequester.setNewAnswer(linkId, newAnswer, itemAndPath.path[0]?.index);
        } else {
          answerValues.push({
            itemPath: itemAndPath.path,
            newAnswer,
            item,
          });
        }
      }
    }
    if (actionRequester) {
      actionRequester.dispatchAllActions(dispatch);
    } else if (answerValues.length !== 0) {
      dispatch(newAnswerValuesAction(answerValues));
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error during FHIR Path update:', error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('An unknown error occurred during FHIR Path update');
    }
  }
};
