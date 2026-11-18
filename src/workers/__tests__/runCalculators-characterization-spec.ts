import { describe, it, expect } from 'vitest';

import type { Questionnaire, QuestionnaireItem, QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';

import { generateQuestionnaireResponse } from '@/actions/generateQuestionnaireResponse';
import { FhirPathExtensions } from '@/util/FhirPathExtensions';
import { resolveFhirPathCalculationOptions, type FhirPathCalculationOptions } from '@/util/fhirPathOptions';
import { calculateWithEngine, getQuestionnaireKey, runCalculators } from '@/workers/helpers';

/**
 * Characterisation of runCalculators, written before making it faster: whatever is cached or skipped between
 * runs, every run must return exactly what a fresh calculation of the same response returns.
 */

const CQF = 'http://hl7.org/fhir/StructureDefinition/cqf-expression';
const CALCULATED = 'http://ehelse.no/fhir/StructureDefinition/sdf-calculatedExpression';
const descendant = (linkId: string): string => `QuestionnaireResponse.descendants().where(linkId='${linkId}')`;
const calc = (linkId: string, type: QuestionnaireItem['type'], url: string, expression: string): QuestionnaireItem => ({
  linkId,
  type,
  readOnly: true,
  extension: [{ url, valueString: expression }],
});

/** One of each kind of expression the forms use, over a small form with a repeating group and nested answers. */
const questionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'draft',
  item: [
    {
      linkId: 'grp',
      type: 'group',
      item: [
        { linkId: 'a1', type: 'integer' },
        { linkId: 'a2', type: 'integer' },
        { linkId: 'txt', type: 'string' },
      ],
    },
    { linkId: 'rep', type: 'group', repeats: true, item: [{ linkId: 'rep.v', type: 'integer' }] },
    { linkId: 'parent', type: 'boolean', item: [{ linkId: 'child', type: 'integer' }] },
    {
      linkId: 'calc',
      type: 'group',
      item: [
        calc('copyA1', 'integer', CQF, `${descendant('a1')}.answer.value`),
        calc('copyTxt', 'string', CQF, `${descendant('txt')}.answer.value`),
        calc(
          'sumStartsWith',
          'integer',
          CALCULATED,
          "QuestionnaireResponse.descendants().where(linkId.startsWith('a')).answer.value.sum()"
        ),
        calc('sumGroup', 'integer', CALCULATED, `${descendant('grp')}.item.answer.value.ofType(integer).sum()`),
        calc('countRep', 'integer', CALCULATED, `${descendant('rep')}.count()`),
        calc('sumRep', 'integer', CALCULATED, `${descendant('rep.v')}.answer.value.sum()`),
        calc('chain1', 'integer', CALCULATED, `${descendant('copyA1')}.answer.value.sum() + 1`),
        calc('chain2', 'integer', CALCULATED, `${descendant('chain1')}.answer.value.sum() + 1`),
        calc('nested', 'integer', CQF, `${descendant('parent')}.answer.item.where(linkId='child').answer.value`),
        calc('orCopy', 'integer', CALCULATED, "QuestionnaireResponse.descendants().where(linkId='a1' or linkId='a2').answer.value.sum()"),
        calc('noLinkId', 'integer', CALCULATED, 'QuestionnaireResponse.item.count()'),
        calc('fromQuestionnaire', 'string', CQF, "%questionnaire.item.where(linkId='grp').linkId"),
        calc('decimalFromText', 'decimal', CALCULATED, `${descendant('txt')}.answer.value`),
        {
          linkId: 'both',
          type: 'integer',
          readOnly: true,
          extension: [
            { url: CQF, valueString: `${descendant('a2')}.answer.value` },
            { url: CALCULATED, valueString: `${descendant('a1')}.answer.value.sum() * 10` },
          ],
        },
      ],
    },
  ],
};

type Edit = (qr: QuestionnaireResponse) => void;

function occurrences(qr: QuestionnaireResponse, linkId: string): QuestionnaireResponseItem[] {
  const found: QuestionnaireResponseItem[] = [];
  (function walk(items: QuestionnaireResponseItem[] = []): void {
    for (const item of items) {
      if (item.linkId === linkId) found.push(item);
      walk(item.item);
      for (const answer of item.answer ?? []) walk(answer.item);
    }
  })(qr.item);
  return found;
}

/** A small deterministic random generator, so a failing sequence can be replayed. */
function random(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

function randomEdit(next: () => number): Edit {
  const pick = <T>(list: T[]): T => list[Math.floor(next() * list.length)];
  const value = Math.floor(next() * 20) - 5;
  switch (Math.floor(next() * 7)) {
    case 0:
      return qr => occurrences(qr, pick(['a1', 'a2'])).forEach(item => (item.answer = [{ valueInteger: value }]));
    case 1:
      return qr => occurrences(qr, pick(['a1', 'a2', 'txt'])).forEach(item => delete item.answer);
    case 2:
      return qr => occurrences(qr, 'txt').forEach(item => (item.answer = [{ valueString: pick(['x', '12', '3.5', '']) }]));
    case 3:
      return qr => {
        const parent = occurrences(qr, 'rep')[0];
        const siblings = qr.item ?? [];
        siblings.splice(siblings.indexOf(parent) + 1, 0, { linkId: 'rep', item: [{ linkId: 'rep.v', answer: [{ valueInteger: value }] }] });
      };
    case 4:
      return qr => {
        const reps = occurrences(qr, 'rep');
        if (reps.length > 1) qr.item?.splice(qr.item.indexOf(reps[reps.length - 1]), 1);
      };
    case 5:
      return qr => {
        const reps = occurrences(qr, 'rep.v');
        const target = reps[Math.floor(next() * reps.length)];
        if (target) target.answer = [{ valueInteger: value }];
      };
    default:
      return qr => occurrences(qr, 'child').forEach(item => (item.answer = [{ valueInteger: value }]));
  }
}

/** Writes calculated answers back the way runFhirPathQrUpdater does: the same answer on every occurrence. */
function applyCalculated(qr: QuestionnaireResponse, pad: Record<string, unknown>): void {
  for (const [linkId, value] of Object.entries(pad)) {
    for (const item of occurrences(qr, linkId)) {
      if (Array.isArray(value) && value.length > 0) item.answer = value;
      else delete item.answer;
    }
  }
}

const optionSets: Array<[string, FhirPathCalculationOptions | undefined]> = [
  ['legacy defaults', undefined],
  ['resolveExpressionChains', { resolveExpressionChains: true }],
  ['omitNonNumericResults + keepZeroValues', { omitNonNumericResults: true, keepZeroValues: true }],
  ['calculated-first', { expressionPriority: 'calculated-first' }],
];

describe('runCalculators characterisation', () => {
  describe.each(optionSets)('with %s', (_name, options) => {
    it('returns the same answers as a fresh calculation over a long sequence of edits', () => {
      const next = random(42);
      const qr = generateQuestionnaireResponse(questionnaire) as QuestionnaireResponse;
      for (let step = 0; step < 60; step++) {
        randomEdit(next)(qr);
        // Same questionnaire object every run, like the form does; may reuse anything it keeps between runs.
        const reused = runCalculators({ questionnaire, questionnaireResponse: structuredClone(qr), options });
        // A new engine every time, outside the cache, so nothing can be reused.
        const resolved = resolveFhirPathCalculationOptions(options);
        const fresh = calculateWithEngine(new FhirPathExtensions(structuredClone(questionnaire), resolved), structuredClone(qr), resolved);
        expect(reused, `step ${step}`).toEqual(fresh);
        applyCalculated(qr, reused as Record<string, unknown>);
      }
    });
  });

  it('gives each questionnaire object its own stable key', () => {
    const copy = structuredClone(questionnaire);
    expect(getQuestionnaireKey(questionnaire)).toBe(getQuestionnaireKey(questionnaire));
    expect(getQuestionnaireKey(copy)).not.toBe(getQuestionnaireKey(questionnaire));
  });

  it('uses the key, not the object, when one is given (as in the worker, where every message brings a new copy)', () => {
    const qr = generateQuestionnaireResponse(questionnaire) as QuestionnaireResponse;
    occurrences(qr, 'a1')[0].answer = [{ valueInteger: 3 }];
    const questionnaireKey = getQuestionnaireKey(questionnaire);
    const first = runCalculators({
      questionnaire: structuredClone(questionnaire),
      questionnaireResponse: structuredClone(qr),
      questionnaireKey,
    });
    occurrences(qr, 'a1')[0].answer = [{ valueInteger: 5 }];
    const second = runCalculators({
      questionnaire: structuredClone(questionnaire),
      questionnaireResponse: structuredClone(qr),
      questionnaireKey,
    });
    expect(first['copyA1']).toEqual([{ valueInteger: 3 }]);
    expect(second['copyA1']).toEqual([{ valueInteger: 5 }]);
  });

  it('works on a frozen response and questionnaire, as the main thread fallback passes them', () => {
    const qr = generateQuestionnaireResponse(questionnaire) as QuestionnaireResponse;
    occurrences(qr, 'a1')[0].answer = [{ valueInteger: 4 }];
    occurrences(qr, 'child')[0].answer = [{ valueInteger: 9 }];
    const expected = runCalculators({ questionnaire: structuredClone(questionnaire), questionnaireResponse: structuredClone(qr) });

    const deepFreeze = <T>(value: T): T => {
      if (value && typeof value === 'object') {
        Object.values(value).forEach(deepFreeze);
        Object.freeze(value);
      }
      return value;
    };
    const frozenQuestionnaire = deepFreeze(structuredClone(questionnaire));
    expect(runCalculators({ questionnaire: frozenQuestionnaire, questionnaireResponse: deepFreeze(structuredClone(qr)) })).toEqual(
      expected
    );
    // and again, with whatever the first run kept
    expect(runCalculators({ questionnaire: frozenQuestionnaire, questionnaireResponse: deepFreeze(structuredClone(qr)) })).toEqual(
      expected
    );
  });

  it.each(optionSets)('treats answers on linkIds the questionnaire does not have like a fresh calculation (%s)', (_name, options) => {
    // An item the questionnaire does not define, but which sumStartsWith (linkId.startsWith('a')) selects. The
    // first pass sees it; it is not carried into the updated response (unchanged behaviour), so whether it
    // shows up in the result depends on the pass - which must be the same with and without reuse.
    const qr = generateQuestionnaireResponse(questionnaire) as QuestionnaireResponse;
    occurrences(qr, 'a1')[0].answer = [{ valueInteger: 1 }];
    qr.item?.push({ linkId: 'a-extra', answer: [{ valueInteger: 100 }] });
    const resolved = resolveFhirPathCalculationOptions(options);
    for (const value of [100, 200, 300]) {
      qr.item!.find(item => item.linkId === 'a-extra')!.answer = [{ valueInteger: value }];
      const reused = runCalculators({ questionnaire, questionnaireResponse: structuredClone(qr), options });
      const fresh = calculateWithEngine(new FhirPathExtensions(structuredClone(questionnaire), resolved), structuredClone(qr), resolved);
      expect(reused, `value ${value}`).toEqual(fresh);
    }
  });

  it.each([
    [
      'a filter that selects nodes without a linkId',
      'QuestionnaireResponse.descendants().where(linkId.empty()).value.ofType(integer).sum()',
    ],
    ['a field of the response', "identifier.value.toInteger() + QuestionnaireResponse.descendants().where(linkId='a1').answer.value"],
  ])('recalculates an expression that reads the response through %s', (_name, expression) => {
    const form: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'draft',
      item: [{ linkId: 'a1', type: 'integer' }, calc('result', 'integer', CALCULATED, expression)],
    };
    const response = (value: number, identifier: string): QuestionnaireResponse => ({
      resourceType: 'QuestionnaireResponse',
      status: 'in-progress',
      identifier: { value: identifier },
      item: [{ linkId: 'a1', answer: [{ valueInteger: value }] }, { linkId: 'result' }],
    });
    const resolved = resolveFhirPathCalculationOptions();
    const cases: Array<[number, string]> = [
      [1, '10'],
      [5, '10'],
      [5, '20'],
    ];
    for (const [value, identifier] of cases) {
      const reused = runCalculators({ questionnaire: form, questionnaireResponse: response(value, identifier) });
      const fresh = calculateWithEngine(new FhirPathExtensions(structuredClone(form), resolved), response(value, identifier), resolved);
      expect(reused, `${value} ${identifier}`).toEqual(fresh);
    }
  });

  it('gives an item with an empty list of answers what a fresh calculation gives, after having seen it without answers', () => {
    const form: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'draft',
      item: [{ linkId: 'a1', type: 'integer' }, calc('result', 'integer', CALCULATED, `${descendant('missing')}.answer.value`)],
    };
    const response = (answer?: []): QuestionnaireResponse => ({
      resourceType: 'QuestionnaireResponse',
      status: 'in-progress',
      item: [{ linkId: 'a1' }, { linkId: 'result', ...(answer && { answer }) }],
    });
    const resolved = resolveFhirPathCalculationOptions();
    runCalculators({ questionnaire: form, questionnaireResponse: response() });
    const reused = runCalculators({ questionnaire: form, questionnaireResponse: response([]) });
    expect(reused).toEqual(calculateWithEngine(new FhirPathExtensions(structuredClone(form), resolved), response([]), resolved));
  });

  it('does not change the response it is given', () => {
    const qr = generateQuestionnaireResponse(questionnaire) as QuestionnaireResponse;
    occurrences(qr, 'a1')[0].answer = [{ valueInteger: 4 }];
    const before = JSON.stringify(qr);
    runCalculators({ questionnaire, questionnaireResponse: qr });
    runCalculators({ questionnaire, questionnaireResponse: qr });
    expect(JSON.stringify(qr)).toBe(before);
  });

  it('follows the options of each call, also for the same questionnaire', () => {
    const qr = generateQuestionnaireResponse(questionnaire) as QuestionnaireResponse;
    occurrences(qr, 'txt')[0].answer = [{ valueString: 'x' }];
    const legacy = runCalculators({ questionnaire, questionnaireResponse: structuredClone(qr) });
    const omitting = runCalculators({
      questionnaire,
      questionnaireResponse: structuredClone(qr),
      options: { omitNonNumericResults: true },
    });
    expect(legacy['decimalFromText']).not.toEqual(omitting['decimalFromText']);
    expect(runCalculators({ questionnaire, questionnaireResponse: structuredClone(qr) })).toEqual(legacy);
  });

  it('keeps calculations of different questionnaires apart', () => {
    const other: Questionnaire = structuredClone(questionnaire);
    const copyA1 = other.item?.[3].item?.find(item => item.linkId === 'copyA1');
    if (copyA1?.extension) copyA1.extension[0].valueString = `${descendant('a2')}.answer.value`;

    const qr = generateQuestionnaireResponse(questionnaire) as QuestionnaireResponse;
    occurrences(qr, 'a1')[0].answer = [{ valueInteger: 1 }];
    occurrences(qr, 'a2')[0].answer = [{ valueInteger: 2 }];
    expect(runCalculators({ questionnaire, questionnaireResponse: structuredClone(qr) })['copyA1']).toEqual([{ valueInteger: 1 }]);
    expect(runCalculators({ questionnaire: other, questionnaireResponse: structuredClone(qr) })['copyA1']).toEqual([{ valueInteger: 2 }]);
    expect(runCalculators({ questionnaire, questionnaireResponse: structuredClone(qr) })['copyA1']).toEqual([{ valueInteger: 1 }]);
  });
});
