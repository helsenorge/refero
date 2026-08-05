import { compile, evaluate } from 'fhirpath';
import fhirpathR4Model from 'fhirpath/fhir-context/r4';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  descendantsHasAnswer,
  evaluateFhirpathExpression,
  evaluateFhirpathExpressionToGetString,
  getAnswerFromResponseItem,
  getResponseItem,
  hasDescendants,
} from '../fhirpathHelper';

vi.mock('fhirpath', async importOriginal => {
  const actual = await importOriginal<{ compile: typeof compile; evaluate: typeof evaluate }>();

  return {
    ...actual,
    compile: vi.fn(actual.compile),
    evaluate: vi.fn(actual.evaluate),
  };
});

describe('fhirpathHelper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses precise decimal arithmetic for scoring expressions', () => {
    const result = evaluateFhirpathExpressionToGetString(
      { url: 'calculated-expression', valueString: '0.1 + 0.2' },
      { resourceType: 'QuestionnaireResponse', status: 'in-progress' }
    );

    expect(result).toEqual([0.3]);
  });

  it('reuses a compiled expression', async () => {
    const expression = '1 + 42';

    await evaluateFhirpathExpression(expression, {});
    await evaluateFhirpathExpression(expression, {});

    expect(compile).toHaveBeenCalledTimes(1);
  });

  it('evicts the least recently used expression when the cache reaches 100 entries', async () => {
    const firstExpression = '1000 + 0';

    await evaluateFhirpathExpression(firstExpression, {});
    await evaluateFhirpathExpression(firstExpression, {});
    for (let index = 1; index <= 100; index += 1) {
      await evaluateFhirpathExpression(`1000 + ${index}`, {});
    }
    await evaluateFhirpathExpression(firstExpression, {});

    expect(compile).toHaveBeenCalledTimes(102);
  });

  it('uses the R4 model for direct evaluations', async () => {
    await getAnswerFromResponseItem({ linkId: 'answer', answer: [{ valueString: 'value' }] });
    descendantsHasAnswer([{ linkId: 'group', answer: [{ valueString: 'value' }] }]);
    hasDescendants([{ linkId: 'group', item: [{ linkId: 'child' }] }]);

    expect(evaluate).toHaveBeenCalledTimes(3);
    for (const call of vi.mocked(evaluate).mock.calls) {
      expect(call[3] === fhirpathR4Model).toBe(true);
    }
  });

  it('passes linkId as an environment variable when finding response items', async () => {
    const responseItem = { linkId: "patient's-answer", answer: [{ valueString: 'yes' }] };
    const response = {
      resourceType: 'QuestionnaireResponse' as const,
      status: 'in-progress' as const,
      item: [{ linkId: 'group', item: [responseItem] }],
    };

    await expect(getResponseItem(responseItem.linkId, response)).resolves.toEqual([responseItem]);
  });
});
