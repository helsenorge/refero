import '../../util/__tests__/defineFetch';
import type { Questionnaire } from 'fhir/r4';

import GroupGridModel from './__data__/group-grid';
import { act, renderRefero, screen } from '../../../test/test-utils';
import { encodeString } from '../createQuestionnaire/utils';

describe('group-grid-spec', () => {
  it('renders table with reordered items', async () => {
    const { container } = await createWrapper(GroupGridModel);
    expect(screen.getAllByRole('table')).toHaveLength(1);

    ['X', 'SpmA', 'SpmB', 'SpmC', 'SpmD'].forEach(element => {
      const els = screen.queryAllByText(element);
      expect(els.length).toBeGreaterThan(0);
    });

    const rows = container.querySelectorAll('tr.page_refero__grid--row');
    expect(rows).toHaveLength(4);
    const expectedItemsPerRow = [['1.1.1', '1.1.2', '1.1.3'], ['1.2.2', '1.2.3', '1.2.1'], ['1.3.1'], ['1.4.1']];
    for (let i = 0; i < rows.length; i++) {
      validateRow(rows[i], 5, expectedItemsPerRow[i]);
    }
  });
});

function validateRow(wrapper: Element, expectedNumCells: number, expectedItemLinkIds: string[]): void {
  const numCells = wrapper.querySelectorAll('td');
  expect(numCells).toHaveLength(expectedNumCells);

  expectedItemLinkIds.forEach(expectedItemLinkId => {
    const id = `item_${encodeString(expectedItemLinkId)}-decimal-label`;
    const cell = screen.queryByTestId(id);
    expect(cell).toBeInTheDocument();
  });

  // expect(cells.map(it => it.prop('item')!.linkId)).toEqual(expectedItemLinkIds);
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function createWrapper(questionnaire: Questionnaire) {
  return await act(async () => await renderRefero({ questionnaire }));
}
