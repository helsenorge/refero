import '../../util/__tests__/defineFetch';
import type { Questionnaire, QuestionnaireItem } from 'fhir/r4';

import questionnaireWithMarkdown from './__data__/markdown';
import { renderRefero, waitFor } from '../../../test/test-utils';
import ItemType from '../../constants/itemType';

describe('support for external markdown', () => {
  it('enableWhen should trigger when correct answer is selected', async () => {
    const visited: { [key: string]: string } = {};
    const cb = (q: QuestionnaireItem): string => {
      visited[q.linkId] = q.type;
      return '';
    };
    await createWrapper(questionnaireWithMarkdown, cb);

    expect(visited['0']).toBe(ItemType.GROUP);
    expect(visited['1']).toBe(ItemType.DECIMAL);
    expect(visited['2']).toBe(ItemType.INTEGER);
    expect(visited['3']).toBe(ItemType.QUANTITY);
    expect(visited['4']).toBe(ItemType.BOOLEAN);
    expect(visited['5a']).toBe(ItemType.CHOICE);
    expect(visited['5b']).toBe(ItemType.CHOICE);
    expect(visited['5c']).toBe(ItemType.CHOICE);
    expect(visited['6a']).toBe(ItemType.OPENCHOICE);
    expect(visited['6b']).toBe(ItemType.OPENCHOICE);
    expect(visited['6c']).toBe(ItemType.OPENCHOICE);
    expect(visited['7a']).toBe(ItemType.DATE);
    expect(visited['7b']).toBe(ItemType.TIME);
    expect(visited['7c']).toBe(ItemType.DATETIME);
    expect(visited['8']).toBe(ItemType.STRING);
    expect(visited['9']).toBe(ItemType.TEXT);
    expect(visited['10']).toBe(ItemType.ATTATCHMENT);
    expect(visited['11']).toBe(ItemType.DISPLAY);
  });
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function createWrapper(questionnaire: Questionnaire, markdownCb: (q: QuestionnaireItem, markdown: string) => string) {
  return await waitFor(async () => {
    return await renderRefero({ questionnaire, props: { onRenderMarkdown: markdownCb } });
  });
}
