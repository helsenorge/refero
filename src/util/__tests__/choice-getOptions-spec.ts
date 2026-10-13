import type { QuestionnaireItem } from 'fhir/r4';

import { OPEN_CHOICE_ID } from '@/constants/index';
import { getOptions } from '@/util/choice';

const resources = { openChoiceOption: 'Annet' } as Parameters<typeof getOptions>[0];

const createItem = (type: 'choice' | 'open-choice'): QuestionnaireItem => ({
  linkId: '1',
  type,
  answerOption: [
    { valueCoding: { code: 'ja', display: 'Ja', system: 'urn:test' } },
    { valueCoding: { code: 'nei', display: 'Nei', system: 'urn:test' } },
  ],
});

describe('getOptions ids', () => {
  it.each(['choice', 'open-choice'] as const)('gives every %s option a unique id', type => {
    const ids = getOptions(resources, createItem(type))?.map(o => o.id);

    expect(ids?.every(id => typeof id === 'string' && id.length > 0)).toBe(true);
    expect(new Set(ids).size).toBe(ids?.length);
  });

  it.each(['choice', 'open-choice'] as const)('keeps %s option ids stable across calls', type => {
    const item = createItem(type);

    expect(getOptions(resources, item)?.map(o => o.id)).toEqual(getOptions(resources, item)?.map(o => o.id));
  });

  it('appends the open-choice option last', () => {
    const options = getOptions(resources, createItem('open-choice'));

    expect(options?.map(o => o.type)).toEqual(['ja', 'nei', OPEN_CHOICE_ID]);
    expect(options?.at(-1)?.label).toBe('Annet');
  });
});
