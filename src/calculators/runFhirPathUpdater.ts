import { Coding, Quantity, Questionnaire, QuestionnaireItem, QuestionnaireResponse } from 'fhir/r4';

import { newAnswerValueAction } from '@/actions/newValue';
import ItemType from '@/constants/itemType';
import { AppDispatch } from '@/reducers';
import { getDecimalValue } from '@/util';
import { ActionRequester } from '@/util/actionRequester';
import { getQuestionnaireUnitExtensionValue } from '@/util/extension';
import { AnswerPad, FhirPathExtensions } from '@/util/FhirPathExtensions';
import { getQuestionnaireDefinitionItem, getResponseItemAndPathWithLinkId } from '@/util/refero-core';

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
const createQuantity = (item: QuestionnaireItem, extension: Coding, value: number): Quantity => {
  return {
    unit: extension.display,
    system: extension.system,
    code: extension.code,
    value: getDecimalValue(item, value),
  };
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
    const value = scores[linkId];

    if (Array.isArray(value) && actionRequester) {
      for (const itemAndPath of itemsAndPaths) {
        actionRequester.setNewAnswer(linkId, value, itemAndPath.path[0]?.index);
      }
    } else if (Array.isArray(value)) {
      for (const itemAndPath of itemsAndPaths) {
        dispatch(
          newAnswerValueAction({
            itemPath: itemAndPath.path,
            newAnswer: value,
            item,
          })
        );
      }
    } else {
      switch (item.type) {
        case ItemType.QUANTITY: {
          const extension = getQuestionnaireUnitExtensionValue(item);
          if (!extension) continue;

          for (const itemAndPath of itemsAndPaths) {
            if (actionRequester) {
              actionRequester.addQuantityAnswer(
                linkId,
                typeof value === 'string' || typeof value === 'number'
                  ? createQuantity(item, extension, value as number)
                  : (value as Quantity),
                itemAndPath.path[0]?.index
              );
            } else {
              dispatch(
                newAnswerValueAction({
                  itemPath: itemAndPath.path,
                  newAnswer: [
                    typeof value === 'string' || typeof value === 'number'
                      ? createQuantity(item, extension, value as number)
                      : (value as Quantity),
                  ],
                  item,
                })
              );
            }
          }
          break;
        }
        case ItemType.DECIMAL: {
          for (const itemAndPath of itemsAndPaths) {
            const decimalValue = getDecimalValue(item, value as number);
            if (actionRequester) {
              actionRequester.addDecimalAnswer(linkId, decimalValue, itemAndPath.path[0]?.index);
            } else {
              dispatch(
                newAnswerValueAction({
                  itemPath: itemAndPath.path,
                  newAnswer: [{ valueDecimal: decimalValue }],
                  item,
                })
              );
            }
          }
          break;
        }
        case ItemType.INTEGER: {
          for (const itemAndPath of itemsAndPaths) {
            if (actionRequester) {
              actionRequester.addIntegerAnswer(linkId, value as number, itemAndPath.path[0]?.index);
            } else {
              dispatch(
                newAnswerValueAction({
                  itemPath: itemAndPath.path,
                  newAnswer: [{ valueInteger: value as number }],
                  item,
                })
              );
            }
          }

          break;
        }
        case ItemType.BOOLEAN: {
          for (const itemAndPath of itemsAndPaths) {
            if (actionRequester) {
              actionRequester.addBooleanAnswer(linkId, value as boolean, itemAndPath.path[0]?.index);
            } else {
              dispatch(
                newAnswerValueAction({
                  itemPath: itemAndPath.path,
                  newAnswer: [{ valueBoolean: value as boolean }],
                  item,
                })
              );
            }
          }
          break;
        }
        case ItemType.STRING:
        case ItemType.TEXT:
          for (const itemAndPath of itemsAndPaths) {
            if (actionRequester) {
              actionRequester.addStringAnswer(linkId, (value as string) ?? '', itemAndPath.path[0]?.index);
            } else {
              dispatch(
                newAnswerValueAction({
                  itemPath: itemAndPath.path,
                  newAnswer: [{ valueString: (value as string) ?? '' }],
                  item,
                })
              );
            }
          }
          break;
        case ItemType.CHOICE: {
          for (const itemAndPath of itemsAndPaths) {
            if (actionRequester) {
              if (actionRequester.isCheckbox(item)) {
                const answer = value ? (value as Coding[])?.map(x => ({ valueCoding: x })) : [];
                actionRequester.setNewAnswer(linkId, answer, itemAndPath.path[0]?.index);
              } else {
                actionRequester.addChoiceAnswer(linkId, value as Coding, itemAndPath.path[0]?.index);
              }
            } else {
              dispatch(
                newAnswerValueAction({
                  itemPath: itemAndPath.path,
                  newAnswer: [{ valueCoding: value as Coding }],
                  item,
                })
              );
            }
          }
          break;
        }
        case ItemType.OPENCHOICE: {
          for (const itemAndPath of itemsAndPaths) {
            if (actionRequester) {
              if (actionRequester.isCheckbox(item)) {
                const answer = value
                  ? (value as Coding[])?.map(x => (typeof x === 'string' ? { valueString: x } : { valueCoding: x }))
                  : [];
                actionRequester.setNewAnswer(linkId, answer, itemAndPath.path[0]?.index);
              } else {
                actionRequester.addOpenChoiceAnswer(linkId, value as Coding | string, itemAndPath.path[0]?.index);
              }
            } else {
              dispatch(
                newAnswerValueAction({
                  itemPath: itemAndPath.path,
                  newAnswer: [typeof value === 'string' ? { valueString: value } : { valueCoding: value as Coding }],
                  item,
                })
              );
            }
          }
          break;
        }
        case ItemType.DATETIME:
          for (const itemAndPath of itemsAndPaths) {
            if (actionRequester) {
              actionRequester.addDateTimeAnswer(linkId, value as string, itemAndPath.path[0]?.index);
            } else {
              dispatch(
                newAnswerValueAction({
                  itemPath: itemAndPath.path,
                  newAnswer: [{ valueDateTime: value as string }],
                  item,
                })
              );
            }
          }
          break;
        case ItemType.DATE:
          for (const itemAndPath of itemsAndPaths) {
            if (actionRequester) {
              actionRequester.addDateAnswer(linkId, value as string, itemAndPath.path[0]?.index);
            } else {
              dispatch(
                newAnswerValueAction({
                  itemPath: itemAndPath.path,
                  newAnswer: [{ valueDate: value as string }],
                  item,
                })
              );
            }
          }
          break;
        case ItemType.TIME:
          for (const itemAndPath of itemsAndPaths) {
            if (actionRequester) {
              actionRequester.addTimeAnswer(linkId, value as string, itemAndPath.path[0]?.index);
            } else {
              dispatch(
                newAnswerValueAction({
                  itemPath: itemAndPath.path,
                  newAnswer: [{ valueTime: value as string }],
                  item,
                })
              );
            }
          }
      }
    }
  }
};
