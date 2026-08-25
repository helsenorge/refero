import type {
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItemAnswer,
  QuestionnaireResponseItem,
  Extension,
  Coding,
  Quantity,
  Attachment,
} from 'fhir/r4';

import { getCalculatedExpressionExtension, getCopyExtension, getQuestionnaireUnitExtensionValue } from './extension';
import { evaluateFhirpathExpressionToGetString, type FhirPathEnvVars } from './fhirpathHelper';
import {
  resolveFhirPathCalculationOptions,
  type FhirPathCalculationOptions,
  type ResolvedFhirPathCalculationOptions,
} from './fhirPathOptions';
import { getAllResponseitemsByLinkIdAndQuestionnaireResponse } from './refero-core';
import { isQuantity } from './typeguards';
import itemType from '../constants/itemType';

import { getDecimalValue } from '.';

import { Extensions } from '@/constants/extensions';

export interface AnswerPad {
  [linkId: string]: number | undefined | string | Coding | boolean | Coding[] | Quantity | QuestionnaireResponseItemAnswer[] | null;
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
  private options: ResolvedFhirPathCalculationOptions;
  private fhirScoreCache: Map<string, QuestionnaireItem> = new Map<string, QuestionnaireItem>();

  constructor(questionnaire: Questionnaire, options?: FhirPathCalculationOptions) {
    this.questionnaire = questionnaire;
    this.options = resolveFhirPathCalculationOptions(options);
    this.initializeCaches(questionnaire);
  }

  private initializeCaches(questionnaire: Questionnaire): void {
    this.traverseQuestionnaire(questionnaire);
  }

  private traverseQuestionnaire(qItem: Questionnaire | QuestionnaireItem): void {
    if (qItem.item) {
      for (const subItem of qItem.item) {
        this.traverseQuestionnaire(subItem);
      }
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

  /**
   * Environment variables made available to every expression in this
   * questionnaire. %questionnaire lets an expression reach the definition side
   * of the form - answerOption, ordinalValue, item.code and so on - instead of
   * only the answers. %resource is bound to the QuestionnaireResponse by
   * evaluateFhirpathExpressionToGetString.
   *
   * The Questionnaire is passed by reference: fhirpath.js wraps values in
   * ResourceNodes and does not mutate the data it is given.
   */
  private getEnvVars(): FhirPathEnvVars {
    return { questionnaire: this.questionnaire };
  }

  /**
   * Picks the expression to evaluate for an item that may carry both a copy
   * expression and a calculated expression.
   *
   * legacyPreference is the extension that this particular code path has always
   * preferred. The two paths disagree, which is why 'legacy' has to be told
   * where it is being called from.
   */
  private getExpressionExtension(qItem: QuestionnaireItem, legacyPreference: 'copy' | 'calculated'): Extension | undefined {
    const calculatedExtension = getCalculatedExpressionExtension(qItem);
    const copyExtension = getCopyExtension(qItem);

    switch (this.options.expressionPriority) {
      case 'copy-first':
        return copyExtension ?? calculatedExtension;
      case 'calculated-first':
        return calculatedExtension ?? copyExtension;
      default:
        return legacyPreference === 'copy' ? (copyExtension ?? calculatedExtension) : (calculatedExtension ?? copyExtension);
    }
  }

  /**
   * True when the raw result of an expression is a number refero can turn into
   * an answer. null, undefined, the empty string, NaN and Infinity are not.
   */
  private isNumericResult(value: unknown): boolean {
    if (value === null || value === undefined || value === '') {
      return false;
    }
    return Number.isFinite(Number(value));
  }

  private toDecimalAnswer(qItem: QuestionnaireItem, value: string | number | undefined): QuestionnaireResponseItemAnswer | undefined {
    if (this.options.omitNonNumericResults && !this.isNumericResult(value)) {
      return undefined;
    }
    if (this.options.keepZeroValues) {
      return {
        valueDecimal: value === null || value === undefined ? undefined : getDecimalValue(qItem, Number(value)),
      };
    }
    return { valueDecimal: getDecimalValue(qItem, value !== 0 && value !== null ? Number(value) : undefined) };
  }

  private toIntegerAnswer(value: string | number): QuestionnaireResponseItemAnswer | undefined {
    const isNumeric = this.isNumericResult(value);
    if (this.options.omitNonNumericResults && !isNumeric) {
      return undefined;
    }
    return { valueInteger: isNumeric ? Math.round(Number(value)) : 0 };
  }
  public evaluateAllExpressions(questionnaireResponse: QuestionnaireResponse): QuestionnaireResponse {
    return this.evaluateCalculatedExpressions(questionnaireResponse);
  }

  public calculateFhirScore(questionnaireResponse: QuestionnaireResponse): AnswerPad {
    const answerPad: AnswerPad = {};
    for (const [key, value] of this.fhirScoreCache) {
      const expressionExtension = this.getExpressionExtension(value, 'calculated');
      if (!expressionExtension) continue;
      answerPad[key] = this.evaluateExpression(value, expressionExtension, questionnaireResponse);
    }
    return answerPad;
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
  private createQuantity(item: QuestionnaireItem, extension?: Coding, value?: number | string | undefined): Quantity {
    return {
      unit: extension?.display || '',
      system: extension?.system || '',
      code: extension?.code || '',
      ...(value !== undefined && value !== null && { value: value || value === 0 ? getDecimalValue(item, Number(value)) : undefined }),
    };
  }

  private evaluateExpression = (
    qItem: QuestionnaireItem,
    expressionExtension: Extension,
    response: QuestionnaireResponse
  ): QuestionnaireResponseItemAnswer[] | null => {
    if (expressionExtension.valueString) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any[] = evaluateFhirpathExpressionToGetString(expressionExtension, response, true, this.getEnvVars());
      const qrItem = getAllResponseitemsByLinkIdAndQuestionnaireResponse(qItem.linkId, response);
      const itemAnswer: QuestionnaireResponseItemAnswer[] = [];
      switch (qItem.type) {
        case itemType.BOOLEAN: {
          const res: boolean[] = result.length === 0 ? [false] : result;
          itemAnswer.push(...res.map((x: boolean): QuestionnaireResponseItemAnswer => ({ valueBoolean: Boolean(x) })));
          break;
        }

        case itemType.DECIMAL:
          itemAnswer.push(
            ...result
              .map((x: string | number | undefined) => this.toDecimalAnswer(qItem, x))
              .filter((x): x is QuestionnaireResponseItemAnswer => x !== undefined)
          );
          break;

        case itemType.INTEGER:
          itemAnswer.push(
            ...result
              .map((x: string | number) => this.toIntegerAnswer(x))
              .filter((x): x is QuestionnaireResponseItemAnswer => x !== undefined)
          );
          break;
        case itemType.QUANTITY:
          itemAnswer.push(
            ...result.map((x: string | number | Quantity): QuestionnaireResponseItemAnswer => ({
              valueQuantity: isQuantity(x) ? x : this.createQuantity(qItem, getQuestionnaireUnitExtensionValue(qItem), x),
            }))
          );
          break;
        case itemType.DATE:
          itemAnswer.push(...result.map((x: string | number): QuestionnaireResponseItemAnswer => ({ valueDate: String(x) })));
          break;
        case itemType.DATETIME:
          itemAnswer.push(...result.map((x: string | number): QuestionnaireResponseItemAnswer => ({ valueDateTime: String(x) })));
          break;
        case itemType.TIME:
          itemAnswer.push(...result.map((x: string | number): QuestionnaireResponseItemAnswer => ({ valueTime: String(x) })));
          break;
        case itemType.STRING:
        case itemType.TEXT: {
          const res: Array<string | undefined> = result ?? [undefined];
          itemAnswer.push(...res.map((x: string | number | undefined): QuestionnaireResponseItemAnswer => ({ valueString: String(x) })));
          break;
        }

        case itemType.CHOICE:
        case itemType.OPENCHOICE:
          itemAnswer.push(...result.map((x: Coding | Quantity): QuestionnaireResponseItemAnswer => ({ valueCoding: x })));
          break;
        case itemType.ATTATCHMENT:
          itemAnswer.push(...result.map((x: Attachment): QuestionnaireResponseItemAnswer => ({ valueAttachment: x })));
          break;
        default:
          break;
      }
      const qrItemAnswer = itemAnswer.map((x: QuestionnaireResponseItemAnswer, index: number) => ({
        ...(x && { ...x }),
        ...(qrItem?.[0]?.answer?.[index]?.item && { item: qrItem?.[0]?.answer?.[index]?.item }),
      }));
      if (qrItemAnswer.length === 0) {
        if (!qrItem?.[0]?.answer) {
          return null;
        }
        const fallback = qrItem[0].answer
          .map((y: QuestionnaireResponseItemAnswer) => (y.item ? ({ item: y.item } as QuestionnaireResponseItemAnswer) : undefined))
          .filter((a): a is QuestionnaireResponseItemAnswer => a !== undefined);
        return fallback;
      }
      return qrItemAnswer;
    }
    return null;
  };

  private evaluateCalculatedExpressions(qr: QuestionnaireResponse): QuestionnaireResponse {
    const traverseItems = (
      qItems: QuestionnaireItem[],
      qrItems: QuestionnaireResponseItem[],
      response: QuestionnaireResponse
    ): QuestionnaireResponseItem[] => {
      const result: QuestionnaireResponseItem[] = [];

      for (const qItem of qItems) {
        const matches = qrItems.filter(x => x.linkId === qItem.linkId);

        for (const qrItem of matches) {
          let newQrItem: QuestionnaireResponseItem = { ...qrItem };

          const expressionExtension = this.getExpressionExtension(qItem, 'copy');
          const newAnswer: QuestionnaireResponseItemAnswer[] | null = expressionExtension
            ? this.evaluateExpression(qItem, expressionExtension, response)
            : null;

          const origAnswers = qrItem.answer ?? [];
          const finalAnswers: QuestionnaireResponseItemAnswer[] = [];

          if (!newAnswer || newAnswer.length === 0) {
            for (const orig of origAnswers) {
              const a = { ...orig };
              if (a.item && qItem.item) {
                a.item = traverseItems(qItem.item, a.item, response);
              }
              finalAnswers.push(a);
            }
          } else {
            for (let i = 0; i < newAnswer.length; i++) {
              const comp = { ...newAnswer[i] };

              if (!comp.item && origAnswers[i]?.item) {
                comp.item = origAnswers[i].item;
              }
              if (comp.item && qItem.item) {
                comp.item = traverseItems(qItem.item, comp.item, response);
              }

              finalAnswers.push(comp);
            }
          }

          if (finalAnswers.length > 0) {
            newQrItem = { ...newQrItem, answer: finalAnswers };
          }

          if (qrItem.item && qItem.item) {
            newQrItem = {
              ...newQrItem,
              item: traverseItems(qItem.item, qrItem.item, response),
            };
          }

          result.push(newQrItem);
        }
      }

      return result;
    };

    return {
      ...qr,
      item: qr.item ? traverseItems(this.questionnaire.item || [], qr.item, qr) : undefined,
    };
  }
}
