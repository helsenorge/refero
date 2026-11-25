import type { QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';

import {
  ALL_MEDISIN,
  MEDICINE_DATA,
  ROW_DOSE,
  ROW_NAVN,
  calculate,
  calculateWithMedisin,
  childStrings,
  cqfExpression,
  kopiGroup,
  medisinItem,
  newResponse,
  occurrencesOf,
  questionnaireOf,
  repetitionContext,
  sdcCalc,
  sdfCalc,
  stringItem,
  withMedisin,
  withOccurrences,
  type MedisinRow,
} from './fixtures';

const kopiOf = (response: QuestionnaireResponse): QuestionnaireResponseItem[] => occurrencesOf(response.item, 'kopi');

const k1Questionnaire = (): ReturnType<typeof questionnaireOf> =>
  questionnaireOf(medisinItem(), kopiGroup({ extension: [repetitionContext(ALL_MEDISIN)] }));

const k1WithNavn = (): ReturnType<typeof questionnaireOf> =>
  questionnaireOf(
    medisinItem(),
    kopiGroup({ extension: [repetitionContext(ALL_MEDISIN)], children: [stringItem('kopi.navn', 'Navn (kopi)', [sdcCalc(ROW_NAVN)])] })
  );

const PINEX: MedisinRow = { navn: 'Pinex', dose: '500 mg' };

const existingKopi = (count: number): QuestionnaireResponseItem[] =>
  Array.from({ length: count }, () => ({ linkId: 'kopi', item: [{ linkId: 'kopi.tekst' }] }));

describe('PDR-REFERO-001 K1: a group gets one repetition per selected item', () => {
  it('K1 (PDR-REFERO-001): equivalence class, two medisin occurrences give two kopi occurrences', async () => {
    const response = await calculateWithMedisin(k1Questionnaire());

    expect(kopiOf(response)).toHaveLength(2);
  });

  it('K1 (PDR-REFERO-001): the kopi occurrences come in the order of the medisin occurrences', async () => {
    const response = await calculateWithMedisin(k1WithNavn());

    expect(childStrings(kopiOf(response), 'kopi.navn')).toEqual([['Paracet'], ['Ibux']]);
  });

  it('K1 (PDR-REFERO-001): error guessing, medisin in reversed order gives kopi in reversed order, not sorted', async () => {
    const response = await calculateWithMedisin(k1WithNavn(), [MEDICINE_DATA[1], MEDICINE_DATA[0]]);

    expect(childStrings(kopiOf(response), 'kopi.navn')).toEqual([['Ibux'], ['Paracet']]);
  });

  it('K1 (PDR-REFERO-001): boundary value, one medisin occurrence gives exactly one kopi occurrence', async () => {
    const response = await calculateWithMedisin(k1Questionnaire(), [MEDICINE_DATA[0]]);

    expect(kopiOf(response)).toHaveLength(1);
  });

  it('K1 (PDR-REFERO-001): boundary value, three medisin occurrences give three kopi occurrences, not a fixed count', async () => {
    const response = await calculateWithMedisin(k1Questionnaire(), [...MEDICINE_DATA, PINEX]);

    expect(kopiOf(response)).toHaveLength(3);
  });
});

describe('PDR-REFERO-001 K2: the repetitions follow the source', () => {
  it('K2 (PDR-REFERO-001): state transition, adding a third medisin gives three kopi, then removing the first gives two', async () => {
    const q = k1Questionnaire();
    const first = await calculateWithMedisin(q);
    const added = await calculate(q, withMedisin(first, [...MEDICINE_DATA, PINEX]));
    const removed = await calculate(q, withMedisin(added, [MEDICINE_DATA[1], PINEX]));

    expect(kopiOf(first)).toHaveLength(2);
    expect(kopiOf(added)).toHaveLength(3);
    expect(kopiOf(removed)).toHaveLength(2);
  });

  it('K2 (PDR-REFERO-001): state transition, after each change the kopi occurrences match the medisin occurrences row by row', async () => {
    const q = k1WithNavn();
    const first = await calculateWithMedisin(q);
    const added = await calculate(q, withMedisin(first, [...MEDICINE_DATA, PINEX]));
    const removed = await calculate(q, withMedisin(added, [MEDICINE_DATA[1], PINEX]));

    expect(childStrings(kopiOf(added), 'kopi.navn')).toEqual([['Paracet'], ['Ibux'], ['Pinex']]);
    expect(childStrings(kopiOf(removed), 'kopi.navn')).toEqual([['Ibux'], ['Pinex']]);
  });
});

describe('PDR-REFERO-001 K3: SDC calc in a repetition reads its own row', () => {
  it('K3 (PDR-REFERO-001): the second medisin has no navn, so the second kopi has no kopi.navn and the first has Paracet', async () => {
    const response = await calculateWithMedisin(k1WithNavn(), [MEDICINE_DATA[0], { dose: '400 mg' }]);

    expect(childStrings(kopiOf(response), 'kopi.navn')).toEqual([['Paracet'], []]);
  });

  it('K3 (PDR-REFERO-001): error guessing, the first medisin has no navn, so Ibux stays in the second kopi and does not move up', async () => {
    const response = await calculateWithMedisin(k1WithNavn(), [{ dose: '1 g' }, MEDICINE_DATA[1]]);

    expect(childStrings(kopiOf(response), 'kopi.navn')).toEqual([[], ['Ibux']]);
  });
});

describe('PDR-REFERO-001 K4: sdf calc in a repetition reads its own row', () => {
  it('K4 (PDR-REFERO-001): each kopi gets the dose of its own medisin, 1 g and 400 mg, not the list of both', async () => {
    const q = questionnaireOf(
      medisinItem(),
      kopiGroup({ extension: [repetitionContext(ALL_MEDISIN)], children: [stringItem('kopi.dose', 'Dose (kopi)', [sdfCalc(ROW_DOSE)])] })
    );
    const response = await calculateWithMedisin(q);

    expect(childStrings(kopiOf(response), 'kopi.dose')).toEqual([['1 g'], ['400 mg']]);
  });
});

describe('PDR-REFERO-001 K5: other expressions under the item see the row', () => {
  it('K5 (PDR-REFERO-001): a cqf-expression with valueExpression on kopi.kopiert gives Paracet and Ibux, one per kopi', async () => {
    const q = questionnaireOf(
      medisinItem(),
      kopiGroup({
        extension: [repetitionContext(ALL_MEDISIN)],
        children: [stringItem('kopi.kopiert', 'Kopiert', [cqfExpression(ROW_NAVN)])],
      })
    );
    const response = await calculateWithMedisin(q);

    expect(childStrings(kopiOf(response), 'kopi.kopiert')).toEqual([['Paracet'], ['Ibux']]);
  });
});

describe('PDR-REFERO-001 K6: plain values give one repetition each', () => {
  const q = (): ReturnType<typeof questionnaireOf> =>
    questionnaireOf(
      medisinItem(),
      kopiGroup({
        linkId: 'navneliste',
        extension: [repetitionContext("%resource.repeat(item).where(linkId='medisin.navn').answer.value")],
        children: [stringItem('navneliste.navn', 'Navn', [sdcCalc('%row')])],
      })
    );

  it('K6 (PDR-REFERO-001): two names give two navneliste occurrences with navneliste.navn Paracet and Ibux', async () => {
    const response = await calculateWithMedisin(q());
    const navneliste = occurrencesOf(response.item, 'navneliste');

    expect(navneliste).toHaveLength(2);
    expect(childStrings(navneliste, 'navneliste.navn')).toEqual([['Paracet'], ['Ibux']]);
  });

  it('K6 (PDR-REFERO-001): equivalence class, a medisin without navn gives no value and so no navneliste occurrence of its own', async () => {
    const response = await calculateWithMedisin(q(), [MEDICINE_DATA[0], { dose: '400 mg' }]);
    const navneliste = occurrencesOf(response.item, 'navneliste');

    expect(childStrings(navneliste, 'navneliste.navn')).toEqual([['Paracet']]);
  });
});

describe('PDR-REFERO-001 K7: an empty result gives no repetitions', () => {
  it('K7 (PDR-REFERO-001): boundary value, an expression that selects nothing leaves no kopi occurrence in the response', async () => {
    const q = questionnaireOf(
      medisinItem(),
      kopiGroup({ extension: [repetitionContext("%resource.repeat(item).where(linkId='finnes-ikke')")] })
    );
    const response = await calculateWithMedisin(q);

    expect(kopiOf(response)).toHaveLength(0);
  });
});

describe('PDR-REFERO-001 K10: without readOnly the extension is ignored', () => {
  const q = (): ReturnType<typeof questionnaireOf> =>
    questionnaireOf(medisinItem(), kopiGroup({ readOnly: false, extension: [repetitionContext(ALL_MEDISIN)] }));

  it('K10 (PDR-REFERO-001): decision table, readOnly missing in a new response keeps the one kopi occurrence, not one per medisin', async () => {
    const response = await calculateWithMedisin(q());

    expect(kopiOf(response)).toHaveLength(1);
  });

  it('K10 (PDR-REFERO-001): decision table, readOnly missing in a response with three kopi keeps the three, not one per medisin', async () => {
    const questionnaire = q();
    const before = withOccurrences(withMedisin(newResponse(questionnaire), MEDICINE_DATA), 'kopi', existingKopi(3));
    const response = await calculate(questionnaire, before);

    expect(kopiOf(response)).toHaveLength(3);
  });
});

describe('PDR-REFERO-001 K14: cqf-expression on a group creates no repetitions', () => {
  const q = (): ReturnType<typeof questionnaireOf> =>
    questionnaireOf(medisinItem(), kopiGroup({ extension: [cqfExpression(ALL_MEDISIN)] }));

  it('K14 (PDR-REFERO-001): decision table, cqf-expression instead of the extension in a new response keeps the one kopi occurrence', async () => {
    const response = await calculateWithMedisin(q());

    expect(kopiOf(response)).toHaveLength(1);
  });

  it('K14 (PDR-REFERO-001): decision table, cqf-expression instead of the extension in a response with three kopi keeps the three', async () => {
    const questionnaire = q();
    const before = withOccurrences(withMedisin(newResponse(questionnaire), MEDICINE_DATA), 'kopi', existingKopi(3));
    const response = await calculate(questionnaire, before);

    expect(kopiOf(response)).toHaveLength(3);
  });
});
