import '../../util/__tests__/defineFetch';
import { Questionnaire } from 'fhir/r4';

import questionnaireWithEnableWhen from './__data__/enableWhen';
import { selectCheckboxOption } from '../../../test/selectors';
import { act, renderRefero, screen } from '../../../test/test-utils';

describe('enableWhen with checkboxes and multiple answers', () => {
  it('enableWhen should trigger when correct answer is selected', async () => {
    await createWrapper(questionnaireWithEnableWhen);
    expect(screen.queryByLabelText(/Flere sykdommer/i)).not.toBeInTheDocument();
    await selectCheckboxOption(/Andre sykdommer/i);

    expect(screen.getByLabelText(/Flere sykdommer/i)).toBeInTheDocument();
  });

  it('enableWhen should trigger when correct answer is selected along with other answers', async () => {
    await createWrapper(questionnaireWithEnableWhen);
    expect(screen.queryByLabelText(/Flere sykdommer/i)).not.toBeInTheDocument();
    await selectCheckboxOption(/Allergi/i);
    await selectCheckboxOption(/Hepatitt C/i);
    await selectCheckboxOption(/Andre sykdommer/i);

    expect(screen.getByLabelText(/Flere sykdommer/i)).toBeInTheDocument();
  });
});
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function createWrapper(questionnaire: Questionnaire) {
  return await act(async () => await renderRefero({ questionnaire, props: { authorized: true } }));
}
