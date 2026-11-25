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

import itemType from '../constants/itemType';
import {
  ALL_DEPENDENCIES,
  analyzeExpression,
  resolveLinkIdFilters,
  ResponseIndex,
  type ExpressionAnalysis,
  type ExpressionDependencies,
} from './expressionDependencies';
import {
  getAnyCopyExtension,
  getCalculatedExpressionExtension,
  getCopyExpressionText,
  getItemCopyVariableName,
  getQuestionnaireUnitExtensionValue,
  getRepetitionContextExtension,
  isItemCopyTarget,
} from './extension';
import { evaluateOnPrivateCopy, type FhirPathEnvVars } from './fhirpathHelper';
import {
  isNumericResult,
  resolveFhirPathCalculationOptions,
  type FhirPathCalculationOptions,
  type ResolvedFhirPathCalculationOptions,
} from './fhirPathOptions';
import {
  enableWhenMatchesAnswer,
  getAllResponseitemsByLinkIdAndQuestionnaireResponse,
  getQuestionnaireDefinitionItem,
  getResponseItemsWithLinkId,
  getResponseItemWithPath,
  type Path,
} from './refero-core';
import { isQuantity } from './typeguards';

import { getDecimalValue } from '.';

import { Extensions } from '@/constants/extensions';

export interface AnswerPad {
  [linkId: string]: number | undefined | string | Coding | boolean | Coding[] | Quantity | QuestionnaireResponseItemAnswer[] | null;
}

/**
 * The occurrences an item copy produced under one parent. The AnswerPad cannot carry these: it maps a linkId
 * to one answer list and writes that list to every occurrence.
 */
export interface ItemCopy {
  /** Path to the parent item; empty for top level items. */
  parentPath: Path[];
  linkId: string;
  items: QuestionnaireResponseItem[];
  /** The parent's children in questionnaire order, so a first occurrence can be inserted in the right place. */
  siblingOrder: string[];
}

function isResponseItemList(result: unknown[]): result is QuestionnaireResponseItem[] {
  return (
    result.length > 0 &&
    result.every(r => typeof r === 'object' && r !== null && typeof (r as QuestionnaireResponseItem).linkId === 'string')
  );
}

/**
 * rowValues are the elements of the repetition context as fhirpath.js returned them: response items carry its type
 * information, without which %row.item finds nothing, so they are what the variable is bound to.
 */
interface SelectedItems {
  rowValues: unknown[];
  extension: Extension;
}

/** fhirpath.js may attach bookkeeping properties to the objects it returns; a JSON round trip keeps plain FHIR. */
function toPlainItems(items: QuestionnaireResponseItem[]): QuestionnaireResponseItem[] {
  return JSON.parse(JSON.stringify(items));
}

function answersWithoutNestedItems(item: QuestionnaireResponseItem): QuestionnaireResponseItemAnswer[] {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (item.answer ?? []).map(({ item: _nested, ...answer }) => answer);
}

/** An unanswered response item; like generateQuestionnaireResponse, a question's children go under answer[0].item. */
function emptyResponseItem(qItem: QuestionnaireItem): QuestionnaireResponseItem {
  const responseItem: QuestionnaireResponseItem = { linkId: qItem.linkId, ...(qItem.text && { text: qItem.text }) };
  if (!qItem.item?.length) return responseItem;
  const children = qItem.item.map(emptyResponseItem);
  return qItem.type === itemType.GROUP ? { ...responseItem, item: children } : { ...responseItem, answer: [{ item: children }] };
}

/**
 * Removes the answers of a copy's questions that their enableWhen turns off, so a question that is turned off has no
 * answer, as elsewhere in the form. A condition's question is looked up in the same copy first, then in the whole
 * response. The questions are checked in order, so a condition sees the answers already removed before it.
 */
export function withoutDisabledAnswers(
  qItems: QuestionnaireItem[],
  children: QuestionnaireResponseItem[],
  response: QuestionnaireResponse
): QuestionnaireResponseItem[] {
  const result = [...children];
  const answersOf = (linkId: string): QuestionnaireResponseItemAnswer[] | undefined => {
    const inCopy = getResponseItemsWithLinkId(linkId, result);
    const found = inCopy.length > 0 ? inCopy : getResponseItemsWithLinkId(linkId, response.item);
    return found.length > 0 ? found.flatMap(item => item.answer ?? []) : undefined;
  };
  result.forEach((child, index) => {
    const qChild = qItems.find(q => q.linkId === child.linkId);
    if (!qChild?.enableWhen?.length || !child.answer) return;
    const matches = qChild.enableWhen.map(condition => enableWhenMatchesAnswer(condition, answersOf(condition.question)));
    const enabled = qChild.enableBehavior === 'all' ? matches.every(Boolean) : matches.some(Boolean);
    if (!enabled) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { answer: _removed, ...withoutAnswer } = child;
      result[index] = withoutAnswer;
    }
  });
  return result;
}

/** A response item's children: answer[0].item for a question with nested items, item otherwise. */
export function getChildResponseItems(responseItem: QuestionnaireResponseItem): QuestionnaireResponseItem[] {
  return [...(responseItem.item ?? []), ...(responseItem.answer ?? []).flatMap(answer => answer.item ?? [])];
}
/**
 * Replaces the occurrences of each copied item under its parent, in place. The first occurrence's position is
 * kept; when there were none, the new ones go before the first sibling that comes later in the questionnaire.
 */
export function applyItemCopies(
  response: QuestionnaireResponse,
  questionnaire: Questionnaire | null | undefined,
  copies: ItemCopy[]
): void {
  for (const copy of copies) {
    const siblings = getOrCreateSiblingsForItemCopy(response, questionnaire, copy);
    if (!siblings) continue;

    const current = siblings.filter(sibling => sibling.linkId === copy.linkId);
    if (JSON.stringify(current) === JSON.stringify(copy.items)) continue;

    let insertAt = siblings.findIndex(sibling => sibling.linkId === copy.linkId);
    if (insertAt === -1) {
      const ownPosition = copy.siblingOrder.indexOf(copy.linkId);
      insertAt = siblings.findIndex(sibling => copy.siblingOrder.indexOf(sibling.linkId) > ownPosition);
      if (insertAt === -1) insertAt = siblings.length;
    }
    for (let i = siblings.length - 1; i >= 0; i--) {
      if (siblings[i].linkId === copy.linkId) siblings.splice(i, 1);
    }
    siblings.splice(insertAt, 0, ...copy.items);
  }
}

/**
 * The array the copied occurrences live in: the top level items, a group's item, or for a question with nested
 * items its answer[0].item, which is created (with an empty answer if needed) the first time a copy lands there.
 */
function getOrCreateSiblingsForItemCopy(
  response: QuestionnaireResponse,
  questionnaire: Questionnaire | null | undefined,
  copy: ItemCopy
): QuestionnaireResponseItem[] | undefined {
  if (copy.parentPath.length === 0) {
    response.item ??= [];
    return response.item;
  }
  const parent = getResponseItemWithPath(copy.parentPath, { Content: response });
  if (!parent) return undefined;
  const parentLinkId = copy.parentPath[copy.parentPath.length - 1].linkId;
  if (getQuestionnaireDefinitionItem(parentLinkId, questionnaire?.item)?.type === itemType.GROUP) {
    parent.item ??= [];
    return parent.item;
  }
  parent.answer ??= [];
  if (parent.answer.length === 0) parent.answer.push({});
  parent.answer[0].item ??= [];
  return parent.answer[0].item;
}

function containsItemCopyTarget(items: QuestionnaireItem[] | undefined): boolean {
  return (items ?? []).some(item => isItemCopyTarget(item) || containsItemCopyTarget(item.item));
}

/**
 * A response with the item copies already applied, for a newly generated response: the calculations otherwise
 * only run when an answer changes, so until then each copied group would show its single template occurrence.
 */
export function withItemCopiesApplied(questionnaire: Questionnaire, response: QuestionnaireResponse): QuestionnaireResponse {
  if (!containsItemCopyTarget(questionnaire.item)) return response;
  const engine = new FhirPathExtensions(questionnaire);
  const copies = engine.collectItemCopies(engine.evaluateAllExpressions(response));
  const result = structuredClone(response);
  applyItemCopies(result, questionnaire, copies);
  return result;
}

const MEMO_ENTRIES_PER_ITEM = 3;

interface MemoEntry {
  extension: Extension;
  signature: string;
  result: EvaluatedExpression;
}

interface EvaluatedExpression {
  answers: QuestionnaireResponseItemAnswer[] | null;
  omitted: boolean;
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
      if (extension.url === Extensions.CALCULATED_EXPRESSION_URL || extension.url === Extensions.SDC_CALCULATED_EXPRESSION_URL) {
        return FhirPathItemType.QUESTION_FHIRPATH_SCORE;
      }
    }
  }

  return FhirPathItemType.NONE;
}
export class FhirPathExtensions {
  private questionnaire: Questionnaire;
  private questionnaireForExpressions?: Questionnaire;
  private options: ResolvedFhirPathCalculationOptions;
  private fhirScoreCache: Map<string, QuestionnaireItem> = new Map<string, QuestionnaireItem>();
  /** linkIds of the items with sdf-item-repetition-context, known from the questionnaire. */
  private itemCopyTargets: Set<string> = new Set<string>();
  /**
   * Recent results per linkId, with the expression and the signature of the response parts they were computed
   * from. A result is reused when the signature matches; see expressionDependencies.
   */
  private memo = new Map<string, MemoEntry[]>();
  private analyses = new Map<Extension, { analysis: ExpressionAnalysis; dependencies?: string[] }>();
  private questionnaireLinkIds?: Set<string>;
  private responseIndex?: { response: QuestionnaireResponse; index: ResponseIndex };
  /** The private copy expressions are evaluated against, made once per response instead of once per expression. */
  private evaluationCopy?: { source: QuestionnaireResponse; copy: QuestionnaireResponse };

  constructor(questionnaire: Questionnaire, options?: FhirPathCalculationOptions) {
    this.questionnaire = questionnaire;
    this.options = resolveFhirPathCalculationOptions(options);
    this.initializeCaches(questionnaire);
  }

  private initializeCaches(questionnaire: Questionnaire): void {
    this.traverseQuestionnaire(questionnaire);
  }

  /**
   * Repetition targets and the items under them are left out of fhirScoreCache: their expressions read the
   * repetition's variable and only make sense per repetition, which evaluateCalculatedExpressions does.
   */
  private traverseQuestionnaire(qItem: Questionnaire | QuestionnaireItem, insideItemCopy = false): void {
    const isTarget = this.isOfTypeQuestionnaireItem(qItem) && isItemCopyTarget(qItem);
    if (isTarget) {
      this.itemCopyTargets.add(qItem.linkId);
    }

    if (qItem.item) {
      for (const subItem of qItem.item) {
        this.traverseQuestionnaire(subItem, insideItemCopy || isTarget);
      }
    }

    // A repetition target's own calculatedExpression is evaluated per element, by buildCopiedOccurrences.
    if (insideItemCopy || isTarget) {
      return;
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
   * evaluateOnPrivateCopy.
   *
   * %questionnaire is a private copy: fhirpath.js attaches a __path__ property
   * to objects it returns, which would mutate, or throw on, a frozen original.
   */
  private getEnvVars(): FhirPathEnvVars {
    this.questionnaireForExpressions ??= structuredClone(this.questionnaire);
    return { questionnaire: this.questionnaireForExpressions };
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
    // FHIR R4: display items and groups cannot have an answer, so an expression on them is never evaluated.
    if (qItem.type === itemType.DISPLAY || qItem.type === itemType.GROUP) return undefined;
    const calculatedExtension = getCalculatedExpressionExtension(qItem);
    const copyExtension = getAnyCopyExtension(qItem);

    switch (this.options.expressionPriority) {
      case 'copy-first':
        return copyExtension ?? calculatedExtension;
      case 'calculated-first':
        return calculatedExtension ?? copyExtension;
      default:
        return legacyPreference === 'copy' ? (copyExtension ?? calculatedExtension) : (calculatedExtension ?? copyExtension);
    }
  }

  private toDecimalAnswer(qItem: QuestionnaireItem, value: string | number | undefined): QuestionnaireResponseItemAnswer | undefined {
    if (this.options.omitNonNumericResults && !isNumericResult(value)) {
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
    const isNumeric = isNumericResult(value);
    if (this.options.omitNonNumericResults && !isNumeric) {
      return undefined;
    }
    return { valueInteger: isNumeric ? Math.round(Number(value)) : 0 };
  }
  public evaluateAllExpressions(questionnaireResponse: QuestionnaireResponse): QuestionnaireResponse {
    try {
      return this.evaluateCalculatedExpressions(questionnaireResponse);
    } finally {
      this.evaluationCopy = undefined;
      this.responseIndex = undefined;
    }
  }

  /**
   * Dropped at the end of every public call, so a response that is changed in place between calls is never
   * evaluated from a stale copy.
   */
  private getEvaluationCopy(response: QuestionnaireResponse): QuestionnaireResponse {
    if (this.evaluationCopy?.source !== response) {
      this.evaluationCopy = { source: response, copy: structuredClone(response) };
    }
    return this.evaluationCopy.copy;
  }

  public calculateFhirScore(questionnaireResponse: QuestionnaireResponse): AnswerPad {
    const answerPad: AnswerPad = {};
    try {
      for (const [key, value] of this.fhirScoreCache) {
        const expressionExtension = this.getExpressionExtension(value, 'calculated');
        if (!expressionExtension) continue;
        if (this.itemCopyTargets.has(key)) continue; // its occurrences are returned by collectItemCopies
        answerPad[key] = this.evaluateExpressionDetailed(value, expressionExtension, questionnaireResponse).answers;
      }
    } finally {
      this.evaluationCopy = undefined;
      this.responseIndex = undefined;
    }
    return answerPad;
  }

  /**
   * The occurrences of every item copy target in a response produced by evaluateAllExpressions, grouped by
   * parent. Item copies inside a copied group are part of the outer copy and are not listed separately.
   */
  public collectItemCopies(questionnaireResponse: QuestionnaireResponse): ItemCopy[] {
    const copies: ItemCopy[] = [];
    const walk = (qItems: QuestionnaireItem[], qrItems: QuestionnaireResponseItem[], parentPath: Path[]): void => {
      const siblingOrder = qItems.map(q => q.linkId);
      for (const qItem of qItems) {
        const occurrences = qrItems.filter(qrItem => qrItem.linkId === qItem.linkId);
        if (this.itemCopyTargets.has(qItem.linkId)) {
          copies.push({ parentPath, linkId: qItem.linkId, items: occurrences, siblingOrder });
          continue;
        }
        if (!qItem.item?.length) continue;
        occurrences.forEach((occurrence, index) => {
          const path: Path[] = [...parentPath, { linkId: qItem.linkId, ...(qItem.repeats && { index }) }];
          walk(qItem.item ?? [], getChildResponseItems(occurrence), path);
        });
      }
    };
    walk(this.questionnaire.item ?? [], questionnaireResponse.item ?? [], []);
    return copies;
  }

  /** Copy and SDC calculated expressions may use valueExpression; other expressions are read from valueString only. */
  private getExpressionText(expressionExtension: Extension): string | undefined {
    return expressionExtension.url === Extensions.COPY_EXPRESSION_URL ||
      expressionExtension.url === Extensions.SDC_CALCULATED_EXPRESSION_URL
      ? getCopyExpressionText(expressionExtension)
      : expressionExtension.valueString;
  }

  /**
   * The elements of the item's sdf-item-repetition-context, or undefined when it has none. Evaluated against the
   * shared private copy, so a target inside a repeating group does not clone the response once per outer row.
   */
  private selectItemsToCopy(
    qItem: QuestionnaireItem,
    response: QuestionnaireResponse,
    envVars: FhirPathEnvVars
  ): SelectedItems | undefined {
    const extension = getRepetitionContextExtension(qItem);
    const expression = extension?.valueExpression?.expression;
    if (!extension || !expression) return undefined;
    const rowValues = evaluateOnPrivateCopy(
      expression,
      this.getEvaluationCopy(response),
      { ...this.getEnvVars(), ...envVars },
      qItem.linkId
    );
    return { rowValues, extension };
  }

  /**
   * One answer for a repeating question's element: from the question's own calculatedExpression evaluated with the
   * element bound, or else the element itself (a value, or a question item's answer). Only the first result counts.
   */
  private answerForElement(
    qItem: QuestionnaireItem,
    variableName: string,
    response: QuestionnaireResponse,
    rowEnvVars: FhirPathEnvVars
  ): QuestionnaireResponseItemAnswer | undefined {
    const expressionExtension: Extension = getCalculatedExpressionExtension(qItem) ?? {
      url: Extensions.COPY_EXPRESSION_URL,
      valueExpression: { language: 'text/fhirpath', expression: `%${variableName}` },
    };
    const answer = this.computeExpression(qItem, expressionExtension, response, rowEnvVars).answers?.[0];
    // An answer without a value (only nested items, or a value that is undefined) means the element is not
    // answered, and it is skipped.
    const hasValue = Object.entries(answer ?? {}).some(([key, value]) => key.startsWith('value') && value !== undefined);
    return hasValue ? answer : undefined;
  }

  /**
   * A group gets one occurrence per element, with fresh children whose expressions see the element through the
   * variable. A repeating question gets one item with one answer per element; the items nested under each answer
   * see that answer's element.
   */
  private buildCopiedOccurrences(
    qItem: QuestionnaireItem,
    selected: SelectedItems,
    envVars: FhirPathEnvVars,
    response: QuestionnaireResponse,
    traverseItems: (
      qItems: QuestionnaireItem[],
      qrItems: QuestionnaireResponseItem[],
      envVars: FhirPathEnvVars
    ) => QuestionnaireResponseItem[]
  ): QuestionnaireResponseItem[] {
    const variableName = getItemCopyVariableName(selected.extension);
    const occurrence: QuestionnaireResponseItem = { linkId: qItem.linkId, ...(qItem.text && { text: qItem.text }) };
    const childrenFor = (rowEnvVars: FhirPathEnvVars): QuestionnaireResponseItem[] | undefined =>
      qItem.item?.length
        ? withoutDisabledAnswers(qItem.item, traverseItems(qItem.item, qItem.item.map(emptyResponseItem), rowEnvVars), response)
        : undefined;

    if (qItem.type === itemType.GROUP) {
      return selected.rowValues.map(rowValue => {
        const children = childrenFor({ ...envVars, [variableName]: rowValue });
        return { ...occurrence, ...(children && { item: children }) };
      });
    }

    const answers = selected.rowValues.flatMap(rowValue => {
      const rowEnvVars = { ...envVars, [variableName]: rowValue };
      const answer = this.answerForElement(qItem, variableName, response, rowEnvVars);
      if (!answer) return [];
      const children = childrenFor(rowEnvVars);
      return [{ ...answer, ...(children && { item: children }) }];
    });
    return [answers.length > 0 ? { ...occurrence, answer: answers } : occurrence];
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

  private getResponseIndex(response: QuestionnaireResponse): ResponseIndex {
    if (this.responseIndex?.response !== response) {
      this.responseIndex = { response, index: new ResponseIndex(response) };
    }
    return this.responseIndex.index;
  }

  private getQuestionnaireLinkIds(): Set<string> {
    if (!this.questionnaireLinkIds) {
      const linkIds = new Set<string>();
      const walk = (items: QuestionnaireItem[] | undefined): void => {
        for (const item of items ?? []) {
          linkIds.add(item.linkId);
          walk(item.item);
        }
      };
      walk(this.questionnaire.item);
      this.questionnaireLinkIds = linkIds;
    }
    return this.questionnaireLinkIds;
  }

  /**
   * The linkIds an expression reads. Filters are resolved once against the questionnaire's linkIds; a response
   * that holds linkIds the questionnaire does not have gets those checked as well.
   */
  private getDependencies(expressionExtension: Extension, index: ResponseIndex): ExpressionDependencies {
    let entry = this.analyses.get(expressionExtension);
    if (!entry) {
      const expression = this.getExpressionText(expressionExtension);
      entry = { analysis: expression ? analyzeExpression(expression) : ALL_DEPENDENCIES };
      this.analyses.set(expressionExtension, entry);
    }
    const { analysis } = entry;
    if (analysis === ALL_DEPENDENCIES) {
      return ALL_DEPENDENCIES;
    }
    const known = this.getQuestionnaireLinkIds();
    entry.dependencies ??= resolveLinkIdFilters(analysis, known);
    const unknown = index.unknownLinkIds(known);
    return unknown.length === 0
      ? entry.dependencies
      : [...new Set([...entry.dependencies, ...resolveLinkIdFilters(analysis, unknown)])].sort();
  }

  /**
   * The result of an expression, reused when the parts of the response it depends on are the same as for an
   * earlier result. The result does not depend on which occurrence of the item is calculated, so items that
   * occur many times are computed once.
   *
   * A few results are kept per item: a calculation evaluates the response and then the updated response, and
   * when an expression only reads answers (not other calculations) both see the same parts, so the second pass
   * reuses the first. Expressions that read other calculations see different parts in the two passes; keeping
   * more than one result stops the passes from evicting each other.
   */
  private evaluateExpressionDetailed(
    qItem: QuestionnaireItem,
    expressionExtension: Extension,
    response: QuestionnaireResponse,
    envVars: FhirPathEnvVars = {}
  ): EvaluatedExpression {
    // Not remembered inside a copied row: there the answers keep the nested items of the occurrence being evaluated,
    // not those of the first occurrence in the response, so a result from outside the row does not fit.
    if (Object.keys(envVars).length > 0) {
      return this.computeExpression(qItem, expressionExtension, response, envVars);
    }
    const index = this.getResponseIndex(response);
    const dependencies = this.getDependencies(expressionExtension, index);
    if (dependencies === ALL_DEPENDENCIES) {
      return this.computeExpression(qItem, expressionExtension, response);
    }
    const signature = index.signature(dependencies, qItem.linkId);
    const entries = this.memo.get(qItem.linkId) ?? [];
    const remembered = entries.find(entry => entry.extension === expressionExtension && entry.signature === signature);
    if (remembered) {
      return remembered.result;
    }
    const result = this.computeExpression(qItem, expressionExtension, response);
    this.memo.set(qItem.linkId, [{ extension: expressionExtension, signature, result }, ...entries].slice(0, MEMO_ENTRIES_PER_ITEM));
    return result;
  }

  /**
   * omitted is true when omitNonNumericResults dropped every result of the expression.
   * When the expression selects QR items rather than values, the answers are the selected items' answers.
   */
  private computeExpression = (
    qItem: QuestionnaireItem,
    expressionExtension: Extension,
    response: QuestionnaireResponse,
    envVars: FhirPathEnvVars = {}
  ): EvaluatedExpression => {
    const expression = this.getExpressionText(expressionExtension);
    if (expression) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any[] = evaluateOnPrivateCopy(
        expression,
        this.getEvaluationCopy(response),
        { ...this.getEnvVars(), ...envVars },
        qItem.linkId
      );
      if (isResponseItemList(result)) {
        const answers = toPlainItems(result).flatMap(answersWithoutNestedItems);
        return { answers: answers.length > 0 ? answers : null, omitted: false };
      }
      // Inside a repetition the first occurrence in the whole response belongs to another one, so nested items
      // are left to the caller, which keeps the ones of the occurrence being evaluated.
      const insideItemCopy = Object.keys(envVars).length > 0;
      const qrItem = insideItemCopy ? undefined : getAllResponseitemsByLinkIdAndQuestionnaireResponse(qItem.linkId, response);
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
        const omitted = result.length > 0 && (qItem.type === itemType.DECIMAL || qItem.type === itemType.INTEGER);
        if (!qrItem?.[0]?.answer) {
          return { answers: null, omitted };
        }
        const fallback = qrItem[0].answer
          .map((y: QuestionnaireResponseItemAnswer) => (y.item ? ({ item: y.item } as QuestionnaireResponseItemAnswer) : undefined))
          .filter((a): a is QuestionnaireResponseItemAnswer => a !== undefined);
        return { answers: fallback, omitted };
      }
      return { answers: qrItemAnswer, omitted: false };
    }
    return { answers: null, omitted: false };
  };

  private evaluateCalculatedExpressions(qr: QuestionnaireResponse): QuestionnaireResponse {
    const traverseItems = (
      qItems: QuestionnaireItem[],
      qrItems: QuestionnaireResponseItem[],
      response: QuestionnaireResponse,
      envVars: FhirPathEnvVars = {}
    ): QuestionnaireResponseItem[] => {
      const result: QuestionnaireResponseItem[] = [];

      for (const qItem of qItems) {
        const selected = this.selectItemsToCopy(qItem, response, envVars);
        if (selected) {
          result.push(
            ...this.buildCopiedOccurrences(qItem, selected, envVars, response, (childQItems, childQrItems, childEnvVars) =>
              traverseItems(childQItems, childQrItems, response, childEnvVars)
            )
          );
          continue;
        }

        const matches = qrItems.filter(x => x.linkId === qItem.linkId);

        for (const qrItem of matches) {
          let newQrItem: QuestionnaireResponseItem = { ...qrItem };

          const expressionExtension = this.getExpressionExtension(qItem, 'copy');
          const evaluated = expressionExtension
            ? this.evaluateExpressionDetailed(qItem, expressionExtension, response, envVars)
            : undefined;
          const newAnswer = evaluated?.answers ?? null;

          const origAnswers = qrItem.answer ?? [];
          const finalAnswers: QuestionnaireResponseItemAnswer[] = [];

          if (evaluated?.omitted) {
            // The value is dropped so dependent expressions cannot read it; nested items are kept.
            for (const orig of origAnswers) {
              if (orig.item) {
                finalAnswers.push({ item: qItem.item ? traverseItems(qItem.item, orig.item, response, envVars) : orig.item });
              }
            }
          } else if (!newAnswer || newAnswer.length === 0) {
            for (const orig of origAnswers) {
              const a = { ...orig };
              if (a.item && qItem.item) {
                a.item = traverseItems(qItem.item, a.item, response, envVars);
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
                comp.item = traverseItems(qItem.item, comp.item, response, envVars);
              }

              finalAnswers.push(comp);
            }
          }

          if (finalAnswers.length > 0) {
            newQrItem = { ...newQrItem, answer: finalAnswers };
          } else if (evaluated?.omitted) {
            delete newQrItem.answer;
          }

          if (qrItem.item && qItem.item) {
            newQrItem = {
              ...newQrItem,
              item: traverseItems(qItem.item, qrItem.item, response, envVars),
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
