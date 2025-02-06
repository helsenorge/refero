import { useEffect, useState } from 'react';

import { Quantity, Questionnaire, QuestionnaireResponse } from 'fhir/r4';

import { newDecimalValueAction, newIntegerValueAction, newQuantityValueAction } from '@/actions/newValue';
import ItemType from '@/constants/itemType';
import { useAppDispatch, useAppSelector } from '@/reducers';
import { getFormDefinition } from '@/reducers/form';
import { getDecimalValue } from '@/util';
import { ActionRequester } from '@/util/actionRequester';
import { getQuestionnaireUnitExtensionValue } from '@/util/extension';
import { getQuestionnaireDefinitionItem, getResponseItemAndPathWithLinkId } from '@/util/refero-core';
import { AnswerPad, ScoringCalculator } from '@/util/scoringCalculator';

export const useScoringCalculator = (): {
  runScoringCalculator: (
    questionnaire?: Questionnaire | null,
    questionnaireResponse?: QuestionnaireResponse | null,
    actionRequester?: ActionRequester
  ) => Promise<void>;
} => {
  const formDefinition = useAppSelector(state => getFormDefinition(state));
  const dispatch = useAppDispatch();
  const [scoringCalculator, setScoringCalculator] = useState<ScoringCalculator | undefined>();

  useEffect(() => {
    if (formDefinition?.Content) {
      setScoringCalculator(new ScoringCalculator(formDefinition.Content));
    }
  }, [formDefinition?.Content]);

  const runScoringCalculator = async (
    questionnaire?: Questionnaire | null,
    questionnaireResponse?: QuestionnaireResponse | null,
    actionRequester?: ActionRequester
  ): Promise<void> => {
    if (!questionnaire || !questionnaireResponse || !scoringCalculator || !questionnaireHasScoring() || !actionRequester) return;

    // Calculate scores using the updated response
    const scores = scoringCalculator.calculateScore(questionnaireResponse);
    updateQuestionnaireResponseWithScore(scores, questionnaire, questionnaireResponse, actionRequester);
  };
  const updateQuestionnaireResponseWithScore = (
    scores: AnswerPad,
    questionnaire: Questionnaire,
    questionnaireResponse: QuestionnaireResponse,
    actionRequester: ActionRequester
  ): void => {
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
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            actionRequester;
            dispatch(newQuantityValueAction({ itemPath: itemAndPath.path, valueQuantity: quantity, item }));
          }
          break;
        }
        case ItemType.DECIMAL: {
          const decimalValue = getDecimalValue(item, value);
          for (const itemAndPath of itemsAndPaths) {
            dispatch(newDecimalValueAction({ itemPath: itemAndPath.path, valueDecimal: decimalValue, item }));
          }
          break;
        }
        case ItemType.INTEGER: {
          const intValue = value !== undefined ? Math.round(value) : undefined;
          for (const itemAndPath of itemsAndPaths) {
            dispatch(newIntegerValueAction({ itemPath: itemAndPath.path, valueInteger: intValue, item }));
          }
          break;
        }
      }
    }
  };
  const questionnaireHasScoring = (): boolean => {
    if (!scoringCalculator) return false;
    return scoringCalculator.getIsScoringQuestionnaire() ?? false;
  };
  return { runScoringCalculator };
};
