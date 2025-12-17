import '../../../../util/__tests__/defineFetch';
import { renderRefero, screen, waitFor } from '@test/test-utils.tsx';

import type { ReferoProps } from '@/types/referoProps';
import type { Questionnaire } from 'fhir/r4';

import { q, qHighlight } from './__data__/';
import { getResources } from '../../../../../preview/resources/referoResources';

const resources = { ...getResources('') };
describe('Display', () => {
  describe('Markdown', () => {
    it('Should render with html elements if valid html', async () => {
      await createWrapper(q);
      const actualMarkdown = screen.queryByText('DISPLAY2 - markdown');

      expect(actualMarkdown).toBeInTheDocument();
    });
    it('Should not render with html elements if not valid html', async () => {
      await createWrapper(q);
      const actualAlert = screen.queryByText(/alert/i);
      expect(actualAlert).not.toBeInTheDocument();
    });
  });
  describe('Highlight extension', () => {
    it('should render highlight correct', async () => {
      const { container } = await createWrapper(qHighlight);
      expect(container.querySelectorAll('.page_refero__component_highlight').length).toBe(1);
    });
    it('should render with page_refero__component_highlight class', async () => {
      const { container } = await createWrapper(q);
      const actualAlert = container.querySelector('div.page_refero__component_highlight');

      expect(actualAlert).toBeInTheDocument();
    });
  });
});
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function createWrapper(questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) {
  return await waitFor(async () => await renderRefero({ questionnaire, props, resources }));
}
