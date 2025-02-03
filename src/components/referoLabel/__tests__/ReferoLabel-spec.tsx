import { renderRefero, screen, waitFor } from '@test/test-utils.tsx';
import { Questionnaire } from 'fhir/r4';

import { q } from './__data__';
import { getResources } from '../../../../preview/resources/referoResources.ts';

import { ReferoProps } from '@/types/referoProps.ts';

const resources = { ...getResources(''), formRequiredErrorMessage: 'Du må fylle ut dette feltet', formOptional: '(Valgfritt)' };

describe('ReferoLabel', () => {
  it('should show label', async () => {
    await createWrapper(q);
    expect(screen.getByLabelText(/String - Label - Markdown/i)).toBeInTheDocument();
  });

  it.skip('should show sublabel if sublable is added', async () => {
    await createWrapper(q);
    expect(screen.getByLabelText(/String - sublabel - Markdown/i)).toBeInTheDocument();
  });

  it('should show optional text if item.reqired is false', async () => {
    await createWrapper(q);
    expect(screen.queryAllByText(resources.formOptional)).toHaveLength(3);
  });
  it('should remove script tag from sublabel and label', async () => {
    await createWrapper(q);

    expect(screen.queryByLabelText(/String - sublabel - Nomarkdown/i)).not.toBeInTheDocument();
  });
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function createWrapper(questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) {
  return await waitFor(async () => await renderRefero({ questionnaire, props, resources }));
}
