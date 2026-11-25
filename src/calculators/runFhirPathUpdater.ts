/* eslint-disable no-console */
import type { AppDispatch } from '@/reducers';
import type { ActionRequester } from '@/util/actionRequester';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

import { type AnswerValuesItemPayload, newAnswerValuesAction, replaceItemCopiesAction } from '@/actions/newValue';
import { getCalculatedAnswerUpdates } from '@/calculators/calculatedAnswers';
import { getChildResponseItems } from '@/util/FhirPathExtensions';
import { resolveFhirPathCalculationOptions } from '@/util/fhirPathOptions';
import { getResponseItemWithPath } from '@/util/refero-core';
import { postTaskToFhirPathWorker } from '@/workers/fhirpath-rpc';
import { runCalculators, type CalculatorResult } from '@/workers/helpers';

type InputParams = {
  questionnaire: Questionnaire | null;
  questionnaireResponse: QuestionnaireResponse;
  dispatch: AppDispatch;
  actionRequester?: ActionRequester;
};

/**
 * Runs a calculation in the worker when a form is loaded and throws the result away. The worker keeps the
 * engine and the results it can reuse, so the first change the user makes costs as little as the next ones
 * instead of a full calculation. Skipped without a worker, where it would block the page.
 */
export function warmUpFhirPathCalculations(questionnaire: Questionnaire, questionnaireResponse: QuestionnaireResponse): void {
  if (typeof window === 'undefined' || !window.Worker) return;
  postTaskToFhirPathWorker({ questionnaire, questionnaireResponse, options: resolveFhirPathCalculationOptions() }).catch(() => {
    // Only a head start; the calculation on the first change does the work if this fails.
  });
}

export const runFhirPathQrUpdater = async ({
  questionnaire,
  questionnaireResponse,
  dispatch,
  actionRequester,
}: InputParams): Promise<void> => {
  if (!questionnaire || !questionnaireResponse) return;
  try {
    // Resolved here rather than inside the worker: the worker has its own
    // module scope and cannot see the options set on the main thread.
    const options = resolveFhirPathCalculationOptions();
    let calculated: CalculatorResult;
    if (typeof window !== 'undefined' && window.Worker) {
      calculated = await postTaskToFhirPathWorker({ questionnaireResponse, questionnaire, options });
    } else {
      calculated = runCalculators({ questionnaireResponse, questionnaire, options });
    }
    const fhirScores = calculated.answerPad;
    const changedItemCopies = calculated.itemCopies.filter(copy => {
      const parent =
        copy.parentPath.length === 0 ? undefined : getResponseItemWithPath(copy.parentPath, { Content: questionnaireResponse });
      const siblings = copy.parentPath.length === 0 ? questionnaireResponse.item : parent && getChildResponseItems(parent);
      const currentOccurrences = (siblings ?? []).filter(sibling => sibling.linkId === copy.linkId);
      return JSON.stringify(currentOccurrences) !== JSON.stringify(copy.items);
    });
    if (changedItemCopies.length > 0) {
      // Occurrences are created and removed here, which the per-linkId answers below cannot express.
      dispatch(replaceItemCopiesAction(changedItemCopies));
    }
    const answerValues: AnswerValuesItemPayload = [];
    for (const { linkId, item, itemPath, newAnswer } of getCalculatedAnswerUpdates(questionnaire, questionnaireResponse, fhirScores)) {
      if (actionRequester) {
        actionRequester.setNewAnswer(linkId, newAnswer ?? [], itemPath[0]?.index);
      } else {
        answerValues.push({ itemPath, newAnswer, item });
      }
    }
    if (actionRequester) {
      actionRequester.dispatchAllActions(dispatch);
    } else if (answerValues.length !== 0) {
      dispatch(newAnswerValuesAction(answerValues));
    }
  } catch (error) {
    console.error('Error during FHIR Path update:', error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('An unknown error occurred during FHIR Path update');
    }
  }
};
