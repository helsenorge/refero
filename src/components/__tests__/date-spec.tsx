import '../../util/defineFetch';
import { Questionnaire } from 'fhir/r4';
import questionnaireWithAllItemTypes from './__data__/onChange/allItemTypes';
import { inputAnswer, findItem } from './utils';
import { renderRefero } from './test-utils/test-utils';

describe.skip('date fields gets set and cleared properly', () => {
  beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation(_ => {
      return {};
    });
  });

  it('dates gets set and cleared', async () => {
    const { container } = createWrapper(questionnaireWithAllItemTypes);

    await inputAnswer('7a-datepicker_input', '2020-12-23', container);
    let item = findItem('7a-datepicker_input', container);
    expect(item.props().value).toBe('23.12.2020');

    await inputAnswer('7a-datepicker_input', '', container);
    item = findItem('7a-datepicker_input', container);
    expect(item.props().value).toBe('');
  });
});

function createWrapper(questionnaire: Questionnaire) {
  return renderRefero({ questionnaire });
}
