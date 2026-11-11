import '../../../../util/__tests__/defineFetch';
import { renderRefero, screen, userEvent, waitFor } from '@test/test-utils.tsx';

import type { Questionnaire } from 'fhir/r4';

import { getResources } from '../../../../../preview/resources/referoResources';

const resources = getResources('');

const questionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'repeating-group-initial-with-child',
  status: 'draft',
  item: [
    {
      linkId: 'kontakt',
      type: 'group',
      text: 'Kontakt',
      repeats: true,
      item: [
        {
          linkId: 'behandler',
          type: 'string',
          text: 'Behandler',
          initial: [{ valueString: 'Dr. Hansen' }],
          item: [{ linkId: 'rolle', type: 'string', text: 'Behandlerens rolle', initial: [{ valueString: 'Fastlege' }] }],
        },
      ],
    },
  ],
};

describe('repeating group with a prefilled question that has a child question', () => {
  it('shows one field for the child question per repetition, without duplicate ids', async () => {
    await waitFor(async () => await renderRefero({ questionnaire, props: { resources } }));
    expect(screen.getAllByLabelText(/Behandlerens rolle/i)).toHaveLength(1);

    await userEvent.click(screen.getAllByTestId('kontakt-repeat-button')[0]);

    await waitFor(() => expect(screen.getAllByLabelText(/^Behandler$/i)).toHaveLength(2));
    const roleFields = screen.getAllByLabelText(/Behandlerens rolle/i);
    expect(roleFields).toHaveLength(2);
    expect(roleFields.map(f => (f as HTMLInputElement).value)).toEqual(['Fastlege', 'Fastlege']);

    const ids = Array.from(document.querySelectorAll('[id]')).map(e => e.id);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    expect(duplicates).toEqual([]);
  });
});
