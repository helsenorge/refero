import { Questionnaire } from 'fhir/r4';
import { getResources } from '../../../../preview/resources/referoResources.ts';
import { renderRefero } from '@test/test-utils.tsx';
import { q } from './__data__';
import { ReferoProps } from '@/types/referoProps.ts';

const resources = { ...getResources(''), formRequiredErrorMessage: 'Du må fylle ut dette feltet', formOptional: '(Valgfritt)' };

describe('ReferoLabel', () => {
  it('should show label', () => {
    const { getByLabelText } = createWrapper(q);
    expect(getByLabelText(/String - Label - Markdown/i)).toBeInTheDocument();
  });

  it.skip('should show sublabel if sublable is added', () => {
    const { getByLabelText } = createWrapper(q);
    expect(getByLabelText(/String - sublabel - Markdown/i)).toBeInTheDocument();
  });

  it('should show optional text if item.reqired is false', () => {
    const { queryAllByLabelText } = createWrapper(q);
    const label = new RegExp(resources.formOptional, 'i');
    expect(queryAllByLabelText(label)).toHaveLength(3);
  });
  it('should remove script tag from sublabel and label', () => {
    const { queryByLabelText } = createWrapper(q);

    expect(queryByLabelText(/String - sublabel - Nomarkdown/i)).not.toBeInTheDocument();
  });
});

function createWrapper(questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) {
  return renderRefero({ questionnaire, props, resources });
}
