import type { AnswerPad } from '@/util/FhirPathExtensions';
import type {
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
} from 'fhir/r4';

import { pruneEmptyAnswers } from '@/calculators/runEnableWhen_new';
import { isEnableWhenEnabled } from '@/util/isEnableWhenEnabled';
import { getQuestionnaireDefinitionItem, getResponseItemAndPathWithLinkId, type Path } from '@/util/refero-core';
import { isQuestionnaireResponseItemAnswerArray } from '@/util/typeguards';
import { runCalculators } from '@/workers/helpers';

interface CalculatedAnswerUpdate {
  linkId: string;
  item: QuestionnaireItem;
  itemPath: Path[];
  responseItem: QuestionnaireResponseItem;
  newAnswer: QuestionnaireResponseItemAnswer[] | undefined;
}

/**
 * The answers from a calculation that differ from the response, one per response item. Items that are not enabled
 * keep their answer.
 */
export function getCalculatedAnswerUpdates(
  questionnaire: Questionnaire,
  questionnaireResponse: QuestionnaireResponse,
  answerPad: AnswerPad
): CalculatedAnswerUpdate[] {
  const updates: CalculatedAnswerUpdate[] = [];
  for (const linkId in answerPad) {
    const item = getQuestionnaireDefinitionItem(linkId, questionnaire.item);
    if (!item) continue;
    const value = answerPad[linkId];
    const newAnswer = isQuestionnaireResponseItemAnswerArray(value) ? value : undefined;
    for (const itemAndPath of getResponseItemAndPathWithLinkId(linkId, questionnaireResponse)) {
      if (
        item.enableWhen &&
        item.enableWhen.length > 0 &&
        itemAndPath.path &&
        !isEnableWhenEnabled(item.enableWhen, item.enableBehavior, itemAndPath.path, questionnaireResponse.item)
      ) {
        continue;
      }
      if (JSON.stringify(itemAndPath.item.answer ?? undefined) === JSON.stringify(newAnswer ?? undefined)) {
        continue;
      }
      updates.push({ linkId, item, itemPath: itemAndPath.path, responseItem: itemAndPath.item, newAnswer });
    }
  }
  return updates;
}

/**
 * Calculates every copy and calculated expression (cqf-expression and sdf-calculatedExpression) and writes the answers
 * into the response with the same engine and the same rules as runFhirPathQrUpdater, which the form runs after the
 * user changes an answer. Changes and returns the given response.
 *
 * A new QuestionnaireResponse goes through this, so the answers a user submits do not depend on whether they changed
 * something first. sdf-scoring is calculated separately, by runScoringCalculator.
 */
export function applyCalculatedAnswers(questionnaire: Questionnaire, questionnaireResponse: QuestionnaireResponse): QuestionnaireResponse {
  // Item copies are applied separately, by withItemCopiesApplied in generateQuestionnaireResponse.
  const { answerPad } = runCalculators({ questionnaire, questionnaireResponse });
  for (const update of getCalculatedAnswerUpdates(questionnaire, questionnaireResponse, answerPad)) {
    // The same as the reducer does with newAnswerValuesAction.
    update.responseItem.answer = pruneEmptyAnswers(update.newAnswer);
  }
  return questionnaireResponse;
}
