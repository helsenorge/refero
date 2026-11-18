import { describe, it, expect } from 'vitest';

import type { QuestionnaireResponse } from 'fhir/r4';

import { ALL_DEPENDENCIES, analyzeExpression, getExpressionDependencies, ResponseIndex } from '../expressionDependencies';

// The linkIds a questionnaire could have; filters are resolved against these.
const linkIds = ['a', 'b', 'grp', 'rep', 'parent', 'child', 'q', "it's", 'g1.q0', 'g1.q1', 'g10.q0', 'g2.q0', 'x'];

describe('getExpressionDependencies', () => {
  it.each([
    ["QuestionnaireResponse.descendants().where(linkId='a').answer.value", ['a']],
    ["%resource.descendants().where(linkId='a').answer.value.sum()", ['a']],
    ["descendants().where(linkId='a').answer.value", ['a']],
    ["QuestionnaireResponse.item.where(linkId='grp').item.where(linkId='b').answer.value", ['b', 'grp']],
    ["QuestionnaireResponse.repeat(item).where(linkId='a').answer.value", ['a']],
    ["QuestionnaireResponse.descendants().where(linkId='a' or linkId='b').answer.value.sum()", ['a', 'b']],
    [
      "QuestionnaireResponse.descendants().where(linkId='a').answer.value.sum() + QuestionnaireResponse.descendants().where(linkId='b').answer.value.sum()",
      ['a', 'b'],
    ],
    ["QuestionnaireResponse.descendants().where(linkId='rep').count()", ['rep']],
    ["QuestionnaireResponse.descendants().where(linkId='a').answer.value.ofType(integer).sum() * 2 + 1", ['a']],
    ["iif(QuestionnaireResponse.descendants().where(linkId='a').answer.value.exists(), 'yes', 'no')", ['a']],
    ["QuestionnaireResponse.descendants().where(linkId='parent').answer.item.where(linkId='child').answer.value", ['child', 'parent']],
    [
      "%questionnaire.item.where(linkId='q').text + QuestionnaireResponse.descendants().where(linkId='a').answer.value.toString()",
      ['a', 'q'],
    ],
    ["QuestionnaireResponse.descendants().where(linkId='it\\'s').answer.value", ["it's"]],
    // Conditions on linkId alone are resolved against the known linkIds.
    ["QuestionnaireResponse.descendants().where(linkId.startsWith('g1.')).answer.value.sum()", ['g1.q0', 'g1.q1']],
    ["QuestionnaireResponse.descendants().where(linkId in ('a' | 'q')).answer.value", ['a', 'q']],
    ["QuestionnaireResponse.descendants().where(linkId != 'a').answer.value", linkIds.filter(linkId => linkId !== 'a').sort()],
    [
      "QuestionnaireResponse.descendants().where((linkId.startsWith('g')).not()).answer.value",
      linkIds.filter(linkId => !linkId.startsWith('g')).sort(),
    ],
    ["QuestionnaireResponse.descendants().where(linkId.matches('^g[0-9]+\\\\.q0$')).answer.value", ['g1.q0', 'g10.q0', 'g2.q0']],
    // Operators, type names and iif around the filtered nodes read nothing else.
    [
      "QuestionnaireResponse.descendants().where(linkId='a').answer.value.value / ((QuestionnaireResponse.descendants().where(linkId='b').answer.value.value / 100) * (QuestionnaireResponse.descendants().where(linkId='b').answer.value.value / 100))",
      ['a', 'b'],
    ],
    ["(QuestionnaireResponse.descendants().where(linkId='a').answer.value as integer) div 2 > 1 and true", ['a']],
    ["QuestionnaireResponse.descendants().where(linkId='a').answer.value is System.Integer", ['a']],
    ["%questionnaire.item.first().text + QuestionnaireResponse.descendants().where(linkId='a').answer.value.toString()", ['a']],
  ])('%s depends on %j', (expression, expected) => {
    expect(getExpressionDependencies(expression, linkIds)).toEqual(expected);
  });

  it.each([
    ["QuestionnaireResponse.descendants().where(linkId='a' and answer.exists()).answer.value", 'filter that also looks at answers'],
    ["QuestionnaireResponse.descendants().where(text = 'Navn').answer.value", 'filter without linkId'],
    ['QuestionnaireResponse.item.count()', 'no linkId filter at all'],
    [
      "QuestionnaireResponse.item.first().answer.value + QuestionnaireResponse.descendants().where(linkId='a').answer.value",
      'positional navigation besides the filter',
    ],
    ["QuestionnaireResponse.descendants().where(linkId='a').answer.value + item.count()", 'implicit root navigation'],
    [
      "QuestionnaireResponse.status = 'completed' and QuestionnaireResponse.descendants().where(linkId='a').exists()",
      'reads the response status',
    ],
    ["today() - QuestionnaireResponse.descendants().where(linkId='a').answer.value", 'time function'],
    ["now().toString() + QuestionnaireResponse.descendants().where(linkId='a').answer.value.toString()", 'time function'],
    ["%row.item.where(linkId='a').answer.value", 'unknown variable'],
    ["%context.descendants().where(linkId='a').answer.value", 'unknown variable'],
    [
      "QuestionnaireResponse.descendants().where(linkId='a').answer.value.where($this > 3) | QuestionnaireResponse.descendants().where(linkId='b').answer.where(value > 2).value",
      'navigation inside a function argument',
    ],
    ["QuestionnaireResponse.descendants().where(linkId='a'", 'unbalanced parenthesis'],
    ['QuestionnaireResponse.descendants().where(linkId.empty()).value.sum()', 'filter that selects nodes without a linkId'],
    ['QuestionnaireResponse.descendants().where(linkId.exists().not()).value.sum()', 'filter that selects nodes without a linkId'],
    ["QuestionnaireResponse.descendants().where(linkId = 'a' or true).answer.value.sum()", 'filter that selects everything'],
    ["identifier.value.toInteger() + QuestionnaireResponse.descendants().where(linkId='a').answer.value", 'reads a field of the response'],
    ["contained.count() + QuestionnaireResponse.descendants().where(linkId='a').answer.value", 'reads a field of the response'],
    ["QuestionnaireResponse.descendants().where(linkId='a').answer.value + children().count()", 'function on the response itself'],
    ["iif(exists(), QuestionnaireResponse.descendants().where(linkId='a').answer.value, 0)", 'function on the response itself'],
    ["QuestionnaireResponse.descendants().where(linkId='a').answer.value + `status`.length()", 'delimited identifier'],
  ])('%s depends on everything (%s)', expression => {
    expect(analyzeExpression(expression)).toBe(ALL_DEPENDENCIES);
  });
});

describe('ResponseIndex', () => {
  const response = (aValue: number, bAnswers: QuestionnaireResponse['item'] = []): QuestionnaireResponse => ({
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress',
    item: [
      { linkId: 'grp', item: [{ linkId: 'a', answer: [{ valueInteger: aValue }] }, ...bAnswers] },
      { linkId: 'calc', answer: [{ valueInteger: 1, item: [{ linkId: 'nested', answer: [{ valueString: 'x' }] }] }] },
    ],
  });

  it('gives the same signature for equal content and a different one when a dependency changes', () => {
    expect(new ResponseIndex(response(1)).signature(['a'], 'calc')).toBe(new ResponseIndex(response(1)).signature(['a'], 'calc'));
    expect(new ResponseIndex(response(1)).signature(['a'], 'calc')).not.toBe(new ResponseIndex(response(2)).signature(['a'], 'calc'));
  });

  it('sees changes below a group the expression navigates into', () => {
    expect(new ResponseIndex(response(1)).signature(['grp'], 'calc')).not.toBe(new ResponseIndex(response(2)).signature(['grp'], 'calc'));
  });

  it('ignores changes outside the dependencies', () => {
    const withB = response(1, [{ linkId: 'b', answer: [{ valueInteger: 9 }] }]);
    expect(new ResponseIndex(response(1)).signature(['a'], 'other')).toBe(new ResponseIndex(withB).signature(['a'], 'other'));
  });

  it("tracks the calculated item's nested items, but not its own value", () => {
    const changedValue = response(1);
    changedValue.item![1].answer![0].valueInteger = 99;
    const changedNested = response(1);
    changedNested.item![1].answer![0].item![0].answer = [{ valueString: 'y' }];
    const base = new ResponseIndex(response(1)).signature(['a'], 'calc');
    expect(new ResponseIndex(changedValue).signature(['a'], 'calc')).toBe(base);
    expect(new ResponseIndex(changedNested).signature(['a'], 'calc')).not.toBe(base);
  });

  it('keeps no answers and an empty list of answers apart for the calculated item', () => {
    const without: QuestionnaireResponse = { resourceType: 'QuestionnaireResponse', status: 'in-progress', item: [{ linkId: 'calc' }] };
    const empty: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'in-progress',
      item: [{ linkId: 'calc', answer: [] }],
    };
    expect(new ResponseIndex(without).signature(['a'], 'calc')).not.toBe(new ResponseIndex(empty).signature(['a'], 'calc'));
  });

  it('notices when items with different linkIds change order, for expressions that combine them', () => {
    const ab: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'in-progress',
      item: [{ linkId: 'a' }, { linkId: 'b' }],
    };
    const ba: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'in-progress',
      item: [{ linkId: 'b' }, { linkId: 'a' }],
    };
    expect(new ResponseIndex(ab).signature(['a', 'b'], 'x')).not.toBe(new ResponseIndex(ba).signature(['a', 'b'], 'x'));
  });

  it('lists linkIds the questionnaire does not know', () => {
    const index = new ResponseIndex(response(1, [{ linkId: 'stranger' }]));
    expect(index.unknownLinkIds(new Set(['grp', 'a', 'calc', 'nested']))).toEqual(['stranger']);
  });
});
