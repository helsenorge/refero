import '../../util/defineFetch';
import { Questionnaire } from 'fhir/r4';
import GroupGridModel from './__data__/group-grid';
import { renderRefero, screen } from './test-utils/test-utils';

describe('group-grid-spec', () => {
  it('renders table with reordered items', () => {
    const { container, getAllByRole, queryAllByText } = createWrapper(GroupGridModel);
    expect(getAllByRole('table')).toHaveLength(1);

    ['X', 'SpmA', 'SpmB', 'SpmC', 'SpmD'].forEach(element => {
      const els = queryAllByText(element);
      expect(els.length).toBeGreaterThan(0);
    });

    const rows = container.querySelectorAll('tr.page_refero__grid--row');
    expect(rows).toHaveLength(4);

    let expectedItemsPerRow = [['1.1.1', '1.1.2', '1.1.3'], ['1.2.2', '1.2.3', '1.2.1'], ['1.3.1'], ['1.4.1']];
    for (let i = 0; i < rows.length; i++) {
      validateRow(rows[i], 5, expectedItemsPerRow[i]);
    }
  });
});

function validateRow(wrapper: Element, expectedNumCells: number, expectedItemLinkIds: string[]) {
  const numCells = wrapper.querySelectorAll('td');
  expect(numCells).toHaveLength(expectedNumCells);

  expectedItemLinkIds.forEach(expectedItemLinkId => {
    const id = `item_${expectedItemLinkId}-label-decimal`;
    const cell = screen.queryByTestId(id);
    expect(cell).toBeInTheDocument();
  });

  // expect(cells.map(it => it.prop('item')!.linkId)).toEqual(expectedItemLinkIds);
}

function createWrapper(questionnaire: Questionnaire) {
  return renderRefero({ questionnaire });
}
