import { renderRefero, screen, userEvent, waitFor } from '@test/test-utils.tsx';
import { Questionnaire, QuestionnaireItem } from 'fhir/r4';
import { vi } from 'vitest';

import { ReferoProps } from '../../../../types/referoProps';

import { q } from './__data__/';
import { getResources } from '../../../../../preview/resources/referoResources';

import ItemType from '@/constants/itemType';

vi.mock('@helsenorge/core-utils/debounce', () => ({
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-unsafe-function-type
  debounce: (fn: Function) => fn,
}));

const resources = { ...getResources(''), formRequiredErrorMessage: 'Du må fylle ut dette feltet' };
describe('string', () => {
  describe('help button', () => {
    it('Should render helpButton', async () => {
      createWrapper(q);
      const helpButton = screen.getByTestId('bee820a4-4bbe-427e-8c39-00a0d9c5518c-help-button');

      expect(helpButton).toBeInTheDocument();
    });
    it('Should render helpElement when helpbutton is clicked', async () => {
      const { container } = await createWrapper(q);
      const helpButton = screen.getByTestId('bee820a4-4bbe-427e-8c39-00a0d9c5518c-help-button');

      expect(helpButton).toBeInTheDocument();

      expect(container.querySelector('.page_refero__helpComponent--open')).not.toBeInTheDocument();

      if (helpButton) {
        await userEvent.click(helpButton);
      }
      await waitFor(async () => {
        expect(await screen.findByText('Hjelp')).toBeInTheDocument();
      });
    });
  });
  describe('onRenderHelpButton', () => {
    it('Should render custom HelpButton', async () => {
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      const onRequestHelpButton = (item: QuestionnaireItem) => (
        <div className="customHelpButton" data-testid="custom-help">
          {item.text}
        </div>
      );
      await createWrapper(q, { onRequestHelpButton });

      expect(screen.getByTestId('custom-help')).toBeInTheDocument();
      expect(screen.getByTestId('custom-help')).toHaveTextContent('Help-element test');
    });
    it('Should render custom helpElement with text', async () => {
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      const onRequestHelpButton = (item: QuestionnaireItem) => (
        <div className="customHelpButton" data-testid="custom-help">
          {item.text}
        </div>
      );
      const onRequestHelpElement = (
        item: QuestionnaireItem,
        helpItem: QuestionnaireItem,
        helpType: string,
        helpText: string,
        opening: boolean
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      ) => {
        return opening ? (
          <div
            className="customHelpElement"
            data-testid="custom-help-element"
            data-itemtype={`${item.type}`}
            data-helpitemid={`${helpItem.linkId}`}
            data-helptype={`${helpType}`}
          >
            {`${helpText} custom`}
          </div>
        ) : (
          <></>
        );
      };
      await createWrapper(q, { onRequestHelpButton, onRequestHelpElement });
      await userEvent.click(screen.getByTestId('custom-help'));
      const customHelpElement = screen.getByTestId('custom-help-element');
      expect(customHelpElement).toHaveAttribute('data-itemtype', ItemType.GROUP);
      expect(customHelpElement).toHaveAttribute('data-helpitemid', 'bee820a4-4bbe-427e-8c39-00a0d9c5518c');
      expect(customHelpElement).toHaveAttribute('data-helptype', 'help');

      expect(customHelpElement).toBeInTheDocument();
      expect(customHelpElement).toHaveTextContent('<p>Hjelp</p> custom');
    });
  });
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function createWrapper(questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) {
  return await waitFor(async () => await renderRefero({ questionnaire, props, resources }));
}
