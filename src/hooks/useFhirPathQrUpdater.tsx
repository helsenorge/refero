import ItemType from '@/constants/itemType';
import { GlobalState } from '@/reducers';
import { getFormDefinition } from '@/reducers/form';
import { getDecimalValue } from '@/util';
import { ActionRequester } from '@/util/actionRequester';
import { getQuestionnaireUnitExtensionValue } from '@/util/extension';
import { AnswerPad, FhirPathExtensions } from '@/util/FhirPathExtensions';
import { getQuestionnaireDefinitionItem, getResponseItemAndPathWithLinkId } from '@/util/refero-core';
import { Coding, Quantity, Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export const useFhirPathQrUpdater = (): {
  runFhirPathQrUpdater: (
    questionnaire: Questionnaire,
    questionnaireResponse: QuestionnaireResponse,
    actionRequester: ActionRequester
  ) => void;
} => {
  const formDefinition = useSelector((state: GlobalState) => getFormDefinition(state));
  const [fhirPathUpdater, setFhirPathUpdater] = useState<FhirPathExtensions | undefined>();

  useEffect(() => {
    if (formDefinition?.Content) {
      setFhirPathUpdater(new FhirPathExtensions(formDefinition.Content));
    }
  }, [formDefinition?.Content]);

  const runFhirPathQrUpdater = (
    questionnaire: Questionnaire,
    questionnaireResponse: QuestionnaireResponse,
    actionRequester: ActionRequester
  ): void => {
    if (!questionnaire || !questionnaireResponse || !fhirPathUpdater) return;

    // Evaluate all expressions and get the updated response
    const updatedResponse = fhirPathUpdater.evaluateAllExpressions(questionnaireResponse);
    //TODO: Figure out a way to not run this on all changes
    // if (JSON.stringify(updatedResponse) === JSON.stringify(questionnaireResponse)) {
    //   return;
    // }
    // Calculate FHIR scores using the same updated response

    const fhirScores = fhirPathUpdater.calculateFhirScore(updatedResponse);

    updateQuestionnaireResponseWithScore(fhirScores, questionnaire, updatedResponse, actionRequester);
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
            value: getDecimalValue(item, value as number),
          };
          for (const itemAndPath of itemsAndPaths) {
            actionRequester.addQuantityAnswer(linkId, quantity as Quantity, itemAndPath.path[0]?.index);
          }
          break;
        }
        case ItemType.DECIMAL: {
          for (const itemAndPath of itemsAndPaths) {
            const decimalValue = getDecimalValue(item, value as number);
            actionRequester.addDecimalAnswer(linkId, decimalValue, itemAndPath.path[0]?.index);
          }
          break;
        }
        case ItemType.INTEGER: {
          for (const itemAndPath of itemsAndPaths) {
            actionRequester.addIntegerAnswer(linkId, value as number, itemAndPath.path[0]?.index);
          }

          break;
        }
        case ItemType.BOOLEAN: {
          for (const itemAndPath of itemsAndPaths) {
            actionRequester.addBooleanAnswer(linkId, value as boolean, itemAndPath.path[0]?.index);
          }
          break;
        }
        case ItemType.STRING:
        case ItemType.TEXT:
          for (const itemAndPath of itemsAndPaths) {
            actionRequester.addStringAnswer(linkId, (value as string) ?? '', itemAndPath.path[0]?.index);
          }
          break;
        case ItemType.CHOICE: {
          for (const itemAndPath of itemsAndPaths) {
            if (actionRequester.isCheckbox(item)) {
              const answer = value ? (value as Coding[])?.map(x => ({ valueCoding: x })) : [];
              actionRequester.setNewAnswer(linkId, answer, itemAndPath.path[0]?.index);
            } else {
              actionRequester.addChoiceAnswer(linkId, value as Coding, itemAndPath.path[0]?.index);
            }
          }
          break;
        }
        case ItemType.OPENCHOICE: {
          for (const itemAndPath of itemsAndPaths) {
            if (actionRequester.isCheckbox(item)) {
              const answer = value ? (value as Coding[])?.map(x => (typeof x === 'string' ? { valueString: x } : { valueCoding: x })) : [];
              actionRequester.setNewAnswer(linkId, answer, itemAndPath.path[0]?.index);
            } else {
              actionRequester.addOpenChoiceAnswer(linkId, value as Coding | string, itemAndPath.path[0]?.index);
            }
          }
          break;
        }
        case ItemType.DATETIME:
          for (const itemAndPath of itemsAndPaths) {
            actionRequester.addDateTimeAnswer(linkId, value as string, itemAndPath.path[0]?.index);
          }
          break;
        case ItemType.DATE:
          for (const itemAndPath of itemsAndPaths) {
            actionRequester.addDateAnswer(linkId, value as string, itemAndPath.path[0]?.index);
          }
          break;
        case ItemType.TIME:
          for (const itemAndPath of itemsAndPaths) {
            actionRequester.addTimeAnswer(linkId, value as string, itemAndPath.path[0]?.index);
          }
      }
    }
  };

  return { runFhirPathQrUpdater };
};
