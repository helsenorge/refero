import type { Extension, QuestionnaireItem } from 'fhir/r4';

import {
  ALL_MEDISIN,
  ROW_DOSE,
  ROW_NAVN,
  answersOf,
  calculateWithMedisin,
  medisinItem,
  questionnaireOf,
  repetitionContext,
  sdcCalc,
  stringsOf,
} from './fixtures';

const repeatingReadOnlyString = (linkId: string, extension: Extension[], item?: QuestionnaireItem[]): QuestionnaireItem => ({
  linkId,
  type: 'string',
  text: linkId,
  repeats: true,
  readOnly: true,
  extension,
  ...(item ? { item } : {}),
});

describe('PDR-REFERO-001 K8: a repeating question gets one answer per element, with its own details', () => {
  const q = (): ReturnType<typeof questionnaireOf> =>
    questionnaireOf(
      medisinItem(),
      repeatingReadOnlyString(
        'alle-medisiner',
        [repetitionContext(ALL_MEDISIN), sdcCalc(ROW_NAVN)],
        [{ linkId: 'alle-medisiner.dose', type: 'string', text: 'Dose', extension: [sdcCalc(ROW_DOSE)] }]
      )
    );

  it('K8 (PDR-REFERO-001): alle-medisiner has the two answers Paracet and Ibux', async () => {
    const response = await calculateWithMedisin(q());

    expect(stringsOf(response.item, 'alle-medisiner')).toEqual(['Paracet', 'Ibux']);
  });

  it('K8 (PDR-REFERO-001): each answer carries its own nested alle-medisiner.dose, 1 g under Paracet and 400 mg under Ibux, not both', async () => {
    const response = await calculateWithMedisin(q());
    const answers = answersOf(response.item, 'alle-medisiner').map(a => ({
      value: a.valueString,
      dose: stringsOf(a.item, 'alle-medisiner.dose'),
    }));

    expect(answers).toEqual([
      { value: 'Paracet', dose: ['1 g'] },
      { value: 'Ibux', dose: ['400 mg'] },
    ]);
  });
});

describe('PDR-REFERO-001 K9: a repeating question without its own calc uses the elements', () => {
  it('K9 (PDR-REFERO-001): equivalence class, selected questions with answers give navn-kopi the answers Paracet and Ibux', async () => {
    const q = questionnaireOf(
      medisinItem(),
      repeatingReadOnlyString('navn-kopi', [repetitionContext("%resource.repeat(item).where(linkId='medisin.navn')")])
    );
    const response = await calculateWithMedisin(q);

    expect(stringsOf(response.item, 'navn-kopi')).toEqual(['Paracet', 'Ibux']);
  });

  it('K9 (PDR-REFERO-001): equivalence class, selected groups have no answer, so navn-kopi gets no answers', async () => {
    const q = questionnaireOf(medisinItem(), repeatingReadOnlyString('navn-kopi', [repetitionContext(ALL_MEDISIN)]));
    const response = await calculateWithMedisin(q);

    expect(answersOf(response.item, 'navn-kopi')).toEqual([]);
  });
});
