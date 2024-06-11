import '../../util/defineFetch';
import { Questionnaire } from 'fhir/r4';

import questionnaireWithEnableWhen from './__data__/enableWhen';
import { renderRefero } from './test-utils/test-utils';
import { selectCheckboxOption } from './test-utils/selectors';

describe('enableWhen with checkboxes and multiple answers', () => {
  beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation(_ => {
      return {};
    });
  });

  it('enableWhen should trigger when correct answer is selected', async () => {
    const { queryByLabelText } = createWrapper(questionnaireWithEnableWhen);
    expect(queryByLabelText('Flere sykdommer')).not.toBeInTheDocument();
    await selectCheckboxOption('Andre sykdommer');

    expect(queryByLabelText('Flere sykdommer')).toBeInTheDocument();
  });

  it('enableWhen should trigger when correct answer is selected along with other answers', async () => {
    const { queryByLabelText } = createWrapper(questionnaireWithEnableWhen);
    expect(queryByLabelText('Flere sykdommer')).not.toBeInTheDocument();
    await selectCheckboxOption('Allergi');
    await selectCheckboxOption('Hepatitt C');
    await selectCheckboxOption('Andre sykdommer');

    expect(queryByLabelText('Flere sykdommer')).toBeInTheDocument();
  });
});

function createWrapper(questionnaire: Questionnaire) {
  return renderRefero({ questionnaire, props: { authorized: true } });
}
