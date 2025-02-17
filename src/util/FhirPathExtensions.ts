import {
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItemAnswer,
  QuestionnaireResponseItem,
  Extension,
  Coding,
  Quantity,
} from 'fhir/r4';

import { getItemControlValue } from './choice';
import { getCalculatedExpressionExtension, getCopyExtension } from './extension';
import { evaluateFhirpathExpressionToGetString } from './fhirpathHelper';
import { createDummySectionScoreItem } from './scoring';
import itemType from '../constants/itemType';

import { Extensions } from '@/constants/extensions';
import ItemControlConstants from '@/constants/itemcontrol';

export interface AnswerPad {
  [linkId: string]: number | undefined | string | Coding | boolean | Coding[] | Quantity;
}
export enum FhirPathItemType {
  QUESTION_FHIRPATH_SCORE = 'QUESTION_FHIRPATH_SCORE',
  QUESTION_FHIRPATH_COPY = 'QUESTION_FHIRPATH_COPY',
  NONE = 'NONE',
}

export function fhirPathItemType(item: QuestionnaireItem): FhirPathItemType {
  if (item.extension) {
    for (const extension of item.extension) {
      if (extension.url === Extensions.COPY_EXPRESSION_URL) {
        return FhirPathItemType.QUESTION_FHIRPATH_COPY;
      }
      if (extension.url === Extensions.CALCULATED_EXPRESSION_URL) {
        return FhirPathItemType.QUESTION_FHIRPATH_SCORE;
      }
    }
  }

  return FhirPathItemType.NONE;
}
export class FhirPathExtensions {
  private questionnaire: Questionnaire;
  private fhirScoreCache: Map<string, QuestionnaireItem> = new Map<string, QuestionnaireItem>();

  constructor(questionnaire: Questionnaire) {
    this.questionnaire = questionnaire;
    this.initializeCaches(questionnaire);
  }

  private initializeCaches(questionnaire: Questionnaire): void {
    this.traverseQuestionnaire(questionnaire);
  }

  private traverseQuestionnaire(qItem: Questionnaire | QuestionnaireItem, level: number = 0): void {
    if (qItem.item) {
      for (const subItem of qItem.item) {
        this.traverseQuestionnaire(subItem, level + 1);
      }
    }

    if (level === 0) {
      const itm = createDummySectionScoreItem();
      this.traverseQuestionnaire(itm, level + 1);
    }

    return this.processItem(qItem);
  }

  private processItem(qItem: Questionnaire | QuestionnaireItem): void {
    if (!this.isOfTypeQuestionnaireItem(qItem)) {
      return;
    }

    const type = fhirPathItemType(qItem);

    switch (type) {
      case FhirPathItemType.QUESTION_FHIRPATH_COPY:
      case FhirPathItemType.QUESTION_FHIRPATH_SCORE:
        this.fhirScoreCache.set(qItem.linkId, qItem);
        break;
      default:
        break;
    }
  }

  private isOfTypeQuestionnaireItem(item: Questionnaire | QuestionnaireItem): item is QuestionnaireItem {
    return 'type' in item;
  }
  public evaluateAllExpressions(questionnaireResponse: QuestionnaireResponse): QuestionnaireResponse {
    return this.evaluateCalculatedExpressions(questionnaireResponse);
  }

  public calculateFhirScore(questionnaireResponse: QuestionnaireResponse): AnswerPad {
    const answerPad: AnswerPad = {};
    for (const [key, value] of this.fhirScoreCache) {
      answerPad[key] = this.valueOfQuestionFhirpathItem(value, questionnaireResponse);
    }
    return answerPad;
  }

  private valueOfQuestionFhirpathItem(
    item: QuestionnaireItem,
    questionnaireResponse: QuestionnaireResponse
  ): number | undefined | string | Coding | boolean | Coding[] | Quantity {
    const expressionExtension = getCalculatedExpressionExtension(item) || getCopyExtension(item);
    if (!expressionExtension) return undefined;

    const result = evaluateFhirpathExpressionToGetString(expressionExtension, questionnaireResponse);
    if (!result.length) return undefined;

    if (item.type === itemType.INTEGER) {
      return isNaN(result[0]) || !isFinite(result[0]) ? undefined : Math.round(result[0]);
    }
    if (item.type === itemType.CHOICE || item.type === itemType.OPENCHOICE) {
      if (this.isCheckbox(item)) {
        return result;
      }
    }
    return result[0];
  }

  public hasFhirPaths(): boolean {
    const hasScoringInItem = (item: QuestionnaireItem): boolean => {
      if (fhirPathItemType(item) !== FhirPathItemType.NONE) {
        return true;
      }
      if (item.item && item.item.length > 0) {
        return item.item.some(nestedItem => hasScoringInItem(nestedItem));
      }
      return false;
    };

    return this.questionnaire?.item?.some(item => hasScoringInItem(item)) ?? false;
  }

  private evaluateCalculatedExpressions(questionnaireResponse: QuestionnaireResponse): QuestionnaireResponse {
    // Function to evaluate an expression and return a new answer
    const evaluateExpression = (
      qItem: QuestionnaireItem,
      expressionExtension: Extension,
      response: QuestionnaireResponse
    ): QuestionnaireResponseItemAnswer | null => {
      if (expressionExtension && expressionExtension.valueString) {
        const result = evaluateFhirpathExpressionToGetString(expressionExtension, response);
        if (result.length > 0) {
          const calculatedValue = result[0];

          let newAnswer: QuestionnaireResponseItemAnswer = {};
          switch (qItem.type) {
            case itemType.BOOLEAN:
              newAnswer = { valueBoolean: Boolean(calculatedValue) };
              break;
            case itemType.DECIMAL:
              newAnswer = { valueDecimal: Number(calculatedValue) };
              break;
            case itemType.INTEGER:
              newAnswer = { valueInteger: Number(calculatedValue) };
              break;
            case itemType.QUANTITY:
              newAnswer = { valueQuantity: calculatedValue };
              break;
            case itemType.DATE:
              newAnswer = { valueDate: String(calculatedValue) };
              break;
            case itemType.DATETIME:
              newAnswer = { valueDateTime: String(calculatedValue) };
              break;
            case itemType.TIME:
              newAnswer = { valueTime: String(calculatedValue) };
              break;
            case itemType.STRING:
            case itemType.TEXT:
              newAnswer = { valueString: String(calculatedValue) };
              break;
            case itemType.CHOICE:
            case itemType.OPENCHOICE:
              newAnswer = { valueCoding: calculatedValue };
              break;
            case itemType.ATTATCHMENT:
              newAnswer = { valueAttachment: calculatedValue };
              break;
            default:
              break;
          }
          return newAnswer;
        }
      }
      return null;
    };

    const traverseItems = (
      qItems: QuestionnaireItem[],
      qrItems: QuestionnaireResponseItem[],
      response: QuestionnaireResponse
    ): QuestionnaireResponseItem[] => {
      const newQrItems: QuestionnaireResponseItem[] = [];

      for (const qItem of qItems) {
        // Find all qrItems with matching linkId
        const matchingQrItems = qrItems.filter(qrItem => qrItem.linkId === qItem.linkId);

        if (matchingQrItems.length === 0) {
          // Handle case where there's no matching qrItem
          // Optional: Create a new qrItem if needed
        } else {
          const updatedQrItems = matchingQrItems.map(qrItem => {
            let newQrItem: QuestionnaireResponseItem = { ...qrItem };

            const calculatedExpression = getCalculatedExpressionExtension(qItem);
            const copyExtension = getCopyExtension(qItem);

            let newAnswer: QuestionnaireResponseItemAnswer | null = null;

            if (calculatedExpression && !copyExtension) {
              newAnswer = evaluateExpression(qItem, calculatedExpression, response);
            }

            if (copyExtension) {
              newAnswer = evaluateExpression(qItem, copyExtension, response);
            }

            if (newAnswer) {
              newQrItem = {
                ...newQrItem,
                answer: [newAnswer],
              };
            }

            if (qItem?.item && qrItem?.item) {
              newQrItem = {
                ...newQrItem,
                item: traverseItems(qItem.item, qrItem.item, response),
              };
            }

            return newQrItem;
          });

          newQrItems.push(...updatedQrItems);
        }
      }

      return newQrItems;
    };

    const newQuestionnaireResponse: QuestionnaireResponse = {
      ...questionnaireResponse,
      item: questionnaireResponse.item
        ? traverseItems(this.questionnaire.item || [], questionnaireResponse.item, questionnaireResponse)
        : undefined,
    };
    return newQuestionnaireResponse;
  }
  private isCheckbox(item: QuestionnaireItem): boolean {
    return getItemControlValue(item) === ItemControlConstants.CHECKBOX;
  }
}
