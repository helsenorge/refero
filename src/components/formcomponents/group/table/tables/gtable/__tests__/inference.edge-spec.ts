import { describe, it, expect } from 'vitest';

import type { Questionnaire, QuestionnaireItem } from 'fhir/r4';

import { makeBigQuestionnaire, gTableCell, gTableSummary, aQItem } from './test-fixures';
import { inferSourceGroupLinkId, getColumnsFromGTableItem } from '../utils';

describe('Inference when first column is nested deeper than others', () => {
  it('picks the deepest common ancestor among columns (prefers repeats)', () => {
    const { questionnaire, ids } = makeBigQuestionnaire({ includeNestedRepeating: true });

    // Build a custom summary where first cell points to a field inside INNER_B,
    // while the second points to OUTER sibling -> common ancestor should be OUTER.
    const customSummary: QuestionnaireItem = gTableSummary('summary-x', [
      gTableCell('sum-nested', 'Nested Note', 'inner-b-note'), // inside grp-inner-b
      gTableCell('sum-int', 'Int', ids.INT_ID), // sibling under OUTER
    ]);

    const columns = getColumnsFromGTableItem(customSummary);
    const group = inferSourceGroupLinkId(questionnaire, columns);

    // expect OUTER (grp-outer), not INNER_B
    expect(group).toBe('grp-outer');
  });
});

describe('Inference fallback when no repeating ancestors exist', () => {
  it('returns deepest common non-repeating group', () => {
    // Craft a mini Questionnaire without repeats, both sources under the same non-repeating parent
    const inner = aQItem({
      linkId: 'grp-nonrep',
      type: 'group',
      items: [aQItem({ linkId: 'q-a', type: 'string' }), aQItem({ linkId: 'q-b', type: 'string' })],
    });
    const root = aQItem({ linkId: 'root', type: 'group', items: [inner] });
    const questionnaire: Questionnaire = { resourceType: 'Questionnaire', status: 'draft', item: [root] };

    const summary = gTableSummary('summary', [gTableCell('sum-a', 'A', 'q-a'), gTableCell('sum-b', 'B', 'q-b')]);

    const columns = getColumnsFromGTableItem(summary);
    const group = inferSourceGroupLinkId(questionnaire, columns);
    expect(group).toBe('grp-nonrep');
  });
});
