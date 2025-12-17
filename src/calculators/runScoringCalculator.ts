import type { ActionRequester } from '@/util/actionRequester';
import type { AnswerPad, ScoringCalculator } from '@/util/scoringCalculator';
import type { Quantity, Questionnaire, QuestionnaireResponse } from 'fhir/r4';

import { newValue, type NewValuePayload } from '@/actions/newValue';
import ItemType from '@/constants/itemType';
import { getDecimalValue } from '@/util';
import { getQuestionnaireUnitExtensionValue } from '@/util/extension';
import { getQuestionnaireDefinitionItem, getResponseItemAndPathWithLinkId } from '@/util/refero-core';

export const runScoringCalculator = async (
  questionnaire?: Questionnaire | null,
  questionnaireResponse?: QuestionnaireResponse | null,
  actionRequester?: ActionRequester,
  scoringCalculator?: ScoringCalculator
): Promise<{ payload: NewValuePayload; type: string }[]> => {
  const hasScoring = questionnaireHasScoring(scoringCalculator);
  if (!questionnaire || !questionnaireResponse || !scoringCalculator || !hasScoring || !actionRequester) return [];

  // Calculate scores using the updated response
  const scores = scoringCalculator.calculateScore(questionnaireResponse);

  return updateQuestionnaireResponseWithScore(scores, questionnaire, questionnaireResponse, actionRequester);
};

export const updateQuestionnaireResponseWithScore = (
  scores: AnswerPad,
  questionnaire: Questionnaire,
  questionnaireResponse: QuestionnaireResponse,
  actionRequester: ActionRequester
): { payload: NewValuePayload; type: string }[] => {
  const actions = [];
  for (const linkId in scores) {
    const item = getQuestionnaireDefinitionItem(linkId, questionnaire.item);
    if (!item) continue;
    const itemsAndPaths = getResponseItemAndPathWithLinkId(linkId, questionnaireResponse);
    const value = scores[linkId];

    switch (item.type) {
      case ItemType.QUANTITY: {
        const extension = getQuestionnaireUnitExtensionValue(item);
        if (!extension) continue;

        const quantity: Quantity = {
          unit: extension.display,
          system: extension.system,
          code: extension.code,
          value: getDecimalValue(item, value),
        };
        for (const itemAndPath of itemsAndPaths) {
          actions.push(newValue({ itemPath: itemAndPath.path, valueQuantity: quantity, item }));
        }
        break;
      }
      case ItemType.DECIMAL: {
        const decimalValue = getDecimalValue(item, value);
        for (const itemAndPath of itemsAndPaths) {
          actions.push(newValue({ itemPath: itemAndPath.path, valueDecimal: decimalValue, item }));
        }
        break;
      }
      case ItemType.INTEGER: {
        const intValue = value !== undefined ? Math.round(value) : undefined;
        for (const itemAndPath of itemsAndPaths) {
          actions.push(newValue({ itemPath: itemAndPath.path, valueInteger: intValue, item }));
        }
        break;
      }
    }
  }
  actionRequester.addManyActions(actions);
  return actions;
};
export const questionnaireHasScoring = (scoringCalculator?: ScoringCalculator): boolean => {
  if (!scoringCalculator) return false;
  return scoringCalculator.getIsScoringQuestionnaire() ?? false;
};
