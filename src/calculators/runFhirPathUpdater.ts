/* eslint-disable no-console */
import type { AppDispatch } from '@/reducers';
import type { ActionRequester } from '@/util/actionRequester';
import type { AnswerPad } from '@/util/FhirPathExtensions';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

import { type AnswerValuesItemPayload, newAnswerValuesAction } from '@/actions/newValue';
import { isEnableWhenEnabled } from '@/hooks/useIsEnabled';
import { resolveFhirPathCalculationOptions } from '@/util/fhirPathOptions';
import { getQuestionnaireDefinitionItem, getResponseItemAndPathWithLinkId } from '@/util/refero-core';
import { isQuestionnaireResponseItemAnswerArray } from '@/util/typeguards';
import { postTaskToFhirPathWorker } from '@/workers/fhirpath-rpc';
import { runCalculators } from '@/workers/helpers';

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
    let fhirScores: AnswerPad;
    if (typeof window !== 'undefined' && window.Worker) {
      fhirScores = await postTaskToFhirPathWorker({ questionnaireResponse, questionnaire, options });
    } else {
      fhirScores = runCalculators({ questionnaireResponse, questionnaire, options });
    }
    const answerValues: AnswerValuesItemPayload = [];
    for (const linkId in fhirScores) {
      const item = getQuestionnaireDefinitionItem(linkId, questionnaire.item);
      if (!item) continue;
      const itemsAndPaths = getResponseItemAndPathWithLinkId(linkId, questionnaireResponse);
      const value = fhirScores[linkId];
      const newAnswer = isQuestionnaireResponseItemAnswerArray(value) ? value : undefined;
      for (const itemAndPath of itemsAndPaths) {
        let enabled = true;
        if (item.enableWhen && item.enableWhen.length > 0 && itemAndPath.path) {
          enabled = isEnableWhenEnabled(item?.enableWhen, item?.enableBehavior, itemAndPath.path, questionnaireResponse.item);
        }
        if (!enabled) {
          continue;
        }
        if (JSON.stringify(itemAndPath.item.answer ?? undefined) === JSON.stringify(newAnswer ?? undefined)) {
          continue;
        }
        if (actionRequester) {
          actionRequester.setNewAnswer(linkId, newAnswer ?? [], itemAndPath.path[0]?.index);
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
    console.error('Error during FHIR Path update:', error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('An unknown error occurred during FHIR Path update');
    }
  }
};
