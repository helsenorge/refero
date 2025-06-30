/* eslint-disable no-console */
import { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

import { newAnswerValuesAction } from '@/actions/newValue';
import { AppDispatch } from '@/reducers';
import { ActionRequester } from '@/util/actionRequester';
import { AnswerPad, FhirPathExtensions } from '@/util/FhirPathExtensions';
import { getQuestionnaireDefinitionItem, getResponseItemAndPathWithLinkId } from '@/util/refero-core';
import { isQuestionnaireResponseItemAnswerArray } from '@/util/typeguards';
import { postTaskToFhirPathWorker } from '@/workers/worker-factory';
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
      // Use the factory to run the calculation
      try {
        const { fhirScores: scores } = await postTaskToFhirPathWorker(questionnaireResponse, questionnaire);
        fhirScores = scores;
      } catch (error) {
        if (error instanceof Error && error.message.includes('FhirPathWorker is busy')) {
          return; // Exit early and wait for the next trigger.
        } else {
          // If the error is not related to the worker being busy, rethrow it.
          console.error('Error in FHIR Path worker:', error);
        }

        throw error;
      }
    } else {
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
    console.error('Error during FHIR Path update:', error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('An unknown error occurred during FHIR Path update');
    }
  }
};
