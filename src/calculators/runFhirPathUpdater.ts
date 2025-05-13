import { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

import { newAnswerValuesAction } from '@/actions/newValue';
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
  const updatedResponse = fhirPathUpdater.evaluateAllExpressions(questionnaireResponse);

  const fhirScores = fhirPathUpdater.calculateFhirScore(updatedResponse);

  updateQuestionnaireResponseWithScore(fhirScores, questionnaire, dispatch, questionnaireResponse, actionRequester);
};

const updateQuestionnaireResponseWithScore = (
  scores: AnswerPad,
  questionnaire: Questionnaire,
  dispatch: AppDispatch,
  questionnaireResponse: QuestionnaireResponse,
  actionRequester?: ActionRequester
): void => {
  const answerValues = [];
  for (const linkId in scores) {
    const item = getQuestionnaireDefinitionItem(linkId, questionnaire.item);
    if (!item) continue;
    const itemsAndPaths = getResponseItemAndPathWithLinkId(linkId, questionnaireResponse);
    const value = scores[linkId];
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
};
