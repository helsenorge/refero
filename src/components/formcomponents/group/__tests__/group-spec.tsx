import '../../../../util/defineFetch';
import { renderRefero } from '../../../__tests__/test-utils/test-utils';
import q from './__data__/';
import Constants from '../../../../constants';
describe('group', () => {
  it('should render correct tag', () => {
    const { queryByRole } = renderRefero({ questionnaire: q });
    const group = queryByRole('heading', { name: 'Overskrift', level: Constants.DEFAULT_HEADER_TAG });
    expect(group).toBeInTheDocument();
  });
});
