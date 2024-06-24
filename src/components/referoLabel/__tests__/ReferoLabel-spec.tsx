import { Questionnaire } from 'fhir/r4';
import { ReferoProps } from 'lib/types';
import { getResources } from '../../../../preview/resources/referoResources.ts';
import { renderRefero } from '@test/test-utils.tsx';

const resources = { ...getResources(''), formRequiredErrorMessage: 'Du må fylle ut dette feltet' };

describe('ReferoLabel', () => {
  it('Should show handle markdown in label', () => {});
  it('should show sublabel if sublable is added', () => {});
});

function createWrapper(questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) {
  return renderRefero({ questionnaire, props, resources });
}
