import { renderRefero, userEvent } from '@test/test-utils';
import { screen, waitFor } from '@testing-library/react';
import { Questionnaire } from 'fhir/r4';

import { q } from './__data__/';

import { ReferoProps } from '@/types/referoProps';

describe('GTable', () => {
  it('should render', async () => {
    await waitFor(async () => {
      createWrapper(q);
    });
    expect(screen.queryByTestId('gtable')).not.toBeInTheDocument();
    await userEvent.type(screen.getByTestId('item_103ab616-f027-482d-c725-7a8486034d8c-string-label'), 'test');
    expect(screen.getByTestId('gtable')).toBeInTheDocument();
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
