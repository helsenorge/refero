import '../../../../util/__tests__/defineFetch';
import { renderRefero, screen, userEvent } from '@test/test-utils.tsx';
import q, { repeatQ } from './__data__';
import Constants from '../../../../constants';
import { Questionnaire } from 'fhir/r4';
import { ReferoProps } from '../../../../types/referoProps';
import { Extensions } from '../../../../constants/extensions';
import { getResources } from '../../../../../preview/resources/referoResources';
import { clickButtonTimes, repeatNTimes } from '../../../../../test/selectors';

const resources = { ...getResources(''), formRequiredErrorMessage: 'Du må fylle ut dette feltet', oppgiGyldigVerdi: 'ikke gyldig tall' };

describe('group', () => {
  it('should render correct tag', () => {
    const { queryByRole } = renderRefero({ questionnaire: q });
    const group = queryByRole('heading', { name: 'Overskrift', level: Constants.DEFAULT_HEADER_TAG });
    expect(group).toBeInTheDocument();
  });
  describe('help button', () => {
    it('Should render helpButton', async () => {
      const { container } = createWrapper(q);

      expect(container.querySelector('.page_refero__helpButton')).toBeInTheDocument();
    });
    it('Should render helpElement when helpbutton is clicked', async () => {
      const { container } = createWrapper(q);

      expect(container.querySelector('.page_refero__helpButton')).toBeInTheDocument();

      expect(container.querySelector('.page_refero__helpComponent--open')).not.toBeInTheDocument();

      const helpButton = container.querySelector('.page_refero__helpButton');
      if (helpButton) {
        await userEvent.click(helpButton);
      }
      expect(container.querySelector('.page_refero__helpComponent--open')).toBeInTheDocument();
    });
  });
  describe('repeat button', () => {
    it('Should render repeat button if item repeats', () => {
      const questionnaire: Questionnaire = {
        ...repeatQ,
        item: q.item?.map(x => ({ ...x, repeats: true })),
      };

      const { getByTestId } = createWrapper(questionnaire);
      const repeatButton = getByTestId(/-repeat-button/i);
      expect(repeatButton).toBeInTheDocument();
    });

    it('Should not render repeat button if item does not repeats', () => {
      const questionnaire: Questionnaire = {
        ...repeatQ,
        item: q.item?.map(x => ({ ...x, repeats: false })),
      };
      const { queryByTestId } = createWrapper(questionnaire);
      const repeatButton = queryByTestId(/-repeat-button/i);
      expect(repeatButton).not.toBeInTheDocument();
    });
    it.skip('Should add item when repeat is clicked and remove button when maxOccurance(4) is reached', async () => {
      const questionnaire: Questionnaire = {
        ...repeatQ,
        item: q.item?.map(x => ({ ...x, repeats: true })),
        extension: q.extension?.map(y => {
          if (y.url === Extensions.MIN_OCCURS_URL) {
            return { ...y, valueInteger: 2 };
          }
          return y;
        }),
      };
      createWrapper(questionnaire);
      const input = 'entotre';
      await repeatNTimes(input, 3, /REPEATABLE INT/i);
      expect(screen.queryAllByText(/Overskrift/i)).toHaveLength(4);
      expect(screen.queryByTestId(/-repeat-button/i)).not.toBeInTheDocument();
    });
  });
  describe('delete button', () => {
    it.skip('Should render delete button if item repeats and number of repeated items is greater than minOccurance(2)', async () => {
      const questionnaire: Questionnaire = {
        ...repeatQ,
        item: q.item?.map(x => ({
          ...x,
          repeats: true,
          readOnly: false,
          extension: x.extension?.map(y => {
            if (y.url === Extensions.MIN_OCCURS_URL) {
              return { ...y, valueInteger: 2 };
            }
            return y;
          }),
        })),
      };
      const { queryAllByTestId } = createWrapper(questionnaire);
      const input = 'entotre';
      await repeatNTimes(input, 3, /REPEATABLE INT/i);
      expect(queryAllByTestId(/-delete-button/i)).toHaveLength(2);
    });
    it.skip('Should not render delete button if item repeats and number of repeated items is lower or equal than minOccurance(2)', async () => {
      const questionnaire: Questionnaire = {
        ...repeatQ,
        item: q.item?.map(x => ({
          ...x,
          repeats: true,
          extension: x.extension?.map(y => {
            if (y.url === Extensions.MIN_OCCURS_URL) {
              return { ...y, valueInteger: 2 };
            }
            return y;
          }),
        })),
      };
      const { queryByTestId } = createWrapper(questionnaire);
      await repeatNTimes('test', 1, /REPEATABLE INT/i);
      expect(queryByTestId(/-delete-button/i)).not.toBeInTheDocument();
    });

    it.skip('Should remove item when delete button is clicked', async () => {
      const questionnaire: Questionnaire = {
        ...repeatQ,
        item: q.item?.map(x => ({ ...x, repeats: true })),
      };
      const { queryByTestId } = createWrapper(questionnaire);
      const input = 'entotre';
      await repeatNTimes(input, 1, /REPEATABLE INT/i);
      await clickButtonTimes(/-delete-button/i, 1);

      expect(queryByTestId(/-delete-button/i)).not.toBeInTheDocument();
    });
  });
});
const createWrapper = (questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) => {
  return renderRefero({ questionnaire, props: { ...props, resources } });
};
