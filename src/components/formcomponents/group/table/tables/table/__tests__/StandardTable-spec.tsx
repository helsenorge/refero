import { renderRefero, userEvent } from '@test/test-utils';
import { screen, waitFor } from '@testing-library/react';

import type { ReferoProps } from '@/types/referoProps';
import type { Questionnaire } from 'fhir/r4';

import { q } from './__data__/';

describe('StandardTable', () => {
  it('should render', async () => {
    await waitFor(async () => {
      await createWrapper(q);
    });
    expect(screen.queryByTestId('standardTable')).not.toBeInTheDocument();
    await userEvent.click(screen.getByTestId(/item_3a818ca4-4cf5-45b4-8f07-5224d855239c-0-radio-choice-label/));
    expect(screen.getByTestId('standardTable')).toBeInTheDocument();
  });
});
//eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function createWrapper(questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) {
  return renderRefero({
    questionnaire,
    props,
  });
}
