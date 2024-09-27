import '../../util/__tests__/defineFetch';
import { Questionnaire } from 'fhir/r4';

import questionnaireWithEnableWhen from './__data__/enableWhen';
import { renderRefero } from '../../../test/test-utils';
import { selectCheckboxOption } from '../../../test/selectors';

describe('enableWhen with checkboxes and multiple answers', () => {
  it('enableWhen should trigger when correct answer is selected', async () => {
    const { getByLabelText, queryByLabelText } = createWrapper(questionnaireWithEnableWhen);
    expect(queryByLabelText(/Flere sykdommer/i)).not.toBeInTheDocument();
    await selectCheckboxOption(/Andre sykdommer/i);

    expect(getByLabelText(/Flere sykdommer/i)).toBeInTheDocument();
  });

  it('enableWhen should trigger when correct answer is selected along with other answers', async () => {
    const { getByLabelText, queryByLabelText } = createWrapper(questionnaireWithEnableWhen);
    expect(queryByLabelText(/Flere sykdommer/i)).not.toBeInTheDocument();
    await selectCheckboxOption(/Allergi/i);
    await selectCheckboxOption(/Hepatitt C/i);
    await selectCheckboxOption(/Andre sykdommer/i);

    expect(getByLabelText(/Flere sykdommer/i)).toBeInTheDocument();
  });
});
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function createWrapper(questionnaire: Questionnaire) {
  return renderRefero({ questionnaire, props: { authorized: true } });
}
