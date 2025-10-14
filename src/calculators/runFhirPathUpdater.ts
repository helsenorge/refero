/* eslint-disable no-console */
import { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

import { AnswerValuesItemPayload, newAnswerValuesAction } from '@/actions/newValue';
import { isEnableWhenEnabled } from '@/hooks/useIsEnabled';
import { AppDispatch } from '@/reducers';
import { ActionRequester } from '@/util/actionRequester';
import { AnswerPad, FhirPathExtensions } from '@/util/FhirPathExtensions';
import { getQuestionnaireDefinitionItem, getResponseItemAndPathWithLinkId } from '@/util/refero-core';
import { isQuestionnaireResponseItemAnswerArray } from '@/util/typeguards';
import { postTaskToFhirPathWorker } from '@/workers/fhirpath-rpc';

type InputParams = {
  questionnaire: Questionnaire;
  questionnaireResponse: QuestionnaireResponse;
  dispatch: AppDispatch;
  actionRequester?: ActionRequester;
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
      fhirScores = await postTaskToFhirPathWorker({ questionnaireResponse, questionnaire });
    } else {
      const fhirPathUpdater = new FhirPathExtensions(questionnaire);
      fhirScores = fhirPathUpdater.calculateFhirScore(fhirPathUpdater.evaluateAllExpressions(questionnaireResponse));
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
