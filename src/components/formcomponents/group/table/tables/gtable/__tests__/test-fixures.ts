/* eslint-disable @typescript-eslint/explicit-function-return-type */
// test-utils/fhir-fixtures.ts

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

import { TableOrderingColum, TableOrderingFunctions } from '@/constants/codingsystems';
import { COPY_EXPRESSION_URL, ITEMCONTROL_URL } from '@/constants/extensions';
import { IItemType } from '@/constants/itemType';
import { QUESTIONNAIRE_ITEM_CONTROL_SYSTEM } from '@/constants/valuesets';

/** Defaults (override in your tests if you have project-wide constants) */
export const ITEM_CONTROL_URL = ITEMCONTROL_URL;
export const ITEM_CONTROL_SYSTEM = QUESTIONNAIRE_ITEM_CONTROL_SYSTEM;
export const ORDER_FN_SYSTEM = TableOrderingFunctions;
export const ORDER_COL_SYSTEM = TableOrderingColum;

/* ========================================================================================
 * 1) Low-level builders (items, answers, extensions)
 * ====================================================================================== */

export type AnyAnswerInit =
  | { valueString: string }
  | { valueBoolean: boolean }
  | { valueInteger: number }
  | { valueDecimal: number }
  | { valueDate: string }
  | { valueDateTime: string }
  | { valueTime: string }
  | { valueCoding: Coding }
  | { valueQuantity: Quantity };

export const aAnswer = (init: AnyAnswerInit): QuestionnaireResponseItemAnswer => ({
  ...init,
});

export const aQRItem = (
  linkId: string,
  children?: QuestionnaireResponseItem[],
  answers?: QuestionnaireResponseItemAnswer[]
): QuestionnaireResponseItem => ({
  linkId,
  ...(children?.length ? { item: children } : {}),
  ...(answers?.length ? { answer: answers } : {}),
});

export const aQItem = (init: {
  linkId: string;
  type: IItemType;
  text?: string;
  repeats?: boolean;
  items?: QuestionnaireItem[];
  extensions?: Extension[];
}): QuestionnaireItem => ({
  linkId: init.linkId,
  type: init.type,
  ...(init.text ? { text: init.text } : {}),
  ...(init.repeats ? { repeats: true } : {}),
  ...(init.items?.length ? { item: init.items } : {}),
  ...(init.extensions?.length ? { extension: init.extensions } : {}),
});

export const extItemControl = (code: string): Extension => ({
  url: ITEM_CONTROL_URL,
  valueCodeableConcept: {
    coding: [{ system: ITEM_CONTROL_SYSTEM, code }],
  },
});

export const extCQFExpression = (value: string, useLegacyValueString: boolean = true): Extension => ({
  url: COPY_EXPRESSION_URL,
  ...(!useLegacyValueString && { valueExpression: { expression: value, language: 'text/fhirpath' } }),
  ...(useLegacyValueString && { valueString: value }),
});

/** gTable header cell with cqf-expression pointing to source linkId */
export const gTableCell = (cellLinkId: string, header: string, sourceLinkId: string): QuestionnaireItem =>
  aQItem({
    linkId: cellLinkId,
    type: 'string',
    text: header,
    extensions: [
      extItemControl('data-receiver'),
      extCQFExpression(`QuestionnaireResponse.descendants().where(linkId='${sourceLinkId}').answer.value`),
    ],
  });

/** gTable summary group with optional sorting codes attached */
export const gTableSummary = (
  summaryLinkId: string,
  cells: QuestionnaireItem[],
  sort?: { dir: 'ASC' | 'DESC'; bySummaryLinkId: string }
): QuestionnaireItem => {
  const base: QuestionnaireItem = aQItem({
    linkId: summaryLinkId,
    type: 'group',
    items: cells,
    extensions: [extItemControl('gtable')],
  });
  if (sort) {
    base.code = [
      { system: ORDER_FN_SYSTEM, code: sort.dir, display: sort.dir === 'ASC' ? 'Ascending' : 'Descending' },
      { system: ORDER_COL_SYSTEM, code: sort.bySummaryLinkId, display: 'Sort column' },
    ];
  }
  return base;
};

/* ========================================================================================
 * 2) Large Questionnaire fixture (covers types + nesting)
 * ====================================================================================== */

/**
 * Build a large questionnaire with:
 * - root group
 *   - choice at root
 *   - OUTER (repeats=true)
 *       - date, time, integer, decimal, string, boolean, quantity, coding (choice), dateTime
 *       - INNER_A (repeats=false) with extra sibling items
 *       - INNER_B (repeats=true) nested repeating subgroup (for edge-case inference)
 *   - SUMMARY (gtable) referencing a subset of OUTER items via cqf-expression
 */
export function makeBigQuestionnaire(opts?: {
  includeNestedRepeating?: boolean;
  includeUnreferencedSiblings?: boolean;
  sorting?: { dir: 'ASC' | 'DESC'; bySummaryCell: 'sum-date' | 'sum-time' | 'sum-int' | 'sum-dec' };
}) {
  const OUTER_ID = 'grp-outer'; // repeating row group
  const INNER_A_ID = 'grp-inner-a'; // non-repeating
  const INNER_B_ID = 'grp-inner-b'; // repeating subgroup (optional)

  // source items under OUTER (used by table)
  const DATE_ID = 'q-date';
  const TIME_ID = 'q-time';
  const INT_ID = 'q-int';
  const DEC_ID = 'q-dec';
  const STR_ID = 'q-str';
  const BOOL_ID = 'q-bool';
  const QTY_ID = 'q-qty';
  const COD_ID = 'q-coding';
  const DT_ID = 'q-datetime';

  // summary cells (each points to a source under OUTER)
  const SUM_DATE = 'sum-date';
  const SUM_TIME = 'sum-time';
  const SUM_INT = 'sum-int';
  const SUM_DEC = 'sum-dec';

  const choiceAtRoot: QuestionnaireItem = aQItem({
    linkId: 'root-choice',
    type: 'choice',
    text: 'Root choice',
  });

  const innerA: QuestionnaireItem = aQItem({
    linkId: INNER_A_ID,
    type: 'group',
    items: [
      aQItem({ linkId: 'inner-a-str', type: 'string', text: 'Inner A String' }),
      aQItem({ linkId: 'inner-a-int', type: 'integer', text: 'Inner A Integer' }),
    ],
  });

  const innerB: QuestionnaireItem = aQItem({
    linkId: INNER_B_ID,
    type: 'group',
    repeats: true,
    items: [
      aQItem({ linkId: 'inner-b-note', type: 'string', text: 'Inner B note' }),
      aQItem({ linkId: 'inner-b-count', type: 'integer', text: 'Inner B count' }),
    ],
  });

  const outerChildren: QuestionnaireItem[] = [
    aQItem({ linkId: DATE_ID, type: 'date', text: 'Date' }),
    aQItem({ linkId: TIME_ID, type: 'time', text: 'Time' }),
    aQItem({ linkId: INT_ID, type: 'integer', text: 'Integer' }),
    aQItem({ linkId: DEC_ID, type: 'decimal', text: 'Decimal' }),
    aQItem({ linkId: STR_ID, type: 'string', text: 'String' }),
    aQItem({ linkId: BOOL_ID, type: 'boolean', text: 'Boolean' }),
    aQItem({ linkId: QTY_ID, type: 'quantity', text: 'Quantity' }),
    aQItem({ linkId: COD_ID, type: 'choice', text: 'Coding choice' }),
    aQItem({ linkId: DT_ID, type: 'dateTime', text: 'DateTime' }),
    innerA,
  ];

  if (opts?.includeNestedRepeating) outerChildren.push(innerB);
  if (opts?.includeUnreferencedSiblings) {
    outerChildren.push(aQItem({ linkId: 'q-unreferenced-1', type: 'string', text: 'Unreferenced 1' }));
    outerChildren.push(aQItem({ linkId: 'q-unreferenced-2', type: 'integer', text: 'Unreferenced 2' }));
  }

  const outer: QuestionnaireItem = aQItem({
    linkId: OUTER_ID,
    type: 'group',
    repeats: true,
    items: outerChildren,
  });

  // gTable summary, referencing only a subset of OUTER items
  const summaryCells = [
    gTableCell(SUM_DATE, 'Dato', DATE_ID),
    gTableCell(SUM_TIME, 'Tid', TIME_ID),
    gTableCell(SUM_INT, 'Heltall', INT_ID),
    gTableCell(SUM_DEC, 'Desimal', DEC_ID),
  ];
  const summarySort = opts?.sorting ? { dir: opts.sorting.dir, bySummaryLinkId: opts.sorting.bySummaryCell } : undefined;
  const summary = gTableSummary('grp-summary', summaryCells, summarySort);

  const q: Questionnaire = {
    resourceType: 'Questionnaire',
    status: 'draft',
    item: [
      aQItem({
        linkId: 'root',
        type: 'group',
        items: [choiceAtRoot, outer, summary],
      }),
    ],
  };

  return {
    questionnaire: q,
    ids: {
      OUTER_ID,
      INNER_A_ID,
      INNER_B_ID,
      DATE_ID,
      TIME_ID,
      INT_ID,
      DEC_ID,
      STR_ID,
      BOOL_ID,
      QTY_ID,
      COD_ID,
      DT_ID,
      SUM_DATE,
      SUM_TIME,
      SUM_INT,
      SUM_DEC,
    },
    summaryItem: summary,
  };
}

/* ========================================================================================
 * 3) Response builders (occurrences & scenarios)
 * ====================================================================================== */

/** Create one OUTER occurrence with arbitrary answers for any subset of source linkIds */
export function makeOuterOccurrenceAnswers(args: Partial<Record<string, QuestionnaireResponseItemAnswer[]>>): QuestionnaireResponseItem {
  const children: QuestionnaireResponseItem[] = [];
  for (const [linkId, answers] of Object.entries(args)) {
    children.push(aQRItem(linkId, undefined, answers));
  }
  return aQRItem('grp-outer', children);
}

/** Assemble a QR with N OUTER occurrences (rows). You pass per-row answers. */
export function makeQRFromOuterOccurrences(occurrences: QuestionnaireResponseItem[]): QuestionnaireResponse {
  return {
    resourceType: 'QuestionnaireResponse',
    status: 'completed',
    item: [
      aQRItem('root', [
        ...occurrences,
        // you can add other top-level occurrences/siblings here if needed
      ]),
    ],
  };
}

/** Handy answer factories for tests */
export const A = {
  str: (v: string) => aAnswer({ valueString: v }),
  bool: (v: boolean) => aAnswer({ valueBoolean: v }),
  int: (v: number) => aAnswer({ valueInteger: v }),
  dec: (v: number) => aAnswer({ valueDecimal: v }),
  date: (v: string) => aAnswer({ valueDate: v }),
  time: (v: string) => aAnswer({ valueTime: v }),
  dt: (v: string) => aAnswer({ valueDateTime: v }),
  coding: (display: string, code?: string, system?: string) =>
    aAnswer({ valueCoding: { display, ...(code ? { code } : {}), ...(system ? { system } : {}) } }),
  qty: (value: number, unit?: string, code?: string, system?: string) =>
    aAnswer({ valueQuantity: { value, ...(unit ? { unit } : {}), ...(code ? { code } : {}), ...(system ? { system } : {}) } }),
};

/** Build a typical 3-row scenario:
 *  - row 1: full answers
 *  - row 2: missing DATE (tests empty cells)
 *  - row 3: only INT + DEC
 */
export function makeTypicalQR(ids: ReturnType<typeof makeBigQuestionnaire>['ids']): QuestionnaireResponse {
  const row1 = makeOuterOccurrenceAnswers({
    [ids.DATE_ID]: [A.date('2025-10-28')],
    [ids.TIME_ID]: [A.time('12:34:56')],
    [ids.INT_ID]: [A.int(7)],
    [ids.DEC_ID]: [A.dec(2.5)],
    [ids.STR_ID]: [A.str('hello')],
    [ids.BOOL_ID]: [A.bool(true)],
    [ids.QTY_ID]: [A.qty(10, 'ml')],
    [ids.COD_ID]: [A.coding('ja', 'ja')],
    [ids.DT_ID]: [A.dt('2025-10-28T10:00:00Z')],
  });

  const row2 = makeOuterOccurrenceAnswers({
    [ids.TIME_ID]: [A.time('08:15:00')],
    [ids.INT_ID]: [A.int(3)],
    [ids.DEC_ID]: [A.dec(1.25)],
  });

  const row3 = makeOuterOccurrenceAnswers({
    [ids.INT_ID]: [A.int(100)],
    [ids.DEC_ID]: [A.dec(9.99)],
  });

  return makeQRFromOuterOccurrences([row1, row2, row3]);
}

/** Scenario: nested repeating group present (INNER_B occurrences), OUTER still drives the gTable rows */
export function makeQRWithNestedRepeating(ids: ReturnType<typeof makeBigQuestionnaire>['ids']): QuestionnaireResponse {
  const row = makeOuterOccurrenceAnswers({
    [ids.DATE_ID]: [A.date('2025-11-01')],
    [ids.TIME_ID]: [A.time('14:00:00')],
  });

  // Attach INNER_B occurrences as children under this OUTER row
  const innerB1 = aQRItem('grp-inner-b', [aQRItem('inner-b-note', undefined, [A.str('note1')])]);
  const innerB2 = aQRItem('grp-inner-b', [aQRItem('inner-b-count', undefined, [A.int(2)])]);

  row.item = [...(row.item ?? []), innerB1, innerB2];

  return makeQRFromOuterOccurrences([row]);
}

/* ========================================================================================
 * 4) Columns and summary helpers (for your gTable code)
 * ====================================================================================== */

const getCopyTargetFhirPath = (extensions?: Extension[], useLegacyValueString: boolean = true): string | undefined => {
  const extension = extensions?.find(ext => ext.url === COPY_EXPRESSION_URL);
  if (!extension) return undefined;
  if (typeof extension.valueString === 'string' && useLegacyValueString) return extension.valueString;
  if (extension.valueExpression?.expression) return extension.valueExpression.expression;
  return undefined;
};

/** Build columns from a summary item (the one created in makeBigQuestionnaire) */
export function getColumnsFromSummary(summary: QuestionnaireItem) {
  const cols: { header: string; sourceLinkId: string; summaryLinkId: string }[] = [];
  for (const cell of summary.item ?? []) {
    const header = cell.text ?? cell.linkId ?? '(kolonne)';
    const summaryLinkId = cell.linkId ?? '';

    const expr = getCopyTargetFhirPath(cell.extension);

    if (!expr) continue;
    const source = extractLinkId(expr);
    if (!source) continue;
    cols.push({ header, summaryLinkId, sourceLinkId: source });
  }
  return cols;
}

function extractLinkId(expr: string): string | undefined {
  const m = expr.match(/linkId\s*=\s*['"]([^'"]+)['"]/);
  return m?.[1];
}

/* ========================================================================================
 * 5) Pre-baked scenarios for tests
 * ====================================================================================== */

/**
 * Scenario A:
 *  - Big questionnaire with nested repeating + unreferenced siblings.
 *  - Sorting configured on summary by INT ascending.
 *  - Typical 3-row response with missing values in row 2 and 3.
 */
export function scenarioA() {
  const { questionnaire, ids, summaryItem } = makeBigQuestionnaire({
    includeNestedRepeating: true,
    includeUnreferencedSiblings: true,
    sorting: { dir: 'ASC', bySummaryCell: 'sum-int' },
  });

  const qr = makeTypicalQR(ids);
  const columns = getColumnsFromSummary(summaryItem);

  return { questionnaire, qr, ids, columns, summaryItem };
}

/**
 * Scenario B:
 *  - Big questionnaire without nested repeating.
 *  - Sorting on time descending.
 *  - Response with only one row + nested inner-B occurrences (won't affect gTable rows).
 */
export function scenarioB() {
  const { questionnaire, ids, summaryItem } = makeBigQuestionnaire({
    includeNestedRepeating: false,
    sorting: { dir: 'DESC', bySummaryCell: 'sum-time' },
  });

  const qr = makeQRWithNestedRepeating(ids);
  const columns = getColumnsFromSummary(summaryItem);

  return { questionnaire, qr, ids, columns, summaryItem };
}

/**
 * Scenario C:
 *  - Same structure, but no sorting codes set on summary (lets UI default).
 *  - Response with empty second row to test empty cells.
 */
export function scenarioC() {
  const { questionnaire, ids, summaryItem } = makeBigQuestionnaire({
    includeNestedRepeating: true,
  });

  const row1 = makeOuterOccurrenceAnswers({
    [ids.DATE_ID]: [A.date('2025-12-24')],
    [ids.TIME_ID]: [A.time('16:00:00')],
    [ids.INT_ID]: [A.int(2)],
    [ids.DEC_ID]: [A.dec(3.14)],
  });
  const row2 = makeOuterOccurrenceAnswers({}); // empty row
  const qr = makeQRFromOuterOccurrences([row1, row2]);

  const columns = getColumnsFromSummary(summaryItem);
  return { questionnaire, qr, ids, columns, summaryItem };
}
