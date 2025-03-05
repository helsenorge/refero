import { renderRefero, userEvent } from '@test/test-utils';
import { screen, waitFor } from '@testing-library/react';
import { Questionnaire } from 'fhir/r4';

import { q } from './__data__/';

import { ReferoProps } from '@/types/referoProps';

describe.skip('StandardTable', () => {
  it('should render', async () => {
    await waitFor(async () => {
      createWrapper(q);
    });
    expect(screen.queryByTestId('standardTable')).not.toBeInTheDocument();
    await userEvent.click(screen.getByTestId(/item_4208c597-87cd-4f36-825b-1a3050981c7b/));
    expect(screen.getByTestId('standardTable')).toBeInTheDocument();
  });
});
//eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function createWrapper(questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) {
  return await waitFor(async () => {
    return renderRefero({
      questionnaire,
      props,
    });
  });
}
