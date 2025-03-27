import { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

import { newAnswerValueAction } from '@/actions/newValue';
import { AppDispatch } from '@/reducers';
import { ActionRequester } from '@/util/actionRequester';
import { AnswerPad, FhirPathExtensions } from '@/util/FhirPathExtensions';
import { getQuestionnaireDefinitionItem, getResponseItemAndPathWithLinkId } from '@/util/refero-core';
import { isQuestionnaireResponseItemAnswerArray } from '@/util/typeguards';

type InputParams = {
  questionnaire: Questionnaire;
  questionnaireResponse: QuestionnaireResponse;
  dispatch: AppDispatch;
  actionRequester?: ActionRequester;
  fhirPathUpdater?: FhirPathExtensions;
};

export const runFhirPathQrUpdater = async ({
  questionnaire,
  questionnaireResponse,
  dispatch,
  actionRequester,
  fhirPathUpdater,
}: InputParams): Promise<void> => {
  if (!questionnaire || !questionnaireResponse || !fhirPathUpdater) return;

  // Evaluate all expressions and get the updated response
  const updatedResponse = fhirPathUpdater.evaluateAllExpressions(questionnaireResponse);
  //TODO: Figure out a way to not run this on all changes
  // if (JSON.stringify(updatedResponse) === JSON.stringify(questionnaireResponse)) {
  //   return;
  // }
  // Calculate FHIR scores using the same updated response
  const fhirScores = fhirPathUpdater.calculateFhirScore(updatedResponse);
  updateQuestionnaireResponseWithScore(fhirScores, questionnaire, dispatch, updatedResponse, actionRequester);
};

const updateQuestionnaireResponseWithScore = (
  scores: AnswerPad,
  questionnaire: Questionnaire,
  dispatch: AppDispatch,
  questionnaireResponse: QuestionnaireResponse,
  actionRequester?: ActionRequester
): void => {
  for (const linkId in scores) {
    const item = getQuestionnaireDefinitionItem(linkId, questionnaire.item);
    if (!item) continue;
    const itemsAndPaths = getResponseItemAndPathWithLinkId(linkId, questionnaireResponse);
    for (const itemAndPath of itemsAndPaths) {
      const value = scores[linkId];
      if (actionRequester) {
        actionRequester.setNewAnswer(linkId, isQuestionnaireResponseItemAnswerArray(value) ? value : [], itemAndPath.path[0]?.index);
      } else {
        dispatch(
          newAnswerValueAction({
            itemPath: itemAndPath.path,
            newAnswer: isQuestionnaireResponseItemAnswerArray(value) ? value : [],
            item,
          })
        );
      }
    }
  }
};
