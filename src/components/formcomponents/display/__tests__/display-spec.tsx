import '../../../../util/defineFetch';
import { renderRefero } from '../../../__tests__/test-utils/test-utils';
import q from './__data__/';

describe('Display', () => {
  describe('Highlight extension', () => {
    it('should render with page_refero__component_highlight class', async () => {
      const { container } = renderRefero({ questionnaire: q });
      const actualAlert = container.querySelector('div.page_refero__component_highlight');

      expect(actualAlert).toBeInTheDocument();
    });
  });
  describe('Markdown', () => {
    it('Should render with html elements if valid html', async () => {
      const { queryByText } = renderRefero({ questionnaire: q });
      const actualMarkdown = queryByText('DISPLAY2 - markdown');

      expect(actualMarkdown).toBeInTheDocument();
    });
    it('Should not render with html elements if not valid html', async () => {
      const { queryByText } = renderRefero({ questionnaire: q });
      const actualAlert = queryByText(/alert/i);
      expect(actualAlert).not.toBeInTheDocument();
    });
  });
});
