import { describe, it, expect } from 'vitest';

import type { Questionnaire, QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';

import questionnaireJson from './__data__/itemCopy/q.json';

import { generateQuestionnaireResponse } from '@/actions/generateQuestionnaireResponse';
import { FhirPathExtensions } from '@/util/FhirPathExtensions';
import { resolveFhirPathCalculationOptions } from '@/util/fhirPathOptions';
import { calculateWithEngine, runCalculators } from '@/workers/helpers';

const questionnaire = questionnaireJson as unknown as Questionnaire;

const urin = (text: string, age?: number): QuestionnaireResponseItem => ({
  linkId: 'urin',
  item: [
    { linkId: 'urin.text', answer: [{ valueString: text }] },
    age === undefined ? { linkId: 'urin.age' } : { linkId: 'urin.age', answer: [{ valueInteger: age }] },
  ],
});
const tall = (value?: number): QuestionnaireResponseItem =>
  value === undefined ? { linkId: 'tall' } : { linkId: 'tall', answer: [{ valueInteger: value }] };

/** Three Urin rows where the middle one has no age, four Tall repetitions where the second is empty. */
const responseWithGaps = (): QuestionnaireResponse => ({
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  item: [
    { linkId: 'kilde', item: [urin('a', 12), urin('b'), urin('c', 42)] },
    { linkId: 's1', item: [{ linkId: 's1.text' }, { linkId: 's1.age' }] },
    { linkId: 's2', item: [{ linkId: 's2.text' }, { linkId: 's2.age' }] },
    { linkId: 's3', item: [{ linkId: 's3.text' }, { linkId: 's3.age' }] },
    { linkId: 's4', item: [{ linkId: 's4.text' }, { linkId: 's4.age' }] },
    { linkId: 'kilde2', item: [tall(1), tall(), tall(3), tall(4)] },
    { linkId: 's5' },
    { linkId: 's6', item: [{ linkId: 's6.tall' }] },
    { linkId: 's7' },
    {
      linkId: 'kilde3',
      item: [
        { linkId: 'medisin', answer: [{ valueString: 'Paracet', item: [{ linkId: 'medisin.dose', answer: [{ valueInteger: 500 }] }] }] },
        { linkId: 'medisin', answer: [{ valueString: 'Ibux', item: [{ linkId: 'medisin.dose' }] }] },
        { linkId: 'medisin', answer: [{ item: [{ linkId: 'medisin.dose', answer: [{ valueInteger: 10 }] }] }] },
      ],
    },
    { linkId: 's8', item: [{ linkId: 's8.navn' }, { linkId: 's8.dose' }] },
    { linkId: 's9', answer: [{ item: [{ linkId: 's9.dose' }] }] },
    { linkId: 'vis', answer: [{ valueBoolean: true, item: [{ linkId: 's10', item: [{ linkId: 's10.text' }, { linkId: 's10.age' }] }] }] },
  ],
});

const run = (): ReturnType<typeof runCalculators> => runCalculators({ questionnaire, questionnaireResponse: responseWithGaps() });

/** Each occurrence as [value of child 1, value of child 2, ...], undefined where the child has no answer. */
const rowsOf = (linkId: string): unknown[][] => {
  const copy = run().itemCopies.find(c => c.linkId === linkId);
  expect(copy, `item copy for ${linkId}`).toBeDefined();
  return (copy?.items ?? []).map(occurrence =>
    occurrence.item
      ? occurrence.item.map(child => child.answer?.[0]?.valueString ?? child.answer?.[0]?.valueInteger)
      : [occurrence.answer?.[0]?.valueInteger]
  );
};

describe('Item copy (cqf-expression selecting items)', () => {
  it('copies a repeating group row by row, keeping the empty answer in its row', () => {
    expect(rowsOf('s1')).toEqual([
      ['a', 12],
      ['b', undefined],
      ['c', 42],
    ]);
  });

  it('uses the variable named by valueExpression.name', () => {
    expect(rowsOf('s2')).toEqual([
      ['a', 12],
      ['b', undefined],
      ['c', 42],
    ]);
  });

  it('lets the expression filter rows', () => {
    expect(rowsOf('s3')).toEqual([
      ['a', 12],
      ['c', 42],
    ]);
  });

  it('copies a repeating question to one occurrence per repetition', () => {
    expect(rowsOf('s5')).toEqual([[1], [undefined], [3], [4]]);
  });

  it('uses a repeating question as row source for a copied group', () => {
    expect(rowsOf('s6')).toEqual([[1], [undefined], [3], [4]]);
  });

  it('reads answer-nested children of the selected items', () => {
    expect(rowsOf('s8')).toEqual([
      ['Paracet', 500],
      ['Ibux', undefined],
      [undefined, 10],
    ]);
  });

  it('gives a copied question its own answer-nested children, evaluated per row', () => {
    const copy = run().itemCopies.find(c => c.linkId === 's9');
    expect(copy?.items.map(o => [o.answer?.[0]?.valueString, o.answer?.[0]?.item?.[0]?.answer?.[0]?.valueInteger])).toEqual([
      ['Paracet', 500],
      ['Ibux', undefined],
      [undefined, 10],
    ]);
  });

  it('finds a copy target nested under a question answer', () => {
    const copy = run().itemCopies.find(c => c.linkId === 's10');
    expect(copy?.parentPath).toEqual([{ linkId: 'vis' }]);
    expect(rowsOf('s10')).toEqual([
      ['a', 12],
      ['b', undefined],
      ['c', 42],
    ]);
  });

  it('places the copies under their parent, with the questionnaire order of the siblings', () => {
    const copy = run().itemCopies.find(c => c.linkId === 's1');
    expect(copy?.parentPath).toEqual([]);
    expect(copy?.siblingOrder.indexOf('s1')).toBe(1);
  });

  it('keeps item copy targets and their children out of the answer pad', () => {
    const { answerPad } = run();
    for (const linkId of ['s1', 's1.text', 's1.age', 's2.text', 's3.age', 's5', 's6.tall', 's8.dose', 's9', 's9.dose', 's10.age']) {
      expect(answerPad, linkId).not.toHaveProperty(linkId);
    }
  });

  it('applies item copies when a response is generated, before any answer is given', () => {
    const generated = generateQuestionnaireResponse(questionnaire);
    const occurrences = (linkId: string): number => (generated?.item ?? []).filter(item => item.linkId === linkId).length;
    // One empty Urin occurrence gives one empty row; the age filter leaves none.
    expect(occurrences('s1')).toBe(1);
    expect(occurrences('s3')).toBe(0);
    // Order follows the questionnaire.
    expect(generated?.item?.map(item => item.linkId)).toEqual([
      'kilde',
      's1',
      's2',
      's4',
      'kilde2',
      's5',
      's6',
      's7',
      'kilde3',
      's8',
      's9',
      'vis',
    ]);
  });

  it('leaves value copies as they are today', () => {
    const { answerPad } = run();
    expect(answerPad['s4.text']).toEqual([{ valueString: 'a' }, { valueString: 'b' }, { valueString: 'c' }]);
    expect(answerPad['s4.age']).toEqual([{ valueInteger: 12 }, { valueInteger: 42 }]);
    expect(answerPad['s7']).toEqual([{ valueInteger: 1 }, { valueInteger: 3 }, { valueInteger: 4 }]);
  });
});

// runCalculators keeps the engine for a questionnaire between calculations, and the engine reuses results. A kept
// engine must give what a new one gives.
describe('Item copy with the engine kept between calculations', () => {
  const fresh = (response: QuestionnaireResponse): ReturnType<typeof runCalculators> => {
    const options = resolveFhirPathCalculationOptions();
    return calculateWithEngine(new FhirPathExtensions(structuredClone(questionnaire), options), response, options);
  };

  it('copies the rows again when the source rows change', () => {
    runCalculators({ questionnaire, questionnaireResponse: responseWithGaps() });
    const changed = responseWithGaps();
    changed.item![0].item = [urin('a', 13), urin('x', 7)];
    expect(runCalculators({ questionnaire, questionnaireResponse: structuredClone(changed) })).toEqual(fresh(structuredClone(changed)));
  });

  it('treats a repeating question as a value copy again when its expression no longer selects items', () => {
    runCalculators({ questionnaire, questionnaireResponse: responseWithGaps() });
    const changed = responseWithGaps();
    changed.item![5] = { linkId: 'kilde2' };
    const result = runCalculators({ questionnaire, questionnaireResponse: structuredClone(changed) });
    expect(result.itemCopies.map(copy => copy.linkId)).not.toContain('s5');
    expect(result).toEqual(fresh(structuredClone(changed)));
  });
});
