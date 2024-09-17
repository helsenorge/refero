import { renderRefero, userEvent } from '@test/test-utils.tsx';
import { q } from './__data__/';

import { Questionnaire, QuestionnaireItem } from 'fhir/r4';
import { ReferoProps } from '../../../../types/referoProps';

import { getResources } from '../../../../../preview/resources/referoResources';
import { vi } from 'vitest';
import ItemType from '@/constants/itemType';

vi.mock('@helsenorge/core-utils/debounce', () => ({
  debounce: (fn: Function) => fn,
}));

const resources = { ...getResources(''), formRequiredErrorMessage: 'Du må fylle ut dette feltet' };
describe('string', () => {
  describe('help button', () => {
    it('Should render helpButton', async () => {
      const { getByTestId } = createWrapper(q);
      const helpButton = getByTestId('bee820a4-4bbe-427e-8c39-00a0d9c5518c-help-button');

      expect(helpButton).toBeInTheDocument();
    });
    it('Should render helpElement when helpbutton is clicked', async () => {
      const { container, getByTestId } = createWrapper(q);
      const helpButton = getByTestId('bee820a4-4bbe-427e-8c39-00a0d9c5518c-help-button');

      expect(helpButton).toBeInTheDocument();

      expect(container.querySelector('.page_refero__helpComponent--open')).not.toBeInTheDocument();

      if (helpButton) {
        await userEvent.click(helpButton);
      }
      expect(container.querySelector('.page_refero__helpComponent--open')).toBeInTheDocument();
    });
  });
  describe('onRenderHelpButton', () => {
    it('Should render custom HelpButton', async () => {
      const onRequestHelpButton = (item: QuestionnaireItem) => (
        <div className="customHelpButton" data-testid="custom-help">
          {item.text}
        </div>
      );
      const { getByTestId } = createWrapper(q, { onRequestHelpButton });

      expect(getByTestId('custom-help')).toBeInTheDocument();
      expect(getByTestId('custom-help')).toHaveTextContent('Help-element test');
    });
    it('Should render custom helpElement with text', async () => {
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
      const { getByTestId } = createWrapper(q, { onRequestHelpButton, onRequestHelpElement });
      await userEvent.click(getByTestId('custom-help'));
      const customHelpElement = getByTestId('custom-help-element');
      expect(customHelpElement).toHaveAttribute('data-itemtype', ItemType.GROUP);
      expect(customHelpElement).toHaveAttribute('data-helpitemid', 'bee820a4-4bbe-427e-8c39-00a0d9c5518c');
      expect(customHelpElement).toHaveAttribute('data-helptype', 'help');

      expect(customHelpElement).toBeInTheDocument();
      expect(customHelpElement).toHaveTextContent('<p>Hjelp</p> custom');
    });
  });
});

function createWrapper(questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) {
  return renderRefero({ questionnaire, props, resources });
}
