import { renderRefero, screen, waitFor } from '@test/test-utils.tsx';

import type { Questionnaire, QuestionnaireItem } from 'fhir/r4';

import { getResources } from '../../../../../preview/resources/referoResources';
import { Extensions } from '../../../../constants/extensions';

// A date limit (sdf-minvalue / sdf-maxvalue) is a FHIRPath expression. When it gives no result, the field has no limit;
// the form must not crash.

const resources = getResources('');
const dateItem = (limitUrl: string, expression: string): QuestionnaireItem => ({
  linkId: 'til-dato',
  text: 'Til dato',
  type: 'date',
  extension: [{ url: limitUrl, valueString: expression }],
});
const questionnaire = (item: QuestionnaireItem): Questionnaire => ({
  resourceType: 'Questionnaire',
  status: 'draft',
  item: [{ linkId: 'fra-dato', text: 'Fra dato', type: 'date' }, item],
});

const renderForm = async (item: QuestionnaireItem): Promise<void> => {
  await waitFor(async () => await renderRefero({ questionnaire: questionnaire(item), props: { resources } }));
};

describe('Date limit with an empty FHIRPath result', () => {
  it.each([
    ['sdf-minvalue', Extensions.DATE_MIN_VALUE_URL, '{}'],
    ['sdf-maxvalue', Extensions.DATE_MAX_VALUE_URL, '{}'],
    ['sdf-minvalue', Extensions.DATE_MIN_VALUE_URL, "QuestionnaireResponse.descendants().where(linkId='fra-dato').answer.valueDate"],
    ['sdf-minvalue', Extensions.DATE_MIN_VALUE_URL, "'ikke en dato'"],
  ])('%s = %s renders the date field without a limit', async (_name, url, expression) => {
    await renderForm(dateItem(url, expression));
    expect(await screen.findByText('Til dato')).toBeInTheDocument();
    // Let the limit's effect resolve and the date picker re-render with it.
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(screen.getByText('Til dato')).toBeInTheDocument();
  });

  it('still uses a limit that gives a date', async () => {
    await renderForm(dateItem(Extensions.DATE_MIN_VALUE_URL, 'today()'));
    expect(await screen.findByText('Til dato')).toBeInTheDocument();
  });
});
