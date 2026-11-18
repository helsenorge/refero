import { evaluate } from 'fhirpath';

import type { QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';

/**
 * Which parts of the response an expression reads, so a calculation can be skipped when none of them changed.
 *
 * The analysis is deliberately conservative. An expression gets a list of linkIds only when every way it reaches
 * the response is a navigation narrowed right away by a filter on linkId alone:
 * `descendants().where(<condition on linkId>)` (also `item.where`, `repeat(item).where`). The condition may be
 * anything that only looks at linkId - `linkId = 'a'`, `linkId.startsWith('g1.')`, `linkId != 'x'`,
 * `(linkId in ('a' | 'b')).not()` - and is resolved against the linkIds that exist. Everything else - a filter
 * that also looks at answers, a filter that selects nodes without a linkId (`linkId.empty()`), navigation
 * without a filter (item.first(), item.count()), any other path or function that starts at the response
 * (`identifier.value`, `children()`), time functions, %variables other than %resource and %questionnaire - is
 * ALL_DEPENDENCIES and is evaluated every time.
 */
export const ALL_DEPENDENCIES = 'all' as const;

/** The linkId conditions an expression filters the response by; resolve them with resolveLinkIdFilters. */
export type LinkIdFilter = { condition: string; literals?: string[] };
export type ExpressionAnalysis = LinkIdFilter[] | typeof ALL_DEPENDENCIES;
export type ExpressionDependencies = string[] | typeof ALL_DEPENDENCIES;

const NAVIGATION_START =
  /(QuestionnaireResponse\s*\.\s*|%resource\s*\.\s*|%questionnaire\s*\.\s*)?(descendants\(\s*\)|repeat\(\s*item\s*\)|item)\s*\.\s*where\(/g;
const STRING_LITERAL = /'(?:[^'\\]|\\.)*'/g;
const LITERALS_ONLY = /^\s*linkId\s*=\s*'(?:[^'\\]|\\.)*'(?:\s+or\s+linkId\s*=\s*'(?:[^'\\]|\\.)*')*\s*$/;
const LINK_ID_LITERAL = /linkId\s*=\s*'((?:[^'\\]|\\.)*)'/g;
// What a condition on linkId alone may consist of besides operators and string literals.
const CONDITION_WORDS = new Set([
  'linkId',
  'startsWith',
  'endsWith',
  'contains',
  'matches',
  'lower',
  'upper',
  'length',
  'substring',
  'not',
  'and',
  'or',
  'xor',
  'in',
  'true',
  'false',
  'exists',
  'empty',
]);
// A name that is not preceded by a dot starts at the response itself: a field (`status`, `identifier`) or a
// function (`children()`, `exists()`). Only these may stand there: operators, literals, type names, units of
// time, and iif, which reads nothing by itself.
const BARE_NAME = /(?:^|[^.\w%$§])([A-Za-z_]\w*)/g;
const ALLOWED_BARE_NAMES = new Set(
  (
    'and or xor implies div mod in contains is as true false iif System FHIR ' +
    'integer decimal string boolean date dateTime time code uri Integer Decimal String Boolean Date DateTime Time Quantity Coding ' +
    'year years month months week weeks day days hour hours minute minutes second seconds millisecond milliseconds'
  ).split(' ')
);
const TIME_FUNCTIONS = /\b(now|today|timeOfDay)\s*\(/;
// %resource is the response itself and is handled like QuestionnaireResponse; %questionnaire does not change.
const OTHER_VARIABLES = /%(?!questionnaire\b|resource\b)[A-Za-z_]\w*|%`/;

const unescape = (literal: string): string => literal.replace(/\\(.)/g, '$1');

/** The end of the parenthesis opened just before start, skipping string literals; -1 when unbalanced. */
function closingParenthesis(text: string, start: number): number {
  let depth = 1;
  for (let i = start; i < text.length; i++) {
    const char = text[i];
    if (char === "'") {
      for (i++; i < text.length && text[i] !== "'"; i++) if (text[i] === '\\') i++;
    } else if (char === '(') {
      depth++;
    } else if (char === ')' && --depth === 0) {
      return i;
    }
  }
  return -1;
}

function isConditionOnLinkIdOnly(condition: string): boolean {
  const code = condition.replace(STRING_LITERAL, "''");
  if (/[%$`]/.test(code)) return false;
  const words: string[] = code.match(/[A-Za-z_]\w*/g) ?? [];
  return words.includes('linkId') && words.every(word => CONDITION_WORDS.has(word)) && !selectsNodesWithoutLinkId(condition);
}

/**
 * descendants() also holds the answers and their values, which have no linkId. A condition that is true for
 * those (`linkId.empty()`, `linkId.exists().not()`, `linkId = 'a' or true`) selects parts of the response that a
 * list of linkIds does not describe.
 */
function selectsNodesWithoutLinkId(condition: string): boolean {
  try {
    return (evaluate({ nodes: [{ other: 1 }] }, `nodes.where(${condition}).exists()`) as boolean[])[0] !== false;
  } catch {
    return true;
  }
}

export function analyzeExpression(expression: string): ExpressionAnalysis {
  if (TIME_FUNCTIONS.test(expression) || OTHER_VARIABLES.test(expression.replace(STRING_LITERAL, "''"))) {
    return ALL_DEPENDENCIES;
  }

  const filters: LinkIdFilter[] = [];
  let remainder = '';
  let consumed = 0;
  for (const match of expression.matchAll(NAVIGATION_START)) {
    if (match.index < consumed) continue;
    const conditionStart = match.index + match[0].length;
    const end = closingParenthesis(expression, conditionStart);
    if (end < 0) return ALL_DEPENDENCIES;
    const condition = expression.slice(conditionStart, end);
    if (!isConditionOnLinkIdOnly(condition)) return ALL_DEPENDENCIES;
    filters.push(
      LITERALS_ONLY.test(condition)
        ? { condition, literals: [...condition.matchAll(LINK_ID_LITERAL)].map(literal => unescape(literal[1])) }
        : { condition }
    );
    remainder += expression.slice(consumed, match.index) + '§';
    consumed = end + 1;
  }
  remainder += expression.slice(consumed);
  if (filters.length === 0) {
    return ALL_DEPENDENCIES;
  }

  // What is left may only work on the filtered nodes and on constants.
  const code = remainder
    .replace(STRING_LITERAL, "''")
    .replace(/%questionnaire\b/g, '§')
    .replace(/\s*\.\s*/g, '.');
  if (/QuestionnaireResponse|%resource|descendants|repeat\s*\(|linkId|\$this|\$index|\$total|`/.test(code)) {
    return ALL_DEPENDENCIES;
  }
  for (const [, name] of code.matchAll(BARE_NAME)) {
    if (!ALLOWED_BARE_NAMES.has(name)) return ALL_DEPENDENCIES;
  }
  return filters;
}

/** The linkIds, out of the given ones, that the filters select. */
export function resolveLinkIdFilters(filters: LinkIdFilter[], linkIds: Iterable<string>): string[] {
  const candidates = [...linkIds];
  const selected = new Set<string>();
  for (const filter of filters) {
    if (filter.literals) {
      filter.literals.forEach(literal => selected.add(literal));
      continue;
    }
    const matching = evaluate({ items: candidates.map(linkId => ({ linkId })) }, `items.where(${filter.condition}).linkId`) as string[];
    matching.forEach(linkId => selected.add(linkId));
  }
  return [...selected].sort();
}

/** analyzeExpression and resolveLinkIdFilters in one, for a known set of linkIds. */
export function getExpressionDependencies(expression: string, linkIds: Iterable<string>): ExpressionDependencies {
  const analysis = analyzeExpression(expression);
  return analysis === ALL_DEPENDENCIES ? ALL_DEPENDENCIES : resolveLinkIdFilters(analysis, linkIds);
}

/**
 * Every response item by linkId, in document order, including items nested under answers. Built once per
 * response; signatures are cached per linkId.
 */
export class ResponseIndex {
  private readonly occurrences = new Map<string, Array<{ item: QuestionnaireResponseItem; position: number }>>();
  private readonly contentSignatures = new Map<string, string>();
  private readonly nestedSignatures = new Map<string, string>();

  constructor(response: QuestionnaireResponse) {
    let position = 0;
    const walk = (items: QuestionnaireResponseItem[] | undefined): void => {
      for (const item of items ?? []) {
        let list = this.occurrences.get(item.linkId);
        if (!list) {
          list = [];
          this.occurrences.set(item.linkId, list);
        }
        list.push({ item, position: position++ });
        walk(item.item);
        for (const answer of item.answer ?? []) walk(answer.item);
      }
    };
    walk(response.item);
  }

  /** The linkIds that occur in the response. */
  linkIds(): IterableIterator<string> {
    return this.occurrences.keys();
  }

  private unknown?: { known: Set<string>; linkIds: string[] };

  /** linkIds in the response that are not among the known ones; normally none. */
  unknownLinkIds(known: Set<string>): string[] {
    if (this.unknown?.known !== known) {
      this.unknown = { known, linkIds: [...this.occurrences.keys()].filter(linkId => !known.has(linkId)) };
    }
    return this.unknown.linkIds;
  }

  /** Everything below the occurrences of a linkId, which is what a `where(linkId = …)` navigation can see. */
  contentSignature(linkId: string): string {
    let signature = this.contentSignatures.get(linkId);
    if (signature === undefined) {
      signature = JSON.stringify((this.occurrences.get(linkId) ?? []).map(occurrence => occurrence.item));
      this.contentSignatures.set(linkId, signature);
    }
    return signature;
  }

  /** Where the occurrences are, for expressions that combine several linkIds in document order. */
  positionSignature(linkId: string): string {
    return (this.occurrences.get(linkId) ?? []).map(occurrence => occurrence.position).join(',');
  }

  /**
   * Only the items nested under the answers of a linkId, which a calculated item copies into its own answers.
   * No answers and an empty list of answers are kept apart, since the result differs (null and []).
   */
  nestedItemsSignature(linkId: string): string {
    let signature = this.nestedSignatures.get(linkId);
    if (signature === undefined) {
      signature = JSON.stringify(
        (this.occurrences.get(linkId) ?? []).map(({ item }) => (item.answer ? item.answer.map(answer => answer.item ?? null) : null))
      );
      this.nestedSignatures.set(linkId, signature);
    }
    return signature;
  }

  /** The part of the response a result depends on: its dependencies, and the calculated item's nested items. */
  signature(dependencies: string[], ownLinkId: string): string {
    const parts = dependencies.map(linkId => this.contentSignature(linkId));
    if (dependencies.length > 1) {
      parts.push(dependencies.map(linkId => this.positionSignature(linkId)).join(';'));
    }
    parts.push(this.nestedItemsSignature(ownLinkId));
    return parts.join('\u0000');
  }
}
