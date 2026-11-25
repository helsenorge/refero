import type { Extension, Questionnaire, QuestionnaireResponse } from 'fhir/r4';

import {
  answersOf,
  calculate,
  cqfExpressionString,
  newResponse,
  occurrencesOf,
  questionnaireOf,
  sdcCalc,
  sdfCalc,
  stringsOf,
  withOccurrences,
} from './fixtures';

const SUM_EXPRESSION = "%resource.repeat(item).where(linkId='a').answer.value + %resource.repeat(item).where(linkId='b').answer.value";

const sumQuestionnaire = (sumExtensions: Extension[]): Questionnaire =>
  questionnaireOf(
    { linkId: 'a', type: 'decimal', text: 'a' },
    { linkId: 'b', type: 'decimal', text: 'b' },
    { linkId: 'sum', type: 'decimal', text: 'sum', extension: sumExtensions }
  );

const withDecimal = (response: QuestionnaireResponse, linkId: string, value: number): QuestionnaireResponse =>
  withOccurrences(response, linkId, [{ linkId, answer: [{ valueDecimal: value }] }]);

const sumOf = (response: QuestionnaireResponse): (number | undefined)[] => answersOf(response.item, 'sum').map(a => a.valueDecimal);

async function sumBeforeAndAfterChangingB(q: Questionnaire): Promise<[(number | undefined)[], (number | undefined)[]]> {
  const before = await calculate(q, withDecimal(withDecimal(newResponse(q), 'a', 2), 'b', 3));
  const after = await calculate(q, withDecimal(before, 'b', 5));
  return [sumOf(before), sumOf(after)];
}

describe('PDR-REFERO-001 K12: SDC calc works outside repetitions', () => {
  it('K12 (PDR-REFERO-001): state transition, sum is 5 with a=2 and b=3, and 7 after b is changed to 5', async () => {
    const [before, after] = await sumBeforeAndAfterChangingB(sumQuestionnaire([sdcCalc(SUM_EXPRESSION)]));

    expect(before).toEqual([5]);
    expect(after).toEqual([7]);
  });

  it('K12 (PDR-REFERO-001): decision table, sdf calc listed before SDC calc, the SDC calc decides the value', async () => {
    const [before, after] = await sumBeforeAndAfterChangingB(sumQuestionnaire([sdfCalc('100'), sdcCalc(SUM_EXPRESSION)]));

    expect(before).toEqual([5]);
    expect(after).toEqual([7]);
  });

  it('K12 (PDR-REFERO-001): decision table, SDC calc listed before sdf calc, the SDC calc decides the value', async () => {
    const [before, after] = await sumBeforeAndAfterChangingB(sumQuestionnaire([sdcCalc(SUM_EXPRESSION), sdfCalc('100')]));

    expect(before).toEqual([5]);
    expect(after).toEqual([7]);
  });
});

describe('PDR-REFERO-001 K15: value copy on a question is unchanged', () => {
  const q = (): Questionnaire =>
    questionnaireOf(
      { linkId: 'kilde', type: 'string', text: 'Kilde' },
      {
        linkId: 'kopi-av-navn',
        type: 'string',
        text: 'Kopi av navn',
        extension: [cqfExpressionString("QuestionnaireResponse.descendants().where(linkId='kilde').answer.value")],
      }
    );

  it('K15 (PDR-REFERO-001): kilde answered Hei gives kopi-av-navn the answer Hei, once, in a single occurrence', async () => {
    const questionnaire = q();
    const response = await calculate(
      questionnaire,
      withOccurrences(newResponse(questionnaire), 'kilde', [{ linkId: 'kilde', answer: [{ valueString: 'Hei' }] }])
    );

    expect(occurrencesOf(response.item, 'kopi-av-navn')).toHaveLength(1);
    expect(stringsOf(response.item, 'kopi-av-navn')).toEqual(['Hei']);
  });
});
