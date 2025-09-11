import { submitForm } from '@test/selectors';
import { renderRefero, screen, waitFor } from '@test/test-utils.tsx';
import { Questionnaire } from 'fhir/r4';

import { q } from './__data__/';
import { getResources } from '../../../../preview/resources/referoResources';

import { ReferoProps } from '@/types/referoProps';
const resources = { ...getResources(''), formRequiredErrorMessage: 'Du må fylle ut dette feltet' };

describe('Validation-summary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('should show validation summary when submitting form with invalid data', async () => {
    await createWrapper(q);
    await submitForm();
    expect(screen.getByTestId(/validation-summary/i)).toBeInTheDocument();
  });
});
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function createWrapper(questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) {
  return await waitFor(async () => await renderRefero({ questionnaire, props, resources }));
}
