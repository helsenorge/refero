/* eslint-disable no-console */
import type { AppDispatch } from '@/reducers';
import type { ActionRequester } from '@/util/actionRequester';
import type { AnswerPad } from '@/util/FhirPathExtensions';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

import { type AnswerValuesItemPayload, newAnswerValuesAction } from '@/actions/newValue';
import { isEnableWhenEnabled } from '@/hooks/useIsEnabled';
import { resolveFhirPathCalculationOptions, type FhirPathCalculationOptions } from '@/util/fhirPathOptions';
import { getQuestionnaireDefinitionItem, getResponseItemAndPathWithLinkId } from '@/util/refero-core';
import { isQuestionnaireResponseItemAnswerArray } from '@/util/typeguards';
import { postTaskToFhirPathWorker } from '@/workers/fhirpath-rpc';
import { runCalculators } from '@/workers/helpers';

type InputParams = {
  questionnaire: Questionnaire | null;
  questionnaireResponse: QuestionnaireResponse;
  dispatch: AppDispatch;
  actionRequester?: ActionRequester;
  fhirPathOptions?: FhirPathCalculationOptions;
};

export const runFhirPathQrUpdater = async ({
  questionnaire,
  questionnaireResponse,
  dispatch,
  actionRequester,
  fhirPathOptions,
}: InputParams): Promise<void> => {
  if (!questionnaire || !questionnaireResponse) return;
  try {
    // Resolved here rather than inside the worker: the worker has its own
    // module scope and cannot see the options set on the main thread.
    const options = resolveFhirPathCalculationOptions(fhirPathOptions);
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
