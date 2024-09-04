import '../../util/__tests__/defineFetch';
import { Questionnaire } from 'fhir/r4';

import questionnaireWithEnableWhen from './__data__/enableWhen';
import { renderRefero } from '../../../test/test-utils';
import { selectCheckboxOption } from '../../../test/selectors';

describe('enableWhen with checkboxes and multiple answers', () => {
  it('enableWhen should trigger when correct answer is selected', async () => {
    const { queryByLabelText } = createWrapper(questionnaireWithEnableWhen);
    expect(queryByLabelText(/Flere sykdommer/i)).not.toBeInTheDocument();
    await selectCheckboxOption(/Andre sykdommer/i);

    expect(queryByLabelText(/Flere sykdommer/i)).toBeInTheDocument();
  });

  it('enableWhen should trigger when correct answer is selected along with other answers', async () => {
    const { queryByLabelText } = createWrapper(questionnaireWithEnableWhen);
    expect(queryByLabelText(/Flere sykdommer/i)).not.toBeInTheDocument();
    await selectCheckboxOption(/Allergi/i);
    await selectCheckboxOption(/Hepatitt C/i);
    await selectCheckboxOption(/Andre sykdommer/i);

    expect(queryByLabelText(/Flere sykdommer/i)).toBeInTheDocument();
  });
});

function createWrapper(questionnaire: Questionnaire) {
  return renderRefero({ questionnaire, props: { authorized: true } });
}
