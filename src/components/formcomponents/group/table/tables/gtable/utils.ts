import { format, isValid } from 'date-fns';
import {
  Coding,
  Extension,
  Quantity,
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
} from 'fhir/r4';

import { DATEFORMATS } from '../constants';

import { TIME_SEPARATOR } from '@/constants/dateTimeConstants';
import { COPY_EXPRESSION_URL } from '@/constants/extensions';
import { getResponseItemsWithLinkId } from '@/util/refero-core';

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

export type Column = {
  header: string;
  sourceLinkId: string;
  summaryLinkId: string;
};

type QuantityKeys = keyof Pick<Quantity, 'value' | 'code' | 'system' | 'unit'> | 'display';
type CodingKeys = keyof Pick<Coding, 'code' | 'display' | 'system'>;

/* -------------------------------------------------------------------------- */
/* FHIRPATH / EXPRESSION HELPERS                                              */
/* -------------------------------------------------------------------------- */

export function extractLinkIdFromExpression(expr: string): string | undefined {
  const match = expr.match(/linkId\s*=\s*['"]([^'"]+)['"]/);
  return match?.[1];
}

const getCopyTargetFhirPath = (extensions?: Extension[]): string | undefined => {
  const extension = extensions?.find(ext => ext.url === COPY_EXPRESSION_URL);
  if (extension?.valueExpression?.expression) {
    return extension.valueExpression.expression;
  } else {
    return extension?.valueString;
  }
};

/**
 * Extract columns from a gTable group item
 */
export function getColumnsFromGTableItem(gTableItem: QuestionnaireItem): Column[] {
  const cols: Column[] = [];
  for (const cell of gTableItem.item ?? []) {
    const expr = getCopyTargetFhirPath(cell.extension);
    if (!expr) continue;
    const source = extractLinkIdFromExpression(expr);
    if (!source) continue;

    cols.push({
      header: cell.text ?? cell.linkId ?? '(kolonne)',
      sourceLinkId: source,
      summaryLinkId: cell.linkId ?? '',
    });
  }
  return cols;
}

/* -------------------------------------------------------------------------- */
/* QUESTIONNAIRE STRUCTURE                                                    */
/* -------------------------------------------------------------------------- */

export function walkQ(
  items: QuestionnaireItem[] | undefined,
  fn: (item: QuestionnaireItem, parents: QuestionnaireItem[]) => void,
  parents: QuestionnaireItem[] = []
): void {
  if (!items) return;
  for (const item of items) {
    fn(item, parents);
    if (item.item?.length) walkQ(item.item, fn, [...parents, item]);
  }
}

export function indexQuestionnaire(q: Questionnaire | undefined | null): {
  byLinkId: Map<string, QuestionnaireItem>;
  parentPath: Map<string, QuestionnaireItem[]>;
} {
  const byLinkId = new Map<string, QuestionnaireItem>();
  const parentPath = new Map<string, QuestionnaireItem[]>();
  walkQ(q?.item, (item, parents) => {
    if (item.linkId) {
      byLinkId.set(item.linkId, item);
      parentPath.set(item.linkId, parents);
    }
  });

  return { byLinkId, parentPath };
}

export function inferSourceGroupLinkId(questionnaire: Questionnaire | undefined | null, columns: Column[]): string | undefined {
  if (!questionnaire || columns.length === 0) return undefined;

  const { parentPath } = indexQuestionnaire(questionnaire);

  const first = columns[0].sourceLinkId;
  const firstAncestors = parentPath.get(first);
  if (!firstAncestors || firstAncestors.length === 0) return undefined;

  const otherChains = columns.slice(1).map(c => parentPath.get(c.sourceLinkId) ?? []);
  const includesInAll = (node: QuestionnaireItem): boolean => otherChains.every(chain => chain.includes(node));

  // 1) deepest common ancestor **repeating** group
  for (let i = firstAncestors.length - 1; i >= 0; i--) {
    const node = firstAncestors[i];
    if (node.type === 'group' && node.repeats && includesInAll(node)) {
      return node.linkId;
    }
  }
  // 2) deepest common ancestor group (non-repeating fallback)
  for (let i = firstAncestors.length - 1; i >= 0; i--) {
    const node = firstAncestors[i];
    if (node.type === 'group' && includesInAll(node)) {
      return node.linkId;
    }
  }
  return undefined;
}

/* -------------------------------------------------------------------------- */
/* QR TRAVERSAL + ROW BUILDING                                               */
/* -------------------------------------------------------------------------- */

export function collectAnswersWithin(root: QuestionnaireResponseItem, targetLinkId: string): string[] {
  const out: string[] = [];
  (function dfs(items?: QuestionnaireResponseItem[]): void {
    if (!items) return;
    for (const item of items) {
      if (item.linkId === targetLinkId && item.answer?.length) {
        for (const a of item.answer) out.push(...answerToStrings(a));
      }
      if (item.item?.length) dfs(item.item);
      if (item.answer?.length) for (const a of item.answer) dfs(a.item);
    }
  })(root.item);
  return out;
}

/**
 * Build rows from QuestionnaireResponse
 * using the inferred source group and column definitions.
 * Keys are stored under `summaryLinkId`
 */
export function buildGTableRows(
  qr: QuestionnaireResponse | undefined | null,
  sourceGroupLinkId: string | undefined,
  columns: Column[],
  opts: { joinMultiple?: (vals: string[]) => string } = {}
): Array<Record<string, string | undefined>> {
  const join = opts.joinMultiple ?? ((vals: string[]): string => vals.join(', '));
  const groupOccurrences = getResponseItemsWithLinkId(sourceGroupLinkId, qr?.item);

  return groupOccurrences.map((occ, idx) => {
    const row: Record<string, string | undefined> = { _rowIndex: String(idx + 1) };
    for (const col of columns) {
      const vals = collectAnswersWithin(occ, col.sourceLinkId);
      row[col.summaryLinkId] = vals.length ? join(vals) : undefined;
    }
    return row;
  });
}

/* -------------------------------------------------------------------------- */
/* ANSWER VALUE EXTRACTION                                                    */
/* -------------------------------------------------------------------------- */

export function extractValueFromCoding(coding: Coding | undefined, field: CodingKeys = 'display'): string {
  if (!coding) return '';
  return coding[field] ?? '';
}

export const extractValueFromQuantity = (quantity: Quantity | undefined, field?: QuantityKeys): string | number => {
  if (!quantity) return '';
  if (field) {
    switch (field) {
      case 'display':
        return `${quantity.value ?? 0} ${quantity.unit ?? ''}`.replace(/'/g, '');
      case 'value':
        return quantity.value ?? 0;
      case 'unit':
        return quantity.unit ?? '';
      case 'system':
        return quantity.system ?? '';
      case 'code':
        return quantity.code ?? '';
      default:
        return '';
    }
  } else {
    return `${quantity.value ?? 0} ${quantity.unit ?? ''}`.replace(/'/g, '');
  }
};

export const extractValueFromDate = (inputValue?: string): string => {
  try {
    if (!inputValue && !isValid(inputValue)) return '';
    return inputValue ? format(inputValue, DATEFORMATS.DATE) : '';
  } catch {
    return '';
  }
};

export const extractValueFromTime = (inputTime?: string): string => {
  if (!inputTime) return '';
  const time = inputTime.split(TIME_SEPARATOR);
  if (time.length !== 3) return '';
  return `${time[0]}${TIME_SEPARATOR}${time[1]}`.trim();
};

export const extractValueFromDateTime = (inputValue?: string): string => {
  try {
    if (!inputValue) return '';
    return inputValue ? format(inputValue, DATEFORMATS.DATETIME) : '';
  } catch {
    return '';
  }
};

export function answerToStrings(a: QuestionnaireResponseItemAnswer): string[] {
  if (a.valueString != null) return [a.valueString];
  if (a.valueBoolean != null) return [a.valueBoolean === true ? '[X]' : '[ ]'];
  if (a.valueInteger != null) return [String(a.valueInteger)];
  if (a.valueDecimal != null) return [String(a.valueDecimal)];
  if (a.valueDate != null) return [extractValueFromDate(a.valueDate)];
  if (a.valueDateTime != null) return [extractValueFromDateTime(a.valueDateTime)];
  if (a.valueTime != null) return [extractValueFromTime(a.valueTime)];
  if (a.valueCoding) return [extractValueFromCoding(a.valueCoding, 'display')];
  if (a.valueQuantity) return [String(extractValueFromQuantity(a.valueQuantity))];
  return [];
}
