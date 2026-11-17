import { renderRefero, screen, waitFor } from '@test/test-utils.tsx';

import type { ReferoProps } from '../../../../types/referoProps';
import type { Questionnaire, QuestionnaireItem } from 'fhir/r4';

import { getResources } from '../../../../../preview/resources/referoResources';

// A boolean in a gtable: the column header is its title, so the checkbox shows no label text, but keeps its name for
// screen readers with the row number. The text is hidden with CSS on the <label>, by its position in the design
// system's markup; the last test pins that markup.

const resources = getResources('');
const gtable = {
  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
  valueCodeableConcept: { coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'gtable' }] },
};
const bekreftet: QuestionnaireItem = { linkId: 'tabell.bekreftet', text: 'Bekreftet', type: 'boolean' };
const questionnaire = (group: Partial<QuestionnaireItem>): Questionnaire => ({
  resourceType: 'Questionnaire',
  status: 'draft',
  item: [{ linkId: 'tabell', text: 'Tabell', type: 'group', repeats: true, extension: [gtable], item: [bekreftet], ...group }],
});
const render = async (q: Questionnaire, props: Partial<ReferoProps> = {}): Promise<void> => {
  await waitFor(async () => await renderRefero({ questionnaire: q, props: { ...props, resources } }));
};

describe('Boolean in a gtable', () => {
  it('has the question text and row number as its name in a table the person fills in', async () => {
    await render(questionnaire({}));
    expect(screen.getByRole('checkbox', { name: 'Bekreftet, rad 1' })).toBeEnabled();
  });

  it('has the same name in a read-only table', async () => {
    await render(questionnaire({ readOnly: true }));
    expect(screen.getByRole('checkbox', { name: 'Bekreftet, rad 1' })).toBeDisabled();
  });

  it('keeps its usual name outside a table', async () => {
    await render({ resourceType: 'Questionnaire', status: 'draft', item: [bekreftet] });
    expect(screen.getByRole('checkbox', { name: 'Bekreftet' })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: /rad 1/ })).not.toBeInTheDocument();
  });

  it('has the label text as the last element of the label content wrapper, which the CSS hides by position', async () => {
    await render(questionnaire({}));
    const label = screen.getByRole('checkbox', { name: 'Bekreftet, rad 1' }).closest('label');
    // <label><span><span>(the box, with the input)</span><span>(the text)</span></span></label>
    const contentWrapper = label?.firstElementChild;
    expect(contentWrapper?.tagName).toBe('SPAN');
    expect(contentWrapper?.lastElementChild?.tagName).toBe('SPAN');
    expect(contentWrapper?.lastElementChild?.textContent).toBe('Bekreftet, rad 1');
    expect(contentWrapper?.lastElementChild?.querySelector('input')).toBeNull();
  });
});
